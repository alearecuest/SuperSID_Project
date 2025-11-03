const API_BASE = 'http://localhost:3001/api';

export interface SolarActivity {
  timestamp: string;
  kIndex: number;
  solarFlux: number;
  activeRegions: number;
  sunspots: number;
  xrayClass: string;
  protonFlux: number;
  electronFlux: number;
  magneticStorm: string;
  source: string;
}

export interface VLFSignal {
  timestamp: string;
  frequency: number;
  amplitude: number;
  phase: number;
  snr: number;
  quality: number;
}

export interface VLFData {
  observatoryId: number;
  signals: VLFSignal[];
  averageAmplitude: number;
  peakAmplitude: number;
  noiseLevel: number;
  disturbanceIndex: number;
}

export interface CorrelationData {
  timestamp: string;
  solarActivity: SolarActivity;
  vlsSignals: VLFData;
  correlationCoefficient: number;
  relationship: string;
  confidence: number;
  summary: string;
}

export interface DashboardData {
  timestamp: string;
  solarActivity: SolarActivity;
  vlsData: VLFData;
  correlation: CorrelationData;
  anomalies: VLFSignal[];
}

class AnalysisService {
  async getCurrentSolarActivity(): Promise<SolarActivity> {
    try {
      const response = await fetch(`${API_BASE}/analysis/space-weather`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching solar activity:', error);
      throw error;
    }
  }

  async getSolarForecast(): Promise<SolarActivity[]> {
    try {
      const response = await fetch(`${API_BASE}/analysis/space-weather/forecast`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching solar forecast:', error);
      throw error;
    }
  }

  async getVLFData(observatoryId: number): Promise<VLFData> {
    try {
      const response = await fetch(`${API_BASE}/analysis/vlf/${observatoryId}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching VLF data:', error);
      throw error;
    }
  }

  async getVLFAnomalies(observatoryId: number): Promise<VLFSignal[]> {
    try {
      const response = await fetch(`${API_BASE}/analysis/vlf/${observatoryId}/anomalies`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      throw error;
    }
  }

  async correlateData(observatoryId: number): Promise<CorrelationData> {
    try {
      const response = await fetch(`${API_BASE}/analysis/correlate/${observatoryId}`, {
        method: 'POST',
      });
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error correlating data:', error);
      throw error;
    }
  }

  async getDashboard(observatoryId: number): Promise<DashboardData> {
    try {
      const response = await fetch(`${API_BASE}/analysis/dashboard/${observatoryId}`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }
}

export const analysisService = new AnalysisService();