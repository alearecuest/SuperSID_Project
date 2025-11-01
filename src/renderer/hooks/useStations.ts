import { useState, useEffect, useCallback } from 'react';
import { Station } from '../types';
import { getStations, getStation } from '../utils/api';
import { logger } from '../utils/logger';

export const useStations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug('Fetching stations...');

      const response = await getStations();
      if (response.success && response.data) {
        setStations(response.data as Station[]);
        logger.info(`Successfully loaded ${(response.data as Station[]).length} stations`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stations';
      setError(errorMessage);
      logger.error('Failed to fetch stations', err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStation = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug(`Fetching station ${id}...`);

      const response = await getStation(id);
      if (response.success && response.data) {
        setSelectedStation(response.data as Station);
        logger.info(`Successfully loaded station ${id}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch station';
      setError(errorMessage);
      logger.error(`Failed to fetch station ${id}`, err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  return {
    stations,
    selectedStation,
    isLoading,
    error,
    fetchStations,
    fetchStation,
    setSelectedStation,
  };
};

export default useStations;