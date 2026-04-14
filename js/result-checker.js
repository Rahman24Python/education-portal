// EduBD - Board Result Checker

document.addEventListener('DOMContentLoaded', function() {
  initResultChecker();
  initSidebarResultChecker();
  initResultsPage();
});

// ===================== FULL RESULT CHECKER (results.html) =====================
function initResultsPage() {
  const fullForm = document.getElementById('full-result-form');
  if (!fullForm) return;

  // Populate board dropdown
  const boardSelect = document.getElementById('result-board');
  if (boardSelect && typeof eduData !== 'undefined') {
    boardSelect.innerHTML = '<option value="">-- বোর্ড নির্বাচন করুন --</option>' +
      eduData.boards.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  }

  // Year dropdown (last 5 years)
  const yearSelect = document.getElementById('result-year');
  if (yearSelect) {
    const currentYear = new Date().getFullYear();
    let options = '<option value="">-- বছর নির্বাচন করুন --</option>';
    for (let y = currentYear; y >= currentYear - 5; y--) {
      options += `<option value="${y}">${y}</option>`;
    }
    yearSelect.innerHTML = options;
  }

  fullForm.addEventListener('submit', function(e) {
    e.preventDefault();
    checkResult(this);
  });
}

// ===================== SIDEBAR RESULT CHECKER =====================
function initSidebarResultChecker() {
  const sidebarForm = document.getElementById('sidebar-result-form');
  if (!sidebarForm) return;

  // Populate board dropdown
  const boardSelect = sidebarForm.querySelector('select[name="board"]');
  if (boardSelect && typeof eduData !== 'undefined') {
    boardSelect.innerHTML = '<option value="">-- বোর্ড নির্বাচন করুন --</option>' +
      eduData.boards.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  }

  sidebarForm.addEventListener('submit', function(e) {
    e.preventDefault();
    checkResultSidebar(this);
  });
}

function initResultChecker() {
  // Generic any form with class result-check-form
  document.querySelectorAll('.result-check-form').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      checkResult(this);
    });
  });
}

// ===================== RESULT CHECK LOGIC =====================
function checkResult(form) {
  const board = form.querySelector('[name="board"]')?.value || '';
  const exam = form.querySelector('[name="exam"]')?.value || 'SSC';
  const year = form.querySelector('[name="year"]')?.value || new Date().getFullYear();
  const roll = form.querySelector('[name="roll"]')?.value.trim() || '';
  const reg = form.querySelector('[name="registration"]')?.value.trim() || '';

  // Validation
  if (!board) {
    showToast('বোর্ড নির্বাচন করুন।', 'error');
    return;
  }
  if (!roll) {
    showToast('রোল নম্বর দিন।', 'error');
    return;
  }
  if (!/^\d{6,9}$/.test(roll)) {
    showToast('সঠিক রোল নম্বর দিন (৬-৯ সংখ্যার)।', 'error');
    return;
  }

  const resultContainer = document.getElementById('result-output');
  if (!resultContainer) {
    // If no result container found, redirect to results page
    const base = (typeof getBasePath === 'function') ? getBasePath() : '';
    window.location.href = `${base}pages/results.html?board=${board}&exam=${exam}&year=${year}&roll=${roll}`;
    return;
  }

  // Show loading
  resultContainer.innerHTML = `
    <div class="loading-overlay">
      <div class="spinner"></div>
      <p>ফলাফল খোঁজা হচ্ছে...</p>
    </div>
  `;
  resultContainer.style.display = 'block';

  // Simulate API call
  setTimeout(() => {
    displayDemoResult(resultContainer, { board, exam, year, roll, reg });
  }, 1500);
}

function checkResultSidebar(form) {
  const base = (typeof getBasePath === 'function') ? getBasePath() : '';
  const board = form.querySelector('[name="board"]')?.value || '';
  const roll = form.querySelector('[name="roll"]')?.value.trim() || '';

  if (!board) {
    showToast('বোর্ড নির্বাচন করুন।', 'error');
    return;
  }
  if (!roll) {
    showToast('রোল নম্বর দিন।', 'error');
    return;
  }
  if (!/^\d{6,9}$/.test(roll)) {
    showToast('সঠিক রোল নম্বর দিন (৬-৯ সংখ্যার)।', 'error');
    return;
  }

  window.location.href = `${base}pages/results.html?board=${board}&roll=${roll}`;
}

function displayDemoResult(container, params) {
  if (typeof eduData === 'undefined') return;

  // Demo: even roll = pass, odd = fail
  const rollNum = parseInt(params.roll);
  const isPass = rollNum % 2 === 0;
  const data = isPass ? eduData.sampleResults.passed : eduData.sampleResults.failed;

  const b = (typeof toBengaliDigits === 'function') ? toBengaliDigits : (x => x);

  const cardClass = isPass ? '' : ' fail';
  const subjectRows = data.subjects.map(s => `
    <tr>
      <td>${s.name}</td>
      <td style="text-align:center;">${s.grade}</td>
      <td style="text-align:center;">${s.gpa}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="result-card${cardClass}">
      <div style="background:${isPass ? 'var(--secondary)' : '#ffebee'};border-radius:8px;padding:15px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
          <div>
            <h4 style="font-size:18px;color:var(--text-dark);margin-bottom:5px;">${data.name}</h4>
            <p style="font-size:13px;color:#666;">রোল: ${b(params.roll)} | রেজি: ${data.registration}</p>
            <p style="font-size:13px;color:#666;">বোর্ড: ${data.board} | পরীক্ষা: ${data.exam} | বছর: ${data.year}</p>
          </div>
          <span class="result-status">${data.status}</span>
        </div>
      </div>
      <div class="result-gpa">${data.gpa}</div>
      <div class="result-grade-label">গ্রেড: ${data.grade}</div>

      <table class="result-subjects">
        <thead>
          <tr>
            <th>বিষয়</th>
            <th style="text-align:center;">গ্রেড</th>
            <th style="text-align:center;">GPA</th>
          </tr>
        </thead>
        <tbody>${subjectRows}</tbody>
      </table>

      <p style="font-size:12px;color:#999;margin-top:15px;text-align:center;">
        ⚠️ এটি একটি ডেমো ফলাফল। বাস্তব ফলাফলের জন্য 
        <a href="https://eboardresults.com" target="_blank" rel="noopener" style="color:var(--primary);">eboardresults.com</a> 
        ব্যবহার করুন।
      </p>
    </div>
  `;
}

// Check result from URL params on results page load
document.addEventListener('DOMContentLoaded', function() {
  const fullForm = document.getElementById('full-result-form');
  if (!fullForm) return;

  const params = new URLSearchParams(window.location.search);
  const roll = params.get('roll');
  const board = params.get('board');
  const exam = params.get('exam');
  const year = params.get('year');

  if (roll) {
    // Pre-fill form
    const rollInput = fullForm.querySelector('[name="roll"]');
    if (rollInput) rollInput.value = roll;

    if (board) {
      const boardSelect = fullForm.querySelector('[name="board"]');
      if (boardSelect) {
        // Need to wait for options to be populated
        setTimeout(() => {
          boardSelect.value = board;
        }, 100);
      }
    }

    // Auto-submit
    setTimeout(() => {
      checkResult(fullForm);
    }, 200);
  }
});
