import React, { useState, useMemo } from 'react';
import { VLF_STATIONS, calculateDistance } from '../data/vlf-stations';
import '../styles/pages.css';

interface SelectVLFStationsProps {
  observatoryId: number;
  observatoryLat?: number;
  observatoryLon?: number;
  selectedStations: string[];
  onStationsChange: (stationIds: string[]) => void;
}

const SelectVLFStations: React.FC<SelectVLFStationsProps> = ({
  observatoryId,
  observatoryLat = 0,
  observatoryLon = 0,
  selectedStations,
  onStationsChange,
}) => {
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'frequency' | 'name'>('distance');

  const stationsWithDistance = useMemo(
    () =>
      VLF_STATIONS.map(station => ({
        ...station,
        distance: calculateDistance(
          observatoryLat,
          observatoryLon,
          station.latitude,
          station.longitude
        ),
      })),
    [observatoryLat, observatoryLon]
  );

  const filteredStations = useMemo(() => {
    let result = stationsWithDistance;

    if (filterCountry !== 'all') {
      result = result.filter(s => s.country === filterCountry);
    }

    if (filterStatus !== 'all') {
      result = result.filter(s => s.status === filterStatus);
    }

    if (searchQuery) {
      result = result.filter(
        s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.callsign.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'distance') {
      result.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'frequency') {
      result.sort((a, b) => a.frequency - b.frequency);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [stationsWithDistance, filterCountry, filterStatus, searchQuery, sortBy]);

  const countries = ['all', ...Array.from(new Set(VLF_STATIONS.map(s => s.country))).sort()];
  const statuses = ['all', 'active', 'inactive', 'intermittent'];

  const handleToggle = (stationId: string) => {
    const newSelected = selectedStations.includes(stationId)
      ? selectedStations.filter(id => id !== stationId)
      : [...selectedStations, stationId];

    onStationsChange(newSelected);
  };

  const handleSelectAll = () => {
    onStationsChange(filteredStations.map(s => s.id));
  };

  const handleDeselectAll = () => {
    onStationsChange([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🟢';
      case 'inactive':
        return '🔴';
      case 'intermittent':
        return '🟡';
      default:
        return '⚪';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📡 Select VLF Reception Stations</h1>
        <p>Choose which global VLF transmitters to monitor from Observatory #{observatoryId}</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Observatory</div>
          <div className="stat-value">#{observatoryId}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Selected Stations</div>
          <div className="stat-value">{selectedStations.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available Stations</div>
          <div className="stat-value">{filteredStations.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Stations</div>
          <div className="stat-value">{VLF_STATIONS.length}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="search">🔍 Search</label>
            <input
              id="search"
              type="text"
              placeholder="Search by name, callsign, or country..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
            >
              {countries.map(country => (
                <option key={country} value={country}>
                  {country === 'all' ? 'All Countries' : country}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort">Sort By</label>
            <select
              id="sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="distance">Distance</option>
              <option value="frequency">Frequency</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <div className="filter-actions">
          <button className="btn-secondary" onClick={handleSelectAll}>
            Select All
          </button>
          <button className="btn-secondary" onClick={handleDeselectAll}>
            Deselect All
          </button>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="stations-grid">
        {filteredStations.length > 0 ? (
          filteredStations.map(station => (
            <div
              key={station.id}
              className={`station-card ${selectedStations.includes(station.id) ? 'selected' : ''}`}
              style={{
                border: selectedStations.includes(station.id) ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
              }}
            >
              <input
                type="checkbox"
                id={station.id}
                checked={selectedStations.includes(station.id)}
                onChange={() => handleToggle(station.id)}
                style={{ marginRight: '0.5rem', cursor: 'pointer' }}
              />

              <label
                htmlFor={station.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{station.callsign}</strong>
                  <span>{getStatusIcon(station.status)} {station.status}</span>
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  {station.name}
                </div>

                <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--color-text-muted)' }}>
                  📍 {station.location}, {station.country}
                </div>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
								<span>{Array.isArray(station.frequency) ? station.frequency.join(', ') : station.frequency} kHz</span>	
                  {station.power && <span>⚡ {station.power} kW</span>}
                  {station.distance !== undefined && (
                    <span>{Math.round(station.distance)} km</span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    marginTop: '0.5rem',
                    color: 'var(--color-text-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  {station.purpose}
                </div>
              </label>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No stations found matching your filters.
          </div>
        )}
      </div>

      <div className="info-box">
        <h3>ℹ️ About VLF Reception Stations</h3>
        <p>
          These are real VLF transmitter stations worldwide from the AAVSO (American Association of Variable Star Observers).
          Select the ones you want to monitor from your Observatory #{observatoryId}.
        </p>
        <p>
          You can select multiple stations and monitor them simultaneously. The data from these stations will help you detect
          Sudden Ionospheric Disturbances (SID) caused by solar flares.
        </p>
      </div>
    </div>
  );
};

export default SelectVLFStations;