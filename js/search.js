// EduBD - Search Functionality

document.addEventListener('DOMContentLoaded', function() {
  initSearchPage();
});

function initSearchPage() {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';

  // Set search input value
  const searchInput = document.querySelector('.search-box input');
  const pageSearchInput = document.getElementById('page-search-input');
  if (searchInput) searchInput.value = query;
  if (pageSearchInput) pageSearchInput.value = query;

  // Show query
  const queryDisplay = document.getElementById('search-query-display');
  if (queryDisplay) queryDisplay.textContent = query;

  if (!query) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <h3>কোনো অনুসন্ধান করা হয়নি</h3>
        <p>উপরের সার্চ বক্সে কিছু টাইপ করুন।</p>
      </div>
    `;
    return;
  }

  if (typeof eduData === 'undefined') {
    resultsContainer.innerHTML = '<p>ডেটা লোড হচ্ছে...</p>';
    return;
  }

  const results = searchAllData(query);
  renderSearchResults(resultsContainer, results, query);

  // Count
  const countEl = document.getElementById('results-count');
  if (countEl) {
    const b = (typeof toBengaliDigits === 'function') ? toBengaliDigits : (x => x);
    countEl.textContent = `${b(results.total)} টি ফলাফল পাওয়া গেছে`;
  }

  // Page search form
  if (pageSearchInput) {
    pageSearchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const q = this.value.trim();
        if (q) window.location.href = 'search.html?q=' + encodeURIComponent(q);
      }
    });
  }
  const pageSearchBtn = document.getElementById('page-search-btn');
  if (pageSearchBtn) {
    pageSearchBtn.addEventListener('click', function() {
      const q = pageSearchInput ? pageSearchInput.value.trim() : '';
      if (q) window.location.href = 'search.html?q=' + encodeURIComponent(q);
    });
  }
}

function searchAllData(query) {
  const q = query.toLowerCase();
  const results = { news: [], admissions: [], scholarships: [], total: 0 };

  // Search news
  eduData.latestNews.forEach(item => {
    if (matches(item.title + ' ' + item.summary + ' ' + item.category + ' ' + item.source, q)) {
      results.news.push(item);
    }
  });

  // Search admissions
  eduData.admissions.forEach(item => {
    if (matches(item.title + ' ' + item.university + ' ' + item.type + ' ' + (item.description || ''), q)) {
      results.admissions.push(item);
    }
  });

  // Search scholarships
  eduData.scholarships.forEach(item => {
    if (matches(item.name + ' ' + item.country + ' ' + item.type + ' ' + item.level + ' ' + (item.description || ''), q)) {
      results.scholarships.push(item);
    }
  });

  results.total = results.news.length + results.admissions.length + results.scholarships.length;
  return results;
}

function matches(text, query) {
  return text.toLowerCase().includes(query);
}

function highlight(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  return text.replace(re, '<mark class="search-highlight">$1</mark>');
}

function renderSearchResults(container, results, query) {
  if (results.total === 0) {
    container.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">😕</div>
        <h3>"${query}" এর জন্য কোনো ফলাফল পাওয়া যায়নি</h3>
        <p>অন্য কীওয়ার্ড দিয়ে অনুসন্ধান করুন অথবা বাংলায় টাইপ করুন।</p>
      </div>
    `;
    return;
  }

  let html = '';

  if (results.news.length > 0) {
    html += `<h3 style="font-size:17px;font-weight:800;color:var(--text-dark);margin:20px 0 12px;display:flex;align-items:center;gap:8px;">
      <span style="width:4px;height:20px;background:var(--primary);border-radius:2px;display:inline-block;"></span>
      সংবাদ (${results.news.length}টি)
    </h3>`;
    results.news.forEach(item => {
      html += `
        <div class="search-result-item">
          <span class="news-category" style="margin-bottom:8px;">${item.category}</span>
          <h3><a href="${item.link ? '../' + item.link : '#'}">${highlight(item.title, query)}</a></h3>
          <p>${highlight(item.summary, query)}</p>
          <div class="news-meta" style="margin-top:8px;">
            <span>📰 ${item.source}</span>
            <span>📅 ${item.date}</span>
          </div>
        </div>
      `;
    });
  }

  if (results.admissions.length > 0) {
    html += `<h3 style="font-size:17px;font-weight:800;color:var(--text-dark);margin:20px 0 12px;display:flex;align-items:center;gap:8px;">
      <span style="width:4px;height:20px;background:var(--accent);border-radius:2px;display:inline-block;"></span>
      ভর্তি তথ্য (${results.admissions.length}টি)
    </h3>`;
    results.admissions.forEach(item => {
      html += `
        <div class="search-result-item" style="border-left-color:var(--accent);">
          <span class="news-category">${item.type}</span>
          <h3><a href="../pages/admissions.html">${highlight(item.title, query)}</a></h3>
          <p>${highlight(item.description || item.university, query)}</p>
          <div class="news-meta" style="margin-top:8px;">
            <span>🏫 ${item.university}</span>
            <span>📅 শেষ: ${item.deadlineDisplay}</span>
            <span class="badge ${item.status === 'চলছে' ? 'badge-success' : item.status === 'শেষ' ? 'badge-danger' : 'badge-warning'}">${item.status}</span>
          </div>
        </div>
      `;
    });
  }

  if (results.scholarships.length > 0) {
    html += `<h3 style="font-size:17px;font-weight:800;color:var(--text-dark);margin:20px 0 12px;display:flex;align-items:center;gap:8px;">
      <span style="width:4px;height:20px;background:#0088cc;border-radius:2px;display:inline-block;"></span>
      বৃত্তি (${results.scholarships.length}টি)
    </h3>`;
    results.scholarships.forEach(item => {
      html += `
        <div class="search-result-item" style="border-left-color:#0088cc;">
          <span class="news-category" style="background:#e3f2fd;color:#0088cc;">${item.country} ${item.flag}</span>
          <h3><a href="${item.link}" target="_blank" rel="noopener">${highlight(item.name, query)}</a></h3>
          <p>${highlight(item.description || item.type, query)}</p>
          <div class="news-meta" style="margin-top:8px;">
            <span>🎓 ${item.level}</span>
            <span>💰 ${item.amount}</span>
            <span>📅 শেষ: ${item.deadlineDisplay}</span>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = html;
}
