const fs = require('fs');
const path = require('path');

const PRAYER_NAMES = {
  fajr: 'Fajr',
  sunrise: 'Shuruk',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha'
};

// Parse the annual CSV timetable once at startup
let timetable = null;

function loadTimetable() {
  if (timetable) return timetable;

  const filePath = path.join(__dirname, '..', 'assets', 'horaires-annee.csv');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  timetable = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [day, month, fajr, sunrise, dhuhr, asr, maghrib, isha] = line.split(',');

    const key = `${parseInt(month, 10)}-${parseInt(day, 10)}`;
    timetable[key] = { fajr, sunrise, dhuhr, asr, maghrib, isha };
  }

  return timetable;
}

// Convert "07h14" to a Date object for the given date
function parseTimeStr(timeStr, date) {
  const match = timeStr.match(/(\d{2})h(\d{2})/);
  if (!match) return null;
  const result = new Date(date);
  result.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
  return result;
}

function getDayTimes(date) {
  const table = loadTimetable();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const key = `${month}-${day}`;
  return table[key] || null;
}

function getPrayerTimes(date = new Date()) {
  const dayTimes = getDayTimes(date);
  if (!dayTimes) return null;

  return {
    fajr: parseTimeStr(dayTimes.fajr, date),
    sunrise: parseTimeStr(dayTimes.sunrise, date),
    dhuhr: parseTimeStr(dayTimes.dhuhr, date),
    asr: parseTimeStr(dayTimes.asr, date),
    maghrib: parseTimeStr(dayTimes.maghrib, date),
    isha: parseTimeStr(dayTimes.isha, date)
  };
}

const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

function getNextPrayer(date = new Date()) {
  const times = getPrayerTimes(date);
  if (!times) return null;

  for (const prayer of PRAYER_ORDER) {
    if (times[prayer] > date) {
      return {
        name: prayer,
        label: PRAYER_NAMES[prayer],
        time: times[prayer]
      };
    }
  }

  // After Isha: next prayer is Fajr of tomorrow
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = getPrayerTimes(tomorrow);
  if (tomorrowTimes) {
    return {
      name: 'fajr',
      label: PRAYER_NAMES.fajr,
      time: tomorrowTimes.fajr
    };
  }

  return null;
}

function getCurrentPrayer(date = new Date()) {
  const times = getPrayerTimes(date);
  if (!times) return null;

  // Walk backwards: the current prayer is the last one whose time has passed
  const prayerKeys = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let current = null;

  for (const prayer of prayerKeys) {
    if (times[prayer] <= date) {
      current = prayer;
    }
  }

  return current;
}

function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function getTimeRemaining(targetDate) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, total: 0 };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, total: diff };
}

module.exports = {
  getPrayerTimes,
  getNextPrayer,
  getCurrentPrayer,
  formatTime,
  getTimeRemaining,
  PRAYER_NAMES
};
