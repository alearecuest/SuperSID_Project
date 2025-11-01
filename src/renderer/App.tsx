import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataVisualization from './pages/DataVisualization';
import StationManager from './pages/StationManager';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';

type PageType = 'dashboard' | 'visualization' | 'stations' | 'analysis' | 'settings';

interface AppState {
  currentPage: PageType;
  isConnected: boolean;
  isDarkMode: boolean;
  stationId: number;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'dashboard',
    isConnected: false,
    isDarkMode: true,
    stationId: 281,
  });

  useEffect(() => {
    // Initialize app
    console.log('SuperSID Pro Analytics - Application Started');
    // Connect to backend
    initializeConnection();
  }, []);

  const initializeConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        setAppState(prev => ({ ...prev, isConnected: true }));
      }
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      setAppState(prev => ({ ...prev, isConnected: false }));
    }
  };

  const handlePageChange = (page: PageType) => {
    setAppState(prev => ({ ...prev, currentPage: page }));
  };

  const handleStationChange = (stationId: number) => {
    setAppState(prev => ({ ...prev, stationId }));
  };

  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case 'dashboard':
        return <Dashboard stationId={appState.stationId} />;
      case 'visualization':
        return <DataVisualization stationId={appState.stationId} />;
      case 'stations':
        return <StationManager onStationChange={handleStationChange} />;
      case 'analysis':
        return <Analysis stationId={appState.stationId} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard stationId={appState.stationId} />;
    }
  };

  return (
    <Layout
      currentPage={appState.currentPage}
      isConnected={appState.isConnected}
      isDarkMode={appState.isDarkMode}
      stationId={appState.stationId}
      onPageChange={handlePageChange}
      onStationChange={handleStationChange}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export default App;