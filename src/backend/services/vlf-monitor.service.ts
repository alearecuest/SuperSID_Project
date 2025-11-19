/**
 * VLF Monitor Service
 * 
 * High-level service that orchestrates:
 * - Audio capture from USB sound card
 * - Signal processing (FFT, filtering)
 * - Database storage
 * - Real-time monitoring
 */

import { EventEmitter } from 'events';
import { audioCaptureService, type AudioSample } from './audio-capture.service.js';
import { signalProcessingService, type ProcessedSignal } from './signal-processing.service.js';
import { database } from '../database/index.js';

export interface MonitorConfig {
  stationId: number;
  autoStart: boolean;
  sampleInterval: number;
  saveToDB: boolean;
}

export interface MonitorStatus {
  isRunning: boolean;
  stationId: number;
  startTime: number | null;
  samplesProcessed: number;
  lastSample: ProcessedSignal | null;
  errors: number;
}

export interface VLFReading {
  timestamp: number;
  frequency: number;
  amplitude: number;
  phase: number;
  snr: number;
  quality: number;
  rawAmplitude: number;
  noiseFloor: number;
}

class VLFMonitorService extends EventEmitter {
  private config: MonitorConfig;
  private status: MonitorStatus;
  private sampleTimer?: NodeJS.Timeout;
  private readings: VLFReading[] = [];

  constructor() {
    super();
    
    this.config = {
      stationId: 1,
      autoStart: false,
      sampleInterval: 60,
      saveToDB: true,
    };

    this.status = {
      isRunning: false,
      stationId: 1,
      startTime: null,
      samplesProcessed: 0,
      lastSample: null,
      errors: 0,
    };

    this.setupEventHandlers();
    
    console.log('VLFMonitorService initialized');
  }

  async startMonitoring(stationId?: number): Promise<void> {
    if (this.status.isRunning) {
      console.warn('Monitoring already in progress');
      return;
    }

    try {
      if (stationId) {
        this.config.stationId = stationId;
        this.status.stationId = stationId;
      }

      console.log(`Starting VLF monitoring for station ${this.config.stationId}...`);

      await audioCaptureService.startCapture();
      this.startPeriodicSampling();

      this.status.isRunning = true;
      this.status.startTime = Date.now();
      this.status.samplesProcessed = 0;
      this.status.errors = 0;

      this.emit('monitoringStarted', { stationId: this.config.stationId });

      console.log('VLF monitoring started successfully');
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      throw error;
    }
  }

  stopMonitoring(): void {
    if (!this.status.isRunning) {
      console.warn('Monitoring not in progress');
      return;
    }

    console.log('Stopping VLF monitoring...');

    audioCaptureService.stopCapture();

    if (this.sampleTimer) {
      clearInterval(this.sampleTimer);
      this.sampleTimer = undefined;
    }

    this.status.isRunning = false;
    this.status.startTime = null;

    this.emit('monitoringStopped');

    console.log('VLF monitoring stopped');
  }

  getStatus(): MonitorStatus {
    return { ...this.status };
  }

  updateConfig(newConfig: Partial<MonitorConfig>): void {
    if (this.status.isRunning) {
      throw new Error('Cannot update config while monitoring. Stop monitoring first.');
    }

    this.config = { ...this.config, ...newConfig };
    console.log('Monitor config updated:', this.config);
  }

  getLatestData(count: number = 60): ProcessedSignal[] {
    return signalProcessingService.getHistory(count);
  }

  /**
   * Get latest N readings
   */
  getLatestReadings(count: number = 100): VLFReading[] {
    const history = signalProcessingService.getHistory(count);
    return history.map(signal => ({
      timestamp: signal.timestamp,
      frequency: signal.frequency,
      amplitude: signal.amplitude,
      phase: signal.phase,
      snr: signal.snr,
      quality: signal.quality,
      rawAmplitude: signal.rawAmplitude,
      noiseFloor: signal.noiseFloor,
    }));
  }

  /**
   * Get all readings
   */
  getAllReadings(): VLFReading[] {
    return this.getLatestReadings(1000);
  }

  /**
   * Clear all readings
   */
  clearReadings(): void {
    this.readings = [];
    console.log('All VLF readings cleared');
  }

  async getHistoricalData(
    stationId: number,
    startTime: Date,
    endTime: Date
  ): Promise<ProcessedSignal[]> {
    return new Promise((resolve, reject) => {
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        reject(new Error('Invalid date parameters'));
        return;
      }
  
      const query = `
        SELECT * FROM vlf_processed_signals
        WHERE station_id = ? 
          AND timestamp >= ? 
          AND timestamp <= ?
        ORDER BY timestamp ASC
      `;
  
      database.all(
        query,
        [stationId, startTime.toISOString(), endTime.toISOString()],
        (err, rows: any[]) => {
          if (err) {
            console.error('Database query error:', err);
            reject(err);
            return;
          }
  
          const signals: ProcessedSignal[] = rows.map(row => ({
            id: row.id,
            timestamp: row.timestamp,
            frequency: row.frequency,
            amplitude: row.amplitude,
            phase: row.phase,
            snr: row.snr,
            quality: row.quality,
            rawAmplitude: row.raw_amplitude,
            noiseFloor: row.noise_floor,
          }));
  
          resolve(signals);
        }
      );
    });
  }

  // ========== PRIVATE METHODS ==========

  private setupEventHandlers(): void {
    signalProcessingService.on('signalProcessed', (signal: ProcessedSignal) => {
      this.handleProcessedSignal(signal);
    });

    audioCaptureService.on('captureStarted', () => {
      console.log('Audio capture started');
    });

    audioCaptureService.on('captureStopped', () => {
      console.log('Audio capture stopped');
    });
  }

  private startPeriodicSampling(): void {
    this.takeSample();

    this.sampleTimer = setInterval(() => {
      this.takeSample();
    }, this.config.sampleInterval * 1000);

    console.log(`Sampling every ${this.config.sampleInterval} seconds`);
  }

  private takeSample(): void {
    audioCaptureService.once('data', (sample: AudioSample) => {
      try {
        const processedSignal = signalProcessingService.processAudioSample(sample);
        
        console.log(`Sample processed: ${processedSignal.amplitude.toFixed(2)} dB, SNR: ${processedSignal.snr.toFixed(2)} dB`);
      } catch (error) {
        console.error('Error processing sample:', error);
        this.status.errors++;
      }
    });
  }

  private handleProcessedSignal(signal: ProcessedSignal): void {
    this.status.samplesProcessed++;
    this.status.lastSample = signal;

    if (this.config.saveToDB) {
      this.saveSignalToDB(signal).catch(err => {
        console.error('Failed to save signal to DB:', err);
        this.status.errors++;
      });
    }

    this.emit('newSignal', signal);
  }

  private async saveSignalToDB(signal: ProcessedSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO vlf_processed_signals 
        (station_id, timestamp, frequency, amplitude, phase, snr, quality, raw_amplitude, noise_floor)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        this.config.stationId,
        new Date(signal.timestamp).toISOString(),
        signal.frequency,
        signal.amplitude,
        signal.phase,
        signal.snr,
        signal.quality,
        signal.rawAmplitude,
        signal.noiseFloor,
      ];

      database.run(query, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

// Singleton instance
export const vlfMonitorService = new VLFMonitorService();