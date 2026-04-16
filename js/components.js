// EduBD - Shared Components (Header, Footer, etc.)
// Called from inner pages with base="../"

function renderSharedHeader(base, activePage) {
  base = base || '../';
  const navData = (typeof eduData !== 'undefined' && eduData.navigation) ? eduData.navigation : {};
  const mainNav = navData.main || [
    { href: 'index.html', label: 'হোম' },
    { href: 'pages/admissions.html', label: 'ভর্তি তথ্য', isDropdown: true, children: [{ href: 'pages/admissions.html?type=বিশ্ববিদ্যালয়', icon: '🎓', label: 'বিশ্ববিদ্যালয় ভর্তি' }] },
    { href: 'pages/routines.html', label: 'পরীক্ষা' },
    { href: 'pages/results.html', label: 'ফলাফল' },
    { href: 'pages/scholarships.html', label: 'স্কলারশিপ' },
    { href: 'pages/news.html', label: 'শিক্ষা সংবাদ' }
  ];
  const navLinks = mainNav.map((n, i) => ({ href: base + (n.href || ''), label: n.label, key: i === 0 ? 'home' : (n.label || '').toLowerCase(), hasDropdown: n.isDropdown, children: n.children || [] }));
  const dropdownItems = (mainNav.find(n => n.isDropdown) || {}).children || [];
  const category = (typeof eduData !== 'undefined' && Array.isArray(eduData.categoryNav)) ? eduData.categoryNav : [];
  const catLinks = category.length ? category.map(c => ({ href: base + (c.href || ''), label: `${c.icon || ''} ${c.label || ''}` })) : [
    { href: base + 'pages/news.html?cat=ট্রেন্ডিং', label: '🔥 ট্রেন্ডিং' },
    { href: base + 'pages/ssc.html', label: '📝 SSC 2025' }
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
              <a href="${base + (d.href || '')}" class="dropdown-item">
                <span class="dropdown-icon">${d.icon || ''}</span>${d.label || ''}
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
  const site = (typeof eduData !== 'undefined' && eduData.siteSettings) ? eduData.siteSettings : {};
  const footerData = (typeof eduData !== 'undefined' && eduData.footerLinks) ? eduData.footerLinks : {};
  const footerCols = (footerData.columns || {});
  const quick = footerCols.quick || [];
  const boards = footerCols.boards || [];
  const important = footerCols.important || [];
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
            ${footerData.description || 'EduBD বাংলাদেশের সকল শিক্ষার্থী ও অভিভাবকদের জন্য একটি বিশ্বস্ত শিক্ষামূলক তথ্য পোর্টাল।'}
          </p>
          <div class="footer-social">
            <a href="${(site.social || {}).facebook || 'https://facebook.com'}" target="_blank" rel="noopener" class="social-btn" title="Facebook">📘</a>
            <a href="${(site.social || {}).youtube || 'https://youtube.com'}" target="_blank" rel="noopener" class="social-btn" title="YouTube">📹</a>
            <a href="${(site.social || {}).telegram || 'https://t.me/edubd_portal'}" target="_blank" rel="noopener" class="social-btn" title="Telegram">✈️</a>
            <a href="${(site.social || {}).whatsapp || 'https://wa.me/8801700000000'}" target="_blank" rel="noopener" class="social-btn" title="WhatsApp">💬</a>
          </div>
        </div>

        <div class="footer-col">
          <h4>দ্রুত লিঙ্ক</h4>
          <div class="footer-links">
            ${(quick.length ? quick : [{ label: '🎓 ভর্তি তথ্য', href: 'pages/admissions.html' }]).map(l => `<a href="${base + (l.href || '')}" ${l.target === '_blank' ? 'target="_blank" rel="noopener"' : ''}>${l.label || ''}</a>`).join('')}
          </div>
        </div>

        <div class="footer-col">
          <h4>শিক্ষা বোর্ড</h4>
          <div class="footer-links">
            ${(boards.length ? boards : [{ label: '🏫 ঢাকা বোর্ড', href: 'pages/board.html?board=dhaka' }]).map(l => `<a href="${base + (l.href || '')}" ${l.target === '_blank' ? 'target="_blank" rel="noopener"' : ''}>${l.label || ''}</a>`).join('')}
          </div>
        </div>

        <div class="footer-col">
          <h4>গুরুত্বপূর্ণ লিঙ্ক</h4>
          <div class="footer-links">
            ${(important.length ? important : [{ label: '🏛️ শিক্ষা মন্ত্রণালয়', href: 'https://moedu.gov.bd', target: '_blank' }]).map(l => `<a href="${l.href || '#'}" ${l.target === '_blank' ? 'target="_blank" rel="noopener"' : ''}>${l.label || ''}</a>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>${site.copyrightText || '© ২০২৫ EduBD — বাংলাদেশ শিক্ষা তথ্য পোর্টাল। সর্বস্বত্ব সংরক্ষিত।'}</span>
      <span>তৈরি করেছেন ❤️ দ্বারা EduBD টিম</span>
    </div>
  </footer>

  <button class="back-to-top" title="উপরে যান">▲</button>
  <div class="toast-container"></div>
  `;
}

window.renderSharedHeader = renderSharedHeader;
window.renderSharedFooter = renderSharedFooter;
