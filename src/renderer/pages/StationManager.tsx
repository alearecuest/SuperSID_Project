import React, { useState, useEffect } from 'react';
import '../styles/pages.css';

interface StationManagerProps {
  onStationChange: (stationId: number) => void;
}

interface Station {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  altitude: number;
  status: 'online' | 'offline' | 'maintenance';
  lastSync: string;
  observations: number;
}

const StationManager: React.FC<StationManagerProps> = ({ onStationChange }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setIsLoading(true);
      // Simulated data
      const mockStations: Station[] = [
        {
          id: 281,
          name: 'Observatory Station #281',
          location: 'Research Campus',
          latitude: 37.4419,
          longitude: -122.1430,
          altitude: 50,
          status: 'online',
          lastSync: new Date().toISOString(),
          observations: 15420,
        },
        {
          id: 282,
          name: 'Research Lab Station',
          location: 'Science Building',
          latitude: 37.4419,
          longitude: -122.1428,
          altitude: 45,
          status: 'online',
          lastSync: new Date(Date.now() - 300000).toISOString(),
          observations: 12850,
        },
        {
          id: 283,
          name: 'Field Site Station',
          location: 'Remote Field',
          latitude: 37.4420,
          longitude: -122.1435,
          altitude: 60,
          status: 'maintenance',
          lastSync: new Date(Date.now() - 3600000).toISOString(),
          observations: 8920,
        },
      ];
      setStations(mockStations);
      setSelectedStation(mockStations[0].id);
    } catch (error) {
      console.error('Failed to load stations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStations = stations.filter(
    station =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'offline':
        return '#ef4444';
      case 'maintenance':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'offline':
        return '🔴';
      case 'maintenance':
        return '🟡';
      default:
        return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Station Manager</h1>
        <p>Manage and monitor all VLF observation stations</p>
      </div>

      {/* Controls */}
      <div className="manager-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search stations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          ➕ Add Station
        </button>
      </div>

      {/* Stations Grid */}
      <div className="stations-grid">
        {filteredStations.map(station => (
          <div
            key={station.id}
            className={`station-card ${selectedStation === station.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedStation(station.id);
              onStationChange(station.id);
            }}
          >
            <div className="station-header">
              <div className="station-title">
                <h3>{station.name}</h3>
                <p className="station-location">{station.location}</p>
              </div>
              <div className="station-status">
                <span className="status-icon">{getStatusIcon(station.status)}</span>
                <span className="status-text" style={{ color: getStatusColor(station.status) }}>
                  {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="station-details">
              <div className="detail-item">
                <span className="detail-label">Station ID:</span>
                <span className="detail-value">#{station.id}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coordinates:</span>
                <span className="detail-value">
                  {station.latitude.toFixed(4)}°, {station.longitude.toFixed(4)}°
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Altitude:</span>
                <span className="detail-value">{station.altitude}m</span>
              </div>
            </div>

            <div className="station-stats">
              <div className="stat">
                <span className="stat-icon">📊</span>
                <div>
                  <div className="stat-label">Observations</div>
                  <div className="stat-value">{station.observations.toLocaleString()}</div>
                </div>
              </div>
              <div className="stat">
                <span className="stat-icon">🕐</span>
                <div>
                  <div className="stat-label">Last Sync</div>
                  <div className="stat-value">
                    {new Date(station.lastSync).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="station-actions">
              <button className="btn-small btn-secondary">🔧 Configure</button>
              <button className="btn-small btn-secondary">📥 Sync</button>
              <button className="btn-small btn-secondary">📋 Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Station Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Station</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>

            <form className="modal-form">
              <div className="form-group">
                <label>Station Name</label>
                <input type="text" placeholder="Enter station name" />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="Enter location" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input type="number" placeholder="Enter latitude" step="0.0001" />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input type="number" placeholder="Enter longitude" step="0.0001" />
                </div>
              </div>

              <div className="form-group">
                <label>Altitude (m)</label>
                <input type="number" placeholder="Enter altitude" />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationManager;