type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  stack?: string;
}

export class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private isDev: boolean = process.env.NODE_ENV === 'development';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: this.formatTimestamp(),
      data,
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
        return console.error;
      default:
        return console.log;
    }
  }

  private getConsoleColor(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return 'color: #64748b;';
      case 'info':
        return 'color: #0ea5e9;';
      case 'warn':
        return 'color: #f59e0b;';
      case 'error':
        return 'color: #ef4444;';
      default:
        return 'color: #f1f5f9;';
    }
  }

  debug(message: string, data?: any): void {
    const entry = this.createLogEntry('debug', message, data);
    this.addLog(entry);

    if (this.isDev) {
      const method = this.getConsoleMethod('debug');
      const color = this.getConsoleColor('debug');
      method(
        `%c[DEBUG] ${entry.timestamp} - ${message}`,
        color,
        data
      );
    }
  }

  info(message: string, data?: any): void {
    const entry = this.createLogEntry('info', message, data);
    this.addLog(entry);

    const method = this.getConsoleMethod('info');
    const color = this.getConsoleColor('info');
    method(
      `%c[INFO] ${entry.timestamp} - ${message}`,
      color,
      data
    );
  }

  warn(message: string, data?: any): void {
    const entry = this.createLogEntry('warn', message, data);
    this.addLog(entry);

    const method = this.getConsoleMethod('warn');
    const color = this.getConsoleColor('warn');
    method(
      `%c[WARN] ${entry.timestamp} - ${message}`,
      color,
      data
    );
  }

  error(message: string, error?: Error | any, data?: any): void {
    const entry: LogEntry = {
      level: 'error',
      message,
      timestamp: this.formatTimestamp(),
      data,
      stack: error?.stack,
    };
    this.addLog(entry);

    const method = this.getConsoleMethod('error');
    const color = this.getConsoleColor('error');
    method(
      `%c[ERROR] ${entry.timestamp} - ${message}`,
      color,
      error,
      data
    );
  }

  getLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    return filtered.slice(-limit);
  }

  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(format: 'json' | 'csv' | 'txt' = 'json'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.logs, null, 2);

      case 'csv':
        const headers = 'Level,Timestamp,Message,Data\n';
        const rows = this.logs
          .map(log =>
            `"${log.level}","${log.timestamp}","${log.message}","${JSON.stringify(log.data || '')}"`
          )
          .join('\n');
        return headers + rows;

      case 'txt':
        return this.logs
          .map(
            log =>
              `[${log.level.toUpperCase()}] ${log.timestamp} - ${log.message}${
                log.data ? `\nData: ${JSON.stringify(log.data)}` : ''
              }`
          )
          .join('\n\n');

      default:
        return '';
    }
  }

  downloadLogs(format: 'json' | 'csv' | 'txt' = 'json'): void {
    const content = this.exportLogs(format);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `supersid-logs-${timestamp}.${format}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  getLogStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    timeRange: { start: string; end: string };
  } {
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
    };

    this.logs.forEach(log => {
      byLevel[log.level]++;
    });

    return {
      total: this.logs.length,
      byLevel,
      timeRange: {
        start: this.logs[0]?.timestamp || '',
        end: this.logs[this.logs.length - 1]?.timestamp || '',
      },
    };
  }
}

export const logger = new Logger();

export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, error?: Error | any, data?: any) => logger.error(message, error, data),
};

export class PerformanceLogger {
  private marks: Map<string, number> = new Map();

  start(label: string): void {
    this.marks.set(label, performance.now());
    logger.debug(`Performance: Starting timer "${label}"`);
  }

  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      logger.warn(`Performance: No start mark found for "${label}"`);
      return 0;
    }

    const duration = performance.now() - startTime;
    logger.debug(`Performance: "${label}" took ${duration.toFixed(2)}ms`);
    this.marks.delete(label);

    return duration;
  }

  measure(label: string, fn: () => any): any {
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      logger.error(`Performance: Error in "${label}"`, error as Error);
      throw error;
    }
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      logger.error(`Performance: Error in "${label}"`, error as Error);
      throw error;
    }
  }
}

export const performanceLogger = new PerformanceLogger();