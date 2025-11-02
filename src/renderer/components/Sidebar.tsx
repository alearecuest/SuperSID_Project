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
  isOpen,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'visualization', label: 'Visualization', icon: '📈' },
    { id: 'stations', label: 'Stations', icon: '🛰️' },
    { id: 'analysis', label: 'Analysis', icon: '🔬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
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
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onPageChange(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
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