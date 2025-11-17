import React, { useState, useEffect } from 'react';
import '../styles/pages.css';

interface MonitorStatus {
  isRunning: boolean;
  samplesCollected: number;
  currentFrequency: number;
  amplitude: number;
  deviceName: string;
  sampleRate: number;
  startTime?: string;
  duration?: number;
}

const VLFMonitor: React.FC<{ observatoryId: number }> = ({ observatoryId }) => {
  const [status, setStatus] = useState<MonitorStatus>({
    isRunning: false,
    samplesCollected: 0,
    currentFrequency: 0,
    amplitude: 0,
    deviceName: 'Not configured',
    sampleRate: 48000,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStations, setSelectedStations] = useState<string[]>([]);

  useEffect(() => {
    loadConfig();
    checkStatus();
    
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadConfig = () => {
    try {
      const config = JSON.parse(localStorage.getItem('supersid-config') || '{}');
      setSelectedStations(config.monitoredStations || []);
      
      setStatus(prev => ({
        ...prev,
        deviceName: config.audioSettings?.deviceName || 'Simulation Mode',
        sampleRate: config.audioSettings?.sampleRate || 48000,
      }));
    } catch (err) {
      console.error('Error loading config:', err);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/vlf-monitor/status');
      const result = await response.json();
      
      if (result.success && result.data) {
        const data = result.data;
        
        setStatus(prev => ({
          ...prev,
          isRunning: data.isRunning || false,
          samplesCollected: data.samplesProcessed || 0,
          currentFrequency: data.lastSample?.frequency || 0,
          amplitude: data.lastSample?.amplitude || 0,
          startTime: data.startTime ? new Date(data.startTime).toISOString() : undefined,
          duration: data.startTime ? Math.floor((Date.now() - data.startTime) / 1000) : 0,
        }));
      }
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  const handleStart = async () => {
    if (selectedStations.length === 0) {
      setError('Please select at least one VLF station to monitor');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const config = JSON.parse(localStorage.getItem('supersid-config') || '{}');
      
      const response = await fetch('http://localhost:3001/api/vlf-monitor/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationId: observatoryId,
          deviceId: config.audioSettings?.deviceId || 'default',
          sampleRate: config.audioSettings?.sampleRate || 48000,
          stations: selectedStations,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await checkStatus();
        setError('');
      } else {
        if (result.error && result.error.includes('already running')) {
          setError('Monitor is already running. Stop it first to restart.');
        } else {
          setError(result.error || 'Failed to start monitoring');
        }
      }
    } catch (err: any) {
      console.error('Error starting monitor:', err);
      setError(err.message || 'Failed to start monitoring');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/vlf-monitor/stop', {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        await checkStatus();
      } else {
        setError(result.error || 'Failed to stop monitoring');
      }
    } catch (err: any) {
      console.error('Error stopping monitor:', err);
      setError(err.message || 'Failed to stop monitoring');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '00:00:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>VLF Signal Monitor</h1>
        <p>Real-time capture and analysis of VLF radio signals</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="section-card">
        <div className="section-header">
          <h2>Monitor Status</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: status.isRunning ? '#22c55e' : '#64748b',
              animation: status.isRunning ? 'pulse 2s infinite' : 'none',
            }}></div>
            <span style={{ color: status.isRunning ? '#22c55e' : '#64748b', fontWeight: '600' }}>
              {status.isRunning ? 'MONITORING ACTIVE' : 'STOPPED'}
            </span>
          </div>
        </div>

        <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
          <div className="stat-card">
            <div className="stat-label">Samples Collected</div>
            <div className="stat-value">{status.samplesCollected.toLocaleString()}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Current Amplitude</div>
            <div className="stat-value">{status.amplitude.toFixed(2)} dB</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Frequency</div>
            <div className="stat-value">{(status.currentFrequency / 1000).toFixed(1)} kHz</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Running Time</div>
            <div className="stat-value">{formatDuration(status.duration)}</div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h2>Control Panel</h2>
        
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Audio Device:</strong> {status.deviceName}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong>Sample Rate:</strong> {(status.sampleRate / 1000).toFixed(1)} kHz
          </div>
          <div>
            <strong>Monitored Stations:</strong> {selectedStations.length > 0 ? selectedStations.join(', ').toUpperCase() : 'None selected'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {!status.isRunning ? (
            <button
              className="btn-primary"
              onClick={handleStart}
              disabled={loading || selectedStations.length === 0}
              style={{ minWidth: '200px' }}
            >
              {loading ? 'Starting...' : 'Start Monitoring'}
            </button>
          ) : (
            <button
              className="btn-secondary"
              onClick={handleStop}
              disabled={loading}
              style={{ minWidth: '200px', backgroundColor: '#ef4444', borderColor: '#ef4444' }}
            >
              {loading ? 'Stopping...' : 'Stop Monitoring'}
            </button>
          )}
        </div>

        {selectedStations.length === 0 && (
          <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
            No VLF stations selected. Go to Settings to configure monitored stations.
          </div>
        )}
      </div>

      <div className="section-card">
        <h2>How It Works</h2>
        <div style={{ padding: '1rem', lineHeight: '1.8', color: '#94a3b8' }}>
          <p style={{ marginBottom: '1rem' }}>
            The VLF Monitor continuously captures audio from your antenna and processes it using FFT (Fast Fourier Transform)
            to extract frequency components in the VLF range (3-30 kHz).
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>Requirements:</strong>
          </p>
          <ul style={{ paddingLeft: '2rem' }}>
            <li>VLF antenna connected to your audio input</li>
            <li>At least one VLF station selected for monitoring</li>
            <li>Audio device properly configured</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            Data is automatically saved to the database and can be visualized in real-time on the Dashboard and Data Visualization pages.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VLFMonitor;