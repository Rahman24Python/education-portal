// EduBD Admin — Main Application (CRUD for all sections)

let appData = {}; // in-memory working copy

// ─── Toast Notifications ───────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const tc = document.getElementById("toast-container");
  if (!tc) return;
  const t = document.createElement("div");
  t.className = "toast toast-" + type;
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(() => t.classList.add("show"), 50);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => tc.removeChild(t), 300);
  }, 3000);
}

// ─── Draft badge ──────────────────────────────────────────────────────────
function updateDraftBadge() {
  const badge = document.getElementById("draft-badge");
  if (!badge) return;
  badge.style.display = hasDraftChanges() ? "inline-flex" : "none";
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────
function confirmDelete(callback) {
  if (confirm("আপনি কি নিশ্চিত? এই আইটেম মুছে ফেলা হবে।")) {
    callback();
  }
}

// ─── Section Routing ─────────────────────────────────────────────────────
function showSection(name) {
  document.querySelectorAll(".section-content").forEach(el => el.style.display = "none");
  document.querySelectorAll(".sidebar-link").forEach(el => el.classList.remove("active"));
  const sec = document.getElementById("section-" + name);
  if (sec) sec.style.display = "block";
  const link = document.querySelector('[data-section="' + name + '"]');
  if (link) link.classList.add("active");
  // render
  const renderMap = {
    dashboard: renderDashboard,
    breaking: renderBreaking,
    news: renderNews,
    admissions: renderAdmissions,
    scholarships: renderScholarships,
    deadlines: renderDeadlines,
    govtnotices: renderGovtNotices,
    boards: renderBoards,
    universities: renderUniversities,
    settings: renderSettings,
    categorynav: () => renderStructuredSection("categorynav"),
    quicklinks: () => renderStructuredSection("quicklinks"),
    featured: renderFeaturedSettings,
    navigation: renderNavigation,
    footer: renderFooterSection,
    sidebar: () => renderStructuredSection("sidebar"),
    importantlinks: () => renderStructuredSection("importantlinks"),
    pages: () => renderStructuredSection("pages"),
    theme: renderThemeSettings,
    images: renderImages
  };
  if (renderMap[name]) renderMap[name]();
}

// ─── Escape HTML helper ──────────────────────────────────────────────────
function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────
function renderDashboard() {
  const d = appData;
  const cards = [
    { label: "মোট খবর", count: (d.latestNews || []).length, icon: "📰" },
    { label: "ভর্তি তথ্য", count: (d.admissions || []).length, icon: "🎓" },
    { label: "বৃত্তি", count: (d.scholarships || []).length, icon: "💰" },
    { label: "ডেডলাইন", count: (d.deadlines || []).length, icon: "⏰" },
    { label: "সরকারি নোটিশ", count: (d.governmentNotices || []).length, icon: "🏛️" },
    { label: "শিক্ষা বোর্ড", count: (d.boards || []).length, icon: "🏫" },
    { label: "ব্রেকিং নিউজ", count: (d.breakingNews || []).length, icon: "🔴" },
    { label: "পাবলিক বিশ্ববিদ্যালয়", count: (d.publicUniversities || []).length, icon: "🏛️" },
    { label: "বেসরকারি বিশ্ববিদ্যালয়", count: (d.privateUniversities || []).length, icon: "🏫" },
    { label: "ক্যাটাগরি নেভ", count: (d.categoryNav || []).length, icon: "🟢" },
    { label: "দ্রুত লিঙ্ক", count: (d.quickLinks || []).length, icon: "⚡" },
    { label: "গুরুত্বপূর্ণ লিঙ্ক", count: (d.importantLinks || []).length, icon: "🔗" },
    { label: "ইমেজ", count: (d.images || []).length, icon: "🖼️" }
  ];
  const html = cards.map(c => `
    <div class="dash-card">
      <div class="dash-card-icon">${c.icon}</div>
      <div class="dash-card-info">
        <div class="dash-card-count">${c.count}</div>
        <div class="dash-card-label">${c.label}</div>
      </div>
    </div>`).join("");
  const container = document.getElementById("dashboard-cards");
  if (container) container.innerHTML = html;
  const updated = document.getElementById("last-updated");
  if (updated) updated.textContent = d.lastUpdated || "অজানা";
}

// ─── BREAKING NEWS ────────────────────────────────────────────────────────
function renderBreaking() {
  const list = appData.breakingNews || [];
  const tbody = document.getElementById("breaking-list");
  if (!tbody) return;
  tbody.innerHTML = list.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(item)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="editBreaking(${i})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteBreaking(${i})">🗑️</button>
        ${i > 0 ? `<button class="btn btn-sm btn-secondary" onclick="moveBreaking(${i},-1)">▲</button>` : ""}
        ${i < list.length - 1 ? `<button class="btn btn-sm btn-secondary" onclick="moveBreaking(${i},1)">▼</button>` : ""}
      </td>
    </tr>`).join("");
}

function addBreaking() {
  const inp = document.getElementById("new-breaking-text");
  if (!inp) return;
  const text = inp.value.trim();
  if (!text) { showToast("টেক্সট লিখুন", "error"); return; }
  appData.breakingNews = appData.breakingNews || [];
  appData.breakingNews.push(text);
  saveData(appData);
  updateDraftBadge();
  inp.value = "";
  renderBreaking();
  showToast("✅ ব্রেকিং নিউজ যোগ করা হয়েছে");
}

function editBreaking(i) {
  const list = appData.breakingNews || [];
  openBreakingEditModal(i, list[i]);
}

function openBreakingEditModal(idx, currentText) {
  const modal = document.getElementById("breaking-edit-modal");
  if (!modal) return;
  const inp = document.getElementById("breaking-edit-text");
  if (inp) inp.value = currentText || "";
  modal.dataset.editIdx = idx;
  modal.style.display = "flex";
  if (inp) inp.focus();
}

function saveBreakingEdit() {
  const modal = document.getElementById("breaking-edit-modal");
  if (!modal) return;
  const idx = parseInt(modal.dataset.editIdx);
  const text = document.getElementById("breaking-edit-text").value.trim();
  if (!text) { showToast("টেক্সট লিখুন", "error"); return; }
  (appData.breakingNews || [])[idx] = text;
  saveData(appData);
  updateDraftBadge();
  closeModal("breaking-edit-modal");
  renderBreaking();
  showToast("✅ আপডেট হয়েছে");
}

function deleteBreaking(i) {
  confirmDelete(() => {
    appData.breakingNews.splice(i, 1);
    saveData(appData);
    updateDraftBadge();
    renderBreaking();
    showToast("✅ মুছে ফেলা হয়েছে");
  });
}

function moveBreaking(i, dir) {
  const list = appData.breakingNews;
  const j = i + dir;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  saveData(appData);
  updateDraftBadge();
  renderBreaking();
}

// ─── LATEST NEWS ─────────────────────────────────────────────────────────
let newsSearchTerm = "";

function renderNews() {
  const list = (appData.latestNews || []).filter(n =>
    !newsSearchTerm ||
    (n.title && n.title.toLowerCase().includes(newsSearchTerm)) ||
    (n.category && n.category.toLowerCase().includes(newsSearchTerm))
  );
  const tbody = document.getElementById("news-tbody");
  if (!tbody) return;
  tbody.innerHTML = list.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(item.title)}</td>
      <td>${esc(item.category)}</td>
      <td>${esc(item.source)}</td>
      <td>${esc(item.date)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="openNewsModal(${item.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNews(${item.id})">🗑️</button>
      </td>
    </tr>`).join("");
}

function openNewsModal(id) {
  const modal = document.getElementById("news-modal");
  if (!modal) return;
  const form = document.getElementById("news-form");
  if (id === null) {
    form.reset();
    form.dataset.editId = "";
    document.getElementById("news-modal-title").textContent = "নতুন খবর যোগ করুন";
    document.getElementById("news-save-btn").textContent = "সেভ করুন";
    clearNewsImage();
    const fetchUrlEl = document.getElementById("n-fetch-url");
    if (fetchUrlEl) fetchUrlEl.value = "";
  } else {
    const item = (appData.latestNews || []).find(n => n.id === id);
    if (!item) return;
    form.dataset.editId = id;
    document.getElementById("news-modal-title").textContent = "খবর সম্পাদনা";
    document.getElementById("news-save-btn").textContent = "আপডেট করুন";
    document.getElementById("n-title").value = item.title || "";
    document.getElementById("n-category").value = item.category || "";
    document.getElementById("n-summary").value = item.summary || "";
    document.getElementById("n-source").value = item.source || "";
    document.getElementById("n-date").value = item.date || "";
    document.getElementById("n-link").value = item.link || "";
    document.getElementById("n-image").value = item.image || "";
    document.getElementById("n-year").value = item.year || "";
    // Update image preview if image exists
    updateNewsImagePreview(item.image || "");
  }
  modal.style.display = "flex";
}

