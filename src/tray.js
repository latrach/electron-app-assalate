const { Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { getPrayerTimes, getNextPrayer, formatTime, getTimeRemaining, PRAYER_NAMES } = require('./prayer-times');

let tray = null;
let tooltipInterval = null;

function createTray(mainWindow) {
  const iconPath = path.join(__dirname, '..', 'assets', 'tray-icon.png');
  let trayIcon;

  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    trayIcon = trayIcon.resize({ width: 16, height: 16 });
  } catch (e) {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Assalate - Horaires de prière');

  updateTrayMenu(mainWindow);

  tooltipInterval = setInterval(() => {
    updateTooltip();
    updateTrayMenu(mainWindow);
  }, 60000);

  updateTooltip();

  return tray;
}

function updateTooltip() {
  if (!tray) return;
  const next = getNextPrayer();
  const remaining = getTimeRemaining(next.time);
  const timeStr = `${String(remaining.hours).padStart(2, '0')}h${String(remaining.minutes).padStart(2, '0')}`;
  tray.setToolTip(`Prochaine : ${next.label} à ${formatTime(next.time)} (dans ${timeStr})`);
}

function updateTrayMenu(mainWindow) {
  const times = getPrayerTimes();
  const next = getNextPrayer();
  const remaining = getTimeRemaining(next.time);
  const timeStr = `${String(remaining.hours).padStart(2, '0')}h${String(remaining.minutes).padStart(2, '0')}`;

  const prayerItems = Object.entries(PRAYER_NAMES).map(([key, label]) => ({
    label: `${label.padEnd(10)} ${formatTime(times[key])}`,
    enabled: false
  }));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Horaires de prière - Orléans', enabled: false },
    { type: 'separator' },
    ...prayerItems,
    { type: 'separator' },
    { label: `⏳ ${next.label} dans ${timeStr}`, enabled: false },
    { type: 'separator' },
    {
      label: 'Ouvrir',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: 'Quitter',
      click: () => {
        const { app } = require('electron');
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function destroyTray() {
  if (tooltipInterval) {
    clearInterval(tooltipInterval);
    tooltipInterval = null;
  }
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

module.exports = { createTray, destroyTray };
