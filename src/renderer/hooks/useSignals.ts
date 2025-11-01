import { useState, useEffect, useCallback } from 'react';
import { SignalData } from '../types';
import { getSignals } from '../utils/api';
import { logger } from '../utils/logger';

interface UseSignalsOptions {
  stationId: number;
  startTime?: string;
  endTime?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useSignals = ({
  stationId,
  startTime,
  endTime,
  autoRefresh = false,
  refreshInterval = 5000,
}: UseSignalsOptions) => {
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug(`Fetching signals for station ${stationId}...`);

      const response = await getSignals(stationId, startTime, endTime);
      if (response.success && response.data) {
        setSignals(response.data as SignalData[]);
        logger.info(`Successfully loaded ${(response.data as SignalData[]).length} signals`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch signals';
      setError(errorMessage);
      logger.error('Failed to fetch signals', err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [stationId, startTime, endTime]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchSignals();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSignals]);

  return {
    signals,
    isLoading,
    error,
    refetch: fetchSignals,
  };
};

export default useSignals;