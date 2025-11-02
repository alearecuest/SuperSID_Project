import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataVisualization from './pages/DataVisualization';
import StationManager from './pages/StationManager';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';
import ObservatorySetup from './pages/ObservatorySetup';
import SelectVLFStations from './pages/SelectVLFStations';

type PageType = 'setup' | 'stations' | 'dashboard' | 'visualization' | 'analysis' | 'settings';

interface AppState {
  currentPage: PageType;
  isConnected: boolean;
  isDarkMode: boolean;
  observatoryId: number;
  monitoredStations: string[];
  isSetupComplete: boolean;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'setup',
    isConnected: false,
    isDarkMode: true,
    observatoryId: 281, // Tu observatorio
    monitoredStations: [],
    isSetupComplete: false,
  });

  useEffect(() => {
    console.log('SuperSID Pro Analytics - Application Started');
    initializeConnection();
    loadSavedState();
  }, []);

  const loadSavedState = () => {
    // Aquí cargaremos estado guardado del localStorage más adelante
    const saved = localStorage.getItem('appState');
    if (saved) {
      const parsedState = JSON.parse(saved);
      setAppState(prev => ({ ...prev, ...parsedState }));
    }
  };

  const saveState = (newState: AppState) => {
    localStorage.setItem('appState', JSON.stringify(newState));
    setAppState(newState);
  };

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

  const handleObservatorySet = (observatoryId: number) => {
    const newState = {
      ...appState,
      observatoryId,
      currentPage: 'stations' as PageType,
    };
    saveState(newState);
  };

  const handleStationsChange = (stationIds: string[]) => {
    const newState = {
      ...appState,
      monitoredStations: stationIds,
      isSetupComplete: stationIds.length > 0,
      currentPage: appState.isSetupComplete ? 'dashboard' : ('stations' as PageType),
    };
    saveState(newState);
  };

  const handlePageChange = (page: PageType) => {
    setAppState(prev => ({ ...prev, currentPage: page }));
  };

  const renderCurrentPage = () => {
    switch (appState.currentPage) {
      case 'setup':
        return (
          <ObservatorySetup
            observatoryId={appState.observatoryId}
            onObservatorySet={handleObservatorySet}
          />
        );
      case 'stations':
        return (
          <SelectVLFStations
            observatoryId={appState.observatoryId}
            observatoryLat={37.4419}
            observatoryLon={-122.1430}
            selectedStations={appState.monitoredStations}
            onStationsChange={handleStationsChange}
          />
        );
      case 'dashboard':
        return <Dashboard stationId={appState.observatoryId} />;
      case 'visualization':
        return <DataVisualization stationId={appState.observatoryId} />;
      case 'analysis':
        return <Analysis stationId={appState.observatoryId} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard stationId={appState.observatoryId} />;
    }
  };

  return (
    <Layout
      currentPage={appState.currentPage}
      isConnected={appState.isConnected}
      isDarkMode={appState.isDarkMode}
      stationId={appState.observatoryId}
      onPageChange={handlePageChange}
      onStationChange={() => {}}
    >
      {renderCurrentPage()}
    </Layout>
  );
};

export default App;