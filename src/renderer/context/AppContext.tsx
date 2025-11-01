import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, Station } from '../types';
import { configStorage, sessionStorage } from '../utils/storage';
import { logger } from '../utils/logger';
import { checkHealth } from '../utils/api';

interface AppContextType {
  state: AppState;
  stations: Station[];
  selectedStation: Station | null;
  selectStation: (station: Station | null) => void;
  setDarkMode: (isDark: boolean) => void;
  setConnected: (connected: boolean) => void;
  updateConfig: (config: Partial<AppState['config']>) => void;
  navigate: (page: string) => void;
  isHealthy: boolean;
  lastHealthCheck: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    isConnected: false,
    isDarkMode: true,
    stationId: 0,
    currentPage: 'dashboard',
    config: configStorage.getConfig(),
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStationState] = useState<Station | null>(null);
  const [isHealthy, setIsHealthy] = useState(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<string | null>(null);

  useEffect(() => {
    const checkAPIHealth = async () => {
      try {
        logger.debug('Checking API health...');
        const response = await checkHealth();
        if (response.success) {
          setIsHealthy(true);
          setState(prev => ({ ...prev, isConnected: true }));
          logger.info('API is healthy');
        }
      } catch (error) {
        setIsHealthy(false);
        setState(prev => ({ ...prev, isConnected: false }));
        logger.warn('API health check failed', error as Error);
      } finally {
        setLastHealthCheck(new Date().toISOString());
      }
    };

    checkAPIHealth();

    const interval = setInterval(checkAPIHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const prefs = sessionStorage.getSessionId();
    if (prefs) {
      logger.debug('Session restored from storage');
    }
  }, []);

  const selectStation = (station: Station | null) => {
    setSelectedStationState(station);
    if (station) {
      setState(prev => ({ ...prev, stationId: station.id }));
      logger.debug(`Selected station: ${station.name} (ID: ${station.id})`);
    }
  };

  const setDarkMode = (isDark: boolean) => {
    setState(prev => ({ ...prev, isDarkMode: isDark }));
    logger.debug(`Dark mode ${isDark ? 'enabled' : 'disabled'}`);
  };

  const setConnected = (connected: boolean) => {
    setState(prev => ({ ...prev, isConnected: connected }));
    logger.info(`Connection status: ${connected ? 'connected' : 'disconnected'}`);
  };

  const updateConfig = (config: Partial<AppState['config']>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...config },
    }));
    configStorage.setConfig(config);
    logger.debug('Application config updated', config);
  };

  const navigate = (page: string) => {
    setState(prev => ({ ...prev, currentPage: page }));
    logger.debug(`Navigated to page: ${page}`);
  };

  const value: AppContextType = {
    state,
    stations,
    selectedStation,
    selectStation,
    setDarkMode,
    setConnected,
    updateConfig,
    navigate,
    isHealthy,
    lastHealthCheck,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;