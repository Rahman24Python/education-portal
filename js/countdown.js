// EduBD - Live Countdown Timer

document.addEventListener('DOMContentLoaded', function() {
  initCountdownTimers();
  initExamCountdown();
});

function initCountdownTimers() {
  if (typeof eduData === 'undefined') return;

  const container = document.getElementById('deadline-timers');
  if (!container) return;

  const base = (typeof getBasePath === 'function') ? getBasePath() : '';

  renderDeadlineTimers(container, eduData.deadlines, base);

  // Update every second
  setInterval(function() {
    updateTimerDisplays(eduData.deadlines);
  }, 1000);
}

function renderDeadlineTimers(container, deadlines, base) {
  container.innerHTML = deadlines.map(deadline => {
    const info = getCountdownInfo(deadline.date);
    const urgencyClass = getUrgencyClass(info.totalDays);
    return `
      <div class="deadline-item">
        <div class="deadline-timer ${urgencyClass}" id="timer-${deadline.id}">
          <div class="deadline-days" id="days-${deadline.id}">${toBengaliDigits(Math.max(0, info.totalDays))}</div>
          <div class="deadline-label">দিন বাকি</div>
        </div>
        <div class="deadline-info">
          <h5><a href="${base}${deadline.link}">${deadline.title}</a></h5>
          <p id="detail-${deadline.id}">${info.detailStr}</p>
        </div>
      </div>
    `;
  }).join('');
}

function updateTimerDisplays(deadlines) {
  deadlines.forEach(deadline => {
    const daysEl = document.getElementById(`days-${deadline.id}`);
    const detailEl = document.getElementById(`detail-${deadline.id}`);
    const timerEl = document.getElementById(`timer-${deadline.id}`);
    if (!daysEl) return;

    const info = getCountdownInfo(deadline.date);
    daysEl.textContent = (typeof toBengaliDigits === 'function') ?
      toBengaliDigits(Math.max(0, info.totalDays)) : Math.max(0, info.totalDays);
    if (detailEl) detailEl.textContent = info.detailStr;
    if (timerEl) {
      timerEl.className = `deadline-timer ${getUrgencyClass(info.totalDays)}`;
    }
  });
}

function getCountdownInfo(dateStr) {
  const target = new Date(dateStr);
  target.setHours(23, 59, 59, 0);
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    return {
      totalDays: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      detailStr: 'সময় শেষ হয়ে গেছে'
    };
  }

  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const b = (typeof toBengaliDigits === 'function') ? toBengaliDigits : (x => x);
  const detailStr = `${b(hours)} ঘণ্টা ${b(minutes)} মিনিট ${b(seconds)} সেকেন্ড`;

  return { totalDays, hours, minutes, seconds, detailStr };
}

function getUrgencyClass(days) {
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'upcoming';
  return 'safe';
}

// ===================== EXAM PAGE COUNTDOWN =====================
function initExamCountdown() {
  const el = document.getElementById('exam-countdown');
  if (!el) return;

  const targetDate = el.dataset.date;
  if (!targetDate) return;

  function update() {
    const info = getCountdownInfo(targetDate);
    const b = (typeof toBengaliDigits === 'function') ? toBengaliDigits : (x => String(x).padStart(2, '0'));

    const dEl = el.querySelector('#cd-days');
    const hEl = el.querySelector('#cd-hours');
    const mEl = el.querySelector('#cd-minutes');
    const sEl = el.querySelector('#cd-seconds');

    if (dEl) dEl.textContent = b(Math.max(0, info.totalDays));
    if (hEl) hEl.textContent = b(info.hours);
    if (mEl) mEl.textContent = b(info.minutes);
    if (sEl) sEl.textContent = b(info.seconds);
  }

  update();
  setInterval(update, 1000);
}
