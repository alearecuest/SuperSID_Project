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
  quality?: number;
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
      return this.getDefaultSolarActivity();
    }
  }

  async getSolarForecast(): Promise<SolarActivity[]> {
    try {
      const response = await fetch(`${API_BASE}/analysis/space-weather/forecast`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching solar forecast:', error);
      return [this.getDefaultSolarActivity()];
    }
  }

  async getVLFData(observatoryId: number): Promise<VLFData> {
    try {
      const response = await fetch(`${API_BASE}/analysis/vlf/${observatoryId}`);
      const data = await response.json();
      
      // If no signals, try to get simulated data
      if (!data.data.signals || data.data.signals.length === 0) {
        console.warn('⚠️ No VLF data found, loading simulated data...');
        return await this.getSimulatedVLFData(observatoryId);
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching VLF data:', error);
      return await this.getSimulatedVLFData(observatoryId);
    }
  }

  async getVLFAnomalies(observatoryId: number): Promise<VLFSignal[]> {
    try {
      const response = await fetch(`${API_BASE}/analysis/vlf/${observatoryId}/anomalies`);
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching anomalies:', error);
      return [];
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
      
      // If no VLF data, use simulated
      if (!data.data.vlsData.signals || data.data.vlsData.signals.length === 0) {
        console.warn('⚠️ No VLF data in dashboard, loading simulated data...');
        const simulatedVLF = await this.getSimulatedVLFData(observatoryId);
        data.data.vlsData = simulatedVLF;
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      // Return simulated dashboard
      return await this.getSimulatedDashboard(observatoryId);
    }
  }

  // ========== SIMULATION METHODS ==========

  private async getSimulatedVLFData(observatoryId: number): Promise<VLFData> {
    try {
      const response = await fetch(
        `${API_BASE}/simulation/generate-vlf-data/${observatoryId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hours: 24 }),
        }
      );
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        console.log(`✅ Generated ${data.data.length} simulated VLF data points`);
        
        // Add quality field to each signal
        const signalsWithQuality = data.data.map((signal: any) => ({
          ...signal,
          quality: signal.quality || Math.min(100, Math.max(0, 70 + (signal.snr - 25) * 2)), // Calculate quality from SNR
        }));
        
        const amplitudes = signalsWithQuality.map((d: any) => d.amplitude);
        
        return {
          observatoryId,
          signals: signalsWithQuality,
          averageAmplitude: this.calculateAverage(amplitudes),
          peakAmplitude: Math.max(...amplitudes),
          noiseLevel: 5,
          disturbanceIndex: 0,
        };
      }

      return this.getEmptyVLFData(observatoryId);
    } catch (error) {
      console.error('Error generating simulated VLF data:', error);
      return this.getEmptyVLFData(observatoryId);
    }
  }

  private async getSimulatedDashboard(observatoryId: number): Promise<DashboardData> {
    console.warn('⚠️ Loading fully simulated dashboard...');
    
    const solarActivity = this.getDefaultSolarActivity();
    const vlsData = await this.getSimulatedVLFData(observatoryId);
    
    return {
      timestamp: new Date().toISOString(),
      solarActivity,
      vlsData,
      correlation: {
        timestamp: new Date().toISOString(),
        solarActivity,
        vlsSignals: vlsData,
        correlationCoefficient: 0.75,
        relationship: 'Moderate positive correlation (simulated)',
        confidence: 0.85,
        summary: 'This is simulated correlation data for demonstration purposes.',
      },
      anomalies: [],
    };
  }

  private getDefaultSolarActivity(): SolarActivity {
    return {
      timestamp: new Date().toISOString(),
      kIndex: 2.0,
      solarFlux: 150,
      activeRegions: 5,
      sunspots: 30,
      xrayClass: 'B',
      protonFlux: 1,
      electronFlux: 0,
      magneticStorm: 'None',
      source: 'Default values (API unavailable)',
    };
  }

  private getEmptyVLFData(observatoryId: number): VLFData {
    return {
      observatoryId,
      signals: [],
      averageAmplitude: 0,
      peakAmplitude: 0,
      noiseLevel: 0,
      disturbanceIndex: 0,
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}

export const analysisService = new AnalysisService();