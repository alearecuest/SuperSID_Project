import React, { useState, useEffect } from 'react';
import { VLF_STATIONS, calculateDistance } from '../data/vlf-stations';
import '../styles/pages.css';

interface WizardProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'observatory' | 'audio' | 'stations' | 'complete';

interface ObservatoryData {
  id: number;
  name: string;
  institution: string;
  location: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timezone: string;
  solarCenterApiKey: string;
  contactEmail: string;
}

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

const FirstTimeWizard: React.FC<WizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Observatory data
  const [observatory, setObservatory] = useState<ObservatoryData>({
    id: 0,
    name: '',
    institution: '',
    location: '',
    latitude: 0,
    longitude: 0,
    altitude: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Montevideo',
    solarCenterApiKey: '',
    contactEmail: '',
  });

  // Audio settings
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [sampleRate, setSampleRate] = useState(48000);
  const [testingAudio, setTestingAudio] = useState(false);
  const [audioTestResult, setAudioTestResult] = useState<string>('');

  // Stations
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [stationFilter, setStationFilter] = useState('all');

  // Load audio devices on mount
  useEffect(() => {
    if (currentStep === 'audio') {
      loadAudioDevices();
    }
  }, [currentStep]);

  const loadAudioDevices = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/audio-devices');
      const result = await response.json();
      
      console.log('Audio devices response:', result);
      
      if (result.success && result.data) {
        // Mapear el formato del backend al formato que espera el wizard
        const devices = result.data.map((device: any) => ({
          deviceId: device.id,
          label: device.name,
          kind: 'audioinput',
        }));
        
        setAudioDevices(devices);
        if (devices.length > 0) {
          setSelectedDevice(devices[0].deviceId);
        }
        console.log('Audio devices loaded:', devices);
      } else {
        console.warn('No audio devices found');
        setError('No audio devices detected. You can skip this step and configure later.');
      }
    } catch (err) {
      console.error('Error loading audio devices:', err);
      setError('Failed to load audio devices. You can skip this step and configure later.');
    }
  };

  const testAudioCapture = async () => {
    setTestingAudio(true);
    setAudioTestResult('');
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/vlf-monitor/test-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: selectedDevice,
          sampleRate,
          duration: 3,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setAudioTestResult(`Audio test successful! Peak level: ${result.peakLevel?.toFixed(2) || 'N/A'} dB`);
      } else {
        setError('Audio test failed. Check your device connection.');
      }
    } catch (err) {
      console.error('Audio test error:', err);
      setError('Failed to test audio. Make sure your device is connected.');
    } finally {
      setTestingAudio(false);
    }
  };

  const handleObservatoryChange = (field: keyof ObservatoryData, value: any) => {
    setObservatory(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateObservatory = (): boolean => {
    if (!observatory.name.trim()) {
      setError('Observatory name is required');
      return false;
    }
    if (observatory.id <= 0) {
      setError('Please enter a valid Observatory ID (positive number)');
      return false;
    }
    if (Math.abs(observatory.latitude) > 90) {
      setError('Latitude must be between -90 and 90');
      return false;
    }
    if (Math.abs(observatory.longitude) > 180) {
      setError('Longitude must be between -180 and 180');
      return false;
    }
    return true;
  };

  const saveObservatory = async () => {
    if (!validateObservatory()) return;

    setLoading(true);
    setError('');

    try {
      // Save to backend
      const response = await fetch('http://localhost:3001/api/observatory/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(observatory),
      });

      if (!response.ok) {
        throw new Error('Failed to save observatory');
      }

      // Save to localStorage
      const config = {
        observatoryId: observatory.id,
        observatoryName: observatory.name,
        institution: observatory.institution,
        location: observatory.location,
        latitude: observatory.latitude,
        longitude: observatory.longitude,
        altitude: observatory.altitude,
        timezone: observatory.timezone,
        solarCenterApiKey: observatory.solarCenterApiKey,
        solarCenterContact: observatory.contactEmail,
        monitoredStations: [],
        audioSettings: {
          deviceId: 'default',
          deviceName: 'Default',
          sampleRate: 48000,
          channels: 1,
        },
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem('supersid-config', JSON.stringify(config));
      localStorage.setItem('supersid-wizard-completed', 'true');

      console.log('Observatory saved:', observatory.id);
      setCurrentStep('audio');
    } catch (err: any) {
      console.error('Error saving observatory:', err);
      setError(err.message || 'Failed to save observatory');
    } finally {
      setLoading(false);
    }
  };

  const saveAudioSettings = async () => {
    setLoading(true);
    setError('');

    try {
      const config = JSON.parse(localStorage.getItem('supersid-config') || '{}');
      
      // Si hay dispositivo seleccionado, usarlo; si no, configuración por defecto
      config.audioSettings = {
        deviceId: selectedDevice || 'default',
        deviceName: selectedDevice 
          ? (audioDevices.find(d => d.deviceId === selectedDevice)?.label || 'Unknown Device')
          : 'Not configured yet',
        sampleRate,
        channels: 1,
      };
      config.lastUpdated = new Date().toISOString();

      localStorage.setItem('supersid-config', JSON.stringify(config));

      console.log('Audio settings saved:', config.audioSettings);
      setCurrentStep('stations');
    } catch (err) {
      console.error('Error saving audio settings:', err);
      setError('Failed to save audio settings');
    } finally {
      setLoading(false);
    }
  };

  const saveStations = async () => {
    if (selectedStations.length === 0) {
      setError('Please select at least one VLF station to monitor');
      return;
    }

    setLoading(true);

    try {
      const config = JSON.parse(localStorage.getItem('supersid-config') || '{}');
      config.monitoredStations = selectedStations;
      config.lastUpdated = new Date().toISOString();

      localStorage.setItem('supersid-config', JSON.stringify(config));

      // Subscribe to stations in backend
      for (const stationId of selectedStations) {
        await fetch('http://localhost:3001/api/stations/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            observatoryId: observatory.id,
            stationId,
          }),
        });
      }

      console.log('Stations saved:', selectedStations);
      setCurrentStep('complete');
    } catch (err) {
      console.error('Error saving stations:', err);
      setError('Failed to save stations');
    } finally {
      setLoading(false);
    }
  };

  const toggleStation = (stationId: string) => {
    setSelectedStations(prev =>
      prev.includes(stationId)
        ? prev.filter(id => id !== stationId)
        : [...prev, stationId]
    );
  };

  const filteredStations = stationFilter === 'all'
    ? VLF_STATIONS
    : VLF_STATIONS.filter(s => s.country === stationFilter);

  const sortedStations = [...filteredStations].sort((a, b) => {
    const distA = calculateDistance(observatory.latitude, observatory.longitude, a.latitude, a.longitude);
    const distB = calculateDistance(observatory.latitude, observatory.longitude, b.latitude, b.longitude);
    return distA - distB;
  });

  // ========== RENDER STEPS ==========

  if (currentStep === 'welcome') {
    return (
      <div className="wizard-container">
        <div className="wizard-content">
          <div className="wizard-header">
            <h1>Welcome to SuperSID Pro Analytics!</h1>
            <p>Let's set up your VLF monitoring station in just a few steps</p>
          </div>

          <div className="wizard-body">
            <div className="welcome-features">
              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Configure Your Observatory</h3>
                <p>Set up your unique station ID and location</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Configure Audio Input</h3>
                <p>Select and test your audio capture device</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Select VLF Stations</h3>
                <p>Choose which global transmitters to monitor</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon"></div>
                <h3>Monitor Space Weather</h3>
                <p>Correlate VLF signals with solar activity</p>
              </div>
            </div>

            <div className="wizard-info">
              <h3>What is SuperSID?</h3>
              <p>
                SuperSID (Sudden Ionospheric Disturbance) monitors Very Low Frequency (VLF) radio signals
                to detect changes in the ionosphere caused by solar flares and other space weather events.
              </p>
              <p>
                This professional version includes real-time monitoring, FFT analysis, automated SID detection,
                and integration with NOAA Space Weather data.
              </p>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="btn-primary btn-large" onClick={() => setCurrentStep('observatory')}>
              Get Started →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'observatory') {
    return (
      <div className="wizard-container">
        <div className="wizard-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '33%' }}></div>
          </div>
          <p>Step 1 of 3: Observatory Configuration</p>
        </div>

        <div className="wizard-content">
          <div className="wizard-header">
            <h1>Configure Your Observatory</h1>
            <p>This information identifies your monitoring station</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="wizard-body">
            <div className="form-section">
              <div className="form-row">
                <div className="form-group">
                  <label>Observatory ID * <span style={{ color: '#f97316' }}>(Unique & Permanent)</span></label>
                  <input
                    type="number"
                    value={observatory.id || ''}
                    onChange={e => handleObservatoryChange('id', parseInt(e.target.value) || 0)}
                    placeholder="e.g., 281"
                    min="1"
                  />
                  <small>Your unique identifier in Solar Center. Choose a number not used by others.</small>
                </div>

                <div className="form-group">
                  <label>Observatory Name *</label>
                  <input
                    type="text"
                    value={observatory.name}
                    onChange={e => handleObservatoryChange('name', e.target.value)}
                    placeholder="e.g., Home Observatory"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Institution</label>
                  <input
                    type="text"
                    value={observatory.institution}
                    onChange={e => handleObservatoryChange('institution', e.target.value)}
                    placeholder="e.g., University or Home Lab"
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={observatory.location}
                    onChange={e => handleObservatoryChange('location', e.target.value)}
                    placeholder="e.g., Montevideo, Uruguay"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude *</label>
                  <input
                    type="number"
                    value={observatory.latitude || ''}
                    onChange={e => handleObservatoryChange('latitude', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., -34.9011"
                    step="0.0001"
                  />
                  <small>-90 to 90</small>
                </div>

                <div className="form-group">
                  <label>Longitude *</label>
                  <input
                    type="number"
                    value={observatory.longitude || ''}
                    onChange={e => handleObservatoryChange('longitude', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., -56.1645"
                    step="0.0001"
                  />
                  <small>-180 to 180</small>
                </div>

                <div className="form-group">
                  <label>Altitude (m)</label>
                  <input
                    type="number"
                    value={observatory.altitude || ''}
                    onChange={e => handleObservatoryChange('altitude', parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 25"
                  />
                </div>

                <div className="form-group">
                  <label>Timezone</label>
                  <select
                    value={observatory.timezone}
                    onChange={e => handleObservatoryChange('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/Uruguay/Montevideo">Montevideo (UTC-3)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                    <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
                    <option value="Europe/London">London (UTC+0)</option>
                    <option value="Europe/Paris">Paris (UTC+1)</option>
                    <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                    <option value="Australia/Sydney">Sydney (UTC+10)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Email (optional)</label>
                  <input
                    type="email"
                    value={observatory.contactEmail}
                    onChange={e => handleObservatoryChange('contactEmail', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Solar Center API Key (optional)</label>
                  <input
                    type="password"
                    value={observatory.solarCenterApiKey}
                    onChange={e => handleObservatoryChange('solarCenterApiKey', e.target.value)}
                    placeholder="For automatic data upload"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="btn-secondary" onClick={() => setCurrentStep('welcome')}>
              ← Back
            </button>
            <button className="btn-primary" onClick={saveObservatory} disabled={loading}>
              {loading ? 'Saving...' : 'Next: Audio Setup →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'audio') {
    return (
      <div className="wizard-container">
        <div className="wizard-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '66%' }}></div>
          </div>
          <p>Step 2 of 3: Audio Configuration</p>
        </div>

        <div className="wizard-content">
          <div className="wizard-header">
            <h1>Configure Audio Input</h1>
            <p>Select your audio device for VLF signal capture</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {audioTestResult && <div className="alert alert-success">{audioTestResult}</div>}

          <div className="wizard-body">
            <div className="form-section">
              <div className="form-group">
                <label>Audio Input Device *</label>
                <select
                  value={selectedDevice}
                  onChange={e => setSelectedDevice(e.target.value)}
                  disabled={audioDevices.length === 0}
                >
                  {audioDevices.length === 0 ? (
                    <option>No devices found</option>
                  ) : (
                    audioDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Device ${device.deviceId}`}
                      </option>
                    ))
                  )}
                </select>
                <small>Connect your antenna to Line In or Microphone input</small>
              </div>

              <div className="form-group">
                <label>Sample Rate</label>
                <select
                  value={sampleRate}
                  onChange={e => setSampleRate(parseInt(e.target.value))}
                >
                  <option value={44100}>44.1 kHz (CD quality)</option>
                  <option value={48000}>48 kHz (Recommended)</option>
                  <option value={96000}>96 kHz (High quality)</option>
                </select>
                <small>Higher sample rates capture more detail but use more CPU</small>
              </div>

              <div className="audio-test-section">
                <h3>Test Your Audio Input</h3>
                <p>Make sure your antenna is connected before testing</p>
                <button
                  className="btn-secondary"
                  onClick={testAudioCapture}
                  disabled={testingAudio || !selectedDevice}
                >
                  {testingAudio ? 'Testing Audio...' : 'Test Audio Capture'}
                </button>
              </div>

              <div className="info-box">
                <h3>Audio Setup Tips</h3>
                <ul>
                  <li>Connect your VLF antenna to your computer's Line In or Microphone input</li>
                  <li>Use a USB sound card for better quality (recommended)</li>
                  <li>Test the audio capture to ensure signal is being received</li>
                  <li>VLF signals are in the 3-30 kHz range</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="btn-secondary" onClick={() => setCurrentStep('observatory')}>
              ← Back
            </button>
            <button 
              className="btn-primary" 
              onClick={saveAudioSettings} 
              disabled={loading}
            >
              {loading ? 'Saving...' : audioDevices.length === 0 ? 'Skip Audio (configure later) →' : 'Next: Select Stations →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'stations') {
    return (
      <div className="wizard-container">
        <div className="wizard-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '99%' }}></div>
          </div>
          <p>Step 3 of 3: Select VLF Stations</p>
        </div>

        <div className="wizard-content">
          <div className="wizard-header">
            <h1>Select VLF Stations to Monitor</h1>
            <p>Choose which global VLF transmitters you want to monitor</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="wizard-body">
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-label">Selected Stations</div>
                <div className="stat-value">{selectedStations.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Available Stations</div>
                <div className="stat-value">{filteredStations.length}</div>
              </div>
            </div>

            <div className="filter-section">
              <div className="form-group">
                <label>Filter by Country</label>
                <select
                  value={stationFilter}
                  onChange={e => setStationFilter(e.target.value)}
                >
                  <option value="all">All Countries</option>
                  {Array.from(new Set(VLF_STATIONS.map(s => s.country))).sort().map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="stations-grid">
              {sortedStations.map(station => {
                const distance = calculateDistance(
                  observatory.latitude,
                  observatory.longitude,
                  station.latitude,
                  station.longitude
                );

                return (
                  <div
                    key={station.id}
                    className={`station-card ${selectedStations.includes(station.id) ? 'selected' : ''}`}
                    onClick={() => toggleStation(station.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStations.includes(station.id)}
                      onChange={() => toggleStation(station.id)}
                    />
                    <div className="station-info">
                      <strong>{station.callsign}</strong>
                      <span className={`status-${station.status}`}>
                        {station.status === 'active' ? '🟢' : station.status === 'intermittent' ? '🟡' : '🔴'}
                      </span>
                      <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{station.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        📍 {station.location}, {station.country}
                      </div>
                      <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        <span>{Array.isArray(station.frequency) ? station.frequency.join(', ') : station.frequency} kHz</span>
                        <span style={{ marginLeft: '1rem' }}>{Math.round(distance)} km</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="info-box">
              <h3>💡 Station Selection Tips</h3>
              <ul>
                <li>Start with 2-5 stations for best performance</li>
                <li>Choose stations at different distances for varied propagation</li>
                <li>Active stations (🟢) provide the most reliable data</li>
                <li>Closer stations usually have stronger signals</li>
              </ul>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="btn-secondary" onClick={() => setCurrentStep('audio')}>
              ← Back
            </button>
            <button
              className="btn-primary"
              onClick={saveStations}
              disabled={loading || selectedStations.length === 0}
            >
              {loading ? 'Saving...' : 'Complete Setup →'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="wizard-container">
        <div className="wizard-content">
          <div className="wizard-header">
            <h1>Setup Complete!</h1>
            <p>Your SuperSID Pro Analytics is ready to start monitoring</p>
          </div>

          <div className="wizard-body">
            <div className="completion-summary">
              <div className="summary-card">
                <h3>Observatory</h3>
                <p><strong>{observatory.name}</strong> (ID: #{observatory.id})</p>
                <p>{observatory.location}</p>
              </div>

              <div className="summary-card">
                <h3>Audio</h3>
                <p>{audioDevices.find(d => d.deviceId === selectedDevice)?.label || 'Device configured'}</p>
                <p>{sampleRate / 1000} kHz sample rate</p>
              </div>

              <div className="summary-card">
                <h3>Stations</h3>
                <p><strong>{selectedStations.length}</strong> stations selected</p>
                <p>{selectedStations.map(id => VLF_STATIONS.find(s => s.id === id)?.callsign).join(', ')}</p>
              </div>
            </div>

            <div className="next-steps">
              <h3>What's Next?</h3>
              <ol>
                <li>Go to the Dashboard to see your monitoring setup</li>
                <li>Start VLF monitoring to begin capturing signals</li>
                <li>View Space Weather to track solar activity</li>
                <li>Check Correlation page for SID event detection</li>
              </ol>
            </div>
          </div>

          <div className="wizard-footer">
            <button className="btn-primary btn-large" onClick={onComplete}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default FirstTimeWizard;