const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getPrayerTimes, getNextPrayer, getCurrentPrayer, formatTime, getTimeRemaining } = require('./src/prayer-times');
const { createTray, destroyTray } = require('./src/tray');
const { startNotificationChecker, stopNotificationChecker, resetNotifiedPrayers } = require('./src/notifications');

let mainWindow = null;
let updateInterval = null;
let midnightTimeout = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 620,
    resizable: false,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('src/renderer/index.html');

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
}

function setupIPC() {
  ipcMain.handle('get-prayer-times', () => {
    const times = getPrayerTimes();
    const formatted = {};
    for (const [key, date] of Object.entries(times)) {
      formatted[key] = { time: formatTime(date), date: date.toISOString() };
    }
    return formatted;
  });

  ipcMain.handle('get-next-prayer', () => {
    const next = getNextPrayer();
    const remaining = getTimeRemaining(next.time);
    return {
      name: next.name,
      label: next.label,
      time: formatTime(next.time),
      timeISO: next.time.toISOString(),
      remaining
    };
  });

  ipcMain.handle('get-current-prayer', () => {
    return getCurrentPrayer();
  });
}

function startPeriodicUpdates() {
  updateInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const next = getNextPrayer();
      const remaining = getTimeRemaining(next.time);
      const current = getCurrentPrayer();
      mainWindow.webContents.send('prayer-update', {
        nextPrayer: {
          name: next.name,
          label: next.label,
          time: formatTime(next.time),
          remaining
        },
        currentPrayer: current
      });
    }
  }, 1000);
}

function scheduleMidnightReset() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 5, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();

  midnightTimeout = setTimeout(() => {
    resetNotifiedPrayers();
    scheduleMidnightReset();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('prayer-update', { refresh: true });
    }
  }, msUntilMidnight);
}

app.on('ready', () => {
  createWindow();
  setupIPC();
  createTray(mainWindow);
  startNotificationChecker();
  startPeriodicUpdates();
  scheduleMidnightReset();
});

app.on('before-quit', () => {
  app.isQuitting = true;
  stopNotificationChecker();
  destroyTray();
  if (updateInterval) clearInterval(updateInterval);
  if (midnightTimeout) clearTimeout(midnightTimeout);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});
