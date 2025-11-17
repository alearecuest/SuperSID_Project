import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FirstTimeWizard from './pages/FirstTimeWizard';
import Dashboard from './pages/Dashboard';
import DataVisualization from './pages/DataVisualization';
import StationManager from './pages/StationManager';
import Analysis from './pages/Analysis';
import Settings from './pages/Settings';
import ObservatorySetup from './pages/ObservatorySetup';
import SelectVLFStations from './pages/SelectVLFStations';
import SpaceWeather from './pages/SpaceWeather';
import VLFSignals from './pages/VLFSignals';
import Correlation from './pages/Correlation';
import { configService } from './services/config.service';
import VLFMonitor from './pages/VLFMonitor';

type PageType = 'setup' | 'stations' | 'dashboard' | 'visualization' | 'analysis' | 'settings' | 'observatory-config' | 'space-weather' | 'vlf-monitor' | 'vlf-signals' | 'correlation';

interface AppState {
  currentPage: PageType;
  isConnected: boolean;
  isDarkMode: boolean;
  observatoryId: number;
  monitoredStations: string[];
  isConfigured: boolean;
  isLoading: boolean;
  showWizard: boolean;
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
    showWizard: false,
  });

  useEffect(() => {
    console.log('SuperSID Pro Analytics - Application Started');
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check backend connection
      await initializeConnection();

      // Check if wizard was completed
      const wizardCompleted = localStorage.getItem('supersid-wizard-completed') === 'true';
      
      // Load config
      const config = configService.getConfig();
      const isConfigured = config.observatoryId > 0 && config.observatoryName.length > 0;

      console.log('App Initialization:');
      console.log('  - Wizard completed:', wizardCompleted);
      console.log('  - Is configured:', isConfigured);
      console.log('  - Observatory ID:', config.observatoryId);

      setAppState(prev => ({
        ...prev,
        observatoryId: config.observatoryId,
        monitoredStations: config.monitoredStations || [],
        isConfigured,
        showWizard: !wizardCompleted || !isConfigured,
        currentPage: (wizardCompleted && isConfigured) ? 'dashboard' : 'setup',
        isLoading: false,
      }));

    } catch (error) {
      console.error('Error initializing app:', error);
      setAppState(prev => ({ ...prev, isLoading: false, showWizard: true }));
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

  const handleWizardComplete = async () => {
    console.log('Wizard completed');
    
    // Reload config
    const config = configService.getConfig();
    
    setAppState(prev => ({
      ...prev,
      observatoryId: config.observatoryId,
      monitoredStations: config.monitoredStations || [],
      isConfigured: true,
      showWizard: false,
      currentPage: 'dashboard',
    }));
  };

  const handlePageChange = (page: PageType) => {
    setAppState(prev => ({ ...prev, currentPage: page }));
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

  const renderCurrentPage = () => {
    if (appState.isLoading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f172a' }}>
          <div style={{ textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading SuperSID Pro...</p>
          </div>
        </div>
      );
    }

    if (appState.showWizard) {
      return <FirstTimeWizard onComplete={handleWizardComplete} />;
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
            observatoryLat={configService.getConfig().latitude}
            observatoryLon={configService.getConfig().longitude}
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
      case 'space-weather':
        return <SpaceWeather />;
      case 'vlf-monitor':
        return <VLFMonitor observatoryId={appState.observatoryId} />;
      case 'vlf-signals':
        return <VLFSignals observatoryId={appState.observatoryId} />;
      case 'correlation':
        return <Correlation observatoryId={appState.observatoryId} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard stationId={appState.observatoryId} />;
    }
  };

  if (appState.showWizard) {
    return renderCurrentPage();
  }

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