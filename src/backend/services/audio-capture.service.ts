/**
 * Audio Capture Service
 * Uses node-record-lpcm16 for cross-platform audio capture
 */

import { EventEmitter } from 'events';

let recorder: any = null;
try {
  recorder = require('node-record-lpcm16');
} catch (err) {
  console.warn('⚠️  node-record-lpcm16 not available, running in simulation mode');
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  bufferSize: number;
  deviceId?: string;
}

export interface AudioSample {
  timestamp: number;
  leftChannel: Float32Array;
  rightChannel: Float32Array;
  sampleRate: number;
}

export interface AudioDeviceInfo {
  id: string;
  name: string;
  channels: number;
  sampleRate: number;
  isDefault: boolean;
}

class AudioCaptureService extends EventEmitter {
  private config: AudioConfig;
  private isCapturing: boolean = false;
  private audioBuffer: Float32Array[] = [];
  private maxBufferLength: number = 10;
  private recordingStream: any = null;
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

    console.log('🎤 AudioCaptureService initialized:', this.config);
    console.log('🔊 Real audio mode:', recorder ? 'ENABLED' : 'DISABLED (simulation)');
  }

  async startCapture(): Promise<void> {
    if (this.isCapturing) {
      console.warn('⚠️  Audio capture already in progress');
      return;
    }

    try {
      console.log('▶️  Starting audio capture...');
      
      if (recorder) {
        await this.initializeRealAudioDevice();
      } else {
        await this.initializeSimulatedAudio();
      }
      
      this.isCapturing = true;
      this.emit('captureStarted', { config: this.config });
      
      console.log('✅ Audio capture started successfully');
    } catch (error) {
      console.error('❌ Failed to start audio capture:', error);
      throw new Error(`Audio capture failed: ${error}`);
    }
  }

  stopCapture(): void {
    if (!this.isCapturing) {
      console.warn('⚠️  Audio capture not in progress');
      return;
    }

    console.log('⏹️  Stopping audio capture...');
    
    if (this.recordingStream) {
      try {
        this.recordingStream.unpipe();
        this.recordingStream = null;
      } catch (err) {
        console.error('Error stopping recording:', err);
      }
    }

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = undefined;
    }
    
    this.isCapturing = false;
    this.emit('captureStopped');
    
    console.log('✅ Audio capture stopped');
  }

  isCaptureActive(): boolean {
    return this.isCapturing;
  }

  getConfig(): AudioConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AudioConfig>): void {
    if (this.isCapturing) {
      throw new Error('Cannot update config while capturing. Stop capture first.');
    }

    this.config = { ...this.config, ...newConfig };
    console.log('⚙️  Audio config updated:', this.config);
  }

  async listAudioDevices(): Promise<AudioDeviceInfo[]> {
    console.log('📋 Listing audio devices...');
    
    return [
      {
        id: 'default',
        name: 'Default Audio Device (Line In)',
        channels: 2,
        sampleRate: 96000,
        isDefault: true,
      },
      {
        id: 'hw:0,0',
        name: 'USB Sound Card (Line In)',
        channels: 2,
        sampleRate: 96000,
        isDefault: false,
      },
    ];
  }

  getRecentBuffers(count: number = 5): Float32Array[] {
    const start = Math.max(0, this.audioBuffer.length - count);
    return this.audioBuffer.slice(start);
  }

  clearBuffer(): void {
    this.audioBuffer = [];
    console.log('🗑️  Audio buffer cleared');
  }

  // ========== PRIVATE METHODS ==========

  private async initializeRealAudioDevice(): Promise<void> {
    console.log('🎙️  Initializing REAL audio device with sox/arecord...');
    
    try {
      const recordOptions = {
        sampleRate: this.config.sampleRate,
        channels: this.config.channels,
        compress: false,
        threshold: 0,
        thresholdStart: null,
        thresholdEnd: null,
        silence: '0',
        device: this.config.deviceId || null,
        audioType: 'raw',
      };

      this.recordingStream = recorder.record(recordOptions).stream();

      let bufferAccumulator = Buffer.alloc(0);
      const bytesPerSample = (this.config.bitDepth / 8) * this.config.channels;
      const targetBytes = this.config.bufferSize * bytesPerSample;

      this.recordingStream.on('data', (chunk: Buffer) => {
        bufferAccumulator = Buffer.concat([bufferAccumulator, chunk]);

        while (bufferAccumulator.length >= targetBytes) {
          const processingBuffer = bufferAccumulator.slice(0, targetBytes);
          bufferAccumulator = bufferAccumulator.slice(targetBytes);
          
          this.processAudioBuffer(processingBuffer);
        }
      });

      this.recordingStream.on('error', (error: Error) => {
        console.error('🔴 Audio recording error:', error);
        this.emit('error', error);
      });

      console.log('✅ Real audio device initialized with sox/arecord');
    } catch (error) {
      console.error('❌ Failed to initialize real audio:', error);
      console.warn('⚠️  Falling back to simulation mode');
      await this.initializeSimulatedAudio();
    }
  }

  private async initializeSimulatedAudio(): Promise<void> {
    console.log('🎭 Initializing SIMULATED audio (multiple VLF stations)...');
    
    this.captureInterval = setInterval(() => {
      this.simulateAudioCapture();
    }, (this.config.bufferSize / this.config.sampleRate) * 1000);
  }

  private processAudioBuffer(buffer: Buffer): void {
    const { channels, bufferSize, sampleRate } = this.config;
    
    const leftChannel = new Float32Array(bufferSize);
    const rightChannel = new Float32Array(bufferSize);
    
    for (let i = 0; i < Math.min(bufferSize, buffer.length / (channels * 2)); i++) {
      const index = i * channels * 2;
      
      if (index + 1 < buffer.length) {
        leftChannel[i] = buffer.readInt16LE(index) / 32768.0;
      }
      
      if (channels > 1 && index + 3 < buffer.length) {
        rightChannel[i] = buffer.readInt16LE(index + 2) / 32768.0;
      }
    }

    this.audioBuffer.push(leftChannel);
    if (this.audioBuffer.length > this.maxBufferLength) {
      this.audioBuffer.shift();
    }

    const sample: AudioSample = {
      timestamp: Date.now(),
      leftChannel,
      rightChannel,
      sampleRate,
    };

    this.emit('data', sample);
  }

  private simulateAudioCapture(): void {
    const { bufferSize, sampleRate } = this.config;
    
    const leftChannel = new Float32Array(bufferSize);
    const rightChannel = new Float32Array(bufferSize);
    
    // Simulate multiple VLF stations with realistic characteristics
    const stations = [
      { freq: 24000, amp: 0.4, name: 'NAA' },     // USA
      { freq: 19800, amp: 0.35, name: 'NWC' },    // Australia
      { freq: 23400, amp: 0.3, name: 'DHO38' },   // Germany
      { freq: 22100, amp: 0.25, name: 'GBZ' },    // UK
    ];
    
    const noiseLevel = 0.08;
    const sidProbability = 0.001; // 0.1% chance of SID event per sample
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / sampleRate;
      let signal = 0;
      
      // Add all VLF station signals
      stations.forEach(station => {
        // Add phase drift and amplitude variation
        const phaseDrift = Math.sin(t * 0.1) * 0.1;
        const ampVariation = 1 + Math.sin(t * 0.05) * 0.1;
        signal += station.amp * ampVariation * Math.sin(2 * Math.PI * station.freq * t + phaseDrift);
      });
      
      // Add realistic noise
      const noise = (Math.random() - 0.5) * noiseLevel;
      
      // Occasionally add SID event (sudden ionospheric disturbance)
      const sidEvent = Math.random() < sidProbability ? Math.random() * 0.5 : 0;
      
      leftChannel[i] = signal / stations.length + noise + sidEvent;
      rightChannel[i] = leftChannel[i];
    }

    this.audioBuffer.push(leftChannel);
    if (this.audioBuffer.length > this.maxBufferLength) {
      this.audioBuffer.shift();
    }

    const sample: AudioSample = {
      timestamp: Date.now(),
      leftChannel,
      rightChannel,
      sampleRate,
    };

    this.emit('data', sample);
  }
}

export const audioCaptureService = new AudioCaptureService();