/**
 * VLF Monitor Service
 * 
 * High-level service that orchestrates:
 * - Audio capture from USB sound card
 * - Signal processing (FFT, filtering)
 * - Database storage
 * - Real-time monitoring
 * 
 * This is the main service that replaces the mock data in supersid.service.ts
 * 
 * @module VLFMonitorService
 */

import { EventEmitter } from 'events';
import { audioCaptureService, type AudioSample } from './audio-capture.service.js';
import { signalProcessingService, type ProcessedSignal } from './signal-processing.service.js';
import { database } from '../database/index.js';

export interface MonitorConfig {
  stationId: number;
  autoStart: boolean;
  sampleInterval: number;  // Seconds between samples (default: 60)
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

/**
 * VLF Monitor Service
 * 
 * Orchestrates the entire VLF monitoring pipeline
 */
class VLFMonitorService extends EventEmitter {
  private config: MonitorConfig;
  private status: MonitorStatus;
  private sampleTimer?: NodeJS.Timeout;

  constructor() {
    super();
    
    this.config = {
      stationId: 1,
      autoStart: false,
      sampleInterval: 60, // 1 sample per minute (like original SuperSID)
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

  /**
   * Start monitoring VLF signals
   */
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

      // Start audio capture
      await audioCaptureService.startCapture();

      // Start periodic sampling
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

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.status.isRunning) {
      console.warn('Monitoring not in progress');
      return;
    }

    console.log('Stopping VLF monitoring...');

    // Stop audio capture
    audioCaptureService.stopCapture();

    // Stop periodic sampling
    if (this.sampleTimer) {
      clearInterval(this.sampleTimer);
      this.sampleTimer = undefined;
    }

    this.status.isRunning = false;
    this.status.startTime = null;

    this.emit('monitoringStopped');

    console.log('VLF monitoring stopped');
  }

  /**
   * Get current monitoring status
   */
  getStatus(): MonitorStatus {
    return { ...this.status };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MonitorConfig>): void {
    if (this.status.isRunning) {
      throw new Error('Cannot update config while monitoring. Stop monitoring first.');
    }

    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Monitor config updated:', this.config);
  }

  /**
   * Get latest VLF data (for API endpoints)
   */
  getLatestData(count: number = 60): ProcessedSignal[] {
    return signalProcessingService.getHistory(count);
  }

  /**
   * Get VLF data from database for specific time range
   */
  async getHistoricalData(
    stationId: number,
    startTime: Date,
    endTime: Date
  ): Promise<ProcessedSignal[]> {
    return new Promise((resolve, reject) => {
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
            timestamp: new Date(row.timestamp).getTime(),
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

  /**
   * Setup event handlers for audio and signal processing
   */
  private setupEventHandlers(): void {
    // Listen to processed signals
    signalProcessingService.on('signalProcessed', (signal: ProcessedSignal) => {
      this.handleProcessedSignal(signal);
    });

    // Listen to audio capture events
    audioCaptureService.on('captureStarted', () => {
      console.log('Audio capture started');
    });

    audioCaptureService.on('captureStopped', () => {
      console.log('Audio capture stopped');
    });
  }

  /**
   * Start periodic sampling (e.g., every 60 seconds)
   */
  private startPeriodicSampling(): void {
    // Take a sample immediately
    this.takeSample();

    // Then take samples at regular intervals
    this.sampleTimer = setInterval(() => {
      this.takeSample();
    }, this.config.sampleInterval * 1000);

    console.log(`Sampling every ${this.config.sampleInterval} seconds`);
  }

  /**
   * Take a single sample
   */
  private takeSample(): void {
    // Listen for the next audio data event
    audioCaptureService.once('data', (sample: AudioSample) => {
      try {
        // Process the audio sample
        const processedSignal = signalProcessingService.processAudioSample(sample);
        
        console.log(`Sample processed: ${processedSignal.amplitude.toFixed(2)} dB, SNR: ${processedSignal.snr.toFixed(2)} dB`);
      } catch (error) {
        console.error('Error processing sample:', error);
        this.status.errors++;
      }
    });
  }

  /**
   * Handle a processed signal (save to DB, emit events)
   */
  private handleProcessedSignal(signal: ProcessedSignal): void {
    this.status.samplesProcessed++;
    this.status.lastSample = signal;

    // Save to database if enabled
    if (this.config.saveToDB) {
      this.saveSignalToDB(signal).catch(err => {
        console.error('Failed to save signal to DB:', err);
        this.status.errors++;
      });
    }

    // Emit for real-time listeners (WebSocket, etc.)
    this.emit('newSignal', signal);
  }

  /**
   * Save processed signal to database
   */
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