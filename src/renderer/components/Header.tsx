import React, { useState } from 'react';
import '../styles/header.css';

interface HeaderProps {
  isConnected: boolean;
  observatoryId: number;
  isDarkMode: boolean;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isConnected,
  observatoryId,
  onMenuToggle,
}) => {
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
        {/* CONNECTION STATUS */}
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* CURRENT TIME */}
        <div className="current-time">
          <span className="time-icon">🕐</span>
          <span className="time-value">{currentTime}</span>
        </div>

        {/* OBSERVATORY ID - SOLO MOSTRAR */}
        <div className="observatory-info">
          <div className="observatory-label">Observatory</div>
          <div className="observatory-id">#{observatoryId}</div>
        </div>

        {/* USER PROFILE */}
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