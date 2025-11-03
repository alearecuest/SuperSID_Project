import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataVisualization from './pages/DataVisualization';
import StationManager from './pages/StationManager';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';
import ObservatorySetup from './pages/ObservatorySetup';
import SelectVLFStations from './pages/SelectVLFStations';
import { configService } from './services/config.service';

type PageType = 'setup' | 'stations' | 'dashboard' | 'visualization' | 'analysis' | 'settings' | 'observatory-config';

interface AppState {
  currentPage: PageType;
  isConnected: boolean;
  isDarkMode: boolean;
  observatoryId: number;
  monitoredStations: string[];
  isConfigured: boolean;
  isLoading: boolean;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'dashboard',
    isConnected: false,
    isDarkMode: true,
    observatoryId: 0,
    monitoredStations: [],
    isConfigured: false,
    isLoading: true,
  });

  useEffect(() => {
    console.log('SuperSID Pro Analytics - Application Started');
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const config = await configService.initialize();
      
      initializeConnection();

      const isConfigured = configService.isConfigured();
      
      setAppState(prev => ({
        ...prev,
        observatoryId: config.observatoryId,
        monitoredStations: config.monitoredStations,
        isConfigured,
        currentPage: isConfigured ? 'dashboard' : 'setup',
        isLoading: false,
      }));

      console.log('App initialized. Observatory ID:', config.observatoryId);
    } catch (error) {
      console.error('Error initializing app:', error);
      setAppState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const initializeConnection = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        setAppState(prev => ({ ...prev, isConnected: true }));
        console.log('Connected to backend');
      }
    } catch (error) {
      console.error('Failed to connect to backend:', error);
      setAppState(prev => ({ ...prev, isConnected: false }));
    }
  };

  const handleObservatorySet = async (observatoryData: any) => {
    try {
      await configService.saveObservatory(observatoryData);

      const response = await fetch('http://localhost:3001/api/observatory/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(observatoryData),
      });

      if (response.ok) {
        setAppState(prev => ({
          ...prev,
          observatoryId: observatoryData.id,
          isConfigured: true,
          currentPage: 'stations',
        }));
        console.log('Observatory saved');
      }
    } catch (error) {
      console.error('Error saving observatory:', error);
    }
  };

  const handleStationsChange = async (stationIds: string[]) => {
    try {
      await configService.updateMonitoredStations(stationIds);

      if (appState.observatoryId > 0) {
        for (const stationId of stationIds) {
          await fetch('http://localhost:3001/api/stations/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              observatoryId: appState.observatoryId,
              stationId,
            }),
          });
        }
      }

      setAppState(prev => ({
        ...prev,
        monitoredStations: stationIds,
        currentPage: stationIds.length > 0 ? 'dashboard' : 'stations',
      }));
      console.log('Monitored stations updated');
    } catch (error) {
      console.error('Error updating stations:', error);
    }
  };

  const handlePageChange = (page: PageType) => {
    setAppState(prev => ({ ...prev, currentPage: page }));
  };

  const renderCurrentPage = () => {
    if (appState.isLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <p>Loading SuperSID Pro...</p>
          </div>
        </div>
      );
    }

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
      case 'observatory-config':
        return (
          <ObservatorySetup
            observatoryId={appState.observatoryId}
            onObservatorySet={handleObservatorySet}
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