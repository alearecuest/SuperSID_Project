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
  private signalBuffer: VLFSignal[] = [];
  private maxBufferSize: number = 1440;

  processRawSignal(
    frequency: number,
    amplitude: number,
    phase: number,
    noiseLevel: number
  ): VLFSignal {
    const snr = amplitude - noiseLevel;
    const quality = Math.min(100, Math.max(0, (snr + 20) * 2.5));

    const signal: VLFSignal = {
      timestamp: new Date().toISOString(),
      frequency,
      amplitude,
      phase,
      snr,
      quality,
    };

    this.signalBuffer.push(signal);

    if (this.signalBuffer.length > this.maxBufferSize) {
      this.signalBuffer.shift();
    }

    console.log('📡 SuperSID signal processed:', signal);
    return signal;
  }

  getData(observatoryId: number): SuperSIDData {
    const averageAmplitude =
      this.signalBuffer.length > 0
        ? this.signalBuffer.reduce((sum, s) => sum + s.amplitude, 0) /
          this.signalBuffer.length
        : 0;

    const peakAmplitude =
      this.signalBuffer.length > 0
        ? Math.max(...this.signalBuffer.map(s => s.amplitude))
        : 0;

    const averageNoise =
      this.signalBuffer.length > 0
        ? this.signalBuffer.reduce((sum, s) => sum + (s.amplitude - s.snr), 0) /
          this.signalBuffer.length
        : 0;

    const disturbanceIndex = this.calculateDisturbanceIndex();

    return {
      observatoryId,
      signals: this.signalBuffer,
      averageAmplitude,
      peakAmplitude,
      noiseLevel: averageNoise,
      disturbanceIndex,
    };
  }

  private calculateDisturbanceIndex(): number {
    if (this.signalBuffer.length < 2) return 0;

    const mean =
      this.signalBuffer.reduce((sum, s) => sum + s.amplitude, 0) /
      this.signalBuffer.length;
    const variance =
      this.signalBuffer.reduce((sum, s) => sum + Math.pow(s.amplitude - mean, 2), 0) /
      this.signalBuffer.length;
    const stdDev = Math.sqrt(variance);

    const index = Math.min(100, (stdDev / mean) * 100);
    return isNaN(index) ? 0 : index;
  }

  detectAnomalies(): VLFSignal[] {
    if (this.signalBuffer.length < 10) return [];

    const mean =
      this.signalBuffer.reduce((sum, s) => sum + s.amplitude, 0) /
      this.signalBuffer.length;
    const variance =
      this.signalBuffer.reduce((sum, s) => sum + Math.pow(s.amplitude - mean, 2), 0) /
      this.signalBuffer.length;
    const stdDev = Math.sqrt(variance);

    return this.signalBuffer.filter(s => s.amplitude > mean + 2 * stdDev);
  }

  clearBuffer(): void {
    this.signalBuffer = [];
  }

  getLatestSignals(count: number = 60): VLFSignal[] {
    return this.signalBuffer.slice(Math.max(0, this.signalBuffer.length - count));
  }
}

export const superSIDService = new SuperSIDService();