export interface AppConfig {
  observatoryId: number;
  observatoryName: string;
  institution: string;
  location: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timezone: string;
  solarCenterApiKey?: string;
  solarCenterContact?: string;
  monitoredStations: string[];
  audioSettings: {
    deviceId: string;
    deviceName: string;
    sampleRate: number;
    channels: number;
  };
  lastUpdated: string;
}

const DEFAULT_CONFIG: AppConfig = {
  observatoryId: 0,
  observatoryName: 'My Observatory',
  institution: '',
  location: '',
  latitude: 0,
  longitude: 0,
  altitude: 0,
  timezone: 'UTC',
  solarCenterApiKey: '',
  solarCenterContact: '',
  monitoredStations: [],
  audioSettings: {
    deviceId: 'default',
    deviceName: 'Default Microphone',
    sampleRate: 48000,
    channels: 1,
  },
  lastUpdated: new Date().toISOString(),
};

const CONFIG_KEY = 'supersid-config';

export class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
          const loaded = JSON.parse(stored);
          return { ...DEFAULT_CONFIG, ...loaded };
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
    return { ...DEFAULT_CONFIG };
  }

  getConfig(): AppConfig {
    return this.config;
  }

  async saveConfig(partial: Partial<AppConfig>): Promise<boolean> {
    try {
      this.config = { ...this.config, ...partial, lastUpdated: new Date().toISOString() };
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
      }
      
      console.log('✅ Config saved');
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }

  async saveAudioSettings(audioSettings: Partial<typeof DEFAULT_CONFIG.audioSettings>): Promise<boolean> {
    return this.saveConfig({
      audioSettings: {
        ...this.config.audioSettings,
        ...audioSettings,
      },
    });
  }
}

export const configService = new ConfigService();