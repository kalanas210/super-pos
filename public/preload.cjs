const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Navigation
  onNavigateTo: (callback) => ipcRenderer.on('navigate-to', callback),
  
  // Printing
  onPrintReceipt: (callback) => ipcRenderer.on('print-receipt', callback),
  
  // Data management
  onBackupData: (callback) => ipcRenderer.on('backup-data', callback),
  onRestoreData: (callback) => ipcRenderer.on('restore-data', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});