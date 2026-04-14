// EduBD - Shared Components (Header, Footer, etc.)
// Called from inner pages with base="../"

function renderSharedHeader(base, activePage) {
  base = base || '../';
  const navLinks = [
    { href: base + 'index.html', label: 'হোম', key: 'home' },
    { href: base + 'pages/admissions.html', label: 'ভর্তি তথ্য', key: 'admissions', hasDropdown: true },
    { href: base + 'pages/routines.html', label: 'পরীক্ষা', key: 'routines' },
    { href: base + 'pages/results.html', label: 'ফলাফল', key: 'results' },
    { href: base + 'pages/scholarships.html', label: 'স্কলারশিপ', key: 'scholarships' },
    { href: base + 'pages/news.html', label: 'শিক্ষা সংবাদ', key: 'news' },
  ];

  const dropdownItems = [
    { href: base + 'pages/admissions.html?type=বিশ্ববিদ্যালয়', icon: '🎓', label: 'বিশ্ববিদ্যালয় ভর্তি' },
    { href: base + 'pages/admissions.html?type=মেডিকেল', icon: '🏥', label: 'মেডিকেল ভর্তি' },
    { href: base + 'pages/admissions.html?type=ইঞ্জিনিয়ারিং', icon: '⚙️', label: 'ইঞ্জিনিয়ারিং ভর্তি' },
    { href: base + 'pages/admissions.html?type=কলেজ', icon: '📚', label: 'কলেজ ভর্তি (XI)' },
    { href: base + 'pages/admissions.html', icon: '📋', label: 'সকল ভর্তি বিজ্ঞপ্তি' },
  ];

  const catLinks = [
    { href: base + 'pages/news.html?cat=ট্রেন্ডিং', label: '🔥 ট্রেন্ডিং' },
    { href: base + 'pages/ssc.html', label: '📝 SSC 2025' },
    { href: base + 'pages/hsc.html', label: '📚 HSC 2025' },
    { href: base + 'pages/admissions.html?type=বিশ্ববিদ্যালয়', label: '🎓 বিশ্ববিদ্যালয়' },
    { href: base + 'pages/routines.html', label: '🗓️ রুটিন' },
    { href: base + 'pages/news.html?cat=নোটিশ', label: '📢 নোটিশ' },
    { href: base + 'pages/scholarships.html', label: '🌟 বৃত্তি' },
    { href: base + 'pages/news.html?cat=মাদ্রাসা', label: '🕌 মাদ্রাসা' },
    { href: base + 'pages/news.html?cat=কারিগরি', label: '🔧 কারিগরি' },
    { href: base + 'pages/scholarships.html?type=international', label: '✈️ বিদেশে পড়াশোনা' },
  ];

  const navLinksHtml = navLinks.map(link => {
    const isActive = activePage === link.key ? ' active' : '';
    if (link.hasDropdown) {
      return `
        <div class="nav-dropdown">
          <a href="${link.href}" class="nav-link${isActive}">
            ${link.label} <span style="font-size:10px;">▼</span>
          </a>
          <div class="dropdown-menu">
            ${dropdownItems.map(d => `
              <a href="${d.href}" class="dropdown-item">
                <span class="dropdown-icon">${d.icon}</span>${d.label}
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }
    return `<a href="${link.href}" class="nav-link${isActive}">${link.label}</a>`;
  }).join('');

  const mobileNavHtml = navLinks.map(link =>
    `<a href="${link.href}" class="mobile-nav-link">${link.label}</a>`
  ).join('') + dropdownItems.slice(0, 4).map(d =>
    `<a href="${d.href}" class="mobile-nav-link" style="padding-left:35px;font-size:13px;">${d.icon} ${d.label}</a>`
  ).join('');

  const catLinksHtml = catLinks.map(l =>
    `<a href="${l.href}" class="cat-link${l.label.includes('SSC') && activePage === 'ssc' ? ' active' : l.label.includes('HSC') && activePage === 'hsc' ? ' active' : ''}">${l.label}</a>`
  ).join('');

  return `
  <div class="top-bar">
    <div class="top-bar-inner">
      <div class="top-bar-left">
        <span id="live-date">লোড হচ্ছে...</span>
        <span>|</span>
        <span id="live-time"></span>
      </div>
      <div class="top-bar-right">
        <a href="${base}pages/about.html">আমাদের সম্পর্কে</a>
        <a href="${base}pages/news.html">শিক্ষা সংবাদ</a>
        <a href="https://moedu.gov.bd" target="_blank" rel="noopener">শিক্ষা মন্ত্রণালয়</a>
      </div>
    </div>
  </div>

  <div class="breaking-news-bar">
    <div class="breaking-news-inner">
      <span class="breaking-label">🔴 ব্রেকিং</span>
      <div class="breaking-ticker">
        <div class="breaking-ticker-inner" id="breaking-ticker">
          <span class="ticker-item">লোড হচ্ছে...</span>
        </div>
      </div>
    </div>
  </div>

  <header>
    <div class="header-inner">
      <a href="${base}index.html" class="logo">
        <div class="logo-icon">📚</div>
        <div class="logo-text">
          <span class="name">EduBD</span>
          <span class="tagline">বাংলাদেশ শিক্ষা তথ্য পোর্টাল</span>
        </div>
      </a>

      <div class="search-box">
        <input type="text" placeholder="🔍 পরীক্ষা, ভর্তি, বৃত্তি খুঁজুন..." autocomplete="off">
        <button class="search-btn" type="button" aria-label="Search">🔍</button>
      </div>

      <nav>
        ${navLinksHtml}
      </nav>

      <button class="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <nav class="category-nav">
    <div class="category-nav-inner">
      ${catLinksHtml}
    </div>
  </nav>

  <div class="mobile-overlay"></div>
  <div class="mobile-menu">
    <div class="mobile-menu-header">
      <div class="logo">
        <div class="logo-icon">📚</div>
        <div class="logo-text">
          <span class="name">EduBD</span>
        </div>
      </div>
      <button class="mobile-menu-close">✕</button>
    </div>
    ${mobileNavHtml}
    <a href="${base}pages/about.html" class="mobile-nav-link">ℹ️ আমাদের সম্পর্কে</a>
  </div>
  `;
}

