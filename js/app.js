// EduBD - Main Application JavaScript

document.addEventListener('DOMContentLoaded', function() {
  initNavbar();
  initBreakingNews();
  initLiveDateTime();
  initBackToTop();
  initMobileMenu();
  setActiveNavLink();
  initNewsPage();
  initQuickLinks();
  initBoardGrid();
  initSidebarAdmissions();
  initSidebarScholarships();
  initImportantLinks();
});

// ===================== NAVBAR =====================
function initNavbar() {
  // Search functionality
  const searchInput = document.querySelector('.search-box input');
  const searchBtn = document.querySelector('.search-btn');

  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        performSearch(this.value.trim());
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
      const q = searchInput ? searchInput.value.trim() : '';
      performSearch(q);
    });
  }
}

function performSearch(query) {
  if (!query) return;
  const base = getBasePath();
  window.location.href = base + 'pages/search.html?q=' + encodeURIComponent(query);
}

function getBasePath() {
  // Determine base path based on current page location
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    return '../';
  }
  return '';
}

// ===================== BREAKING NEWS =====================
function initBreakingNews() {
  const tickerInner = document.querySelector('.breaking-ticker-inner');
  if (!tickerInner || typeof eduData === 'undefined') return;

  const items = eduData.breakingNews;
  const base = getBasePath();
  tickerInner.innerHTML = items.map(item =>
    `<span class="ticker-item"><a href="${base}pages/news.html">📰 ${item}</a></span>`
  ).join('');
}

// ===================== LIVE DATE/TIME =====================
function initLiveDateTime() {
  const dateEl = document.getElementById('live-date');
  const timeEl = document.getElementById('live-time');

  function update() {
    const now = new Date();
    if (dateEl) {
      dateEl.textContent = formatBengaliDate(now);
    }
    if (timeEl) {
      timeEl.textContent = formatBengaliTime(now);
    }
  }

  update();
  setInterval(update, 1000);
}

function formatBengaliDate(date) {
  const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
                  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const d = date.getDate();
  const m = date.getMonth();
  const y = date.getFullYear();
  const day = date.getDay();
  return `${days[day]}, ${toBengaliDigits(d)} ${months[m]} ${toBengaliDigits(y)}`;
}

