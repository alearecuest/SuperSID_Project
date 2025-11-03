import axios from 'axios';

export interface SolarActivity {
  timestamp: string;
  kIndex: number;
  solarFlux: number;
  activeRegions: number;
  sunspots: number;
  xrayClass: string;
  protonFlux: number;
  electronFlux: number;
  magneticStorm: string;
  source: string;
}

export interface SpaceWeatherData {
  current: SolarActivity;
  forecast: SolarActivity[];
  lastUpdated: string;
}

class SpaceWeatherService {
  private apiUrl = 'https://www.spaceweatherlive.com/api/v1';
  private cache: SpaceWeatherData | null = null;
  private cacheExpiry: number = 0;
  private cacheDuration: number = 15 * 60 * 1000;

  async getCurrentSolarActivity(): Promise<SolarActivity> {
    try {
      if (this.cache && Date.now() < this.cacheExpiry) {
        console.log('📡 Space Weather - Using cached data');
        return this.cache.current;
      }

      console.log('Space Weather - Fetching from API...');

      const kIndexResponse = await axios.get(`${this.apiUrl}/ovation/overview`, {
        timeout: 5000,
      });

      const solarFluxResponse = await axios.get(
        `${this.apiUrl}/latest_space_weather`,
        { timeout: 5000 }
      );

      const kData = kIndexResponse.data?.data || {};
      const solarData = solarFluxResponse.data?.data || {};

      const activity: SolarActivity = {
        timestamp: new Date().toISOString(),
        kIndex: parseInt(kData.kp) || 0,
        solarFlux: parseInt(solarData.solar_flux) || 0,
        activeRegions: parseInt(solarData.active_regions) || 0,
        sunspots: parseInt(solarData.sunspots) || 0,
        xrayClass: solarData.xray_class || 'A',
        protonFlux: parseInt(solarData.proton_flux) || 0,
        electronFlux: parseInt(solarData.electron_flux) || 0,
        magneticStorm: solarData.magnetic_storm_warning || 'none',
        source: 'spaceweatherlive.com',
      };

      this.cache = {
        current: activity,
        forecast: [],
        lastUpdated: new Date().toISOString(),
      };
      this.cacheExpiry = Date.now() + this.cacheDuration;

      console.log('Space Weather data fetched:', activity);
      return activity;
    } catch (error) {
      console.error('Error fetching Space Weather:', error);
      return {
        timestamp: new Date().toISOString(),
        kIndex: 0,
        solarFlux: 0,
        activeRegions: 0,
        sunspots: 0,
        xrayClass: 'A',
        protonFlux: 0,
        electronFlux: 0,
        magneticStorm: 'none',
        source: 'error',
      };
    }
  }

  async getForecast(): Promise<SolarActivity[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/forecast/27day`, {
        timeout: 5000,
      });

      const forecasts = response.data?.data || [];
      return forecasts.map((f: any) => ({
        timestamp: f.date,
        kIndex: parseInt(f.kp) || 0,
        solarFlux: parseInt(f.solar_flux) || 0,
        activeRegions: 0,
        sunspots: 0,
        xrayClass: 'A',
        protonFlux: 0,
        electronFlux: 0,
        magneticStorm: 'none',
        source: 'spaceweatherlive.com',
      }));
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return [];
    }
  }

  getSolarActivitySeverity(activity: SolarActivity): 'low' | 'moderate' | 'high' | 'severe' {
    if (activity.kIndex >= 7 || activity.xrayClass >= 'M') {
      return 'severe';
    }
    if (activity.kIndex >= 5 || activity.xrayClass >= 'C') {
      return 'high';
    }
    if (activity.kIndex >= 3) {
      return 'moderate';
    }
    return 'low';
  }

  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
  }
}

export const spaceWeatherService = new SpaceWeatherService();