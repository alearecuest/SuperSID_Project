export interface AppConfig {
  apiUrl: string;
  apiKey: string;
  theme: 'dark' | 'light' | 'auto';
  autoRefresh: boolean;
  refreshInterval: number;
  notifications: boolean;
  soundAlerts: boolean;
  dataRetention: number;
  exportFormat: 'csv' | 'json' | 'parquet';
}

export interface AppState {
  isConnected: boolean;
  isDarkMode: boolean;
  stationId: number;
  currentPage: string;
  config: AppConfig;
}

export interface Station {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  altitude: number;
  status: 'online' | 'offline' | 'maintenance';
  lastSync: string;
  observations: number;
  timezone?: string;
  description?: string;
}

export interface StationConfig {
  samplingRate: number;
  frequencyBands: FrequencyBand[];
  recordingDuration: number;
  calibrationFactor: number;
  noiseThreshold: number;
}

export interface FrequencyBand {
  name: string;
  startFrequency: number;
  endFrequency: number;
  priority: number;
}

export interface SignalData {
  id?: string;
  stationId: number;
  timestamp: string;
  frequency: number;
  amplitude: number;
  phase: number;
  snr?: number;
  quality?: number;
}

export interface SignalFrame {
  stationId: number;
  timestamp: string;
  samples: number;
  sampleRate: number;
  data: Float32Array;
  metadata?: Record<string, any>;
}

export interface SIDEvent {
  id: string;
  stationId: number;
  timestamp: string;
  endTime?: string;
  duration: number;
  magnitude: number;
  frequency: number;
  frequencyRange: [number, number];
  confidence: number;
  classification?: string;
  notes?: string;
}

export interface SIDEventReport {
  eventId: string;
  stationId: number;
  timestamp: string;
  duration: number;
  peakMagnitude: number;
  averageMagnitude: number;
  frequency: number;
  frequencyBandwidth: number;
  confidence: number;
  affectedBands: FrequencyBand[];
  solarEventCorrelation?: string;
  comments?: string;
}

export interface AnalysisResult {
  type: 'frequency' | 'time-series' | 'anomaly' | 'correlation';
  stationId: number;
  startTime: string;
  endTime: string;
  data: AnalysisData;
  metadata?: Record<string, any>;
}

export interface AnalysisData {
  frequencyData?: FrequencyAnalysis[];
  timeSeriesData?: TimeSeriesPoint[];
  anomalies?: Anomaly[];
  correlations?: CorrelationData[];
}

export interface FrequencyAnalysis {
  frequency: number;
  amplitude: number;
  phase: number;
  power: number;
  bandwidth?: number;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
  confidence?: number;
}

export interface Anomaly {
  id: string;
  timestamp: string;
  type: 'spike' | 'drop' | 'drift' | 'noise' | 'other';
  severity: 'low' | 'medium' | 'high';
  value: number;
  expectedValue: number;
  deviation: number;
  description: string;
}

export interface CorrelationData {
  station1Id: number;
  station2Id: number;
  frequency: number;
  correlationCoefficient: number;
  timeDelay: number;
  confidence: number;
}

export interface SpectrogramData {
  times: string[];
  frequencies: number[];
  magnitudes: number[][];
  colorMap?: string;
}

export interface WaveformData {
  timestamp: string;
  samples: number[];
  sampleRate: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ExportConfig {
  format: 'csv' | 'json' | 'parquet';
  dateRange: [string, string];
  includeRawData: boolean;
  includeAnalysis: boolean;
  includeEvents: boolean;
  stationIds: number[];
  fileName: string;
}

export interface ExportReport {
  id: string;
  config: ExportConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  fileSize?: number;
  filePath?: string;
  error?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  preferences: UserPreferences;
  createdAt: string;
  lastLogin?: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  notifications: boolean;
  soundAlerts: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultStation?: number;
  timezone: string;
}

export interface Statistics {
  totalObservations: number;
  totalEvents: number;
  averageEventDuration: number;
  averageAmplitude: number;
  peakAmplitude: number;
  uptime: number;
  dataQuality: number;
}

export interface HistoricalStats {
  date: string;
  eventCount: number;
  averageMagnitude: number;
  peakMagnitude: number;
  observations: number;
  dataQuality: number;
}

export class SuperSIDError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'SuperSIDError';
  }
}

export type EventCallback<T = any> = (data: T) => void;
export type EventListener = {
  event: string;
  callback: EventCallback;
};