function formatBengaliTime(date) {
  let h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${toBengaliDigits(h)}:${pad(m)}:${pad(s)} ${ampm}`;
}

function toBengaliDigits(num) {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).split('').map(d => bengaliDigits[d] || d).join('');
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// ===================== BACK TO TOP =====================
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===================== MOBILE MENU =====================
function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-overlay');
  const closeBtn = document.querySelector('.mobile-menu-close');

  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    mobileMenu.classList.add('open');
    if (mobileOverlay) mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
}

// ===================== ACTIVE NAV LINK =====================
function setActiveNavLink() {
  const path = window.location.pathname;
  const filename = path.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && (href.includes(filename) || (filename === 'index.html' && href.endsWith('index.html')))) {
      link.classList.add('active');
    }
  });
}

// ===================== TOAST NOTIFICATIONS =====================
function showToast(message, type = 'success', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type !== 'success' ? type : ''}`;
  toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ===================== NEWS PAGE =====================
function initNewsPage() {
  const newsGrid = document.getElementById('news-grid');
  if (!newsGrid || typeof eduData === 'undefined') return;

  renderNewsCards(newsGrid, eduData.latestNews);
}

function renderNewsCards(container, newsItems) {
  const base = getBasePath();
  container.innerHTML = newsItems.map(item => {
    const safeTitle = escapeHtml(item.title);
    const safeSummary = escapeHtml(item.summary);
    const safeSource = escapeHtml(item.source);
    const safeDate = escapeHtml(item.date);
    const safeCategory = escapeHtml(item.category);
    const safeImage = escapeHtml(item.image);
    const safeLink = item.link ? (item.link.startsWith('http') ? item.link : base + item.link) : '#';
    return `
    <div class="news-card">
      <div class="news-card-img">
        <a href="${escapeHtml(safeLink)}">
          <img src="${safeImage}" alt="${safeTitle}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200/1a6b3c/ffffff?text=EduBD'">
        </a>
      </div>
      <div class="news-card-body">
        <span class="news-category">${safeCategory}</span>
        <a href="${escapeHtml(safeLink)}">
          <h3 class="news-title">${safeTitle}</h3>
        </a>
        <p class="news-summary">${safeSummary}</p>
        <div class="news-meta">
          <span>📰 ${safeSource}</span>
          <span>📅 ${safeDate}</span>
          <span>👁 ${toBengaliDigits(item.views)}</span>
        </div>
      </div>
    </div>
  `}).join('');
}

// ===================== QUICK LINKS =====================
function initQuickLinks() {
  const grid = document.querySelector('.quick-links-grid');
  if (!grid) return;

  const base = getBasePath();
  const links = [
    { icon: '📝', text: 'SSC 2025', href: base + 'pages/ssc.html' },
    { icon: '📚', text: 'HSC 2025', href: base + 'pages/hsc.html' },
    { icon: '🎓', text: 'ভর্তি তথ্য', href: base + 'pages/admissions.html' },
    { icon: '📊', text: 'ফলাফল', href: base + 'pages/results.html' },
    { icon: '🌟', text: 'স্কলারশিপ', href: base + 'pages/scholarships.html' },
    { icon: '🗓️', text: 'রুটিন', href: base + 'pages/routines.html' }
  ];

  grid.innerHTML = links.map(l => `
    <a href="${l.href}" class="quick-link-card">
      <span class="quick-link-icon">${l.icon}</span>
      <span class="quick-link-text">${l.text}</span>
    </a>
  `).join('');
}

// ===================== BOARD GRID =====================
function initBoardGrid() {
  const grid = document.querySelector('.board-grid');
  if (!grid || typeof eduData === 'undefined') return;

  const base = getBasePath();
  grid.innerHTML = eduData.boards.map(board => `
    <a href="${base}pages/board.html?board=${board.id}" class="board-card">
      <span class="board-icon">🏫</span>
      <span class="board-name">${board.shortName}</span>
    </a>
  `).join('');
}

// ===================== SIDEBAR ADMISSIONS =====================
function initSidebarAdmissions() {
  const container = document.getElementById('sidebar-admissions');
  if (!container || typeof eduData === 'undefined') return;

  const base = getBasePath();
  const items = eduData.admissions.slice(0, 5);
  container.innerHTML = items.map(item => `
    <div class="admission-notice-item">
      <h5><a href="${base}pages/admissions.html">${item.title}</a></h5>
      <div style="display:flex;gap:8px;align-items:center;margin-top:5px;">
        <span class="badge ${item.status === 'চলছে' ? 'badge-success' : item.status === 'শেষ' ? 'badge-danger' : 'badge-warning'}">${item.status}</span>
        <span style="font-size:11px;color:#888;">শেষ: ${item.deadlineDisplay}</span>
      </div>
    </div>
  `).join('');
}

// ===================== SIDEBAR SCHOLARSHIPS =====================
function initSidebarScholarships() {
  const container = document.getElementById('sidebar-scholarships');
  if (!container || typeof eduData === 'undefined') return;

  const base = getBasePath();
  const items = eduData.scholarships.slice(0, 4);
  container.innerHTML = items.map(item => `
    <div class="scholarship-item">
      <span class="scholarship-flag">${item.flag}</span>
      <div class="scholarship-info">
        <h5><a href="${item.link}" target="_blank" rel="noopener">${item.name}</a></h5>
        <p>${item.country} • ${item.type} • ${item.level}</p>
        <p style="color:#e65100;">শেষ: ${item.deadlineDisplay}</p>
      </div>
    </div>
  `).join('');
}

// ===================== IMPORTANT LINKS =====================
function initImportantLinks() {
  const container = document.getElementById('important-links');
  if (!container || typeof eduData === 'undefined') return;

  container.innerHTML = eduData.importantLinks.map(link => `
    <a href="${link.url}" target="_blank" rel="noopener" class="important-link-item">
      <span>${link.icon}</span>
      <span>${link.name}</span>
      <span style="margin-left:auto;font-size:11px;color:#bbb;">↗</span>
    </a>
  `).join('');
}

// ===================== UTILS =====================
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return formatBengaliDate(d);
}

// Expose globally
window.showToast = showToast;
window.getBasePath = getBasePath;
window.toBengaliDigits = toBengaliDigits;
window.formatBengaliDate = formatBengaliDate;

// HTML escape utility to prevent XSS when inserting dynamic content
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
window.escapeHtml = escapeHtml;
