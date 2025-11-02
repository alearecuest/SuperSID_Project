import Client from 'ssh2-sftp-client';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { runAsync, allAsync } from '../db/database.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface SolarCenterConfig {
  monitorId: string;
  siteName: string;
  contact: string;
  latitude: number;
  longitude: number;
  altitude: number;
  utcOffset: string;
}

export interface SignalData {
  timestamp: string;
  signal: number;
}

export class SolarCenterService {
  private sftp: Client;
  private config: SolarCenterConfig | null = null;
  private readonly FTP_SERVER = 'sid-ftp.stanford.edu';
  private readonly FTP_DIRECTORY = '/incoming/SuperSID/NEW/';
  private readonly FTP_PORT = 22;
  private readonly DATA_PATH = './data/solar-center';

  constructor() {
    this.sftp = new Client();
    this.createDataDirectory();
  }

  private createDataDirectory(): void {
    if (!fs.existsSync(this.DATA_PATH)) {
      fs.mkdirSync(this.DATA_PATH, { recursive: true });
      console.log(`📁 Created data directory: ${this.DATA_PATH}`);
    }
  }

  setConfig(config: SolarCenterConfig): void {
    this.config = config;
    console.log(`⚙️ Solar Center config set for monitor: ${config.monitorId}`);
  }

  async validateConnection(monitorId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔐 Testing SFTP connection with monitor ID: ${monitorId}`);

      await this.sftp.connect({
        host: this.FTP_SERVER,
        port: this.FTP_PORT,
        username: monitorId,
        password: '',
        readyTimeout: 30000,
      });

      console.log(`✅ SFTP connection successful for ${monitorId}`);
      await this.sftp.end();

      return { success: true, message: 'Connection successful' };
    } catch (error: any) {
      console.error(`❌ SFTP connection failed: ${error.message}`);
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  generateSidFile(stationCallSign: string, signals: SignalData[], date: string): string {
    if (!this.config) {
      throw new Error('Solar Center config not set');
    }

    const filename = `${this.config.siteName}_${stationCallSign}_${date}.csv`;
    const filepath = path.join(this.DATA_PATH, filename);

    const header = [
      `# Station=${this.config.siteName}`,
      `# Monitor_ID=${this.config.monitorId}`,
      `# Contact=${this.config.contact}`,
      `# Latitude=${this.config.latitude}`,
      `# Longitude=${this.config.longitude}`,
      `# Altitude=${this.config.altitude}`,
      `# UTC_Offset=${this.config.utcOffset}`,
      `# Date=${date}`,
      `# Frequency_Call_Sign=${stationCallSign}`,
      '',
      'Time Signal',
    ];

    const lines = header.join('\n');
    const dataLines = signals.map((s) => `${s.timestamp} ${s.signal}`).join('\n');

    const content = `${lines}\n${dataLines}\n`;

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`✅ Generated SID file: ${filename}`);

    return filepath;
  }

  async sendFileToStanford(filePath: string, monitorId: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`📤 Connecting to Stanford SFTP...`);

      await this.sftp.connect({
        host: this.FTP_SERVER,
        port: this.FTP_PORT,
        username: monitorId,
        password: '',
        readyTimeout: 30000,
      });

      console.log(`📁 Changing to directory: ${this.FTP_DIRECTORY}`);
      await this.sftp.cwd(this.FTP_DIRECTORY);

      const fileName = path.basename(filePath);
      console.log(`📤 Uploading file: ${fileName}`);

      await this.sftp.put(filePath, fileName);

      await this.sftp.end();
      console.log(`✅ File uploaded successfully: ${fileName}`);

      return { success: true, message: `File uploaded: ${fileName}` };
    } catch (error: any) {
      console.error(`❌ Upload failed: ${error.message}`);
      return { success: false, message: `Upload failed: ${error.message}` };
    }
  }

  async getLatestSignals(stationId: number, limit: number = 86400): Promise<SignalData[]> {
    try {
      const signals = await allAsync(
        `SELECT timestamp, amplitude as signal FROM signals 
         WHERE station_id = ? 
         ORDER BY timestamp DESC 
         LIMIT ?`,
        [stationId, limit]
      );

      return signals
        .reverse()
        .map((s: any) => ({
          timestamp: s.timestamp,
          signal: Math.round(s.signal),
        }));
    } catch (error) {
      console.error(`Error fetching signals: ${error}`);
      return [];
    }
  }

  async sendDailyData(
    stationId: number,
    stationCallSign: string,
    monitorId: string,
    date: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`📊 Preparing daily data for ${date}...`);

      const signals = await this.getLatestSignals(stationId);

      if (signals.length === 0) {
        return { success: false, message: 'No signal data available' };
      }

      const sidFilePath = this.generateSidFile(stationCallSign, signals, date);

      const result = await this.sendFileToStanford(sidFilePath, monitorId);

      if (result.success) {
        await this.logUpload(stationId, date, 'success', sidFilePath);
      }

      return result;
    } catch (error: any) {
      console.error(`Error sending daily data: ${error.message}`);
      await this.logUpload(stationId, date, 'error', error.message);
      return { success: false, message: error.message };
    }
  }

  private async logUpload(stationId: number, date: string, status: string, details: string): Promise<void> {
    try {
      await runAsync(
        `INSERT INTO solar_center_uploads (station_id, date, status, details, created_at) 
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [stationId, date, status, details]
      );
    } catch (error) {
      console.error(`Error logging upload: ${error}`);
    }
  }

  async getUploadHistory(): Promise<any[]> {
    try {
      return await allAsync(`SELECT * FROM solar_center_uploads ORDER BY created_at DESC LIMIT 50`);
    } catch (error) {
      console.error(`Error fetching upload history: ${error}`);
      return [];
    }
  }
}

export const solarCenterService = new SolarCenterService();