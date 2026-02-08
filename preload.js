const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('prayerAPI', {
  getPrayerTimes: () => ipcRenderer.invoke('get-prayer-times'),
  getNextPrayer: () => ipcRenderer.invoke('get-next-prayer'),
  getCurrentPrayer: () => ipcRenderer.invoke('get-current-prayer'),
  onPrayerUpdate: (callback) => {
    ipcRenderer.on('prayer-update', (_event, data) => callback(data));
  }
});
