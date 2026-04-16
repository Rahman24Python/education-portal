// EduBD - Main Application JavaScript

// ===================== YEAR PRIORITY SORT =====================
// Year priority: 2025-26 / 2026 data first, then older years fill remaining space
function sortByYearPriority(items) {
  return [...items].sort((a, b) => {
    const getYear = (item) => {
      if (item.year) return parseInt(item.year) || 0;
      if (item.date) return parseInt(String(item.date).substring(0, 4)) || 0;
      if (item.deadline) return parseInt(String(item.deadline).substring(0, 4)) || 0;
      return 0;
    };
    const aYear = getYear(a);
    const bYear = getYear(b);
    const currentYear = new Date().getFullYear();
    if (aYear >= currentYear && bYear < currentYear) return -1;
    if (aYear < currentYear && bYear >= currentYear) return 1;
    return bYear - aYear;
  });
}

function resolveHrefWithBase(href, base) {
  if (!href) return '#';
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('#')) return href;
  if (href.startsWith('/')) return href.slice(1);
  return base + href;
}

document.addEventListener('DOMContentLoaded', function() {
  applyThemeSettings();
  applySiteSettings();
  initNavigationMenus();
  initCategoryNav();
  initNavbar();
  initBreakingNews();
  initLiveDateTime();
  initLastUpdated();
  initBackToTop();
  initMobileMenu();
  setActiveNavLink();
  initFeaturedNews();
  initNewsPage();
  initQuickLinks();
  initSidebarAdmissions();
  initSidebarGovtNotices();
  initSidebarScholarships();
  initImportantLinks();
  initSidebarWidgets();
  initFooterContent();
  applyPageContent();
  initBoardGrid();
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

function applySiteSettings() {
  if (typeof eduData === 'undefined') return;
  const s = eduData.siteSettings || {};
  if (s.siteName) document.title = document.title.replace(/EduBD/g, s.siteName);
  const meta = document.querySelector('meta[name="description"]');
  if (meta && s.metaDescription) meta.setAttribute('content', s.metaDescription);
  document.querySelectorAll('.logo-icon, .footer-logo-icon').forEach(el => {
    if (s.logoIcon) el.textContent = s.logoIcon;
  });
  document.querySelectorAll('.logo .name, .footer-logo-text .name').forEach(el => {
    if (s.logoText) el.textContent = s.logoText;
  });
  document.querySelectorAll('.logo .tagline, .footer-logo-text .tagline').forEach(el => {
    if (s.tagline) el.textContent = s.tagline;
  });
}

function applyThemeSettings() {
  if (typeof eduData === 'undefined') return;
  const t = eduData.themeSettings || {};
  const root = document.documentElement;
  if (t.primaryColor) root.style.setProperty('--primary', t.primaryColor);
  if (t.accentColor) root.style.setProperty('--secondary', t.accentColor);
  if (t.darkColor) root.style.setProperty('--text-dark', t.darkColor);
  if (t.fontFamily) document.body.style.fontFamily = t.fontFamily;
}

function initNavigationMenus() {
  if (typeof eduData === 'undefined') return;
  const navData = eduData.navigation || {};
  const base = getBasePath();
  const nav = document.querySelector('header nav');
  if (nav && Array.isArray(navData.main) && navData.main.length) {
    nav.innerHTML = navData.main.map(item => {
      const hasChildren = item.isDropdown && Array.isArray(item.children) && item.children.length;
      if (!hasChildren) return `<a href="${escapeHtml(resolveHrefWithBase(item.href, base))}" class="nav-link">${escapeHtml(item.label)}</a>`;
      return `
        <div class="nav-dropdown">
          <a href="${escapeHtml(resolveHrefWithBase(item.href, base))}" class="nav-link">${escapeHtml(item.label)} <span style="font-size:10px;">▼</span></a>
          <div class="dropdown-menu">
            ${(item.children || []).map(ch => `<a href="${escapeHtml(resolveHrefWithBase(ch.href, base))}" class="dropdown-item"><span class="dropdown-icon">${escapeHtml(ch.icon || '')}</span>${escapeHtml(ch.label || '')}</a>`).join('')}
          </div>
        </div>`;
    }).join('');
  }
  const mobile = document.querySelector('.mobile-menu');
  if (mobile && Array.isArray(navData.mobile) && navData.mobile.length) {
    const header = mobile.querySelector('.mobile-menu-header');
    const existingClose = mobile.querySelector('.mobile-menu-close');
    const closeHtml = existingClose ? existingClose.outerHTML : '<button class="mobile-menu-close">✕</button>';
    const headerHtml = header ? `<div class="mobile-menu-header">${header.innerHTML.replace(existingClose ? existingClose.outerHTML : '', '')}${closeHtml}</div>` : `<div class="mobile-menu-header">${closeHtml}</div>`;
    mobile.innerHTML = `${headerHtml}${navData.mobile.map(m => `<a href="${escapeHtml(resolveHrefWithBase(m.href, base))}" class="mobile-nav-link">${escapeHtml(m.label || '')}</a>`).join('')}`;
  }
}

function initCategoryNav() {
  const wrap = document.querySelector('.category-nav-inner');
  if (!wrap || typeof eduData === 'undefined') return;
  const list = (eduData.categoryNav || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
  if (!list.length) return;
  const base = getBasePath();
  wrap.innerHTML = list.map(item => `<a href="${escapeHtml(resolveHrefWithBase(item.href, base))}" class="cat-link">${escapeHtml(item.icon || '')} ${escapeHtml(item.label || '')}</a>`).join('');
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

// ===================== LAST UPDATED =====================
function initLastUpdated() {
  const el = document.getElementById('last-updated-indicator');
  if (!el) return;
  if (!eduData.lastUpdated) return;

  const updated = new Date(eduData.lastUpdated);
  const now = new Date();
  const diffMs = now - updated;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));

  let label;
  if (diffMins < 1) {
    label = 'এইমাত্র আপডেট হয়েছে';
  } else if (diffMins < 60) {
    label = `${toBengaliDigits(diffMins)} মিনিট আগে আপডেট`;
  } else if (diffHours < 24) {
    label = `${toBengaliDigits(diffHours)} ঘণ্টা আগে আপডেট`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    label = `${toBengaliDigits(diffDays)} দিন আগে আপডেট`;
  }

  el.textContent = '';
  const sep = document.createTextNode(' | ');
  const icon = document.createTextNode('🔄 ');
  const text = document.createTextNode(label);
  el.appendChild(sep);
  el.appendChild(icon);
  el.appendChild(text);
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

// ===================== FEATURED NEWS =====================
function initFeaturedNews() {
  const container = document.getElementById('featured-news');
  const headlinesContainer = document.getElementById('featured-headlines');
  if (!container || typeof eduData === 'undefined') return;

  const featuredSettings = eduData.featuredSettings || { enabled: true, headlineCount: 5, featuredNewsId: null };
  if (featuredSettings.enabled === false) {
    const section = container.closest('.featured-news-section');
    if (section) section.style.display = 'none';
    return;
  }

  const sorted = sortByYearPriority(eduData.latestNews);
  const featured = featuredSettings.featuredNewsId !== null
    ? sorted.find(item => String(item.id) === String(featuredSettings.featuredNewsId)) || sorted[0]
    : sorted.find(item => item.image && !item.image.includes('placeholder')) || sorted[0];
  if (!featured) return;

  const base = getBasePath();
  const safeTitle = escapeHtml(featured.title);
  const safeSummary = escapeHtml(featured.summary);
  const safeSource = escapeHtml(featured.source);
  const safeDate = escapeHtml(featured.date);
  const safeCategory = escapeHtml(featured.category);
  const safeImage = escapeHtml(featured.image || '');
  const safeLink = featured.link ? (featured.link.startsWith('http') ? featured.link : base + featured.link) : '#';
  const yearClass = (featured.year && parseInt(featured.year) >= 2026) ? 'current' : 'previous';

  container.style.backgroundImage = `url('${safeImage}')`;
  container.innerHTML = `
    <div class="featured-overlay">
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
        <span class="news-category" style="background:var(--accent);color:white;">${safeCategory}</span>
        ${featured.year ? `<span class="year-badge ${yearClass}">${escapeHtml(featured.year)}</span>` : ''}
      </div>
      <a href="${escapeHtml(safeLink)}" style="text-decoration:none;">
        <h2 class="featured-title">${safeTitle}</h2>
      </a>
      <p class="featured-summary">${safeSummary}</p>
      <div class="featured-meta">
        <span>📰 ${safeSource}</span>
        <span>📅 ${safeDate}</span>
        <span>👁 ${toBengaliDigits(featured.views || 0)}</span>
      </div>
    </div>
  `;

  // Render right-side headlines (next 5 items after featured)
  if (headlinesContainer) {
    const headlineCount = Math.max(1, parseInt(featuredSettings.headlineCount, 10) || 5);
    const headlines = sorted.filter(item => String(item.id) !== String(featured.id)).slice(0, headlineCount);
    headlinesContainer.innerHTML = headlines.map(item => {
      const hLink = item.link ? (item.link.startsWith('http') ? item.link : base + item.link) : '#';
      return `
      <div class="headline-item">
        <span class="headline-cat">${escapeHtml(item.category || '')}</span>
        <a href="${escapeHtml(hLink)}" class="headline-title">${escapeHtml(item.title)}</a>
        <div class="headline-meta">
          <span>📰 ${escapeHtml(item.source || '')}</span>
          <span>📅 ${escapeHtml(item.date || '')}</span>
        </div>
      </div>`;
    }).join('');
  }
}


function initNewsPage() {
  const newsGrid = document.getElementById('news-grid');
  if (!newsGrid || typeof eduData === 'undefined') return;

  const sorted = sortByYearPriority(eduData.latestNews);
  renderNewsCards(newsGrid, sorted);
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
          <img src="${safeImage}" alt="${safeTitle}" loading="lazy" onerror="this.style.display='none'">
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
  if (!grid || typeof eduData === 'undefined') return;

  const base = getBasePath();
  const links = (eduData.quickLinks && eduData.quickLinks.length)
    ? eduData.quickLinks
    : [
      { icon: '📝', text: 'SSC 2026', href: 'pages/ssc.html' },
      { icon: '📚', text: 'HSC 2026', href: 'pages/hsc.html' },
      { icon: '🎓', text: 'ভর্তি তথ্য', href: 'pages/admissions.html' },
      { icon: '📊', text: 'ফলাফল', href: 'pages/results.html' },
      { icon: '🌟', text: 'স্কলারশিপ', href: 'pages/scholarships.html' },
      { icon: '🗓️', text: 'রুটিন', href: 'pages/routines.html' }
    ];

  grid.innerHTML = links.map(l => `
    <a href="${escapeHtml(resolveHrefWithBase(l.href, base))}" class="quick-link-card">
      <span class="quick-link-icon">${escapeHtml(l.icon || '')}</span>
      <span class="quick-link-text">${escapeHtml(l.text || '')}</span>
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
  const sorted = sortByYearPriority(eduData.admissions);
  const items = sorted.slice(0, 5);
  container.innerHTML = items.map(item => {
    const safeTitle = escapeHtml(item.title);
    const safeStatus = escapeHtml(item.status);
    const safeDeadline = escapeHtml(item.deadlineDisplay);
    const yearClass = (item.year && parseInt(item.year) >= 2026) ? 'current' : 'previous';
    return `
    <div class="admission-notice-item">
      <h5><a href="${base}pages/admissions.html">${safeTitle}</a></h5>
      <div style="display:flex;gap:8px;align-items:center;margin-top:5px;flex-wrap:wrap;">
        <span class="badge ${safeStatus === 'চলছে' ? 'badge-success' : safeStatus === 'শেষ' ? 'badge-danger' : 'badge-warning'}">${safeStatus}</span>
        <span style="font-size:11px;color:#888;">শেষ: ${safeDeadline}</span>
        ${item.year ? `<span class="year-badge ${yearClass}">${escapeHtml(item.year)}</span>` : ''}
      </div>
    </div>
  `}).join('');
}

// ===================== SIDEBAR GOVERNMENT NOTICES =====================
function initSidebarGovtNotices() {
  const container = document.getElementById('sidebar-govt-notices');
  if (!container || typeof eduData === 'undefined') return;

  const notices = eduData.governmentNotices || [];
  const sorted = sortByYearPriority(notices);
  const items = sorted.slice(0, 5);
  container.innerHTML = items.map(item => {
    const safeTitle = escapeHtml(item.title);
    const safeDesc = escapeHtml(item.description);
    const safeDate = escapeHtml(item.date);
    const safeSourceUrl = item.sourceUrl ? escapeHtml(item.sourceUrl) : 'https://shed.gov.bd/pages/notices';
    return `
    <div class="govt-notice-item">
      <a href="${safeSourceUrl}" target="_blank" rel="noopener">
        <h5 style="font-size:12px;font-weight:600;color:#2c3e50;margin-bottom:4px;line-height:1.4;">${safeTitle}</h5>
      </a>
      <div style="display:flex;gap:6px;align-items:center;margin-top:3px;flex-wrap:wrap;">
        <span class="govt-source-badge">shed.gov.bd</span>
        <span style="font-size:10px;color:#888;">${safeDate}</span>
      </div>
    </div>
  `}).join('');
}

// ===================== SIDEBAR SCHOLARSHIPS =====================
function initSidebarScholarships() {
  const container = document.getElementById('sidebar-scholarships');
  if (!container || typeof eduData === 'undefined') return;

  const base = getBasePath();
  const sorted = sortByYearPriority(eduData.scholarships);
  const items = sorted.slice(0, 4);
  container.innerHTML = items.map(item => {
    const safeName = escapeHtml(item.name);
    const safeCountry = escapeHtml(item.country);
    const safeType = escapeHtml(item.type);
    const safeLevel = escapeHtml(item.level);
    const safeDeadline = escapeHtml(item.deadlineDisplay);
    const safeFlag = escapeHtml(item.flag);
    const safeLink = item.link && item.link.startsWith('http') ? item.link : '#';
    const yearClass = (item.year && parseInt(item.year) >= 2026) ? 'current' : 'previous';
    return `
    <div class="scholarship-item">
      <span class="scholarship-flag">${safeFlag}</span>
      <div class="scholarship-info">
        <h5><a href="${escapeHtml(safeLink)}" target="_blank" rel="noopener">${safeName}</a></h5>
        <p>${safeCountry} • ${safeType} • ${safeLevel}</p>
        <p style="color:#e65100;">শেষ: ${safeDeadline}</p>
        ${item.year ? `<span class="year-badge ${yearClass}">${escapeHtml(item.year)}</span>` : ''}
      </div>
    </div>
  `}).join('');
}

// ===================== IMPORTANT LINKS =====================
function initImportantLinks() {
  const container = document.getElementById('important-links');
  if (!container || typeof eduData === 'undefined') return;

  container.innerHTML = (eduData.importantLinks || []).map(link => `
    <a href="${escapeHtml(link.url || '#')}" target="${escapeHtml(link.target || '_blank')}" rel="noopener" class="important-link-item">
      <span>${escapeHtml(link.icon || '🔗')}</span>
      <span>${escapeHtml(link.label || link.name || '')}</span>
      <span style="margin-left:auto;font-size:11px;color:#bbb;">↗</span>
    </a>
  `).join('');
}

function initSidebarWidgets() {
  if (typeof eduData === 'undefined') return;
  const widgets = eduData.sidebarWidgets || [];
  if (!widgets.length) return;
  const keyMap = {
    resultChecker: '#sidebar-result-form',
    deadlines: '#deadline-timers',
    admissions: '#sidebar-admissions',
    govtNotices: '#sidebar-govt-notices',
    scholarships: '#sidebar-scholarships',
    importantLinks: '#important-links',
    newsletter: '#newsletter-email'
  };
  widgets.forEach(w => {
    const sel = keyMap[w.key];
    if (!sel) return;
    const el = document.querySelector(sel);
    const card = el ? el.closest('.sidebar-card') : null;
    if (card) card.style.display = w.visible === false ? 'none' : '';
  });
}

function initFooterContent() {
  if (typeof eduData === 'undefined') return;
  const site = eduData.siteSettings || {};
  const footer = eduData.footerLinks || {};
  const cols = (footer.columns || {});
  const footerCols = document.querySelectorAll('footer .footer-col');
  if (footerCols[0]) {
    const desc = footerCols[0].querySelector('.footer-desc');
    if (desc && (footer.description || site.footerText)) desc.textContent = footer.description || site.footerText;
    const social = footerCols[0].querySelector('.footer-social');
    if (social && site.social) {
      social.innerHTML = `
        <a href="${escapeHtml(site.social.facebook || '#')}" target="_blank" rel="noopener" class="social-btn" title="Facebook">📘</a>
        <a href="${escapeHtml(site.social.youtube || '#')}" target="_blank" rel="noopener" class="social-btn" title="YouTube">📹</a>
        <a href="${escapeHtml(site.social.telegram || '#')}" target="_blank" rel="noopener" class="social-btn" title="Telegram">✈️</a>
        <a href="${escapeHtml(site.social.whatsapp || '#')}" target="_blank" rel="noopener" class="social-btn" title="WhatsApp">💬</a>`;
    }
  }
  const base = getBasePath();
  const colDefs = [{ idx: 1, key: 'quick' }, { idx: 2, key: 'boards' }, { idx: 3, key: 'important' }];
  colDefs.forEach(def => {
    const col = footerCols[def.idx];
    const linksWrap = col ? col.querySelector('.footer-links') : null;
    const items = cols[def.key] || [];
    if (linksWrap && items.length) {
      linksWrap.innerHTML = items.map(item => `<a href="${escapeHtml(resolveHrefWithBase(item.href, base))}" ${item.target === '_blank' ? 'target="_blank" rel="noopener"' : ''}>${escapeHtml(item.label || '')}</a>`).join('');
    }
  });
  const bottom = document.querySelector('footer .footer-bottom span');
  if (bottom && site.copyrightText) bottom.textContent = site.copyrightText;
}

function applyPageContent() {
  if (typeof eduData === 'undefined') return;
  const key = document.body.getAttribute('data-page');
  if (!key) return;
  const list = eduData.pageContent || [];
  const item = list.find(p => p.key === key);
  if (!item) return;
  if (key === 'about') {
    const h = document.querySelector('.about-hero h1');
    const p = document.querySelector('.about-hero p');
    if (h && item.heroTitle) h.textContent = item.heroTitle;
    if (p && item.heroDescription) p.textContent = item.heroDescription;
  } else if (key === 'ssc' || key === 'hsc') {
    const h = document.querySelector('.exam-hero h1');
    const p = document.querySelector('.exam-hero p');
    if (h && item.heroTitle) h.textContent = item.heroTitle;
    if (p && item.heroDescription) p.textContent = item.heroDescription;
  } else {
    const h = document.querySelector('.page-hero h1, .scholarship-page-hero h1');
    const p = document.querySelector('.page-hero p, .scholarship-page-hero p');
    if (h && item.heroTitle) h.textContent = item.heroTitle;
    if (p && item.heroDescription) p.textContent = item.heroDescription;
  }
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

// ===================== HOME DEADLINES =====================
function initHomeDeadlines() {
  const container = document.getElementById('home-deadlines-list');
  if (!container || typeof eduData === 'undefined') return;

  const base = getBasePath();
  const now = new Date();
  const deadlines = (eduData.deadlines || [])
    .map(d => ({ ...d, _ts: new Date(d.date).getTime() }))
    .sort((a, b) => a._ts - b._ts)
    .slice(0, 6);

  container.innerHTML = deadlines.map(item => {
    const dt = new Date(item.date);
    const diffDays = Math.ceil((dt - now) / (1000 * 60 * 60 * 24));
    let statusClass, dateLabel, daysLabel;
    if (diffDays < 0) {
      statusClass = 'overdue';
      dateLabel = 'শেষ হয়েছে';
      daysLabel = `${toBengaliDigits(Math.abs(diffDays))} দিন আগে`;
    } else if (diffDays <= 7) {
      statusClass = 'soon';
      dateLabel = item.date;
      daysLabel = diffDays === 0 ? 'আজ!' : `${toBengaliDigits(diffDays)} দিন বাকি`;
    } else {
      statusClass = 'upcoming';
      dateLabel = item.date;
      daysLabel = `${toBengaliDigits(diffDays)} দিন বাকি`;
    }
    const link = item.link ? (item.link.startsWith('http') ? item.link : base + item.link) : '#';
    return `
    <div class="deadline-timeline-item">
      <div class="deadline-dot ${statusClass}"></div>
      <div class="deadline-info">
        <div class="deadline-title"><a href="${escapeHtml(link)}">${escapeHtml(item.title)}</a></div>
        <span class="deadline-date-badge ${statusClass}">${escapeHtml(dateLabel)}</span>
        <span class="deadline-days">${daysLabel}</span>
      </div>
    </div>`;
  }).join('');
}

// ===================== HOME SCHOLARSHIPS =====================
function initHomeScholarships() {
  const container = document.getElementById('home-scholarships-grid');
  if (!container || typeof eduData === 'undefined') return;

  const base = getBasePath();
  const sorted = sortByYearPriority(eduData.scholarships || []);
  const items = sorted.slice(0, 4);
  container.innerHTML = items.map(item => {
    const safeLink = item.link && item.link.startsWith('http') ? item.link : base + 'pages/scholarships.html';
    return `
    <a href="${escapeHtml(safeLink)}" target="${item.link && item.link.startsWith('http') ? '_blank' : '_self'}" rel="noopener" class="home-scholar-card">
      <span class="scholar-flag">${escapeHtml(item.flag || '🌟')}</span>
      <div class="scholar-name">${escapeHtml(item.name)}</div>
      <div class="scholar-meta">${escapeHtml(item.country)} • ${escapeHtml(item.level)}</div>
      <div class="scholar-deadline">শেষ: ${escapeHtml(item.deadlineDisplay || item.deadline || '')}</div>
    </a>`;
  }).join('');
}

// ===================== HOME USEFUL LINKS =====================
function initHomeUsefulLinks() {
  const container = document.getElementById('home-useful-links');
  if (!container || typeof eduData === 'undefined') return;

  const links = (eduData.importantLinks || []).slice(0, 12);
  container.innerHTML = links.map(link => `
    <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener" class="home-useful-link-card">
      <span class="link-icon">${escapeHtml(link.icon || '🔗')}</span>
      <span>${escapeHtml(link.name)}</span>
    </a>`).join('');
}
