import React, { useState } from 'react';
import '../styles/header.css';

interface HeaderProps {
  isConnected: boolean;
  stationId: number;
  onStationChange: (stationId: number) => void;
  isDarkMode: boolean;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isConnected,
  stationId,
  onStationChange,
  isDarkMode,
  onMenuToggle,
}) => {
  const [showStationDropdown, setShowStationDropdown] = useState(false);

  const stations = [
    { id: 281, name: 'Station 281 - Observatory' },
    { id: 282, name: 'Station 282 - Research Lab' },
    { id: 283, name: 'Station 283 - Field Site' },
  ];

  const handleStationSelect = (id: number) => {
    onStationChange(id);
    setShowStationDropdown(false);
  };

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle} title="Toggle menu">
          ☰
        </button>
        <div className="header-title">
          <h1>SuperSID Pro Analytics</h1>
          <p className="subtitle">Professional VLF Signal Detection & Analysis</p>
        </div>
      </div>

      <div className="header-right">
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="current-time">
          <span className="time-icon">🕐</span>
          <span className="time-value">{currentTime}</span>
        </div>

        <div className="station-selector">
          <button
            className="station-button"
            onClick={() => setShowStationDropdown(!showStationDropdown)}
          >
            <span className="station-icon">🛰️</span>
            <span className="station-id">Station {stationId}</span>
          </button>
          
          {showStationDropdown && (
            <div className="station-dropdown">
              {stations.map(station => (
                <button
                  key={station.id}
                  className={`station-option ${stationId === station.id ? 'active' : ''}`}
                  onClick={() => handleStationSelect(station.id)}
                >
                  <span className="option-id">#{station.id}</span>
                  <span className="option-name">{station.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="user-profile">
          <button className="profile-button" title="User profile">
            <span className="profile-avatar">A</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;