/**
 * Audio Capture Service
 * 
 * Captures real-time audio from USB sound card for VLF signal detection.
 * Based on the original SuperSID Python implementation.
 * 
 * Hardware Requirements:
 * - USB External Sound Card (stereo input)
 * - Sample rate: 96000 Hz (configurable)
 * - Bit depth: 16-bit
 * 
 * @module AudioCaptureService
 */

import { EventEmitter } from 'events';

export interface AudioConfig {
  sampleRate: number;        // Default: 96000 Hz
  channels: number;           // Default: 2 (stereo)
  bitDepth: number;           // Default: 16
  bufferSize: number;         // Samples per buffer (default: 4096)
  deviceId?: string;          // Optional: specific audio device
}

export interface AudioSample {
  timestamp: number;          // Unix timestamp in milliseconds
  leftChannel: Float32Array;  // Left channel data
  rightChannel: Float32Array; // Right channel data
  sampleRate: number;         // Sample rate used
}

export interface AudioDeviceInfo {
  id: string;
  name: string;
  channels: number;
  sampleRate: number;
  isDefault: boolean;
}

/**
 * Audio Capture Service Class
 * 
 * Handles continuous audio capture from USB sound card.
 * Emits 'data' events with audio samples for processing.
 */
class AudioCaptureService extends EventEmitter {
  private config: AudioConfig;
  private isCapturing: boolean = false;
  private audioBuffer: Float32Array[] = [];
  private maxBufferLength: number = 10; // Keep last 10 buffers in memory
  
  // TODO: Will be replaced with actual audio library (node-portaudio or naudiodon)
  private captureInterval?: NodeJS.Timeout;

  constructor(config?: Partial<AudioConfig>) {
    super();
    
    this.config = {
      sampleRate: 96000,
      channels: 2,
      bitDepth: 16,
      bufferSize: 4096,
      ...config,
    };

    console.log('AudioCaptureService initialized with config:', this.config);
  }

  /**
   * Start capturing audio from the sound card
   */
  async startCapture(): Promise<void> {
    if (this.isCapturing) {
      console.warn('Audio capture already in progress');
      return;
    }

    try {
      console.log('Starting audio capture...');
      
      // TODO: Initialize actual audio device
      // For now, we'll simulate audio capture for testing
      await this.initializeAudioDevice();
      
      this.isCapturing = true;
      this.emit('captureStarted', { config: this.config });
      
      console.log('Audio capture started successfully');
    } catch (error) {
      console.error('Failed to start audio capture:', error);
      throw new Error(`Audio capture failed: ${error}`);
    }
  }

  /**
   * Stop capturing audio
   */
  stopCapture(): void {
    if (!this.isCapturing) {
      console.warn('Audio capture not in progress');
      return;
    }

    console.log('Stopping audio capture...');
    
    // Clear the simulation interval
    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = undefined;
    }
    
    this.isCapturing = false;
    this.emit('captureStopped');
    
