import { ipcMain, app } from 'electron';
import fs from 'fs';
import path from 'path';

const CONFIG_DIR = path.join(app.getPath('userData'), 'data');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

export function setupIpcHandlers() {
  ipcMain.handle('config:load', async () => {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const config = JSON.parse(data);
        return { success: true, data: config, path: CONFIG_FILE };
      }
      return { success: false, error: 'Config file not found' };
    } catch (error) {
      console.error('Error loading config:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('config:save', async (_event, config) => {
    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
      console.log('Config saved to:', CONFIG_FILE);
      return { success: true };
    } catch (error) {
      console.error('Error saving config:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  ipcMain.handle('config:path', async () => {
    return { path: CONFIG_FILE };
  });
}