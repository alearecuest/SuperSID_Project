type ConfigChangeListener = () => void;

class ConfigObserverService {
  private listeners: Set<ConfigChangeListener> = new Set();

  subscribe(listener: ConfigChangeListener): () => void {
    this.listeners.add(listener);
    console.log('Config observer subscribed, total:', this.listeners.size);
    
    return () => {
      this.listeners.delete(listener);
      console.log('Config observer unsubscribed, total:', this.listeners.size);
    };
  }

  notifyChange(): void {
    console.log('Config changed! Notifying', this.listeners.size, 'listeners');
    this.listeners.forEach(listener => listener());
  }
}

export const configObserverService = new ConfigObserverService();