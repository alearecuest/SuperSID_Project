/**
 * Signal Processing Service
 * 
 * Processes raw audio samples to extract VLF signal information.
 * Implements FFT, filtering, and signal analysis.
 * 
 * Based on the original SuperSID Python implementation:
 * - FFT for frequency domain analysis
 * - Band-pass filtering for VLF frequencies (20-26 kHz)
 * - Signal strength calculation
 * - Noise reduction
 * 
 * @module SignalProcessingService
 */

import { EventEmitter } from 'events';
import type { AudioSample } from './audio-capture.service.js';

export interface ProcessedSignal {
  timestamp: number;
  frequency: number;          // Target frequency (e.g., 24000 Hz)
  amplitude: number;          // Signal amplitude in dB
  phase: number;              // Phase in radians
  snr: number;                // Signal-to-Noise Ratio in dB
  quality: number;            // Quality index (0-100)
  rawAmplitude: number;       // Raw amplitude value
  noiseFloor: number;         // Estimated noise floor
}

export interface FFTResult {
  frequencies: Float32Array;  // Frequency bins
  magnitudes: Float32Array;   // Magnitude for each bin
  phases: Float32Array;       // Phase for each bin
  sampleRate: number;
}

export interface FilterConfig {
  centerFrequency: number;    // Default: 24000 Hz
  bandwidth: number;          // Default: 2000 Hz (±1000 Hz)
  minFrequency: number;       // Default: 20000 Hz
  maxFrequency: number;       // Default: 26000 Hz
}

/**
 * Signal Processing Service Class
 * 
 * Handles FFT, filtering, and signal analysis for VLF detection.
 */
class SignalProcessingService extends EventEmitter {
  private filterConfig: FilterConfig;
  private signalHistory: ProcessedSignal[] = [];
  private maxHistorySize: number = 1440; // 24 hours at 1 sample/min

  constructor() {
    super();
    
    this.filterConfig = {
      centerFrequency: 24000,
      bandwidth: 2000,
      minFrequency: 20000,
      maxFrequency: 26000,
    };

    console.log('SignalProcessingService initialized');
  }

  /**
   * Process a raw audio sample
   * 
   * @param sample Raw audio sample from AudioCaptureService
   * @returns Processed VLF signal information
   */
  processAudioSample(sample: AudioSample): ProcessedSignal {
    // Use left channel for processing (mono VLF signal)
    const audioData = sample.leftChannel;
    
    // 1. Apply FFT to get frequency domain
    const fftResult = this.computeFFT(audioData, sample.sampleRate);
    
    // 2. Extract VLF band (20-26 kHz)
    const vlfSignal = this.extractVLFBand(fftResult);
    
    // 3. Calculate signal metrics
    const processedSignal = this.calculateSignalMetrics(vlfSignal, sample.timestamp);
    
    // 4. Store in history
    this.addToHistory(processedSignal);
    
    // 5. Emit processed signal
    this.emit('signalProcessed', processedSignal);
    
    return processedSignal;
  }

  /**
   * Get signal history
   */
  getHistory(count?: number): ProcessedSignal[] {
    if (!count) return [...this.signalHistory];
    
    const start = Math.max(0, this.signalHistory.length - count);
    return this.signalHistory.slice(start);
  }

  /**
   * Get latest processed signal
   */
  getLatestSignal(): ProcessedSignal | null {
    return this.signalHistory.length > 0 
      ? this.signalHistory[this.signalHistory.length - 1]
      : null;
  }

  /**
   * Clear signal history
   */
  clearHistory(): void {
    this.signalHistory = [];
    console.log('🧹 Signal history cleared');
  }

  /**
   * Update filter configuration
   */
  updateFilterConfig(config: Partial<FilterConfig>): void {
    this.filterConfig = { ...this.filterConfig, ...config };
    console.log('🔧 Filter config updated:', this.filterConfig);
  }

