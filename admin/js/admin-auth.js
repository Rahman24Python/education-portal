// EduBD Admin — Authentication
// Default: admin / admin123

const DEFAULT_USERNAME = "admin";
const DEFAULT_PASSWORD_HASH = "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
const SESSION_KEY = "edubd_admin_session";
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function login(username, password) {
  const hash = await hashPassword(password);
  if (username === DEFAULT_USERNAME && hash === DEFAULT_PASSWORD_HASH) {
    const now = Date.now();
    const session = {
      username: username,
      loginTime: now,
      expiresAt: now + SESSION_TIMEOUT_MS
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  }
  return false;
}

function checkAuth() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    redirectToLogin();
    return false;
  }
  try {
    const session = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      redirectToLogin();
      return false;
    }
    return session;
  } catch (e) {
    localStorage.removeItem(SESSION_KEY);
    redirectToLogin();
    return false;
  }
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  redirectToLogin();
}

function redirectToLogin() {
  // Works from admin/index.html → admin/login.html
  const path = window.location.pathname;
  if (!path.endsWith("login.html")) {
    window.location.href = "login.html";
  }
}

function getSessionUsername() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return "অ্যাডমিন";
  try {
    return JSON.parse(raw).username || "অ্যাডমিন";
  } catch (e) {
    return "অ্যাডমিন";
  }
}
