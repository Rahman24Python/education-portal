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
    universities: renderUniversities
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
    { label: "বেসরকারি বিশ্ববিদ্যালয়", count: (d.privateUniversities || []).length, icon: "🏫" }
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
    // Sanitize: only allow http, https, and data:image URLs
    let safeSrc = '';
    if (src.startsWith('data:image/')) {
      safeSrc = src;
    } else {
      try {
        const parsed = new URL(src);
        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          safeSrc = parsed.href;
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
    const today = now.toISOString().slice(0, 10);
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
