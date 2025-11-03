import React, { useState } from 'react';
import { configService } from '../services/config.service';
import '../styles/pages.css';

interface ObservatorySetupProps {
  observatoryId: number;
  onObservatorySet: (observatoryId: number) => void;
}

const ObservatorySetup: React.FC<ObservatorySetupProps> = ({ observatoryId, onObservatorySet }) => {
  const [inputId, setInputId] = useState<string>(observatoryId.toString());
  const [errors, setErrors] = useState<string>('');
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: 'My Observatory',
    institution: '',
    location: '',
    latitude: '',
    longitude: '',
    altitude: '',
    timezone: 'UTC',
    solarCenterApiKey: '',
  });

  const validateObservatoryId = (id: string): boolean => {
    const num = parseInt(id);
    if (isNaN(num) || num <= 0) {
      setErrors('Observatory ID must be a positive number');
      return false;
    }
    return true;
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputId(e.target.value);
    if (errors) setErrors('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateObservatoryId(inputId)) {
      return;
    }

    const newId = parseInt(inputId);
    console.log('Observatory configured:', {
      id: newId,
      ...formData,
    });

    try {
      const success = await configService.saveConfig({
        observatoryId: newId,
        observatoryName: formData.name,
        institution: formData.institution,
        location: formData.location,
        latitude: parseFloat(formData.latitude) || 0,
        longitude: parseFloat(formData.longitude) || 0,
        altitude: parseFloat(formData.altitude) || 0,
        timezone: formData.timezone,
        solarCenterApiKey: formData.solarCenterApiKey,
      });

      if (success) {
        console.log('Observatory saved to config');
        onObservatorySet(newId);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErrors('Failed to save observatory configuration');
      }
    } catch (error) {
      console.error('Error saving observatory:', error);
      setErrors('Error saving observatory configuration');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Observatory Configuration</h1>
        <p>Set up your unique VLF observation station for Solar Center integration</p>
      </div>

      {saved && (
        <div className="alert alert-success">
          Observatory configuration saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="setup-form">
        {/* OBSERVATORY ID - CRITICAL */}
        <div className="form-section" style={{ borderLeft: '4px solid #0ea5e9' }}>
          <h2>Your Observatory ID</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
            This is your unique identifier in Solar Center. It cannot be changed once registered.
          </p>

          <div className="form-group">
            <label htmlFor="observatoryId">
              Observatory ID * <span style={{ color: '#f97316' }}>(Unique & Permanent)</span>
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <input
                type="number"
                id="observatoryId"
                value={inputId}
                onChange={handleIdChange}
                placeholder="e.g., 281"
                min="1"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ whiteSpace: 'nowrap', marginTop: '0' }}
              >
                Set Observatory
              </button>
            </div>
            {errors && <span className="error" style={{ display: 'block', marginTop: '0.5rem' }}>{errors}</span>}
            <small style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              Your observatory is currently: <strong>#{observatoryId}</strong>
            </small>
          </div>
        </div>

        {/* OBSERVATORY DETAILS */}
        <div className="form-section">
          <h2>Observatory Details</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Observatory Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g., Main Observatory"
              />
            </div>

            <div className="form-group">
              <label htmlFor="institution">Institution</label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleFormChange}
                placeholder="e.g., University of Technology"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleFormChange}
              placeholder="e.g., Research Campus, Building A"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleFormChange}
                placeholder="e.g., 37.4419"
                step="0.0001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleFormChange}
                placeholder="e.g., -122.1430"
                step="0.0001"
              />
            </div>

            <div className="form-group">
              <label htmlFor="altitude">Altitude (meters)</label>
              <input
                type="number"
                id="altitude"
                name="altitude"
                value={formData.altitude}
                onChange={handleFormChange}
                placeholder="e.g., 50"
              />
            </div>

            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleFormChange}
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST (UTC-5)</option>
                <option value="CST">CST (UTC-6)</option>
                <option value="MST">MST (UTC-7)</option>
                <option value="PST">PST (UTC-8)</option>
                <option value="CET">CET (UTC+1)</option>
                <option value="IST">IST (UTC+5:30)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SOLAR CENTER INTEGRATION */}
        <div className="form-section">
          <h2>Solar Center Integration</h2>

          <div className="form-group">
            <label htmlFor="solarCenterApiKey">Solar Center API Key</label>
            <input
              type="password"
              id="solarCenterApiKey"
              name="solarCenterApiKey"
              value={formData.solarCenterApiKey}
              onChange={handleFormChange}
              placeholder="Your Solar Center API key"
            />
            <small>Required for automatic data upload to Solar Center</small>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            Save Observatory Configuration
          </button>
        </div>
      </form>

      <div className="info-box">
        <h3>ℹ️ About Your Observatory</h3>
        <p>
          Your observatory is your unique VLF receiver station registered with Solar Center.
          Your Observatory ID is permanent and identifies your data uploads globally.
        </p>
        <p>
          Once configured, you can then select which <strong>VLF Reception Stations</strong> you want to monitor globally.
        </p>
      </div>
    </div>
  );
};

export default ObservatorySetup;