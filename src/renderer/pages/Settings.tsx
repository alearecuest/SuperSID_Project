import React, { useState, useEffect } from 'react';
import { configService } from '../services/config.service';
import { audioService, AudioDevice } from '../services/audio.service';
import '../styles/settings.css';

const Settings: React.FC = () => {
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('default');
  const [deviceName, setDeviceName] = useState<string>('Default Microphone');
  const [testingAudio, setTestingAudio] = useState(false);
  const [testMessage, setTestMessage] = useState<string>('');
  const [monitorId, setMonitorId] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);

  useEffect(() => {
    loadSettings();
    loadAudioDevices();
    loadUploadHistory();
  }, []);

  const loadSettings = async () => {
    const config = configService.getConfig();
    setSelectedDevice(config.audioSettings.deviceId);
    setDeviceName(config.audioSettings.deviceName);
    setMonitorId(config.solarCenterApiKey || '');
    setContactEmail(config.solarCenterContact || '');
  };

  const loadAudioDevices = async () => {
    const devices = await audioService.getAudioDevices();
    setAudioDevices(devices);
  };

  const loadUploadHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/solar-center/history');
      if (response.ok) {
        const history = await response.json();
        setUploadHistory(history.slice(0, 10));
      }
    } catch (error) {
      console.error('Error loading upload history:', error);
    }
  };

  const handleAudioDeviceChange = async (deviceId: string) => {
    const device = audioDevices.find(d => d.deviceId === deviceId);
    setSelectedDevice(deviceId);
    setDeviceName(device?.label || 'Unknown Device');
  };

  const handleTestAudio = async () => {
    setTestingAudio(true);
    setTestMessage('Testing audio device...');

    const result = await audioService.testAudioDevice(selectedDevice);
    setTestMessage(result.message);
    setTestingAudio(false);

    setTimeout(() => setTestMessage(''), 3000);
  };

  const handleSaveAudioSettings = async () => {
    setSaveStatus('Saving audio settings...');

    const success = await configService.saveAudioSettings({
      deviceId: selectedDevice,
      deviceName: deviceName,
      sampleRate: 48000,
      channels: 1,
    });

    if (success) {
      setSaveStatus('Audio settings saved successfully');
    } else {
      setSaveStatus('Failed to save audio settings');
    }

    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleTestSolarCenterConnection = async () => {
    if (!monitorId) {
      setConnectionMessage('Please enter your Monitor ID');
      return;
    }

    setTestingConnection(true);
    setConnectionMessage('Testing SFTP connection...');

    try {
      const response = await fetch('http://localhost:3001/api/solar-center/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monitorId }),
      });

      const result = await response.json();

      if (result.success) {
        setConnectionMessage('Connection successful!');
      } else {
        setConnectionMessage(`${result.message}`);
      }
    } catch (error: any) {
      setConnectionMessage(`Error: ${error.message}`);
    }

    setTestingConnection(false);
    setTimeout(() => setConnectionMessage(''), 4000);
  };

  const handleSaveSolarCenter = async () => {
    if (!monitorId) {
      setSaveStatus('Monitor ID is required');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }

    setSaveStatus('Saving Solar Center settings...');

    try {
      const monitorNumber = parseInt(monitorId, 10);

      const success = await configService.saveConfig({
        observatoryId: isNaN(monitorNumber) ? 0 : monitorNumber,
        solarCenterApiKey: monitorId,
        solarCenterContact: contactEmail,
      });

      if (success) {
        setSaveStatus('Solar Center settings saved successfully');
        window.dispatchEvent(new Event('storage'));
      } else {
        setSaveStatus('Failed to save settings');
      }
    } catch (error) {
      setSaveStatus('Error saving settings');
    }

    setTimeout(() => setSaveStatus(''), 3000);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your SuperSID Pro Analytics system</p>
      </div>

      {saveStatus && (
        <div className={`status-message ${saveStatus.includes('✅') ? 'success' : 'error'}`}>
          {saveStatus}
        </div>
      )}

      {/* Audio Input Settings */}
      <div className="settings-section">
        <div className="settings-section-header">
          <h2>Audio Input Settings</h2>
          <p>Select and configure your audio input device</p>
        </div>

        <div className="settings-group">
          <label htmlFor="audio-device">Audio Input Device</label>
          <select
            id="audio-device"
            value={selectedDevice}
            onChange={(e) => handleAudioDeviceChange(e.target.value)}
            className="settings-select"
          >
            <option value="default">Default Microphone</option>
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>

        <div className="settings-group">
          <label>Selected Device</label>
          <div className="device-display">
            <span>{deviceName}</span>
            <span className="device-id">{selectedDevice}</span>
          </div>
        </div>

        <div className="settings-group">
          <label>Sample Rate (Hz)</label>
          <input
            type="text"
            value="48000"
            disabled
            className="settings-input"
            title="Default sample rate for VLF detection"
          />
          <small>Standard sample rate for VLF signal processing</small>
        </div>

        <div className="settings-group">
          <label>Channels</label>
          <input
            type="text"
            value="1 (Mono)"
            disabled
            className="settings-input"
            title="Mono channel for VLF detection"
          />
          <small>Single channel for VLF frequency analysis</small>
        </div>

        <div className="settings-actions">
          <button
            className="btn btn-secondary"
            onClick={handleTestAudio}
            disabled={testingAudio}
          >
            {testingAudio ? 'Testing...' : 'Test Audio Device'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveAudioSettings}
          >
            Save Audio Settings
          </button>
        </div>

        {testMessage && (
          <div className={`test-message ${testMessage.includes('successful') ? 'success' : 'error'}`}>
            {testMessage}
          </div>
        )}
      </div>

      {/* Solar Center Integration */}
      <div className="settings-section">
        <div className="settings-section-header">
          <h2>Solar Center Integration</h2>
          <p>Configure Stanford Solar Center SFTP for data sharing</p>
        </div>

        <div className="settings-group">
          <label htmlFor="monitor-id">Monitor ID (SFTP Username)</label>
          <input
            id="monitor-id"
            type="text"
            value={monitorId}
            onChange={(e) => setMonitorId(e.target.value)}
            placeholder="Enter your Observatory Monitor ID"
            className="settings-input"
          />
          <small>
            Your unique Monitor ID assigned by{' '}
            <a href="https://solar-center.stanford.edu/SID/sidmonitor/" target="_blank" rel="noopener noreferrer">
              Stanford Solar Center
            </a>
            . Used as username for SFTP connection.
          </small>
        </div>

        <div className="settings-group">
          <label htmlFor="contact-email">Contact Email</label>
          <input
            id="contact-email"
            type="email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="settings-input"
          />
          <small>Used in the SID data file headers for identification</small>
        </div>

        <div className="settings-group">
          <label>Connection Status</label>
          <div className="api-status">
            {monitorId ? (
              <>
                <span className="status-indicator active"></span>
                <span>Monitor ID configured</span>
              </>
            ) : (
              <>
                <span className="status-indicator inactive"></span>
                <span>No Monitor ID configured</span>
              </>
            )}
          </div>
        </div>

        <div className="settings-actions">
          <button
            className="btn btn-secondary"
            onClick={handleTestSolarCenterConnection}
            disabled={testingConnection || !monitorId}
          >
            {testingConnection ? 'Testing...' : 'Test SFTP Connection'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveSolarCenter}
          >
            Save Solar Center Settings
          </button>
        </div>

        {connectionMessage && (
          <div className={`test-message ${connectionMessage.includes('✅') ? 'success' : 'error'}`}>
            {connectionMessage}
          </div>
        )}

        {/* Upload History */}
        {uploadHistory.length > 0 && (
          <div className="settings-group">
            <label>Recent Uploads</label>
            <div className="upload-history">
              {uploadHistory.map((upload, idx) => (
                <div key={idx} className={`history-item ${upload.status}`}>
                  <span className="date">{new Date(upload.created_at).toLocaleDateString()}</span>
                  <span className="status-badge">{upload.status.toUpperCase()}</span>
                  <span className="detail">{upload.details}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* System Information */}
      <div className="settings-section">
        <div className="settings-section-header">
          <h2>System Information</h2>
        </div>

        <div className="system-info">
          <div className="info-item">
            <span className="label">Application Version:</span>
            <span className="value">v1.0.0</span>
          </div>
          <div className="info-item">
            <span className="label">Platform:</span>
            <span className="value">{navigator.platform}</span>
          </div>
          <div className="info-item">
            <span className="label">User Agent:</span>
            <span className="value">{navigator.userAgent.substring(0, 50)}...</span>
          </div>
          <div className="info-item">
            <span className="label">Available Audio Devices:</span>
            <span className="value">{audioDevices.length} device(s)</span>
          </div>
          <div className="info-item">
            <span className="label">SFTP Server:</span>
            <span className="value">sid-ftp.stanford.edu</span>
          </div>
          <div className="info-item">
            <span className="label">SFTP Port:</span>
            <span className="value">22</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;