// ============================================
// OBSERVATORIO - Tu estación única
// ============================================
export interface Observatory {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timezone: string;
  institution: string;
  solarCenterApiKey?: string;
  status: 'registered' | 'pending' | 'inactive';
  registeredAt: string;
  description?: string;
}

// ============================================
// ESTACIONES VLF - Estaciones que monitoreas
// ============================================
export interface VLFStation {
  id: string;
  callsign: string;
  name: string;
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  frequency: number;
  power?: number;
  purpose: string;
  status: 'active' | 'inactive' | 'intermittent';
  distance?: number;
}

export type Station = VLFStation;

// ============================================
// CONFIGURACIÓN APP
// ============================================
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
  observatoryId: number;
  monitoredStations: string[];
  currentPage: string;
  config: AppConfig;
}

// ============================================
// DATOS Y EVENTOS
// ============================================
export interface SIDEvent {
  id: string;
  stationId: string;
  timestamp: string;
  frequency: number;
  magnitude: number;
  duration: number;
  type: 'SID' | 'anomaly' | 'noise';
  confidence: number;
}

export interface SignalData {
  frequency: number;
  amplitude: number;
  timestamp: string;
  quality: number;
}

export interface FrequencyBand {
  name: string;
  startFreq: number;
  endFreq: number;
  enabled: boolean;
}

// ============================================
// API RESPONSES
// ============================================
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

// ============================================
// USER
// ============================================
export interface UserPreferences {
  theme: 'dark' | 'light';
  language: string;
  notifications: boolean;
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

// ============================================
// EXPORT
// ============================================
export interface ExportConfig {
  format: 'csv' | 'json' | 'parquet';
  dateRange: [string, string];
  includeRawData: boolean;
  includeAnalysis: boolean;
  stationIds: string[];
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

// ============================================
// CUSTOM ERRORS
// ============================================
export class SuperSIDError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'SuperSIDError';
  }
}

export interface StationConfig {
  samplingRate: number;
  frequencyBands: FrequencyBand[];
  recordingDuration: number;
  calibrationFactor: number;
  noiseThreshold: number;
}