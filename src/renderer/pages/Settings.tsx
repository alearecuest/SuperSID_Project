import React, { useState } from 'react';
import '../styles/pages.css';

interface SettingsState {
  theme: 'dark' | 'light' | 'auto';
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: boolean;
  soundAlerts: boolean;
  dataRetention: number;
  exportFormat: 'csv' | 'json' | 'parquet';
  apiUrl: string;
  apiKey: string;
}

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'dark',
    autoRefresh: true,
    refreshInterval: 5,
    notifications: true,
    soundAlerts: false,
    dataRetention: 90,
    exportFormat: 'csv',
    apiUrl: 'http://localhost:3001',
    apiKey: '••••••••••••••••',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSettingChange = (key: keyof SettingsState, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setSaveStatus('saving');
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Failed to save settings:', error);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      theme: 'dark',
      autoRefresh: true,
      refreshInterval: 5,
      notifications: true,
      soundAlerts: false,
      dataRetention: 90,
      exportFormat: 'csv',
      apiUrl: 'http://localhost:3001',
      apiKey: '••••••••••••••••',
    });
    setHasChanges(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure SuperSID Pro application preferences</p>
      </div>

      <div className="settings-container">
        {/* Display Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Display</h2>
            <span className="section-icon"></span>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-label">
                <label>Theme</label>
                <span className="setting-description">Choose your preferred color theme</span>
              </div>
              <select
                value={settings.theme}
                onChange={e => handleSettingChange('theme', e.target.value)}
                className="setting-input"
              >
                <option value="dark">Dark Mode</option>
                <option value="light">Light Mode</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Data Management</h2>
            <span className="section-icon"></span>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-label">
                <label>Auto Refresh</label>
                <span className="setting-description">Automatically refresh data at intervals</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={e => handleSettingChange('autoRefresh', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <label>Refresh Interval (seconds)</label>
                <span className="setting-description">
                  {settings.autoRefresh ? `Updates every ${settings.refreshInterval}s` : 'Disabled'}
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.refreshInterval}
                onChange={e =>
                  handleSettingChange('refreshInterval', parseInt(e.target.value))
                }
                disabled={!settings.autoRefresh}
                className="setting-input"
              />
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <label>Data Retention (days)</label>
                <span className="setting-description">
                  Automatically delete data older than {settings.dataRetention} days
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.dataRetention}
                onChange={e =>
                  handleSettingChange('dataRetention', parseInt(e.target.value))
                }
                className="setting-input"
              />
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <label>Export Format</label>
                <span className="setting-description">Default format for data exports</span>
              </div>
              <select
                value={settings.exportFormat}
                onChange={e => handleSettingChange('exportFormat', e.target.value)}
                className="setting-input"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="parquet">Parquet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2>Notifications</h2>
            <span className="section-icon"></span>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-label">
                <label>Enable Notifications</label>
                <span className="setting-description">Receive event notifications</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={e => handleSettingChange('notifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <label>Sound Alerts</label>
                <span className="setting-description">Play sound for important events</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.soundAlerts}
                  onChange={e => handleSettingChange('soundAlerts', e.target.checked)}
                  disabled={!settings.notifications}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2>API Configuration</h2>
            <span className="section-icon">🔌</span>
          </div>

          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-label">
                <label>API URL</label>
                <span className="setting-description">Backend API endpoint</span>
              </div>
              <input
                type="text"
                value={settings.apiUrl}
                onChange={e => handleSettingChange('apiUrl', e.target.value)}
                className="setting-input"
              />
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <label>API Key</label>
                <span className="setting-description">Authentication key for API</span>
              </div>
              <div className="api-key-input">
                <input
                  type="password"
                  value={settings.apiKey}
                  readOnly
                  className="setting-input"
                />
                <button className="btn-small btn-secondary">Regenerate</button>
              </div>
            </div>

            <button className="btn-secondary" style={{ marginTop: '1rem' }}>
              Test Connection
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <div className="section-header">
            <h2>About</h2>
            <span className="section-icon">ℹ️</span>
          </div>

          <div className="settings-group">
            <div className="about-item">
              <div className="about-label">Application</div>
              <div className="about-value">SuperSID Pro Analytics</div>
            </div>
            <div className="about-item">
              <div className="about-label">Version</div>
              <div className="about-value">1.0.0</div>
            </div>
            <div className="about-item">
              <div className="about-label">Build</div>
              <div className="about-value">2025.11.01</div>
            </div>
            <div className="about-item">
              <div className="about-label">License</div>
              <div className="about-value">MIT</div>
            </div>
          </div>

          <button className="btn-secondary">View Documentation</button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="settings-actions">
        <button
          className="btn-secondary"
          onClick={handleResetSettings}
          disabled={!hasChanges}
        >
          ↻ Reset to Defaults
        </button>
        <button
          className="btn-primary"
          onClick={handleSaveSettings}
          disabled={!hasChanges}
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;