function saveNewsForm() {
  const form = document.getElementById("news-form");
  const editId = form.dataset.editId;
  const title = document.getElementById("n-title").value.trim();
  if (!title) { showToast("শিরোনাম আবশ্যক", "error"); return; }
  const obj = {
    title,
    category: document.getElementById("n-category").value.trim(),
    summary: document.getElementById("n-summary").value.trim(),
    source: document.getElementById("n-source").value.trim(),
    date: document.getElementById("n-date").value.trim(),
    link: document.getElementById("n-link").value.trim(),
    image: document.getElementById("n-image").value.trim(),
    year: document.getElementById("n-year").value.trim(),
    views: 0
  };
  appData.latestNews = appData.latestNews || [];
  if (editId !== "") {
    const idx = appData.latestNews.findIndex(n => n.id === parseInt(editId));
    if (idx >= 0) {
      obj.id = parseInt(editId);
      obj.views = appData.latestNews[idx].views || 0;
      appData.latestNews[idx] = obj;
      showToast("✅ সফলভাবে আপডেট করা হয়েছে");
    }
  } else {
    obj.id = getNextId(appData.latestNews);
    appData.latestNews.unshift(obj);
    showToast("✅ সফলভাবে যোগ করা হয়েছে");
  }
  saveData(appData);
  updateDraftBadge();
  closeModal("news-modal");
  renderNews();
}

function deleteNews(id) {
  confirmDelete(() => {
    appData.latestNews = (appData.latestNews || []).filter(n => n.id !== id);
    saveData(appData);
    updateDraftBadge();
    renderNews();
    showToast("✅ মুছে ফেলা হয়েছে");
  });
}

// ─── ADMISSIONS ──────────────────────────────────────────────────────────
let admissionSearchTerm = "";

function renderAdmissions() {
  const list = (appData.admissions || []).filter(a =>
    !admissionSearchTerm ||
    (a.university && a.university.toLowerCase().includes(admissionSearchTerm)) ||
    (a.title && a.title.toLowerCase().includes(admissionSearchTerm))
  );
  const tbody = document.getElementById("admissions-tbody");
  if (!tbody) return;
  tbody.innerHTML = list.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(item.university)}</td>
      <td>${esc(item.title)}</td>
      <td>${esc(item.deadlineDisplay || item.deadline)}</td>
      <td><span class="badge ${item.status === 'active' ? 'badge-success' : 'badge-secondary'}">${esc(item.status)}</span></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="openAdmissionModal(${item.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteAdmission(${item.id})">🗑️</button>
      </td>
    </tr>`).join("");
}

function openAdmissionModal(id) {
  const modal = document.getElementById("admission-modal");
  if (!modal) return;
  const form = document.getElementById("admission-form");
  if (id === null) {
    form.reset();
    form.dataset.editId = "";
    document.getElementById("adm-modal-title").textContent = "নতুন ভর্তি তথ্য যোগ করুন";
    document.getElementById("adm-save-btn").textContent = "সেভ করুন";
  } else {
    const item = (appData.admissions || []).find(a => a.id === id);
    if (!item) return;
    form.dataset.editId = id;
    document.getElementById("adm-modal-title").textContent = "ভর্তি তথ্য সম্পাদনা";
    document.getElementById("adm-save-btn").textContent = "আপডেট করুন";
    document.getElementById("adm-university").value = item.university || "";
    document.getElementById("adm-type").value = item.type || "";
    document.getElementById("adm-title").value = item.title || "";
    document.getElementById("adm-deadline").value = item.deadline || "";
    document.getElementById("adm-deadlineDisplay").value = item.deadlineDisplay || "";
    document.getElementById("adm-link").value = item.link || "";
    document.getElementById("adm-status").value = item.status || "";
    document.getElementById("adm-seats").value = item.seats || "";
    document.getElementById("adm-fee").value = item.fee || "";
    document.getElementById("adm-description").value = item.description || "";
    document.getElementById("adm-year").value = item.year || "";
  }
  modal.style.display = "flex";
}

function saveAdmissionForm() {
  const form = document.getElementById("admission-form");
  const editId = form.dataset.editId;
  const university = document.getElementById("adm-university").value.trim();
  if (!university) { showToast("বিশ্ববিদ্যালয়ের নাম আবশ্যক", "error"); return; }
  const obj = {
    university,
    type: document.getElementById("adm-type").value.trim(),
    title: document.getElementById("adm-title").value.trim(),
    deadline: document.getElementById("adm-deadline").value.trim(),
    deadlineDisplay: document.getElementById("adm-deadlineDisplay").value.trim(),
    link: document.getElementById("adm-link").value.trim(),
    status: document.getElementById("adm-status").value.trim(),
    seats: document.getElementById("adm-seats").value.trim(),
    fee: document.getElementById("adm-fee").value.trim(),
    description: document.getElementById("adm-description").value.trim(),
    year: document.getElementById("adm-year").value.trim()
  };
  appData.admissions = appData.admissions || [];
  if (editId !== "") {
    const idx = appData.admissions.findIndex(a => a.id === parseInt(editId));
    if (idx >= 0) {
      obj.id = parseInt(editId);
      appData.admissions[idx] = obj;
      showToast("✅ সফলভাবে আপডেট করা হয়েছে");
    }
  } else {
    obj.id = getNextId(appData.admissions);
    appData.admissions.unshift(obj);
    showToast("✅ সফলভাবে যোগ করা হয়েছে");
  }
  saveData(appData);
  updateDraftBadge();
  closeModal("admission-modal");
  renderAdmissions();
}

function deleteAdmission(id) {
  confirmDelete(() => {
    appData.admissions = (appData.admissions || []).filter(a => a.id !== id);
    saveData(appData);
    updateDraftBadge();
    renderAdmissions();
    showToast("✅ মুছে ফেলা হয়েছে");
  });
}

// ─── SCHOLARSHIPS ─────────────────────────────────────────────────────────
let scholarSearchTerm = "";
let scholarBenefits = [];
let scholarRequirements = [];

function renderScholarships() {
  const list = (appData.scholarships || []).filter(s =>
    !scholarSearchTerm ||
    (s.name && s.name.toLowerCase().includes(scholarSearchTerm)) ||
    (s.country && s.country.toLowerCase().includes(scholarSearchTerm))
  );
  const tbody = document.getElementById("scholarship-tbody");
  if (!tbody) return;
  tbody.innerHTML = list.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(item.flag || "")} ${esc(item.name)}</td>
      <td>${esc(item.country)}</td>
      <td>${esc(item.level)}</td>
      <td>${esc(item.deadlineDisplay || item.deadline)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="openScholarModal(${item.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteScholar(${item.id})">🗑️</button>
      </td>
    </tr>`).join("");
}

function openScholarModal(id) {
  const modal = document.getElementById("scholar-modal");
  if (!modal) return;
  const form = document.getElementById("scholar-form");
  if (id === null) {
    form.reset();
    form.dataset.editId = "";
    scholarBenefits = [];
    scholarRequirements = [];
    document.getElementById("scholar-modal-title").textContent = "নতুন বৃত্তি যোগ করুন";
    document.getElementById("scholar-save-btn").textContent = "সেভ করুন";
  } else {
    const item = (appData.scholarships || []).find(s => s.id === id);
    if (!item) return;
    form.dataset.editId = id;
    scholarBenefits = [...(item.benefits || [])];
    scholarRequirements = [...(item.requirements || [])];
    document.getElementById("scholar-modal-title").textContent = "বৃত্তি সম্পাদনা";
    document.getElementById("scholar-save-btn").textContent = "আপডেট করুন";
    document.getElementById("sch-name").value = item.name || "";
    document.getElementById("sch-country").value = item.country || "";
    document.getElementById("sch-flag").value = item.flag || "";
    document.getElementById("sch-type").value = item.type || "";
    document.getElementById("sch-level").value = item.level || "";
    document.getElementById("sch-amount").value = item.amount || "";
    document.getElementById("sch-deadline").value = item.deadline || "";
    document.getElementById("sch-deadlineDisplay").value = item.deadlineDisplay || "";
    document.getElementById("sch-eligibility").value = item.eligibility || "";
    document.getElementById("sch-link").value = item.link || "";
    document.getElementById("sch-description").value = item.description || "";
    document.getElementById("sch-year").value = item.year || "";
  }
  renderBenefitsList();
  renderRequirementsList();
  modal.style.display = "flex";
}

