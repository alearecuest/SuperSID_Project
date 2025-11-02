import { useState, useEffect, useCallback } from 'react';
import { SIDEvent } from '../types';
import { getSIDEvents } from '../utils/api';
import { logger } from '../utils/logger';

interface UseEventsOptions {
  stationId: number;
  startTime?: string;
  endTime?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useEvents = ({
  stationId,
  startTime,
  endTime,
  autoRefresh = false,
  refreshInterval = 10000,
}: UseEventsOptions) => {
  const [events, setEvents] = useState<SIDEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      logger.debug(`Fetching SID events for station ${stationId}...`);

      const response = await getSIDEvents(stationId, startTime, endTime);
      if (response.success && response.data) {
        setEvents(response.data as SIDEvent[]);
        logger.info(`Successfully loaded ${(response.data as SIDEvent[]).length} events`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(errorMessage);
      logger.error('Failed to fetch events', err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [stationId, startTime, endTime]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchEvents();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchEvents]);

  const getEventStats = useCallback(() => {
    if (events.length === 0) {
      return {
        total: 0,
        averageDuration: 0,
        averageMagnitude: 0,
        peakMagnitude: 0,
      };
    }

    const totalDuration = events.reduce((sum, e) => sum + e.duration, 0);
    const totalMagnitude = events.reduce((sum, e) => sum + e.magnitude, 0);
    const magnitudes = events.map(e => e.magnitude);

    return {
      total: events.length,
      averageDuration: totalDuration / events.length,
      averageMagnitude: totalMagnitude / events.length,
      peakMagnitude: Math.max(...magnitudes),
    };
  }, [events]);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
    stats: getEventStats(),
  };
};

export default useEvents;