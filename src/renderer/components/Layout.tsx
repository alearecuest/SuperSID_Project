import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/layout.css';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  isConnected: boolean;
  isDarkMode: boolean;
  stationId: number;
  onPageChange: (page: string) => void;
  onStationChange: (stationId: number) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  isConnected,
  isDarkMode,
  stationId,
  onPageChange,
  onStationChange,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout-container">
      <Sidebar
        currentPage={currentPage}
        onPageChange={onPageChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="layout-main">
        <Header
          isConnected={isConnected}
          observatoryId={stationId}
          onStationChange={onStationChange}
          isDarkMode={isDarkMode}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;