function renderBenefitsList() {
  const ul = document.getElementById("benefits-list");
  if (!ul) return;
  ul.innerHTML = scholarBenefits.map((b, i) =>
    `<li>${esc(b)} <button type="button" class="btn btn-sm btn-danger" onclick="removeBenefit(${i})">✕</button></li>`
  ).join("");
}

function addBenefit() {
  const inp = document.getElementById("new-benefit");
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) return;
  scholarBenefits.push(val);
  inp.value = "";
  renderBenefitsList();
}

function removeBenefit(i) {
  scholarBenefits.splice(i, 1);
  renderBenefitsList();
}

function renderRequirementsList() {
  const ul = document.getElementById("requirements-list");
  if (!ul) return;
  ul.innerHTML = scholarRequirements.map((r, i) =>
    `<li>${esc(r)} <button type="button" class="btn btn-sm btn-danger" onclick="removeRequirement(${i})">✕</button></li>`
  ).join("");
}

function addRequirement() {
  const inp = document.getElementById("new-requirement");
  if (!inp) return;
  const val = inp.value.trim();
  if (!val) return;
  scholarRequirements.push(val);
  inp.value = "";
  renderRequirementsList();
}

function removeRequirement(i) {
  scholarRequirements.splice(i, 1);
  renderRequirementsList();
}

function saveScholarForm() {
  const form = document.getElementById("scholar-form");
  const editId = form.dataset.editId;
  const name = document.getElementById("sch-name").value.trim();
  if (!name) { showToast("বৃত্তির নাম আবশ্যক", "error"); return; }
  const obj = {
    name,
    country: document.getElementById("sch-country").value.trim(),
    flag: document.getElementById("sch-flag").value.trim(),
    type: document.getElementById("sch-type").value.trim(),
    level: document.getElementById("sch-level").value.trim(),
    amount: document.getElementById("sch-amount").value.trim(),
    deadline: document.getElementById("sch-deadline").value.trim(),
    deadlineDisplay: document.getElementById("sch-deadlineDisplay").value.trim(),
    eligibility: document.getElementById("sch-eligibility").value.trim(),
    link: document.getElementById("sch-link").value.trim(),
    description: document.getElementById("sch-description").value.trim(),
    year: document.getElementById("sch-year").value.trim(),
    benefits: [...scholarBenefits],
    requirements: [...scholarRequirements]
  };
  appData.scholarships = appData.scholarships || [];
  if (editId !== "") {
    const idx = appData.scholarships.findIndex(s => s.id === parseInt(editId));
    if (idx >= 0) {
      obj.id = parseInt(editId);
      appData.scholarships[idx] = obj;
      showToast("✅ সফলভাবে আপডেট করা হয়েছে");
    }
  } else {
    obj.id = getNextId(appData.scholarships);
    appData.scholarships.unshift(obj);
    showToast("✅ সফলভাবে যোগ করা হয়েছে");
  }
  saveData(appData);
  updateDraftBadge();
  closeModal("scholar-modal");
  renderScholarships();
}

function deleteScholar(id) {
  confirmDelete(() => {
    appData.scholarships = (appData.scholarships || []).filter(s => s.id !== id);
    saveData(appData);
    updateDraftBadge();
    renderScholarships();
    showToast("✅ মুছে ফেলা হয়েছে");
  });
}

// ─── DEADLINES ────────────────────────────────────────────────────────────
function renderDeadlines() {
  const list = appData.deadlines || [];
  const tbody = document.getElementById("deadlines-tbody");
  if (!tbody) return;
  tbody.innerHTML = list.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(item.title)}</td>
      <td>${esc(item.date)}</td>
      <td><a href="${esc(item.link)}" target="_blank">${esc(item.link)}</a></td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="openDeadlineModal(${item.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteDeadline(${item.id})">🗑️</button>
      </td>
    </tr>`).join("");
}

function openDeadlineModal(id) {
  const modal = document.getElementById("deadline-modal");
  if (!modal) return;
  const form = document.getElementById("deadline-form");
  if (id === null) {
    form.reset();
    form.dataset.editId = "";
    document.getElementById("dl-modal-title").textContent = "নতুন ডেডলাইন যোগ করুন";
    document.getElementById("dl-save-btn").textContent = "সেভ করুন";
  } else {
    const item = (appData.deadlines || []).find(d => d.id === id);
    if (!item) return;
    form.dataset.editId = id;
    document.getElementById("dl-modal-title").textContent = "ডেডলাইন সম্পাদনা";
    document.getElementById("dl-save-btn").textContent = "আপডেট করুন";
    document.getElementById("dl-title").value = item.title || "";
    document.getElementById("dl-date").value = item.date || "";
    document.getElementById("dl-link").value = item.link || "";
    document.getElementById("dl-year").value = item.year || "";
  }
  modal.style.display = "flex";
}

function saveDeadlineForm() {
  const form = document.getElementById("deadline-form");
  const editId = form.dataset.editId;
  const title = document.getElementById("dl-title").value.trim();
  if (!title) { showToast("শিরোনাম আবশ্যক", "error"); return; }
  const obj = {
    title,
    date: document.getElementById("dl-date").value.trim(),
    link: document.getElementById("dl-link").value.trim(),
    year: document.getElementById("dl-year").value.trim()
  };
  appData.deadlines = appData.deadlines || [];
  if (editId !== "") {
    const idx = appData.deadlines.findIndex(d => d.id === parseInt(editId));
    if (idx >= 0) {
      obj.id = parseInt(editId);
      appData.deadlines[idx] = obj;
      showToast("✅ সফলভাবে আপডেট করা হয়েছে");
    }
  } else {
    obj.id = getNextId(appData.deadlines);
    appData.deadlines.push(obj);
    showToast("✅ সফলভাবে যোগ করা হয়েছে");
  }
  saveData(appData);
  updateDraftBadge();
  closeModal("deadline-modal");
  renderDeadlines();
}

function deleteDeadline(id) {
  confirmDelete(() => {
    appData.deadlines = (appData.deadlines || []).filter(d => d.id !== id);
    saveData(appData);
    updateDraftBadge();
    renderDeadlines();
    showToast("✅ মুছে ফেলা হয়েছে");
  });
}

// ─── GOVERNMENT NOTICES ──────────────────────────────────────────────────
function renderGovtNotices() {
  const list = appData.governmentNotices || [];
  const tbody = document.getElementById("govtnotices-tbody");
  if (!tbody) return;
  tbody.innerHTML = list.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(item.title)}</td>
      <td>${esc(item.source)}</td>
      <td>${esc(item.date)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="openGovtNoticeModal(${item.id})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteGovtNotice(${item.id})">🗑️</button>
      </td>
    </tr>`).join("");
}

function openGovtNoticeModal(id) {
  const modal = document.getElementById("govtnotice-modal");
  if (!modal) return;
  const form = document.getElementById("govtnotice-form");
  if (id === null) {
    form.reset();
    form.dataset.editId = "";
    document.getElementById("gn-modal-title").textContent = "নতুন নোটিশ যোগ করুন";
    document.getElementById("gn-save-btn").textContent = "সেভ করুন";
  } else {
    const item = (appData.governmentNotices || []).find(n => n.id === id);
    if (!item) return;
    form.dataset.editId = id;
    document.getElementById("gn-modal-title").textContent = "নোটিশ সম্পাদনা";
    document.getElementById("gn-save-btn").textContent = "আপডেট করুন";
    document.getElementById("gn-title").value = item.title || "";
    document.getElementById("gn-sourceUrl").value = item.sourceUrl || "";
    document.getElementById("gn-date").value = item.date || "";
    document.getElementById("gn-description").value = item.description || "";
    document.getElementById("gn-source").value = item.source || "";
    document.getElementById("gn-year").value = item.year || "";
  }
  modal.style.display = "flex";
}