function renderSharedFooter(base) {
  base = base || '../';
  return `
  <footer>
    <div class="footer-top">
      <div class="footer-grid">
        <div class="footer-col">
          <div class="footer-logo">
            <div class="footer-logo-icon">📚</div>
            <div class="footer-logo-text">
              <div class="name">EduBD</div>
              <div class="tagline">বাংলাদেশ শিক্ষা তথ্য পোর্টাল</div>
            </div>
          </div>
          <p class="footer-desc">
            EduBD বাংলাদেশের সকল শিক্ষার্থী ও অভিভাবকদের জন্য একটি বিশ্বস্ত শিক্ষামূলক তথ্য পোর্টাল। 
            SSC, HSC, ভর্তি, বৃত্তি, পরীক্ষার রুটিন সহ সকল শিক্ষা সংক্রান্ত তথ্য একটি জায়গায়।
          </p>
          <div class="footer-social">
            <a href="https://facebook.com" target="_blank" rel="noopener" class="social-btn" title="Facebook">📘</a>
            <a href="https://youtube.com" target="_blank" rel="noopener" class="social-btn" title="YouTube">📹</a>
            <a href="https://t.me/edubd_portal" target="_blank" rel="noopener" class="social-btn" title="Telegram">✈️</a>
            <a href="https://wa.me/8801700000000" target="_blank" rel="noopener" class="social-btn" title="WhatsApp">💬</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>দ্রুত লিঙ্ক</h4>
          <div class="footer-links">
            <a href="${base}pages/admissions.html">🎓 ভর্তি তথ্য</a>
            <a href="${base}pages/results.html">📊 পরীক্ষার ফলাফল</a>
            <a href="${base}pages/scholarships.html">🌟 বৃত্তি তথ্য</a>
            <a href="${base}pages/routines.html">🗓️ পরীক্ষার রুটিন</a>
            <a href="${base}pages/news.html">📰 শিক্ষা সংবাদ</a>
            <a href="${base}pages/ssc.html">📝 SSC 2025</a>
            <a href="${base}pages/hsc.html">📚 HSC 2025</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>শিক্ষা বোর্ড</h4>
          <div class="footer-links">
            <a href="${base}pages/board.html?board=dhaka">🏫 ঢাকা বোর্ড</a>
            <a href="${base}pages/board.html?board=rajshahi">🏫 রাজশাহী বোর্ড</a>
            <a href="${base}pages/board.html?board=chittagong">🏫 চট্টগ্রাম বোর্ড</a>
            <a href="${base}pages/board.html?board=sylhet">🏫 সিলেট বোর্ড</a>
            <a href="${base}pages/board.html?board=comilla">🏫 কুমিল্লা বোর্ড</a>
            <a href="${base}pages/board.html?board=madrasah">🏫 মাদ্রাসা বোর্ড</a>
            <a href="${base}pages/board.html?board=technical">🏫 কারিগরি বোর্ড</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>গুরুত্বপূর্ণ লিঙ্ক</h4>
          <div class="footer-links">
            <a href="https://moedu.gov.bd" target="_blank" rel="noopener">🏛️ শিক্ষা মন্ত্রণালয়</a>
            <a href="https://ugc.gov.bd" target="_blank" rel="noopener">🎓 UGC Bangladesh</a>
            <a href="https://eboardresults.com" target="_blank" rel="noopener">📊 বোর্ড রেজাল্ট</a>
            <a href="https://www.nu.ac.bd" target="_blank" rel="noopener">🏫 জাতীয় বিশ্ববিদ্যালয়</a>
            <a href="https://teachers.gov.bd" target="_blank" rel="noopener">👩‍🏫 শিক্ষক বাতায়ন</a>
            <a href="${base}pages/about.html">ℹ️ আমাদের সম্পর্কে</a>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ২০২৫ EduBD — বাংলাদেশ শিক্ষা তথ্য পোর্টাল। সর্বস্বত্ব সংরক্ষিত।</span>
      <span>তৈরি করেছেন ❤️ দ্বারা EduBD টিম</span>
    </div>
  </footer>

  <button class="back-to-top" title="উপরে যান">▲</button>
  <div class="toast-container"></div>
  `;
}

window.renderSharedHeader = renderSharedHeader;
window.renderSharedFooter = renderSharedFooter;
