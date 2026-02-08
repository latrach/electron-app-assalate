const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
  'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
];

function formatGregorianDate() {
  const now = new Date();
  return now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatHijriDate() {
  try {
    const formatter = new Intl.DateTimeFormat('fr-FR-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(new Date());
  } catch (e) {
    return '';
  }
}

function updateDates() {
  document.getElementById('gregorian-date').textContent = formatGregorianDate();
  document.getElementById('hijri-date').textContent = formatHijriDate();
}

async function updatePrayerTimes() {
  const times = await window.prayerAPI.getPrayerTimes();
  for (const [prayer, data] of Object.entries(times)) {
    const el = document.getElementById(`time-${prayer}`);
    if (el) el.textContent = data.time;
  }
}

function updateCountdown(remaining, nextLabel) {
  const h = String(remaining.hours).padStart(2, '0');
  const m = String(remaining.minutes).padStart(2, '0');
  const s = String(remaining.seconds).padStart(2, '0');
  document.getElementById('countdown').textContent = `${h}:${m}:${s}`;
  document.getElementById('next-prayer-name').textContent = nextLabel;
}

function highlightPrayer(currentPrayer, nextPrayer) {
  document.querySelectorAll('.prayer-row').forEach(row => {
    row.classList.remove('active', 'next');
    const prayer = row.dataset.prayer;
    if (prayer === currentPrayer) {
      row.classList.add('active');
    } else if (prayer === nextPrayer) {
      row.classList.add('next');
    }
  });
}

// Listen for real-time updates from main process
window.prayerAPI.onPrayerUpdate((data) => {
  if (data.refresh) {
    updatePrayerTimes();
    updateDates();
    return;
  }

  if (data.nextPrayer) {
    updateCountdown(data.nextPrayer.remaining, data.nextPrayer.label);
    highlightPrayer(data.currentPrayer, data.nextPrayer.name);
  }
});

// Initial load
async function init() {
  updateDates();
  await updatePrayerTimes();

  const next = await window.prayerAPI.getNextPrayer();
  const current = await window.prayerAPI.getCurrentPrayer();
  updateCountdown(next.remaining, next.label);
  highlightPrayer(current, next.name);
}

init();
