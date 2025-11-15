/**
 * SuperSID Service (Updated)
 * 
 * Now integrates with real VLF monitoring services.
 * Maintains backward compatibility with existing API endpoints.
 */

import { vlfMonitorService } from './vlf-monitor.service.js';
import type { ProcessedSignal } from './signal-processing.service.js';

export interface VLFSignal {
  timestamp: string;
  frequency: number;
  amplitude: number;
  phase: number;
  snr: number;
  quality: number;
}

export interface SuperSIDData {
  observatoryId: number;
  signals: VLFSignal[];
  averageAmplitude: number;
  peakAmplitude: number;
  noiseLevel: number;
  disturbanceIndex: number;
}

class SuperSIDService {
  /**
   * Get VLF data for an observatory
   * Now uses real data from VLF Monitor Service
   */
  getData(observatoryId: number): SuperSIDData {
    // Get latest signals from VLF monitor
    const latestSignals = vlfMonitorService.getLatestData(60); // Last 60 samples

    // Convert ProcessedSignal to VLFSignal format
    const signals: VLFSignal[] = latestSignals.map(this.convertToVLFSignal);

    // Calculate metrics
    const averageAmplitude = this.calculateAverage(signals.map(s => s.amplitude));
    const peakAmplitude = this.calculatePeak(signals.map(s => s.amplitude));
    const averageNoise = this.calculateAverage(
      latestSignals.map(s => s.noiseFloor)
    );
    const disturbanceIndex = this.calculateDisturbanceIndex(signals);

    return {
      observatoryId,
      signals,
      averageAmplitude,
      peakAmplitude,
      noiseLevel: averageNoise,
      disturbanceIndex,
    };
  }

  /**
   * Detect anomalies in VLF signals
   */
  detectAnomalies(): VLFSignal[] {
    const latestSignals = vlfMonitorService.getLatestData(1440); // Last 24 hours
    
    if (latestSignals.length < 10) return [];

    const amplitudes = latestSignals.map(s => s.amplitude);
    const mean = this.calculateAverage(amplitudes);
    const stdDev = this.calculateStdDev(amplitudes, mean);

    // Find signals 2 std deviations away from mean
    return latestSignals
      .filter(s => Math.abs(s.amplitude - mean) > 2 * stdDev)
      .map(this.convertToVLFSignal);
  }

  /**
   * Get latest signals
   */
  getLatestSignals(count: number = 60): VLFSignal[] {
    const signals = vlfMonitorService.getLatestData(count);
    return signals.map(this.convertToVLFSignal);
  }

  /**
   * Clear buffer (for backward compatibility)
   */
  clearBuffer(): void {
    console.log('Buffer clear requested (handled by VLF Monitor Service)');
  }

  // ========== PRIVATE HELPERS ==========

  /**
   * Convert ProcessedSignal to VLFSignal format
   */
  private convertToVLFSignal(signal: ProcessedSignal): VLFSignal {
    return {
      timestamp: new Date(signal.timestamp).toISOString(),
      frequency: signal.frequency,
      amplitude: signal.amplitude,
      phase: signal.phase,
      snr: signal.snr,
      quality: signal.quality,
    };
  }

  /**
   * Calculate average
   */
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  /**
   * Calculate peak value
   */
  private calculatePeak(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.max(...values);
  }

  /**
   * Calculate standard deviation
   */
  private calculateStdDev(values: number[], mean: number): number {
    if (values.length < 2) return 0;
    
    const variance = values.reduce(
      (sum, v) => sum + Math.pow(v - mean, 2),
      0
    ) / values.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate disturbance index
   */
  private calculateDisturbanceIndex(signals: VLFSignal[]): number {
    if (signals.length < 2) return 0;

    const amplitudes = signals.map(s => s.amplitude);
    const mean = this.calculateAverage(amplitudes);
    const stdDev = this.calculateStdDev(amplitudes, mean);

    const index = Math.min(100, (stdDev / Math.abs(mean)) * 100);
    return isNaN(index) ? 0 : index;
  }
}

export const superSIDService = new SuperSIDService();