function saveGovtNoticeForm() {
  const form = document.getElementById("govtnotice-form");
  const editId = form.dataset.editId;
  const title = document.getElementById("gn-title").value.trim();
  if (!title) { showToast("শিরোনাম আবশ্যক", "error"); return; }
  const obj = {
    title,
    sourceUrl: document.getElementById("gn-sourceUrl").value.trim(),
    date: document.getElementById("gn-date").value.trim(),
    description: document.getElementById("gn-description").value.trim(),
    source: document.getElementById("gn-source").value.trim(),
    year: document.getElementById("gn-year").value.trim()
  };
  appData.governmentNotices = appData.governmentNotices || [];
  if (editId !== "") {
    const idx = appData.governmentNotices.findIndex(n => n.id === parseInt(editId));
    if (idx >= 0) {
      obj.id = parseInt(editId);
      appData.governmentNotices[idx] = obj;
      showToast("✅ সফলভাবে আপডেট করা হয়েছে");
    }
  } else {
    obj.id = getNextId(appData.governmentNotices);
    appData.governmentNotices.unshift(obj);
    showToast("✅ সফলভাবে যোগ করা হয়েছে");
  }
  saveData(appData);
  updateDraftBadge();
  closeModal("govtnotice-modal");
  renderGovtNotices();
}

function deleteGovtNotice(id) {
  confirmDelete(() => {
    appData.governmentNotices = (appData.governmentNotices || []).filter(n => n.id !== id);
    saveData(appData);
    updateDraftBadge();
    renderGovtNotices();
    showToast("✅ মুছে ফেলা হয়েছে");
  });
}

// ─── EDUCATION BOARDS ────────────────────────────────────────────────────
let boardPdfLinks = [];

function renderBoards() {
  const list = appData.boards || [];
  const container = document.getElementById("boards-grid");
  if (!container) return;
  container.innerHTML = list.map(board => `
    <div class="board-card">
      <div class="board-card-header">
        <h3>${esc(board.name)}</h3>
        <button class="btn btn-sm btn-primary board-edit-btn" data-boardid="${esc(board.id)}">✏️ সম্পাদনা</button>
      </div>
      <div class="board-card-body">
        <p><strong>ওয়েবসাইট:</strong> <a href="${esc(board.website)}" target="_blank">${esc(board.website)}</a></p>
        <p><strong>ফোন:</strong> ${esc(board.phone)}</p>
        <p><strong>ইমেইল:</strong> ${esc(board.email)}</p>
        <p><strong>PDF লিংক:</strong> ${(board.pdfLinks || []).length} টি</p>
      </div>
    </div>`).join("");
  container.querySelectorAll(".board-edit-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      openBoardModal(this.dataset.boardid);
    });
  });
}

function openBoardModal(boardId) {
  const modal = document.getElementById("board-modal");
  if (!modal) return;
  const board = (appData.boards || []).find(b => b.id === boardId);
  if (!board) return;
  const form = document.getElementById("board-form");
  form.dataset.editId = boardId;
  boardPdfLinks = [...(board.pdfLinks || [])];
  document.getElementById("board-modal-title").textContent = board.name + " — সম্পাদনা";
  document.getElementById("b-name").value = board.name || "";
  document.getElementById("b-website").value = board.website || "";
  document.getElementById("b-phone").value = board.phone || "";
  document.getElementById("b-email").value = board.email || "";
  document.getElementById("b-address").value = board.address || "";
  renderBoardPdfList();
  modal.style.display = "flex";
}

function renderBoardPdfList() {
  const ul = document.getElementById("board-pdf-list");
  if (!ul) return;
  ul.innerHTML = boardPdfLinks.map((p, i) =>
    `<li><strong>${esc(p.title)}</strong> — <a href="${esc(p.url)}" target="_blank">${esc(p.url)}</a>
     <button type="button" class="btn btn-sm btn-danger" onclick="removeBoardPdf(${i})">✕</button></li>`
  ).join("");
}

function addBoardPdf() {
  const title = document.getElementById("new-pdf-title").value.trim();
  const url = document.getElementById("new-pdf-url").value.trim();
  if (!title || !url) { showToast("শিরোনাম ও URL আবশ্যক", "error"); return; }
  boardPdfLinks.push({ title, url });
  document.getElementById("new-pdf-title").value = "";
  document.getElementById("new-pdf-url").value = "";
  renderBoardPdfList();
}

function removeBoardPdf(i) {
  boardPdfLinks.splice(i, 1);
  renderBoardPdfList();
}

function saveBoardForm() {
  const form = document.getElementById("board-form");
  const boardId = form.dataset.editId;
  const idx = (appData.boards || []).findIndex(b => b.id === boardId);
  if (idx < 0) return;
  appData.boards[idx].name = document.getElementById("b-name").value.trim();
  appData.boards[idx].website = document.getElementById("b-website").value.trim();
  appData.boards[idx].phone = document.getElementById("b-phone").value.trim();
  appData.boards[idx].email = document.getElementById("b-email").value.trim();
  appData.boards[idx].address = document.getElementById("b-address").value.trim();
  appData.boards[idx].pdfLinks = [...boardPdfLinks];
  saveData(appData);
  updateDraftBadge();
  closeModal("board-modal");
  renderBoards();
  showToast("✅ সফলভাবে আপডেট করা হয়েছে");
}

// ─── UNIVERSITIES ────────────────────────────────────────────────────────
let activeUniTab = "public";

function renderUniversities() {
  renderUniTab(activeUniTab);
}

function switchUniTab(tab) {
  activeUniTab = tab;
  document.querySelectorAll(".uni-tab-btn").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById("uni-tab-" + tab);
  if (btn) btn.classList.add("active");
  renderUniTab(tab);
}

