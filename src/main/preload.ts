import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
    on: (channel: string, listener: (event: any, ...args: any[]) => void) =>
      ipcRenderer.on(channel, listener),
    once: (channel: string, listener: (event: any, ...args: any[]) => void) =>
      ipcRenderer.once(channel, listener),
    removeListener: (channel: string, listener: (event: any, ...args: any[]) => void) =>
      ipcRenderer.removeListener(channel, listener),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    getAppPath: () => ipcRenderer.invoke('get-app-path'),
    getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  },
});

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
        once: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
        removeListener: (channel: string, listener: (event: any, ...args: any[]) => void) => void;
      };
      app: {
        getVersion: () => Promise<string>;
        getAppPath: () => Promise<string>;
        getUserDataPath: () => Promise<string>;
      };
    };
  }
}