  /**
   * Get current filter configuration
   */
  getFilterConfig(): FilterConfig {
    return { ...this.filterConfig };
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Compute FFT on audio data
   * 
   * TODO: Replace with actual FFT library (fft.js or kiss-fft-js)
   * For now, this is a simplified simulation
   */
  private computeFFT(audioData: Float32Array, sampleRate: number): FFTResult {
    const N = audioData.length;
    const frequencies = new Float32Array(N / 2);
    const magnitudes = new Float32Array(N / 2);
    const phases = new Float32Array(N / 2);

    // Generate frequency bins
    for (let i = 0; i < N / 2; i++) {
      frequencies[i] = (i * sampleRate) / N;
    }

    // TODO: Implement actual FFT
    // For simulation, generate approximate frequency response
    for (let i = 0; i < N / 2; i++) {
      const freq = frequencies[i];
      
      // Simulate VLF signal around 24 kHz
      const distance = Math.abs(freq - 24000);
      const magnitude = Math.exp(-distance / 1000) * 0.5 + Math.random() * 0.1;
      
      magnitudes[i] = magnitude;
      phases[i] = Math.random() * 2 * Math.PI;
    }

    return {
      frequencies,
      magnitudes,
      phases,
      sampleRate,
    };
  }

  /**
   * Extract VLF band from FFT result
   */
  private extractVLFBand(fftResult: FFTResult): {
    frequency: number;
    amplitude: number;
    phase: number;
    noiseFloor: number;
  } {
    const { frequencies, magnitudes, phases } = fftResult;
    const { minFrequency, maxFrequency, centerFrequency } = this.filterConfig;

    // Find indices for VLF band
    let peakAmplitude = 0;
    let peakFrequency = centerFrequency;
    let peakPhase = 0;
    let peakIndex = 0;

    // Find peak within VLF band
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      
      if (freq >= minFrequency && freq <= maxFrequency) {
        if (magnitudes[i] > peakAmplitude) {
          peakAmplitude = magnitudes[i];
          peakFrequency = freq;
          peakPhase = phases[i];
          peakIndex = i;
        }
      }
    }

    // Calculate noise floor (average magnitude outside VLF band)
    let noiseSum = 0;
    let noiseCount = 0;
    
    for (let i = 0; i < frequencies.length; i++) {
      const freq = frequencies[i];
      
      if (freq < minFrequency || freq > maxFrequency) {
        noiseSum += magnitudes[i];
        noiseCount++;
      }
    }
    
    const noiseFloor = noiseCount > 0 ? noiseSum / noiseCount : 0.01;

    return {
      frequency: peakFrequency,
      amplitude: peakAmplitude,
      phase: peakPhase,
      noiseFloor,
    };
  }

  /**
   * Calculate signal metrics (SNR, quality, dB conversion)
   */
  private calculateSignalMetrics(
    vlfSignal: { frequency: number; amplitude: number; phase: number; noiseFloor: number },
    timestamp: number
  ): ProcessedSignal {
    const { frequency, amplitude, phase, noiseFloor } = vlfSignal;

    // Convert to dB (20 * log10(amplitude))
    const amplitudeDB = amplitude > 0 ? 20 * Math.log10(amplitude) : -100;
    const noiseFloorDB = noiseFloor > 0 ? 20 * Math.log10(noiseFloor) : -100;
    
    // Calculate SNR (Signal-to-Noise Ratio)
    const snr = amplitudeDB - noiseFloorDB;
    
    // Calculate quality index (0-100 based on SNR)
    // SNR > 20 dB = excellent (100)
    // SNR 10-20 dB = good (50-100)
    // SNR < 10 dB = poor (0-50)
    const quality = Math.max(0, Math.min(100, (snr + 10) * 2.5));

    return {
      timestamp,
      frequency,
      amplitude: amplitudeDB,
      phase,
      snr,
      quality,
      rawAmplitude: amplitude,
      noiseFloor: noiseFloorDB,
    };
  }

  /**
   * Add processed signal to history
   */
  private addToHistory(signal: ProcessedSignal): void {
    this.signalHistory.push(signal);
    
    // Keep only last N samples
    if (this.signalHistory.length > this.maxHistorySize) {
      this.signalHistory.shift();
    }
  }

  /**
   * Calculate average signal strength over time window
   */
  getAverageSignalStrength(windowMinutes: number = 60): number {
    if (this.signalHistory.length === 0) return 0;

    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    const recentSignals = this.signalHistory.filter(
      s => now - s.timestamp < windowMs
    );

    if (recentSignals.length === 0) return 0;

    const sum = recentSignals.reduce((acc, s) => acc + s.amplitude, 0);
    return sum / recentSignals.length;
  }

  /**
   * Detect anomalies in signal (spikes or drops)
   */
  detectAnomalies(thresholdStdDev: number = 2): ProcessedSignal[] {
    if (this.signalHistory.length < 10) return [];

    // Calculate mean and standard deviation
    const amplitudes = this.signalHistory.map(s => s.amplitude);
    const mean = amplitudes.reduce((sum, a) => sum + a, 0) / amplitudes.length;
    
    const variance = amplitudes.reduce(
      (sum, a) => sum + Math.pow(a - mean, 2),
      0
    ) / amplitudes.length;
    
    const stdDev = Math.sqrt(variance);

    // Find signals outside threshold
    return this.signalHistory.filter(
      s => Math.abs(s.amplitude - mean) > thresholdStdDev * stdDev
    );
  }
}

// Singleton instance
export const signalProcessingService = new SignalProcessingService();