function renderUniTab(tab) {
  const key = tab === "public" ? "publicUniversities" : "privateUniversities";
  const list = appData[key] || [];
  const tbody = document.getElementById("uni-tbody-" + tab);
  if (!tbody) return;
  tbody.innerHTML = list.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(item.name)}</td>
      <td>${esc(item.location)}</td>
      <td><a href="${esc(item.website)}" target="_blank">${esc(item.website)}</a></td>
      <td>
        <button class="btn btn-sm btn-primary uni-edit-btn" data-tab="${esc(tab)}" data-idx="${i}">✏️</button>
        <button class="btn btn-sm btn-danger uni-del-btn" data-tab="${esc(tab)}" data-idx="${i}">🗑️</button>
      </td>
    </tr>`).join("");
  tbody.querySelectorAll(".uni-edit-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      openUniModal(this.dataset.tab, parseInt(this.dataset.idx));
    });
  });
  tbody.querySelectorAll(".uni-del-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      deleteUni(this.dataset.tab, parseInt(this.dataset.idx));
    });
  });
  const pub = document.getElementById("uni-section-public");
  const priv = document.getElementById("uni-section-private");
  if (pub) pub.style.display = tab === "public" ? "block" : "none";
  if (priv) priv.style.display = tab === "private" ? "block" : "none";
}

function openUniModal(tab, idx) {
  const modal = document.getElementById("uni-modal");
  if (!modal) return;
  const form = document.getElementById("uni-form");
  const key = tab === "public" ? "publicUniversities" : "privateUniversities";
  if (idx === null) {
    form.reset();
    form.dataset.editTab = tab;
    form.dataset.editIdx = "";
    document.getElementById("uni-modal-title").textContent = "নতুন বিশ্ববিদ্যালয় যোগ করুন";
    document.getElementById("uni-save-btn").textContent = "সেভ করুন";
  } else {
    const item = (appData[key] || [])[idx];
    if (!item) return;
    form.dataset.editTab = tab;
    form.dataset.editIdx = idx;
    document.getElementById("uni-modal-title").textContent = "বিশ্ববিদ্যালয় সম্পাদনা";
    document.getElementById("uni-save-btn").textContent = "আপডেট করুন";
    document.getElementById("uni-name").value = item.name || "";
    document.getElementById("uni-location").value = item.location || "";
    document.getElementById("uni-website").value = item.website || "";
    document.getElementById("uni-brief").value = item.brief || "";
  }
  modal.style.display = "flex";
}

function saveUniForm() {
  const form = document.getElementById("uni-form");
  const tab = form.dataset.editTab;
  const editIdx = form.dataset.editIdx;
  const key = tab === "public" ? "publicUniversities" : "privateUniversities";
  const name = document.getElementById("uni-name").value.trim();
  if (!name) { showToast("নাম আবশ্যক", "error"); return; }
  const obj = {
    name,
    location: document.getElementById("uni-location").value.trim(),
    website: document.getElementById("uni-website").value.trim(),
    brief: document.getElementById("uni-brief").value.trim()
  };
  appData[key] = appData[key] || [];
  if (editIdx !== "") {
    appData[key][parseInt(editIdx)] = obj;
    showToast("✅ সফলভাবে আপডেট করা হয়েছে");
  } else {
    appData[key].unshift(obj);
    showToast("✅ সফলভাবে যোগ করা হয়েছে");
  }
  saveData(appData);
  updateDraftBadge();
  closeModal("uni-modal");
  renderUniTab(tab);
}

function deleteUni(tab, idx) {
  confirmDelete(() => {
    const key = tab === "public" ? "publicUniversities" : "privateUniversities";
    (appData[key] || []).splice(idx, 1);
    saveData(appData);
    updateDraftBadge();
    renderUniTab(tab);
    showToast("✅ মুছে ফেলা হয়েছে");
  });
}

// ─── NEW FULL-PORTAL MANAGERS ────────────────────────────────────────────
function ensureNewDataDefaults() {
  if (!appData.siteSettings) {
    appData.siteSettings = {
      siteName: "EduBD",
      tagline: "বাংলাদেশ শিক্ষা তথ্য পোর্টাল",
      metaDescription: "EduBD - বাংলাদেশ শিক্ষা তথ্য পোর্টাল। SSC, HSC, ভর্তি তথ্য, বৃত্তি, ফলাফল ও রুটিন।",
      logoIcon: "📚",
      logoText: "EduBD",
      footerText: "EduBD বাংলাদেশের সকল শিক্ষার্থী ও অভিভাবকদের জন্য একটি বিশ্বস্ত শিক্ষামূলক তথ্য পোর্টাল।",
      copyrightText: "© ২০২৫-২৬ EduBD — বাংলাদেশ শিক্ষা তথ্য পোর্টাল। সর্বস্বত্ব সংরক্ষিত।",
      contactInfo: "📧 info@edubd.com.bd | 💬 +8801700000000",
      social: { facebook: "https://facebook.com", youtube: "https://youtube.com", telegram: "https://t.me/edubd_portal", whatsapp: "https://wa.me/8801700000000" }
    };
  }
  if (!appData.categoryNav) appData.categoryNav = [];
  if (!appData.quickLinks) appData.quickLinks = [];
  if (!appData.featuredSettings) appData.featuredSettings = { enabled: true, featuredNewsId: null, headlineCount: 5 };
  if (!appData.navigation) appData.navigation = { main: [], mobile: [] };
  if (!appData.footerLinks) appData.footerLinks = { description: appData.siteSettings.footerText, columns: { quick: [], boards: [], important: [] } };
  if (!appData.sidebarWidgets) appData.sidebarWidgets = [];
  if (!appData.importantLinks) appData.importantLinks = [];
  if (!appData.pageContent) appData.pageContent = [];
  if (!appData.themeSettings) appData.themeSettings = { primaryColor: "#1e88e5", accentColor: "#2ecc71", darkColor: "#1a237e", fontFamily: "'Noto Sans Bengali', sans-serif" };
  if (!appData.images) appData.images = [];
}

function saveAndNotify(msg) {
  saveData(appData);
  updateDraftBadge();
  showToast(msg || "✅ সেভ হয়েছে");
}

function renderSettings() {
  const c = document.getElementById("site-settings-form");
  if (!c) return;
  ensureNewDataDefaults();
  const s = appData.siteSettings;
  c.innerHTML = `
    <div class="form-field"><label>সাইট নাম</label><input id="st-siteName" value="${esc(s.siteName)}"></div>
    <div class="form-field"><label>ট্যাগলাইন</label><input id="st-tagline" value="${esc(s.tagline)}"></div>
    <div class="form-field"><label>Meta Description</label><textarea id="st-metaDescription">${esc(s.metaDescription)}</textarea></div>
    <div class="form-field"><label>লোগো আইকন</label><input id="st-logoIcon" value="${esc(s.logoIcon)}"></div>
    <div class="form-field"><label>লোগো টেক্সট</label><input id="st-logoText" value="${esc(s.logoText)}"></div>
    <div class="form-field"><label>Footer Text</label><textarea id="st-footerText">${esc(s.footerText)}</textarea></div>
    <div class="form-field"><label>Copyright Text</label><input id="st-copyrightText" value="${esc(s.copyrightText)}"></div>
    <div class="form-field"><label>Contact Info</label><textarea id="st-contactInfo">${esc(s.contactInfo || "")}</textarea></div>
    <div class="form-field"><label>Facebook URL</label><input id="st-facebook" value="${esc(s.social.facebook || "")}"></div>
    <div class="form-field"><label>YouTube URL</label><input id="st-youtube" value="${esc(s.social.youtube || "")}"></div>
    <div class="form-field"><label>Telegram URL</label><input id="st-telegram" value="${esc(s.social.telegram || "")}"></div>
    <div class="form-field"><label>WhatsApp URL</label><input id="st-whatsapp" value="${esc(s.social.whatsapp || "")}"></div>
  `;
}

function saveSiteSettings() {
  ensureNewDataDefaults();
  appData.siteSettings = {
    ...appData.siteSettings,
    siteName: document.getElementById("st-siteName").value.trim(),
    tagline: document.getElementById("st-tagline").value.trim(),
    metaDescription: document.getElementById("st-metaDescription").value.trim(),
    logoIcon: document.getElementById("st-logoIcon").value.trim(),
    logoText: document.getElementById("st-logoText").value.trim(),
    footerText: document.getElementById("st-footerText").value.trim(),
    copyrightText: document.getElementById("st-copyrightText").value.trim(),
    contactInfo: document.getElementById("st-contactInfo").value.trim(),
    social: {
      facebook: document.getElementById("st-facebook").value.trim(),
      youtube: document.getElementById("st-youtube").value.trim(),
      telegram: document.getElementById("st-telegram").value.trim(),
      whatsapp: document.getElementById("st-whatsapp").value.trim()
    }
  };
  saveAndNotify("✅ সাইট সেটিংস সেভ হয়েছে");
}

function renderFeaturedSettings() {
  const c = document.getElementById("featured-settings-form");
  if (!c) return;
  ensureNewDataDefaults();
  const f = appData.featuredSettings;
  const options = (appData.latestNews || []).map(n => `<option value="${n.id}" ${String(f.featuredNewsId) === String(n.id) ? "selected" : ""}>${esc(n.title)}</option>`).join("");
  c.innerHTML = `
    <div class="form-field"><label>ফিচার্ড সেকশন চালু?</label><select id="fs-enabled"><option value="true" ${f.enabled ? "selected" : ""}>চালু</option><option value="false" ${!f.enabled ? "selected" : ""}>বন্ধ</option></select></div>
    <div class="form-field"><label>ফিচার্ড নিউজ নির্বাচন</label><select id="fs-featuredNewsId"><option value="">-- স্বয়ংক্রিয় --</option>${options}</select></div>
    <div class="form-field"><label>Headline সংখ্যা</label><input id="fs-headlineCount" type="number" min="1" max="12" value="${esc(f.headlineCount)}"></div>
  `;
}

function saveFeaturedSettings() {
  ensureNewDataDefaults();
  const rawId = document.getElementById("fs-featuredNewsId").value;
  appData.featuredSettings = {
    enabled: document.getElementById("fs-enabled").value === "true",
    featuredNewsId: rawId === "" ? null : parseInt(rawId, 10),
    headlineCount: parseInt(document.getElementById("fs-headlineCount").value, 10) || 5
  };
  saveAndNotify("✅ ফিচার্ড সেটিংস সেভ হয়েছে");
}

const STRUCTURED_CONFIG = {
  categorynav: {
    key: "categoryNav",
    tbodyId: "categorynav-tbody",
    fields: [{ k: "icon", l: "আইকন/ইমোজি" }, { k: "label", l: "লেবেল" }, { k: "href", l: "লিংক URL" }, { k: "order", l: "Sort Order", t: "number" }]
  },
  quicklinks: {
    key: "quickLinks",
    tbodyId: "quicklinks-tbody",
    fields: [{ k: "icon", l: "আইকন" }, { k: "text", l: "টেক্সট" }, { k: "href", l: "লিংক URL" }]
  },
  sidebar: {
    key: "sidebarWidgets",
    tbodyId: "sidebarwidgets-tbody",
    fields: [{ k: "key", l: "Widget Key" }, { k: "label", l: "লেবেল" }, { k: "visible", l: "Visible", t: "select", o: ["true", "false"] }, { k: "order", l: "Order", t: "number" }]
  },
  importantlinks: {
    key: "importantLinks",
    tbodyId: "importantlinks-tbody",
    fields: [{ k: "icon", l: "আইকন" }, { k: "label", l: "লেবেল" }, { k: "url", l: "URL" }, { k: "target", l: "Target", t: "select", o: ["_self", "_blank"] }]
  },
  pages: {
    key: "pageContent",
    tbodyId: "pages-tbody",
    fields: [{ k: "key", l: "Page Key" }, { k: "heroTitle", l: "Hero Title" }, { k: "heroDescription", l: "Hero Description" }, { k: "staticText", l: "Static Text", ta: true }]
  },
  footerlinks: {
    key: "footerLinks",
    tbodyId: "footerlinks-tbody",
    fields: [{ k: "column", l: "কলাম", t: "select", o: ["quick", "boards", "important"] }, { k: "label", l: "লেবেল" }, { k: "href", l: "লিংক URL" }, { k: "target", l: "Target", t: "select", o: ["_self", "_blank"] }]
  }
};

function getStructuredList(type) {
  ensureNewDataDefaults();
  const cfg = STRUCTURED_CONFIG[type];
  if (!cfg) return [];
  if (type === "footerlinks") {
    const cols = appData.footerLinks.columns || {};
    return ["quick", "boards", "important"].flatMap(col => (cols[col] || []).map(item => ({ ...item, column: col })));
  }
  return appData[cfg.key] || [];
}

function setStructuredList(type, list) {
  const cfg = STRUCTURED_CONFIG[type];
  if (!cfg) return;
  if (type === "footerlinks") {
    appData.footerLinks.columns = { quick: [], boards: [], important: [] };
    list.forEach(i => {
      const col = i.column || "quick";
      appData.footerLinks.columns[col].push(i);
    });
    return;
  }
  appData[cfg.key] = list;
}

function renderStructuredSection(type) {
  const cfg = STRUCTURED_CONFIG[type];
  if (!cfg) return;
  const tbody = document.getElementById(cfg.tbodyId);
  if (!tbody) return;
  const list = getStructuredList(type);
  tbody.innerHTML = list.map((item, i) => {
    if (type === "categorynav") return `<tr><td>${i + 1}</td><td>${esc(item.icon)}</td><td>${esc(item.label)}</td><td>${esc(item.href)}</td><td>${esc(item.order)}</td><td><button class="btn btn-sm btn-primary" onclick="openStructuredModal('${type}', ${i})">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteStructuredItem('${type}', ${i})">🗑️</button> <button class="btn btn-sm btn-secondary" onclick="moveStructuredItem('${type}', ${i}, -1)">▲</button> <button class="btn btn-sm btn-secondary" onclick="moveStructuredItem('${type}', ${i}, 1)">▼</button></td></tr>`;
    if (type === "quicklinks") return `<tr><td>${i + 1}</td><td>${esc(item.icon)}</td><td>${esc(item.text)}</td><td>${esc(item.href)}</td><td><button class="btn btn-sm btn-primary" onclick="openStructuredModal('${type}', ${i})">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteStructuredItem('${type}', ${i})">🗑️</button></td></tr>`;
    if (type === "sidebar") return `<tr><td>${i + 1}</td><td>${esc(item.label)}</td><td>${esc(item.key)}</td><td>${item.visible ? "হ্যাঁ" : "না"}</td><td>${esc(item.order)}</td><td><button class="btn btn-sm btn-primary" onclick="openStructuredModal('${type}', ${i})">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteStructuredItem('${type}', ${i})">🗑️</button> <button class="btn btn-sm btn-secondary" onclick="moveStructuredItem('${type}', ${i}, -1)">▲</button> <button class="btn btn-sm btn-secondary" onclick="moveStructuredItem('${type}', ${i}, 1)">▼</button></td></tr>`;
    if (type === "importantlinks") return `<tr><td>${i + 1}</td><td>${esc(item.icon)}</td><td>${esc(item.label || item.name)}</td><td>${esc(item.url)}</td><td>${esc(item.target || "_blank")}</td><td><button class="btn btn-sm btn-primary" onclick="openStructuredModal('${type}', ${i})">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteStructuredItem('${type}', ${i})">🗑️</button></td></tr>`;
    if (type === "pages") return `<tr><td>${i + 1}</td><td>${esc(item.key)}</td><td>${esc(item.heroTitle)}</td><td>${esc(item.heroDescription)}</td><td><button class="btn btn-sm btn-primary" onclick="openStructuredModal('${type}', ${i})">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteStructuredItem('${type}', ${i})">🗑️</button></td></tr>`;
    if (type === "footerlinks") return `<tr><td>${i + 1}</td><td>${esc(item.column)}</td><td>${esc(item.label)}</td><td>${esc(item.href)}</td><td>${esc(item.target || "_self")}</td><td><button class="btn btn-sm btn-primary" onclick="openStructuredModal('${type}', ${i})">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteStructuredItem('${type}', ${i})">🗑️</button></td></tr>`;
    return "";
  }).join("");
}

