/**
 * FFT Processor Service
 * 
 * Processes audio samples using Fast Fourier Transform (FFT)
 * to extract VLF frequency spectrum (3 kHz - 30 kHz)
 */

import FFT from 'fft.js';

export interface FrequencyData {
  frequency: number;      // Frequency in Hz
  amplitude: number;      // Amplitude in dB
  phase: number;          // Phase in degrees
}

export interface FFTResult {
  timestamp: number;
  frequencies: FrequencyData[];
  sampleRate: number;
  fftSize: number;
}

class FFTProcessorService {
  private fftSize: number = 4096; // Must be power of 2
  private fft: FFT;

  constructor(fftSize: number = 4096) {
    this.fftSize = fftSize;
    this.fft = new FFT(fftSize);
  }

  /**
   * Process audio samples and extract frequency spectrum
   */
  processAudioSample(samples: Float32Array, sampleRate: number): FFTResult {
    const timestamp = Date.now();

    // Ensure samples length matches FFT size
    const input = this.prepareInput(samples);

    // Apply windowing (Hann window to reduce spectral leakage)
    const windowed = this.applyHannWindow(input);

    // Convert to complex format for FFT
    const complexInput = this.toComplexArray(windowed);

    // Perform FFT - Create output array explicitly as Float32Array
    const output = new Float32Array(this.fftSize * 2);
    this.fft.transform(output, complexInput);

    // Extract frequency data
    const frequencies = this.extractFrequencies(output, sampleRate);

    return {
      timestamp,
      frequencies,
      sampleRate,
      fftSize: this.fftSize,
    };
  }

  /**
   * Extract specific VLF frequencies (3 kHz - 30 kHz)
   */
  extractVLFFrequencies(fftResult: FFTResult, targetFrequencies: number[]): FrequencyData[] {
    const results: FrequencyData[] = [];

    for (const targetFreq of targetFrequencies) {
      // Find the closest frequency bin
      const binIndex = Math.round((targetFreq * this.fftSize) / fftResult.sampleRate);
      
      if (binIndex >= 0 && binIndex < fftResult.frequencies.length) {
        results.push(fftResult.frequencies[binIndex]);
      }
    }

    return results;
  }

  // ========== PRIVATE METHODS ==========

  private prepareInput(samples: Float32Array): Float32Array {
    if (samples.length === this.fftSize) {
      return samples;
    }

    const prepared = new Float32Array(this.fftSize);
    
    if (samples.length > this.fftSize) {
      // Truncate
      prepared.set(samples.slice(0, this.fftSize));
    } else {
      // Zero-pad
      prepared.set(samples);
    }

    return prepared;
  }

  private applyHannWindow(samples: Float32Array): Float32Array {
    const windowed = new Float32Array(samples.length);
    
    for (let i = 0; i < samples.length; i++) {
      const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (samples.length - 1)));
      windowed[i] = samples[i] * window;
    }

    return windowed;
  }

  private toComplexArray(samples: Float32Array): Float32Array {
    const complex = this.fft.toComplexArray(samples, new Float32Array(this.fftSize * 2));
    return complex;
  }

  private extractFrequencies(fftOutput: Float32Array, sampleRate: number): FrequencyData[] {
    const frequencies: FrequencyData[] = [];
    const binCount = this.fftSize / 2;

    for (let i = 0; i < binCount; i++) {
      const real = fftOutput[2 * i];
      const imag = fftOutput[2 * i + 1];

      // Calculate magnitude
      const magnitude = Math.sqrt(real * real + imag * imag);
      
      // Convert to dB (with reference to prevent log(0))
      const amplitude = 20 * Math.log10(magnitude + 1e-10);

      // Calculate phase
      const phase = (Math.atan2(imag, real) * 180) / Math.PI;

      // Calculate frequency
      const frequency = (i * sampleRate) / this.fftSize;

      // Only include VLF range (3 kHz - 30 kHz)
      if (frequency >= 3000 && frequency <= 30000) {
        frequencies.push({
          frequency: Math.round(frequency),
          amplitude: parseFloat(amplitude.toFixed(2)),
          phase: parseFloat(phase.toFixed(2)),
        });
      }
    }

    return frequencies;
  }

  /**
   * Calculate SNR (Signal-to-Noise Ratio)
   */
  calculateSNR(signal: FrequencyData[], noiseFloor: number): number {
    const maxAmplitude = Math.max(...signal.map(f => f.amplitude));
    return maxAmplitude - noiseFloor;
  }
}

export const fftProcessorService = new FFTProcessorService();