const { Notification } = require('electron');
const { getPrayerTimes, PRAYER_NAMES, formatTime } = require('./prayer-times');

let notifiedPrayers = new Set();
let checkInterval = null;

function resetNotifiedPrayers() {
  notifiedPrayers.clear();
}

function checkAndNotify() {
  const now = new Date();
  const times = getPrayerTimes(now);
  if (!times) return;

  const prayersToNotify = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

  for (const prayer of prayersToNotify) {
    if (notifiedPrayers.has(prayer)) continue;

    const prayerTime = times[prayer];
    const diff = Math.abs(now.getTime() - prayerTime.getTime());

    if (diff < 30000) {
      notifiedPrayers.add(prayer);
      showNotification(prayer, prayerTime);
    }
  }
}

function showNotification(prayer, time) {
  const notification = new Notification({
    title: `${PRAYER_NAMES[prayer]} - Heure de prière`,
    body: `Il est l'heure de la prière de ${PRAYER_NAMES[prayer]} (${formatTime(time)})`,
    sound: 'default',
    silent: false
  });

  notification.show();
}

function startNotificationChecker() {
  checkInterval = setInterval(() => checkAndNotify(), 30000);
  checkAndNotify();
}

function stopNotificationChecker() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

module.exports = {
  startNotificationChecker,
  stopNotificationChecker,
  resetNotifiedPrayers
};