    console.log('Audio capture stopped');
  }

  /**
   * Check if currently capturing
   */
  isCaptureActive(): boolean {
    return this.isCapturing;
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (only when not capturing)
   */
  updateConfig(newConfig: Partial<AudioConfig>): void {
    if (this.isCapturing) {
      throw new Error('Cannot update config while capturing. Stop capture first.');
    }

    this.config = { ...this.config, ...newConfig };
    console.log('Audio config updated:', this.config);
  }

  /**
   * List available audio devices
   */
  async listAudioDevices(): Promise<AudioDeviceInfo[]> {
    // TODO: Implement actual device enumeration
    // This will use portaudio or naudiodon to list devices
    
    console.log('Listing audio devices...');
    
    // Simulated device list for testing
    const simulatedDevices: AudioDeviceInfo[] = [
      {
        id: 'default',
        name: 'Default Audio Device',
        channels: 2,
        sampleRate: 96000,
        isDefault: true,
      },
      {
        id: 'usb-sound-card',
        name: 'USB Sound Card',
        channels: 2,
        sampleRate: 96000,
        isDefault: false,
      },
    ];

    return simulatedDevices;
  }

  /**
   * Get the last N audio buffers
   */
  getRecentBuffers(count: number = 5): Float32Array[] {
    const start = Math.max(0, this.audioBuffer.length - count);
    return this.audioBuffer.slice(start);
  }

  /**
   * Clear the audio buffer
   */
  clearBuffer(): void {
    this.audioBuffer = [];
    console.log('Audio buffer cleared');
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Initialize the audio device for capture
   * 
   * TODO: Replace with actual audio library initialization
   * Options:
   * - node-portaudio: https://www.npmjs.com/package/naudiodon
   * - naudiodon: https://www.npmjs.com/package/naudiodon (more maintained)
   */
  private async initializeAudioDevice(): Promise<void> {
    console.log('Initializing audio device...');
    
    // SIMULATION MODE - Replace this with actual audio capture
    // This simulates audio data for testing purposes
    this.captureInterval = setInterval(() => {
      this.simulateAudioCapture();
    }, (this.config.bufferSize / this.config.sampleRate) * 1000);
    
    // TODO: Actual implementation would look like:
    /*
    const portAudio = require('naudiodon');
    
    this.audioInput = new portAudio.AudioIO({
      inOptions: {
        channelCount: this.config.channels,
        sampleFormat: portAudio.SampleFormat16Bit,
        sampleRate: this.config.sampleRate,
        deviceId: this.config.deviceId || -1, // -1 = default device
        closeOnError: true,
      }
    });

    this.audioInput.on('data', (buffer: Buffer) => {
      this.processAudioBuffer(buffer);
    });

    this.audioInput.start();
    */
  }

  /**
   * Process incoming audio buffer from hardware
   * 
   * @param buffer Raw audio buffer from sound card
   */
  private processAudioBuffer(buffer: Buffer): void {
    const { channels, bufferSize, sampleRate } = this.config;
    
    // Convert raw buffer to Float32Array for each channel
    const leftChannel = new Float32Array(bufferSize);
    const rightChannel = new Float32Array(bufferSize);
    
    // Parse interleaved stereo data
    // Format: [L, R, L, R, L, R, ...]
    for (let i = 0; i < bufferSize; i++) {
      const index = i * channels * 2; // 2 bytes per sample (16-bit)
      
      // Read 16-bit signed integers and normalize to [-1.0, 1.0]
      leftChannel[i] = buffer.readInt16LE(index) / 32768.0;
      
      if (channels > 1) {
        rightChannel[i] = buffer.readInt16LE(index + 2) / 32768.0;
      }
    }

    // Store in buffer (keep only last N buffers)
    this.audioBuffer.push(leftChannel);
    if (this.audioBuffer.length > this.maxBufferLength) {
      this.audioBuffer.shift();
    }

    // Create audio sample object
    const sample: AudioSample = {
      timestamp: Date.now(),
      leftChannel,
      rightChannel,
      sampleRate,
    };

    // Emit data event for signal processing
    this.emit('data', sample);
  }

  /**
   * SIMULATION: Generate fake audio data for testing
   * This should be removed once actual audio capture is implemented
   */
  private simulateAudioCapture(): void {
    const { bufferSize, channels, sampleRate } = this.config;
    
    // Generate simulated VLF signal (24 kHz sine wave with noise)
    const leftChannel = new Float32Array(bufferSize);
    const rightChannel = new Float32Array(bufferSize);
    
    const frequency = 24000; // 24 kHz VLF frequency
    const amplitude = 0.5;
    const noiseLevel = 0.1;
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      const signal = amplitude * Math.sin(2 * Math.PI * frequency * t);
      const noise = (Math.random() - 0.5) * noiseLevel;
      
      leftChannel[i] = signal + noise;
      rightChannel[i] = signal + noise;
    }

    // Store in buffer
    this.audioBuffer.push(leftChannel);
    if (this.audioBuffer.length > this.maxBufferLength) {
      this.audioBuffer.shift();
    }

    // Create sample
    const sample: AudioSample = {
      timestamp: Date.now(),
      leftChannel,
      rightChannel,
      sampleRate,
    };

    // Emit for processing
    this.emit('data', sample);
  }
}

// Singleton instance
export const audioCaptureService = new AudioCaptureService();