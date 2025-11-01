import { AppConfig, UserPreferences } from '../types';

const STORAGE_PREFIX = 'supersid_';

export class StorageManager {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  set(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error(`Failed to set storage key "${key}":`, error);
    }
  }

  get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const item = this.storage.getItem(this.getKey(key));
      if (!item) return defaultValue ?? null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Failed to get storage key "${key}":`, error);
      return defaultValue ?? null;
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Failed to remove storage key "${key}":`, error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }

  has(key: string): boolean {
    return this.storage.getItem(this.getKey(key)) !== null;
  }
}

export const storage = new StorageManager();

export const configStorage = {
  getConfig(): AppConfig {
    return (
      storage.get<AppConfig>('config') || {
        apiUrl: 'http://localhost:3001',
        apiKey: '',
        theme: 'dark',
        autoRefresh: true,
        refreshInterval: 5,
        notifications: true,
        soundAlerts: false,
        dataRetention: 90,
        exportFormat: 'csv',
      }
    );
  },

  setConfig(config: Partial<AppConfig>): void {
    const current = this.getConfig();
    storage.set('config', { ...current, ...config });
  },

  resetConfig(): void {
    storage.remove('config');
  },
};

export const preferencesStorage = {
  getPreferences(): UserPreferences {
    return (
      storage.get<UserPreferences>('preferences') || {
        theme: 'dark',
        notifications: true,
        soundAlerts: false,
        autoRefresh: true,
        refreshInterval: 5,
        timezone: 'UTC',
      }
    );
  },

  setPreferences(prefs: Partial<UserPreferences>): void {
    const current = this.getPreferences();
    storage.set('preferences', { ...current, ...prefs });
  },

  resetPreferences(): void {
    storage.remove('preferences');
  },
};

export const sessionStorage = {
  getSessionId(): string | null {
    return storage.get<string>('sessionId');
  },

  setSessionId(id: string): void {
    storage.set('sessionId', id);
  },

  clearSessionId(): void {
    storage.remove('sessionId');
  },

  isAuthenticated(): boolean {
    return this.getSessionId() !== null;
  },
};

export const recentStationsStorage = {
  getRecentStations(): number[] {
    return storage.get<number[]>('recentStations') || [];
  },

  addRecentStation(stationId: number): void {
    const recent = this.getRecentStations();
    const updated = [stationId, ...recent.filter(id => id !== stationId)].slice(0, 5);
    storage.set('recentStations', updated);
  },

  clearRecentStations(): void {
    storage.remove('recentStations');
  },
};

export const cacheStorage = {
  setCache(key: string, value: any, ttl: number = 3600000): void {
    const cached = {
      value,
      timestamp: Date.now(),
      ttl,
    };
    storage.set(`cache_${key}`, cached);
  },

  getCache<T = any>(key: string): T | null {
    const cached = storage.get<{
      value: T;
      timestamp: number;
      ttl: number;
    }>(`cache_${key}`);

    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      storage.remove(`cache_${key}`);
      return null;
    }

    return cached.value;
  },

  clearCache(key?: string): void {
    if (key) {
      storage.remove(`cache_${key}`);
    } else {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith(`${STORAGE_PREFIX}cache_`)) {
          localStorage.removeItem(k);
        }
      });
    }
  },
};

export const favoritesStorage = {
  getFavorites(): number[] {
    return storage.get<number[]>('favorites') || [];
  },

  addFavorite(stationId: number): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(stationId)) {
      storage.set('favorites', [...favorites, stationId]);
    }
  },

  removeFavorite(stationId: number): void {
    const favorites = this.getFavorites();
    storage.set(
      'favorites',
      favorites.filter(id => id !== stationId)
    );
  },

  isFavorite(stationId: number): boolean {
    return this.getFavorites().includes(stationId);
  },

  clearFavorites(): void {
    storage.remove('favorites');
  },
};

export const bookmarksStorage = {
  getBookmarks(): Record<string, string> {
    return storage.get<Record<string, string>>('bookmarks') || {};
  },

  addBookmark(name: string, url: string): void {
    const bookmarks = this.getBookmarks();
    storage.set('bookmarks', { ...bookmarks, [name]: url });
  },

  removeBookmark(name: string): void {
    const bookmarks = this.getBookmarks();
    delete bookmarks[name];
    storage.set('bookmarks', bookmarks);
  },

  clearBookmarks(): void {
    storage.remove('bookmarks');
  },
};

export const exportHistoryStorage = {
  getExportHistory(): Array<{ id: string; date: string; format: string; fileName: string }> {
    return storage.get<Array<{ id: string; date: string; format: string; fileName: string }>>(
      'exportHistory'
    ) || [];
  },

  addExport(id: string, date: string, format: string, fileName: string): void {
    const history = this.getExportHistory();
    storage.set('exportHistory', [{ id, date, format, fileName }, ...history].slice(0, 20));
  },

  clearExportHistory(): void {
    storage.remove('exportHistory');
  },
};