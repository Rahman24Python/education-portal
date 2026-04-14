// EduBD - Scholarship Page Dedicated JavaScript
// scholars4dev.com inspired functionality

(function () {
  'use strict';

  // ===================== STATE =====================
  const state = {
    scholarships: [],
    filtered: [],
    filters: {
      search: '',
      countries: [],
      levels: [],
      funding: [],
      deadline: ''
    },
    sort: 'deadline',
    bookmarks: new Set()
  };

  // ===================== INIT =====================
  function init() {
    state.scholarships = (typeof eduData !== 'undefined') ? [...eduData.scholarships] : [];
    loadBookmarks();
    initFromURL();
    buildFilters();
    applyFiltersAndRender();
    bindEvents();
    renderStats();
    updateAllCountdowns();
    setInterval(updateAllCountdowns, 60000);
  }

  // ===================== URL STATE =====================
  function initFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('search')) state.filters.search = params.get('search');
    if (params.get('sort')) state.sort = params.get('sort');
    if (params.get('countries')) state.filters.countries = params.get('countries').split(',').filter(Boolean);
    if (params.get('levels')) state.filters.levels = params.get('levels').split(',').filter(Boolean);
    if (params.get('funding')) state.filters.funding = params.get('funding').split(',').filter(Boolean);
    if (params.get('deadline')) state.filters.deadline = params.get('deadline');

    // Pre-fill search box
    const searchInput = document.getElementById('scholarship-search-input');
    if (searchInput && state.filters.search) searchInput.value = state.filters.search;

    // Pre-select sort
    const sortSelect = document.getElementById('scholarship-sort');
    if (sortSelect && state.sort) sortSelect.value = state.sort;
  }

  function pushURL() {
    const params = new URLSearchParams();
    if (state.filters.search) params.set('search', state.filters.search);
    if (state.sort !== 'deadline') params.set('sort', state.sort);
    if (state.filters.countries.length) params.set('countries', state.filters.countries.join(','));
    if (state.filters.levels.length) params.set('levels', state.filters.levels.join(','));
    if (state.filters.funding.length) params.set('funding', state.filters.funding.join(','));
    if (state.filters.deadline) params.set('deadline', state.filters.deadline);
    const url = params.toString() ? '?' + params.toString() : window.location.pathname;
    window.history.replaceState({}, '', url);
  }

  // ===================== FILTERS =====================
  function buildFilters() {
    // Country filters
    const countries = [...new Set(state.scholarships.map(s => s.country))].sort();
    const countryContainer = document.getElementById('filter-countries');
    if (countryContainer) {
      countryContainer.innerHTML = countries.map(c => {
        const s = state.scholarships.find(x => x.country === c);
        const flag = s ? s.flag : '';
        const checked = state.filters.countries.includes(c) ? 'checked' : '';
        return `<label class="filter-check-label">
          <input type="checkbox" value="${esc(c)}" ${checked} data-filter-type="country">
          <span>${flag} ${esc(c)}</span>
        </label>`;
      }).join('');
    }

    // Level filters
    const levelOptions = [
      { value: 'স্নাতক', label: '🎓 স্নাতক' },
      { value: 'মাস্টার্স', label: '📖 মাস্টার্স' },
      { value: 'পিএইচডি', label: '🔬 পিএইচডি' }
    ];
    const levelContainer = document.getElementById('filter-levels');
    if (levelContainer) {
      levelContainer.innerHTML = levelOptions.map(l => {
        const checked = state.filters.levels.includes(l.value) ? 'checked' : '';
        return `<label class="filter-check-label">
          <input type="checkbox" value="${esc(l.value)}" ${checked} data-filter-type="level">
          <span>${l.label}</span>
        </label>`;
      }).join('');
    }

    // Funding filters
    const fundingOptions = [
      { value: 'সম্পূর্ণ', label: '💰 সম্পূর্ণ বৃত্তি' },
      { value: 'আংশিক', label: '💵 আংশিক বৃত্তি' },
      { value: 'সরকারি', label: '🏛️ সরকারি বৃত্তি' }
    ];
    const fundingContainer = document.getElementById('filter-funding');
    if (fundingContainer) {
      fundingContainer.innerHTML = fundingOptions.map(f => {
        const checked = state.filters.funding.includes(f.value) ? 'checked' : '';
        return `<label class="filter-check-label">
          <input type="checkbox" value="${esc(f.value)}" ${checked} data-filter-type="funding">
          <span>${f.label}</span>
        </label>`;
      }).join('');
    }

    // Deadline filters
    const deadlineContainer = document.getElementById('filter-deadline');
    if (deadlineContainer) {
      const options = [
        { value: '', label: 'সব সময়' },
        { value: '30', label: 'এই মাসে (৩০ দিন)' },
        { value: '90', label: 'আগামী ৩ মাস' },
        { value: '180', label: 'আগামী ৬ মাস' }
      ];
      deadlineContainer.innerHTML = options.map(o => {
        const sel = state.filters.deadline === o.value ? 'selected' : '';
        return `<option value="${esc(o.value)}" ${sel}>${esc(o.label)}</option>`;
      }).join('');
    }
  }

  function applyFiltersAndRender() {
    let items = [...state.scholarships];

    // Search
    if (state.filters.search) {
      const q = state.filters.search.toLowerCase();
      items = items.filter(s =>
        (s.name + ' ' + s.country + ' ' + s.type + ' ' + s.level + ' ' + (s.description || '')).toLowerCase().includes(q)
      );
    }

    // Countries
    if (state.filters.countries.length) {
      items = items.filter(s => state.filters.countries.includes(s.country));
    }

    // Levels
    if (state.filters.levels.length) {
      items = items.filter(s => state.filters.levels.some(l => s.level.includes(l)));
    }

    // Funding
    if (state.filters.funding.length) {
      items = items.filter(s => state.filters.funding.some(f => s.type.includes(f)));
    }

    // Deadline
    if (state.filters.deadline) {
      const days = parseInt(state.filters.deadline);
      const now = new Date();
      items = items.filter(s => {
        const dl = new Date(s.deadline);
        const diff = Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= days;
      });
    }

    // Sort
    items = sortItems(items, state.sort);

    state.filtered = items;
    renderCards(items);
    renderResultCount(items.length);
    pushURL();
  }

  function sortItems(items, sort) {
    const arr = [...items];
    if (sort === 'deadline') {
      arr.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    } else if (sort === 'alpha') {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'newest') {
      arr.sort((a, b) => b.id - a.id);
    }
    return arr;
  }

  // ===================== RENDER CARDS =====================
  function renderCards(items) {
    const container = document.getElementById('scholarship-cards-container');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>কোনো বৃত্তি পাওয়া যায়নি</h3>
          <p>ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          <button class="btn btn-primary" onclick="clearAllFilters()">সব ফিল্টার মুছুন</button>
        </div>`;
      return;
    }

    container.innerHTML = items.map(s => renderCard(s)).join('');
  }

  function renderCard(s) {
    const daysLeft = getDaysLeft(s.deadline);
    const isBookmarked = state.bookmarks.has(s.id);
    const statusBadge = getStatusBadge(daysLeft, s.deadline);
    const countdownHtml = getCountdownHtml(daysLeft);
    const isNew = s.id >= 10; // treat higher IDs as newer

    return `<div class="scholarship-detail-card" data-id="${s.id}" id="sc-card-${s.id}">
  <div class="scholarship-card-header">
    <div class="scholarship-card-flag-title">
      <span class="scholarship-flag-big">${esc(s.flag)}</span>
      <div class="scholarship-title-area">
        <h3 class="scholarship-detail-title">
          <a href="${esc(s.website || s.link)}" target="_blank" rel="noopener">${esc(s.name)}</a>
        </h3>
        <div class="scholarship-badges">
          ${statusBadge}
          ${isNew ? '<span class="scholarship-badge badge-new">🆕 নতুন</span>' : ''}
        </div>
      </div>
    </div>
    <div class="scholarship-card-actions">
      <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
              onclick="toggleBookmark(${s.id})" 
              title="${isBookmarked ? 'সংরক্ষণ বাতিল' : 'সংরক্ষণ করুন'}"
              aria-label="বুকমার্ক">
        ${isBookmarked ? '🔖' : '🔖'}
        <span class="btn-bookmark-label">${isBookmarked ? 'সংরক্ষিত' : 'সংরক্ষণ'}</span>
      </button>
    </div>
  </div>

  <div class="scholarship-meta-row">
    <span class="scholarship-meta-item">📍 ${esc(s.country)}</span>
    <span class="scholarship-meta-item">🎓 ${esc(s.level)}</span>
    <span class="scholarship-meta-item">💰 ${esc(s.type)}</span>
    <span class="scholarship-meta-item">💵 ${esc(s.amount)}</span>
  </div>

  <p class="scholarship-description-text">${esc(s.description || '')}</p>

  ${s.benefits && s.benefits.length ? `
  <div class="scholarship-benefits-section">
    <h4 class="scholarship-section-title">✅ সুবিধাসমূহ:</h4>
    <ul class="scholarship-benefits-list">
      ${s.benefits.map(b => `<li>${esc(b)}</li>`).join('')}
    </ul>
  </div>` : ''}

  <div class="scholarship-info-row">
    <div class="scholarship-info-item">
      <span class="info-label">📋 যোগ্যতা:</span>
      <span class="info-value">${esc(s.eligibility)}</span>
    </div>
    ${s.numberOfAwards ? `<div class="scholarship-info-item">
      <span class="info-label">🏆 পুরস্কার:</span>
      <span class="info-value">${esc(s.numberOfAwards)}</span>
    </div>` : ''}
    ${s.duration ? `<div class="scholarship-info-item">
      <span class="info-label">⏱️ মেয়াদ:</span>
      <span class="info-value">${esc(s.duration)}</span>
    </div>` : ''}
  </div>

  <div class="scholarship-deadline-row">
    <div class="scholarship-deadline-info">
      <span class="deadline-label">📅 শেষ তারিখ:</span>
      <span class="deadline-value">${esc(s.deadlineDisplay)}</span>
    </div>
    ${countdownHtml}
  </div>

  <div class="scholarship-expandable" id="expand-${s.id}" style="display:none;">
    ${s.requirements && s.requirements.length ? `
    <div class="scholarship-requirements">
      <h4 class="scholarship-section-title">📌 প্রয়োজনীয়তা:</h4>
      <ul class="scholarship-req-list">
        ${s.requirements.map(r => `<li>${esc(r)}</li>`).join('')}
      </ul>
    </div>` : ''}
    ${s.applicationProcess ? `
    <div class="scholarship-process">
      <h4 class="scholarship-section-title">📝 আবেদন প্রক্রিয়া:</h4>
      <p>${esc(s.applicationProcess)}</p>
    </div>` : ''}
  </div>

  <div class="scholarship-card-footer">
    <a href="${esc(s.website || s.link)}" target="_blank" rel="noopener" class="btn btn-primary btn-apply">
      আবেদন করুন ↗
    </a>
    <button class="btn btn-secondary btn-details" onclick="toggleDetails(${s.id})">
      বিস্তারিত দেখুন
    </button>
    <div class="scholarship-share-btns">
      <button class="share-btn" onclick="copyLink(${s.id})" title="লিঙ্ক কপি করুন">🔗</button>
      <button class="share-btn" onclick="shareWhatsApp(${s.id})" title="WhatsApp-এ শেয়ার করুন">📱</button>
    </div>
  </div>
</div>`;
  }

  function getStatusBadge(daysLeft, deadline) {
    const d = new Date(deadline);
    const now = new Date();
    if (d < now) {
      return '<span class="scholarship-badge badge-closed">❌ আবেদন বন্ধ</span>';
    } else if (daysLeft <= 30) {
      return '<span class="scholarship-badge badge-urgent">🔴 শেষ সময়!</span>';
    } else {
      return '<span class="scholarship-badge badge-open">✅ আবেদন চলছে</span>';
    }
  }

  function getCountdownHtml(daysLeft) {
    if (daysLeft < 0) {
      return '<span class="scholarship-countdown countdown-closed">মেয়াদ শেষ</span>';
    } else if (daysLeft === 0) {
      return '<span class="scholarship-countdown countdown-urgent">আজই শেষ!</span>';
    } else if (daysLeft <= 30) {
      return `<span class="scholarship-countdown countdown-urgent" data-deadline-days="${daysLeft}">⏳ মাত্র ${daysLeft} দিন বাকি!</span>`;
    } else {
      return `<span class="scholarship-countdown countdown-ok" data-deadline-days="${daysLeft}">⏳ ${daysLeft} দিন বাকি</span>`;
    }
  }

  function getDaysLeft(deadline) {
    const now = new Date();
    const dl = new Date(deadline);
    return Math.ceil((dl - now) / (1000 * 60 * 60 * 24));
  }

  function renderResultCount(count) {
    const el = document.getElementById('scholarship-result-count');
    if (el) el.textContent = `${count}টি বৃত্তি পাওয়া গেছে`;
  }

  // ===================== STATS =====================
  function renderStats() {
    const items = state.scholarships;
    const total = items.length;
    const countries = new Set(items.map(s => s.country)).size;
    const fullFunded = items.filter(s => s.type.includes('সম্পূর্ণ')).length;
    const now = new Date();
    const open = items.filter(s => new Date(s.deadline) >= now).length;

    const statsEl = document.getElementById('scholarship-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-item">
          <span class="stat-number">${total}</span>
          <span class="stat-label">মোট বৃত্তি</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${countries}</span>
          <span class="stat-label">দেশ</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${fullFunded}</span>
          <span class="stat-label">সম্পূর্ণ বৃত্তি</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${open}</span>
          <span class="stat-label">আবেদন চলছে</span>
        </div>
      `;
    }
  }

  // ===================== COUNTDOWN UPDATE =====================
  function updateAllCountdowns() {
    document.querySelectorAll('[data-deadline-days]').forEach(el => {
      const parentCard = el.closest('[data-id]');
      if (!parentCard) return;
      const id = parseInt(parentCard.dataset.id);
      const s = state.scholarships.find(x => x.id === id);
      if (!s) return;
      const days = getDaysLeft(s.deadline);
      el.setAttribute('data-deadline-days', days);
      if (days < 0) {
        el.className = 'scholarship-countdown countdown-closed';
        el.textContent = 'মেয়াদ শেষ';
      } else if (days === 0) {
        el.className = 'scholarship-countdown countdown-urgent';
        el.textContent = 'আজই শেষ!';
      } else if (days <= 30) {
        el.className = 'scholarship-countdown countdown-urgent';
        el.textContent = `⏳ মাত্র ${days} দিন বাকি!`;
      } else {
        el.className = 'scholarship-countdown countdown-ok';
        el.textContent = `⏳ ${days} দিন বাকি`;
      }
    });
  }

  // ===================== TOGGLE DETAILS =====================
  window.toggleDetails = function (id) {
    const el = document.getElementById('expand-' + id);
    const btn = document.querySelector(`#sc-card-${id} .btn-details`);
    if (!el) return;
    const isOpen = el.style.display !== 'none';
    el.style.display = isOpen ? 'none' : 'block';
    if (btn) btn.textContent = isOpen ? 'বিস্তারিত দেখুন' : 'কম দেখুন ▲';
  };

  // ===================== BOOKMARK =====================
  function loadBookmarks() {
    try {
      const saved = localStorage.getItem('edubd_bookmarks');
      if (saved) {
        JSON.parse(saved).forEach(id => state.bookmarks.add(id));
      }
    } catch (e) { /* ignore */ }
  }

  function saveBookmarks() {
    try {
      localStorage.setItem('edubd_bookmarks', JSON.stringify([...state.bookmarks]));
    } catch (e) { /* ignore */ }
  }

  window.toggleBookmark = function (id) {
    if (state.bookmarks.has(id)) {
      state.bookmarks.delete(id);
      showToast('বুকমার্ক সরানো হয়েছে');
    } else {
      state.bookmarks.add(id);
      showToast('বৃত্তি সংরক্ষণ করা হয়েছে! 🔖');
    }
    saveBookmarks();
    const btn = document.querySelector(`#sc-card-${id} .bookmark-btn`);
    if (btn) {
      const isBookmarked = state.bookmarks.has(id);
      btn.classList.toggle('bookmarked', isBookmarked);
      const label = btn.querySelector('.btn-bookmark-label');
      if (label) label.textContent = isBookmarked ? 'সংরক্ষিত' : 'সংরক্ষণ';
    }
  };

  // ===================== SHARE =====================
  window.copyLink = function (id) {
    const url = window.location.origin + window.location.pathname + '?highlight=' + id;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showToast('লিঙ্ক কপি করা হয়েছে! 🔗'));
    } else {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('লিঙ্ক কপি করা হয়েছে! 🔗');
    }
  };

  window.shareWhatsApp = function (id) {
    const s = state.scholarships.find(x => x.id === id);
    if (!s) return;
    const text = `📚 ${s.name}\n🌍 ${s.country} | ${s.type}\n📅 শেষ: ${s.deadlineDisplay}\n🔗 ${s.website || s.link}\n\nEduBD - বাংলাদেশ শিক্ষা পোর্টাল থেকে`;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };

  // ===================== CLEAR FILTERS =====================
  window.clearAllFilters = function () {
    state.filters = { search: '', countries: [], levels: [], funding: [], deadline: '' };
    state.sort = 'deadline';
    const searchInput = document.getElementById('scholarship-search-input');
    if (searchInput) searchInput.value = '';
    const sortSelect = document.getElementById('scholarship-sort');
    if (sortSelect) sortSelect.value = 'deadline';
    document.querySelectorAll('.filter-check-label input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    const deadlineSelect = document.getElementById('filter-deadline');
    if (deadlineSelect) deadlineSelect.value = '';
    applyFiltersAndRender();
    updateActiveFilterCount();
  };

  function updateActiveFilterCount() {
    const count = state.filters.countries.length + state.filters.levels.length +
      state.filters.funding.length + (state.filters.deadline ? 1 : 0) +
      (state.filters.search ? 1 : 0);
    const badge = document.getElementById('active-filter-count');
    if (badge) {
      badge.textContent = count > 0 ? count : '';
      badge.style.display = count > 0 ? 'inline' : 'none';
    }
  }

  // ===================== MOBILE DRAWER =====================
  function openFilterDrawer() {
    const drawer = document.getElementById('filter-drawer');
    const overlay = document.getElementById('filter-drawer-overlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeFilterDrawer() {
    const drawer = document.getElementById('filter-drawer');
    const overlay = document.getElementById('filter-drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ===================== TOAST =====================
  function showToast(message) {
    if (typeof window.showToastMessage === 'function') {
      window.showToastMessage(message);
      return;
    }
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast toast-show';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ===================== HELPER =====================
  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  // ===================== EVENT BINDINGS =====================
  function bindEvents() {
    // Search
    const searchInput = document.getElementById('scholarship-search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.filters.search = this.value.trim();
          applyFiltersAndRender();
          updateActiveFilterCount();
        }, 300);
      });
    }

    // Sort
    const sortSelect = document.getElementById('scholarship-sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.sort = this.value;
        applyFiltersAndRender();
      });
    }

    // Checkbox filters
    document.addEventListener('change', function (e) {
      const target = e.target;
      if (!target.dataset.filterType) return;

      const type = target.dataset.filterType;
      const value = target.value;
      const filterKey = type === 'country' ? 'countries' : type === 'level' ? 'levels' : 'funding';

      if (target.checked) {
        if (!state.filters[filterKey].includes(value)) {
          state.filters[filterKey].push(value);
        }
      } else {
        state.filters[filterKey] = state.filters[filterKey].filter(v => v !== value);
      }
      applyFiltersAndRender();
      updateActiveFilterCount();
    });

    // Deadline select
    const deadlineSelect = document.getElementById('filter-deadline');
    if (deadlineSelect) {
      deadlineSelect.addEventListener('change', function () {
        state.filters.deadline = this.value;
        applyFiltersAndRender();
        updateActiveFilterCount();
      });
    }

    // Mobile filter FAB
    const filterFab = document.getElementById('filter-fab');
    if (filterFab) filterFab.addEventListener('click', openFilterDrawer);

    const filterDrawerClose = document.getElementById('filter-drawer-close');
    if (filterDrawerClose) filterDrawerClose.addEventListener('click', closeFilterDrawer);

    const filterDrawerOverlay = document.getElementById('filter-drawer-overlay');
    if (filterDrawerOverlay) filterDrawerOverlay.addEventListener('click', closeFilterDrawer);

    const filterDrawerApply = document.getElementById('filter-drawer-apply');
    if (filterDrawerApply) filterDrawerApply.addEventListener('click', closeFilterDrawer);

    const clearAllBtn = document.getElementById('clear-all-filters');
    if (clearAllBtn) clearAllBtn.addEventListener('click', clearAllFilters);
  }

  // ===================== START =====================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
