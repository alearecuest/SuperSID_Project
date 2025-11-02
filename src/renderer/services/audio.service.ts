export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput' | 'audiooutput';
}

export class AudioService {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;

  async getAudioDevices(): Promise<AudioDevice[]> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.warn('enumerateDevices() not supported.');
        return [];
      }

      try {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        console.warn('Microphone access denied:', err);
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices: AudioDevice[] = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${devices.filter(d => d.kind === 'audioinput').indexOf(device) + 1}`,
          kind: 'audioinput',
        }));

      console.log('📱 Available audio devices:', audioDevices);
      return audioDevices;
    } catch (error) {
      console.error('Error getting audio devices:', error);
      return [];
    }
  }

  async startAudioCapture(deviceId: string): Promise<MediaStream | null> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: {
          deviceId: deviceId !== 'default' ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Audio capture started for device:', deviceId);
      return this.mediaStream;
    } catch (error) {
      console.error('Error starting audio capture:', error);
      return null;
    }
  }

  stopAudioCapture() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
      console.log('⏹️ Audio capture stopped');
    }
  }

  getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  async testAudioDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const stream = await this.startAudioCapture(deviceId);
      if (!stream) {
        return { success: false, message: 'Failed to access audio device' };
      }

      const audioContext = this.getAudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      this.stopAudioCapture();
      return { success: true, message: 'Audio device test successful' };
    } catch (error) {
      return { success: false, message: `Audio device test failed: ${error}` };
    }
  }
}

export const audioService = new AudioService();