function openStructuredModal(type, index) {
  const cfg = STRUCTURED_CONFIG[type];
  if (!cfg) return;
  const modal = document.getElementById("structured-modal");
  const form = document.getElementById("structured-form");
  document.getElementById("structured-modal-title").textContent = index === null ? "নতুন আইটেম যোগ করুন" : "আইটেম সম্পাদনা";
  modal.dataset.type = type;
  modal.dataset.index = index === null ? "" : String(index);
  const list = getStructuredList(type);
  const item = index === null ? {} : (list[index] || {});
  form.innerHTML = cfg.fields.map(f => {
    const value = item[f.k] !== undefined ? item[f.k] : "";
    if (f.ta) return `<div class="form-field"><label>${f.l}</label><textarea id="sf-${f.k}">${esc(value)}</textarea></div>`;
    if (f.t === "select") return `<div class="form-field"><label>${f.l}</label><select id="sf-${f.k}">${(f.o || []).map(v => `<option value="${esc(v)}" ${String(value) === String(v) ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></div>`;
    return `<div class="form-field"><label>${f.l}</label><input id="sf-${f.k}" type="${f.t || "text"}" value="${esc(value)}"></div>`;
  }).join("");
  modal.style.display = "flex";
}

function saveStructuredModal() {
  const modal = document.getElementById("structured-modal");
  const type = modal.dataset.type;
  if (type === "navigation") {
    saveNavigationModal();
    return;
  }
  const idxRaw = modal.dataset.index;
  const cfg = STRUCTURED_CONFIG[type];
  if (!cfg) return;
  const list = getStructuredList(type);
  const obj = {};
  cfg.fields.forEach(f => {
    const el = document.getElementById("sf-" + f.k);
    if (!el) return;
    obj[f.k] = el.value;
  });
  if (!obj.id) obj.id = getNextId(list);
  if (type === "sidebar") obj.visible = String(obj.visible) !== "false";
  if (type === "importantlinks" && !obj.label && obj.name) obj.label = obj.name;
  const idx = idxRaw === "" ? -1 : parseInt(idxRaw, 10);
  if (idx >= 0) list[idx] = { ...list[idx], ...obj };
  else list.push(obj);
  setStructuredList(type, list);
  closeModal("structured-modal");
  saveAndNotify("✅ আইটেম সেভ হয়েছে");
  renderStructuredSection(type);
}

function deleteStructuredItem(type, index) {
  confirmDelete(() => {
    const list = getStructuredList(type);
    list.splice(index, 1);
    setStructuredList(type, list);
    saveAndNotify("✅ মুছে ফেলা হয়েছে");
    renderStructuredSection(type);
  });
}

function moveStructuredItem(type, index, dir) {
  const list = getStructuredList(type);
  const j = index + dir;
  if (j < 0 || j >= list.length) return;
  [list[index], list[j]] = [list[j], list[index]];
  setStructuredList(type, list);
  saveAndNotify("✅ ক্রম আপডেট হয়েছে");
  renderStructuredSection(type);
}

function renderNavigation() {
  ensureNewDataDefaults();
  const tbody = document.getElementById("navigation-tbody");
  if (!tbody) return;
  const main = appData.navigation.main || [];
  const mobile = appData.navigation.mobile || [];
  const rows = [];
  main.forEach((item, i) => {
    rows.push({ type: "main", i, item, parent: "-" });
    (item.children || []).forEach((child, ci) => rows.push({ type: "child", i, ci, item: child, parent: item.label }));
  });
  mobile.forEach((item, i) => rows.push({ type: "mobile", i, item, parent: "-" }));
  tbody.innerHTML = rows.map((r, idx) => `
    <tr>
      <td>${idx + 1}</td><td>${esc(r.type)}</td><td>${esc(r.item.label)}</td><td>${esc(r.item.href)}</td><td>${esc(r.item.icon || "")}</td><td>${esc(r.parent)}</td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="openNavigationModal('${r.type}', ${r.i}, ${r.ci === undefined ? "null" : r.ci})">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteNavigationItem('${r.type}', ${r.i}, ${r.ci === undefined ? "null" : r.ci})">🗑️</button>
      </td>
    </tr>`).join("");
}

function openNavigationModal(type, i, ci) {
  const modal = document.getElementById("structured-modal");
  const form = document.getElementById("structured-form");
  document.getElementById("structured-modal-title").textContent = "নেভিগেশন আইটেম";
  modal.dataset.type = "navigation";
  modal.dataset.navType = type || "main";
  modal.dataset.index = i === null ? "" : String(i);
  modal.dataset.childIndex = ci === null ? "" : String(ci);
  let item = { label: "", href: "", icon: "", isDropdown: false, parentId: "" };
  if (type === "main" && i !== null) item = appData.navigation.main[i] || item;
  if (type === "mobile" && i !== null) item = appData.navigation.mobile[i] || item;
  if (type === "child" && i !== null && ci !== null) item = ((appData.navigation.main[i] || {}).children || [])[ci] || item;
  const parentOptions = (appData.navigation.main || []).map((m, idx) => `<option value="${idx}">${esc(m.label)}</option>`).join("");
  form.innerHTML = `
    <div class="form-field"><label>টাইপ</label><select id="nav-type"><option value="main" ${type === "main" ? "selected" : ""}>main</option><option value="child" ${type === "child" ? "selected" : ""}>dropdown-child</option><option value="mobile" ${type === "mobile" ? "selected" : ""}>mobile</option></select></div>
    <div class="form-field"><label>Parent (dropdown child হলে)</label><select id="nav-parent"><option value="">--</option>${parentOptions}</select></div>
    <div class="form-field"><label>লেবেল</label><input id="nav-label" value="${esc(item.label || "")}"></div>
    <div class="form-field"><label>href</label><input id="nav-href" value="${esc(item.href || "")}"></div>
    <div class="form-field"><label>icon</label><input id="nav-icon" value="${esc(item.icon || "")}"></div>
    <div class="form-field"><label>Dropdown?</label><select id="nav-dropdown"><option value="false" ${!item.isDropdown ? "selected" : ""}>না</option><option value="true" ${item.isDropdown ? "selected" : ""}>হ্যাঁ</option></select></div>
  `;
  if (type === "child" && i !== null) document.getElementById("nav-parent").value = String(i);
  modal.style.display = "flex";
}

function saveNavigationModal() {
  ensureNewDataDefaults();
  const modal = document.getElementById("structured-modal");
  const type = document.getElementById("nav-type").value;
  const i = modal.dataset.index === "" ? null : parseInt(modal.dataset.index, 10);
  const ci = modal.dataset.childIndex === "" ? null : parseInt(modal.dataset.childIndex, 10);
  const item = {
    id: Date.now(),
    label: document.getElementById("nav-label").value.trim(),
    href: document.getElementById("nav-href").value.trim(),
    icon: document.getElementById("nav-icon").value.trim(),
    isDropdown: document.getElementById("nav-dropdown").value === "true",
    children: []
  };
  if (!item.label) { showToast("লেবেল দিন", "error"); return; }
  if (type === "main") {
    if (i !== null && modal.dataset.navType === "main") appData.navigation.main[i] = { ...(appData.navigation.main[i] || {}), ...item, children: (appData.navigation.main[i] || {}).children || [] };
    else appData.navigation.main.push(item);
  } else if (type === "mobile") {
    if (i !== null && modal.dataset.navType === "mobile") appData.navigation.mobile[i] = item;
    else appData.navigation.mobile.push(item);
  } else {
    const parentIdx = parseInt(document.getElementById("nav-parent").value, 10);
    if (Number.isNaN(parentIdx) || !appData.navigation.main[parentIdx]) { showToast("Parent নির্বাচন করুন", "error"); return; }
    appData.navigation.main[parentIdx].children = appData.navigation.main[parentIdx].children || [];
    if (i !== null && ci !== null && modal.dataset.navType === "child") appData.navigation.main[i].children[ci] = item;
    else appData.navigation.main[parentIdx].children.push(item);
  }
  closeModal("structured-modal");
  saveAndNotify("✅ নেভিগেশন সেভ হয়েছে");
  renderNavigation();
}

function deleteNavigationItem(type, i, ci) {
  confirmDelete(() => {
    if (type === "main") appData.navigation.main.splice(i, 1);
    else if (type === "mobile") appData.navigation.mobile.splice(i, 1);
    else if (type === "child") (appData.navigation.main[i].children || []).splice(ci, 1);
    saveAndNotify("✅ নেভিগেশন আইটেম মুছে ফেলা হয়েছে");
    renderNavigation();
  });
}

function renderFooterSection() {
  ensureNewDataDefaults();
  const c = document.getElementById("footer-settings-form");
  if (c) c.innerHTML = `<div class="form-field"><label>ফুটার বর্ণনা</label><textarea id="footer-description">${esc(appData.footerLinks.description || "")}</textarea></div>`;
  renderStructuredSection("footerlinks");
}

function saveFooterSettings() {
  ensureNewDataDefaults();
  appData.footerLinks.description = document.getElementById("footer-description").value.trim();
  saveAndNotify("✅ ফুটার সেটিংস সেভ হয়েছে");
}

function renderThemeSettings() {
  ensureNewDataDefaults();
  const c = document.getElementById("theme-settings-form");
  if (!c) return;
  const t = appData.themeSettings;
  c.innerHTML = `
    <div class="form-field"><label>Primary Color</label><input id="th-primary" type="color" value="${esc(t.primaryColor)}"></div>
    <div class="form-field"><label>Accent Color</label><input id="th-accent" type="color" value="${esc(t.accentColor)}"></div>
    <div class="form-field"><label>Dark Color</label><input id="th-dark" type="color" value="${esc(t.darkColor)}"></div>
    <div class="form-field"><label>Font Family</label><input id="th-font" value="${esc(t.fontFamily)}"></div>
  `;
  ["th-primary", "th-accent", "th-dark"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", applyThemePreview);
  });
}

function applyThemePreview() {
  const root = document.documentElement;
  const primary = document.getElementById("th-primary");
  const accent = document.getElementById("th-accent");
  const dark = document.getElementById("th-dark");
  if (primary) root.style.setProperty("--primary", primary.value);
  if (accent) root.style.setProperty("--secondary", accent.value);
  if (dark) root.style.setProperty("--text-dark", dark.value);
}

function saveThemeSettings() {
  ensureNewDataDefaults();
  appData.themeSettings = {
    primaryColor: document.getElementById("th-primary").value,
    accentColor: document.getElementById("th-accent").value,
    darkColor: document.getElementById("th-dark").value,
    fontFamily: document.getElementById("th-font").value.trim()
  };
  saveAndNotify("✅ থিম সেটিংস সেভ হয়েছে");
}

function renderImages() {
  ensureNewDataDefaults();
  const tbody = document.getElementById("images-tbody");
  if (!tbody) return;
  tbody.innerHTML = (appData.images || []).map((img, i) => `
    <tr>
      <td>${i + 1}</td><td>${esc(img.name)}</td><td><img src="${esc(img.dataUrl)}" alt="" style="width:60px;height:40px;object-fit:cover;border-radius:4px;"></td>
      <td><input value="${esc(img.dataUrl)}" readonly style="width:100%"></td>
      <td><button class="btn btn-sm btn-secondary" onclick="copyImageUrl(${i})">📋</button> <button class="btn btn-sm btn-danger" onclick="deleteImage(${i})">🗑️</button></td>
    </tr>
  `).join("");
}

function handleImageManagerUpload(event) {
  ensureNewDataDefaults();
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast("শুধুমাত্র ছবি গ্রহণযোগ্য", "error"); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    appData.images.push({ id: Date.now(), name: file.name, dataUrl: e.target.result });
    saveAndNotify("✅ ছবি আপলোড হয়েছে");
    renderImages();
    event.target.value = "";
  };
  reader.readAsDataURL(file);
}

function copyImageUrl(i) {
  const img = (appData.images || [])[i];
  if (!img) return;
  navigator.clipboard.writeText(img.dataUrl).then(() => showToast("✅ কপি হয়েছে"));
}

function deleteImage(i) {
  confirmDelete(() => {
    appData.images.splice(i, 1);
    saveAndNotify("✅ ছবি মুছে ফেলা হয়েছে");
    renderImages();
  });
}

// ─── Image Upload Helpers ────────────────────────────────────────────────
function handleNewsImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast("শুধুমাত্র ছবি ফাইল গ্রহণযোগ্য", "error"); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    document.getElementById("n-image").value = dataUrl;
    updateNewsImagePreview(dataUrl);
    showToast("✅ ছবি আপলোড হয়েছে");
  };
  reader.readAsDataURL(file);
}

function handleNewsImageDrop(event) {
  event.preventDefault();
  const dropArea = document.getElementById("n-image-drop");
  if (dropArea) dropArea.classList.remove("drag-over");
  const file = event.dataTransfer.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast("শুধুমাত্র ছবি ফাইল গ্রহণযোগ্য", "error"); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    document.getElementById("n-image").value = dataUrl;
    updateNewsImagePreview(dataUrl);
    showToast("✅ ছবি আপলোড হয়েছে");
  };
  reader.readAsDataURL(file);
}

function updateNewsImagePreview(src) {
  const wrap = document.getElementById("n-image-preview");
  const img = document.getElementById("n-image-preview-img");
  if (!wrap || !img) return;
  if (src) {
    let safeSrc = '';
    if (src.startsWith('data:image/')) {
      // Base64 image data URL from file upload - safe
      safeSrc = src;
    } else {
      try {
        const parsed = new URL(src);
        // Reconstruct URL from safe components to break taint chain
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          safeSrc = parsed.protocol + '//' + parsed.host + parsed.pathname + parsed.search;
        }
      } catch (e) {
        safeSrc = '';
      }
    }
    if (!safeSrc) { wrap.style.display = "none"; return; }
    img.setAttribute('src', safeSrc);
    wrap.style.display = "block";
  } else {
    img.setAttribute('src', '');
    wrap.style.display = "none";
  }
}

function clearNewsImage() {
  const el = document.getElementById("n-image");
  if (el) el.value = "";
  updateNewsImagePreview("");
  const fileInput = document.getElementById("n-image-file");
  if (fileInput) fileInput.value = "";
}

// ─── Auto-Fetch News from URL ────────────────────────────────────────────
async function fetchNewsFromUrl() {
  const urlEl = document.getElementById("n-fetch-url");
  if (!urlEl) return;
  const url = urlEl.value.trim();
  if (!url) { showToast("URL লিখুন", "error"); return; }
  showToast("⏳ তথ্য সংগ্রহ করা হচ্ছে...", "info");
  try {
    const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(url);
    const resp = await fetch(proxyUrl);
    if (!resp.ok) throw new Error("নেটওয়ার্ক সমস্যা");
    const data = await resp.json();
    const html = data.contents || "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const getMeta = (selectors) => {
      for (const sel of selectors) {
        const el = doc.querySelector(sel);
        if (el) {
          const val = el.getAttribute("content") || el.textContent;
          if (val && val.trim()) return val.trim();
        }
      }
      return "";
    };

    const title = getMeta(['meta[property="og:title"]', 'meta[name="twitter:title"]']) || doc.title || "";
    const description = getMeta(['meta[property="og:description"]', 'meta[name="description"]', 'meta[name="twitter:description"]']);
    const image = getMeta(['meta[property="og:image"]', 'meta[name="twitter:image"]', 'meta[itemprop="image"]']);
    let domain = "";
    try { domain = new URL(url).hostname.replace("www.", ""); } catch(e) { domain = ""; }
    const now = new Date();
    const today = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear().toString();

    if (title) document.getElementById("n-title").value = title;
    if (description) document.getElementById("n-summary").value = description;
    if (domain) document.getElementById("n-source").value = domain;
    document.getElementById("n-date").value = today;
    document.getElementById("n-link").value = url;
    document.getElementById("n-year").value = year;
    if (image) {
      document.getElementById("n-image").value = image;
      updateNewsImagePreview(image);
    }
    showToast("✅ তথ্য সফলভাবে সংগ্রহ করা হয়েছে");
  } catch (err) {
    showToast("❌ তথ্য সংগ্রহ করা সম্ভব হয়নি: " + (err.message || ""), "error");
  }
}

// ─── Modal helpers ───────────────────────────────────────────────────────
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

// Close on backdrop click
document.addEventListener("click", function(e) {
  if (e.target && e.target.classList.contains("modal-overlay")) {
    e.target.style.display = "none";
  }
});

// ─── Global Action Bar ───────────────────────────────────────────────────
function saveDraft() {
  saveData(appData);
  updateDraftBadge();
  showToast("✅ ড্রাফট সেভ হয়েছে");
}

function downloadDataJS() {
  exportDataJS(appData);
  showToast("✅ data.js ডাউনলোড শুরু হয়েছে");
}

async function copyJSONData() {
  await copyJSON(appData);
  showToast("✅ JSON ক্লিপবোর্ডে কপি হয়েছে");
}

function discardDraft() {
  if (confirm("সমস্ত পরিবর্তন বাতিল করবেন?")) {
    clearDraft();
    appData = loadData();
    updateDraftBadge();
    showToast("✅ পরিবর্তন বাতিল হয়েছে");
    showSection("dashboard");
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
  // Auth check
  const session = checkAuth();
  if (!session) return;

  // Show username
  const unEl = document.getElementById("admin-username");
  if (unEl) unEl.textContent = session.username || "অ্যাডমিন";

  // Load data
  if (!window.eduData) {
    showToast("⚠️ data.js লোড হয়নি। ড্রাফট থেকে লোড করা হচ্ছে।", "error");
  }
  appData = loadData();
  ensureNewDataDefaults();
  updateDraftBadge();

  // Sidebar navigation
  document.querySelectorAll(".sidebar-link").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const sec = this.dataset.section;
      if (sec) showSection(sec);
    });
  });

  // Search inputs
  const newsSearch = document.getElementById("news-search");
  if (newsSearch) newsSearch.addEventListener("input", function() {
    newsSearchTerm = this.value.toLowerCase();
    renderNews();
  });
  const admissionSearch = document.getElementById("admissions-search");
  if (admissionSearch) admissionSearch.addEventListener("input", function() {
    admissionSearchTerm = this.value.toLowerCase();
    renderAdmissions();
  });
  const scholarSearch = document.getElementById("scholarship-search");
  if (scholarSearch) scholarSearch.addEventListener("input", function() {
    scholarSearchTerm = this.value.toLowerCase();
    renderScholarships();
  });

  // Default section
  showSection("dashboard");

  // Image URL preview on text change
  const nImageEl = document.getElementById("n-image");
  if (nImageEl) {
    nImageEl.addEventListener("input", function() {
      const val = this.value.trim();
      if (val && (val.startsWith('http') || val.startsWith('data:'))) {
        updateNewsImagePreview(val);
      } else if (!val) {
        updateNewsImagePreview("");
      }
    });
  }

  // Mobile sidebar toggle
  const toggleBtn = document.getElementById("sidebar-toggle");
  const sidebar = document.getElementById("sidebar");
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function() {
      sidebar.classList.toggle("open");
    });
  }
});
