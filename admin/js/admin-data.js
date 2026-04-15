// EduBD Admin — Data Management
const DRAFT_KEY = "edubd_admin_data_draft";

function loadData() {
  // eduData is loaded globally from ../js/data.js
  const base = window.eduData ? JSON.parse(JSON.stringify(window.eduData)) : {};
  const draftRaw = localStorage.getItem(DRAFT_KEY);
  if (draftRaw) {
    try {
      const draft = JSON.parse(draftRaw);
      return draft;
    } catch (e) {
      // ignore corrupt draft
    }
  }
  return base;
}

function saveData(data) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
}

function hasDraftChanges() {
  const draftRaw = localStorage.getItem(DRAFT_KEY);
  if (!draftRaw) return false;
  try {
    const draft = JSON.parse(draftRaw);
    const original = window.eduData ? JSON.parse(JSON.stringify(window.eduData)) : {};
    // Compare JSON stringified (ignore key order)
    return JSON.stringify(draft) !== JSON.stringify(original);
  } catch (e) {
    return false;
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

function getNextId(arr) {
  if (!arr || arr.length === 0) return 1;
  const maxId = arr.reduce((max, item) => {
    const id = typeof item.id === "number" ? item.id : parseInt(item.id, 10) || 0;
    return Math.max(max, id);
  }, 0);
  return maxId + 1;
}

function exportDataJS(data) {
  const json = JSON.stringify(data, null, 2);
  const content = `// EduBD - Bangladesh Education Portal - Data\n// Auto-updated by scripts/update_data.py — do not edit manually.\nconst eduData = ${json};\n\n// Make data available globally\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = eduData;\n}\n`;
  const blob = new Blob([content], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.js";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyJSON(data) {
  const json = JSON.stringify(data, null, 2);
  try {
    await navigator.clipboard.writeText(json);
    return true;
  } catch (e) {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = json;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  }
}
