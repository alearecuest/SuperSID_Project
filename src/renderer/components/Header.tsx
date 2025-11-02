import React, { useState, useEffect } from 'react';
import { configService } from '../services/config.service';
import { configObserverService } from '../services/config-observer.service';
import '../styles/header.css';

interface HeaderProps {
  isConnected: boolean;
  isDarkMode: boolean;
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isConnected,
  onMenuToggle,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('00:00:00');
  const [observatoryId, setObservatoryId] = useState<number>(0);

  useEffect(() => {
    // Cargar observatoryId inicial
    const updateObservatoryId = () => {
      const id = configService.getObservatoryId();
      console.log('📡 Header - Observatory ID loaded:', id);
      setObservatoryId(id);
    };

    updateObservatoryId();

    // Suscribirse a cambios de configuración
    const unsubscribe = configObserverService.subscribe(() => {
      console.log('🔔 Header - Config changed, updating Observatory ID');
      updateObservatoryId();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Actualizar hora cada segundo
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

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

      <div className="header-center">
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span className="status-text">
            {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        <div className="current-time">
          <span className="time-value">{currentTime}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="observatory-info">
          <div className="observatory-label">OBSERVATORY</div>
          <div className="observatory-id">#{observatoryId}</div>
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