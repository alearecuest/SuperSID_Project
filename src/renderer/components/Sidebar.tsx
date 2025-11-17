import React from 'react';
import '../styles/sidebar.css';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'visualization', label: 'Visualization' },
    { id: 'vlf-monitor', label: 'VLF Monitor' },
    { id: 'stations', label: 'Stations' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'space-weather', label: 'Space Weather' },
    { id: 'vlf-signals', label: 'VLF Signals' },
    { id: 'correlation', label: 'Correlation' },
    { id: 'observatory-config', label: 'Observatory' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img
            src="/logo.png"
            alt="SuperSID Pro"
            className="logo-image"
          />
          <span className="logo-text">SuperSID Pro</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          {menuItems.slice(0, 5).map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
              title={item.label}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Analysis</div>
          {menuItems.slice(5, 8).map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
              title={item.label}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Configuration</div>
          {menuItems.slice(8).map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onPageChange(item.id)}
              title={item.label}
            >
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="version-info">
          <span className="version-label">v1.0.0</span>
          <span className="version-status">Pro</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;