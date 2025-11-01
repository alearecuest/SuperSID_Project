import { ApiResponse, ApiError, SuperSIDError } from '../types';

export class APIClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number = 30000;

  constructor(baseUrl: string = 'http://localhost:3001', apiKey: string = '') {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error: ApiError = {
        code: `HTTP_${response.status}`,
        message: data?.message || `HTTP Error: ${response.status}`,
        details: data?.details,
      };

      throw new SuperSIDError(error.code, error.message, response.status, error.details);
    }

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  private handleError<T>(error: any): ApiResponse<T> {
    if (error instanceof SuperSIDError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new SuperSIDError('TIMEOUT', 'Request timeout exceeded', 408);
    }

    if (error instanceof TypeError) {
      throw new SuperSIDError('NETWORK_ERROR', 'Network request failed');
    }

    throw new SuperSIDError('UNKNOWN_ERROR', 'An unknown error occurred');
  }
}

export const apiClient = new APIClient();

export const endpoints = {
  stations: {
    list: () => '/api/stations',
    get: (id: number) => `/api/stations/${id}`,
    create: () => '/api/stations',
    update: (id: number) => `/api/stations/${id}`,
    delete: (id: number) => `/api/stations/${id}`,
    config: (id: number) => `/api/stations/${id}/config`,
    sync: (id: number) => `/api/stations/${id}/sync`,
  },

  // Signals
  signals: {
    list: (stationId: number) => `/api/stations/${stationId}/signals`,
    get: (stationId: number, signalId: string) => `/api/stations/${stationId}/signals/${signalId}`,
    query: (stationId: number) => `/api/stations/${stationId}/signals/query`,
  },

  // Events
  events: {
    list: (stationId: number) => `/api/stations/${stationId}/events`,
    get: (stationId: number, eventId: string) => `/api/stations/${stationId}/events/${eventId}`,
    create: (stationId: number) => `/api/stations/${stationId}/events`,
    update: (stationId: number, eventId: string) => `/api/stations/${stationId}/events/${eventId}`,
    delete: (stationId: number, eventId: string) => `/api/stations/${stationId}/events/${eventId}`,
  },

  // Analysis
  analysis: {
    frequency: (stationId: number) => `/api/stations/${stationId}/analysis/frequency`,
    timeseries: (stationId: number) => `/api/stations/${stationId}/analysis/timeseries`,
    anomalies: (stationId: number) => `/api/stations/${stationId}/analysis/anomalies`,
    correlation: () => '/api/analysis/correlation',
  },

  // Data
  data: {
    export: () => '/api/data/export',
    import: () => '/api/data/import',
  },

  // Health
  health: {
    status: () => '/api/health/status',
    version: () => '/api/health/version',
  },
};

// Helper functions
export async function getStations() {
  return apiClient.get(endpoints.stations.list());
}

export async function getStation(id: number) {
  return apiClient.get(endpoints.stations.get(id));
}

export async function getSignals(stationId: number, startTime?: string, endTime?: string) {
  const params = new URLSearchParams();
  if (startTime) params.append('startTime', startTime);
  if (endTime) params.append('endTime', endTime);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient.get(endpoints.signals.list(stationId) + query);
}

export async function getEvents(stationId: number) {
  return apiClient.get(endpoints.events.list(stationId));
}

export async function getSIDEvents(stationId: number, startTime?: string, endTime?: string) {
  const params = new URLSearchParams();
  if (startTime) params.append('startTime', startTime);
  if (endTime) params.append('endTime', endTime);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiClient.get(endpoints.events.list(stationId) + query);
}

export async function getFrequencyAnalysis(stationId: number) {
  return apiClient.get(endpoints.analysis.frequency(stationId));
}

export async function getTimeSeriesAnalysis(stationId: number) {
  return apiClient.get(endpoints.analysis.timeseries(stationId));
}

export async function getAnomalies(stationId: number) {
  return apiClient.get(endpoints.analysis.anomalies(stationId));
}

export async function checkHealth() {
  return apiClient.get(endpoints.health.status());
}

export async function getVersion() {
  return apiClient.get(endpoints.health.version());
}