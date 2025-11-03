import React, { useState, useEffect } from 'react';
import { analysisService, VLFData } from '../services/analysis.service';
import VLFSignalsChart from '../components/VLFSignalsChart';
import '../styles/pages.css';

const VLFSignals: React.FC<{ observatoryId?: number }> = ({ observatoryId = 999 }) => {
  const [vlsData, setVlsData] = useState<VLFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await analysisService.getVLFData(observatoryId);
        setVlsData(data);
        setError('');
      } catch (err) {
        console.error('Error loading VLF data:', err);
        setError('Failed to load VLF data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, autoRefresh ? 10000 : 999999);
    return () => clearInterval(interval);
  }, [observatoryId, autoRefresh]);

  if (loading && !vlsData) {
    return (
      <div className="page-container">
        <div className="loading">Loading VLF signals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!vlsData) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📡 VLF Signals</h1>
        <p>SuperSID Radiotelescopio Signal Analysis</p>
        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (10s)
          </label>
        </div>
      </div>

      {/* MAIN METRICS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Average Amplitude</div>
          <div className="stat-value">{vlsData.averageAmplitude.toFixed(2)} dB</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Peak Amplitude</div>
          <div className="stat-value">{vlsData.peakAmplitude.toFixed(2)} dB</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Noise Level</div>
          <div className="stat-value">{vlsData.noiseLevel.toFixed(2)} dB</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Signal Count</div>
          <div className="stat-value">{vlsData.signals.length}</div>
        </div>
      </div>

      {/* DISTURBANCE INDEX */}
      <div className="section-card">
        <h2>Disturbance Index</h2>
        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              width: '100%',
              height: '30px',
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #334155',
            }}
          >
            <div
              style={{
                width: `${vlsData.disturbanceIndex}%`,
                height: '100%',
                backgroundColor: getDisturbanceColor(vlsData.disturbanceIndex),
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {vlsData.disturbanceIndex > 10 && `${vlsData.disturbanceIndex.toFixed(1)}%`}
            </div>
          </div>
          <p style={{ marginTop: '0.5rem', color: '#94a3b8', textAlign: 'center' }}>
            {getDisturbanceLevel(vlsData.disturbanceIndex)}
          </p>
        </div>
      </div>

      {/* CHARTS */}
      {vlsData.signals.length > 0 && (
        <VLFSignalsChart
          data={vlsData.signals}
          title="Signal Amplitude & Quality Trend"
          type="line"
        />
      )}

      {vlsData.signals.length > 0 && (
        <VLFSignalsChart
          data={vlsData.signals}
          title="Signal Distribution"
          type="bar"
        />
      )}

      {/* RECENT SIGNALS TABLE */}
      <div className="section-card">
        <h2>Recent Signals (Last 60)</h2>
        {vlsData.signals.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>Timestamp</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>Frequency</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>Amplitude</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>SNR</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#94a3b8' }}>Quality</th>
                </tr>
              </thead>
              <tbody>
                {vlsData.signals.slice(-60).reverse().map((signal, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                      {signal.frequency.toFixed(0)} Hz
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#0ea5e9' }}>
                      {signal.amplitude.toFixed(2)} dB
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                      {signal.snr.toFixed(2)} dB
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.85rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: getQualityBg(signal.quality),
                          color: getQualityColor(signal.quality),
                          borderRadius: '4px',
                          fontWeight: '600',
                        }}
                      >
                        {signal.quality.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: '#94a3b8' }}>No signals recorded yet</p>
        )}
      </div>
    </div>
  );
};

function getDisturbanceColor(index: number): string {
  if (index >= 70) return '#ef4444';
  if (index >= 50) return '#f97316';
  if (index >= 30) return '#eab308';
  return '#22c55e';
}

function getDisturbanceLevel(index: number): string {
  if (index >= 70) return '🔴 Severe Disturbance';
  if (index >= 50) return '🟠 High Disturbance';
  if (index >= 30) return '🟡 Moderate Disturbance';
  return '🟢 Low Disturbance';
}

function getQualityColor(quality: number): string {
  if (quality >= 80) return '#10b981';
  if (quality >= 60) return '#0ea5e9';
  if (quality >= 40) return '#f59e0b';
  return '#ef4444';
}

function getQualityBg(quality: number): string {
  if (quality >= 80) return 'rgba(16, 185, 129, 0.2)';
  if (quality >= 60) return 'rgba(14, 165, 233, 0.2)';
  if (quality >= 40) return 'rgba(245, 158, 11, 0.2)';
  return 'rgba(239, 68, 68, 0.2)';
}

export default VLFSignals;