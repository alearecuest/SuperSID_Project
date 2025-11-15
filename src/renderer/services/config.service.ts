import { configObserverService } from './config-observer.service';

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
  observatoryId: 1,
  observatoryName: 'Test Observatory',
  institution: 'Home Lab',
  location: 'Buenos Aires',
  latitude: -34.6037,
  longitude: -58.3816,
  altitude: 25,
  timezone: 'America/Argentina/Buenos_Aires',
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
    return this.loadConfig();
  }

  getObservatoryId(): number {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(CONFIG_KEY);
        if (stored) {
          const loaded = JSON.parse(stored);
          return loaded.observatoryId || 1;
        }
      }
    } catch (error) {
      console.error('Error loading observatory ID:', error);
    }
    return 1;
  }

  async saveConfig(partial: Partial<AppConfig>): Promise<boolean> {
    try {
      this.config = { ...this.config, ...partial, lastUpdated: new Date().toISOString() };

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
        console.log('Config saved to localStorage:', this.config);
        
        configObserverService.notifyChange();
      }

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

  initialize(): AppConfig {
    console.log('ConfigService initialized');
    console.log('Observatory ID:', this.getObservatoryId());
    console.log('Observatory Name:', this.config.observatoryName);
    
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(CONFIG_KEY);
      if (!stored) {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
        console.log('Initial config saved to localStorage');
      }
    }
    
    return this.getConfig();
  }

  isConfigured(): boolean {
    const config = this.getConfig();
    const isValid = config.observatoryId > 0 && config.observatoryName.length > 0;
    console.log('🔍 isConfigured check:', isValid, 'ID:', config.observatoryId);
    return isValid;
  }

  async saveObservatory(observatoryData: any): Promise<boolean> {
    return this.saveConfig({
      observatoryId: observatoryData.id,
      observatoryName: observatoryData.name,
      institution: observatoryData.institution || '',
      location: observatoryData.location || '',
      latitude: observatoryData.latitude || 0,
      longitude: observatoryData.longitude || 0,
      altitude: observatoryData.altitude || 0,
      timezone: observatoryData.timezone || 'UTC',
      solarCenterApiKey: observatoryData.solarCenterApiKey || '',
    });
  }

  async updateMonitoredStations(stationIds: string[]): Promise<boolean> {
    return this.saveConfig({
      monitoredStations: stationIds,
    });
  }
}

export const configService = new ConfigService();