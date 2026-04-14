/**
 * EduBD Live Notices — Client-side live notice fetcher
 *
 * Uses a CORS proxy to fetch fresh notices directly from official Bangladeshi
 * education websites in the browser. Falls back to the static data in data.js
 * if the live fetch fails.
 *
 * Sources and selectors mirror scripts/update_data.py for consistency.
 *
 * NOTE: The CORS proxy (api.allorigins.win) is a third-party service. It may
 * become unavailable. The fallback to static data.js handles that case.
 * For production, consider hosting your own CORS proxy.
 */

(function () {
  "use strict";

  const CORS_PROXY = "https://api.allorigins.win/get?url=";

  /** Minimum meaningful text length for a notice item */
  var MIN_TEXT_LEN = 5;

  /** Source definitions: each entry produces one card in the Live Notices panel */
  const LIVE_SOURCES = [
    {
      name: "জাতীয় বিশ্ববিদ্যালয়",
      url: "https://www.nu.ac.bd/",
      selector: "a[href*='uploads/notices']",
      baseUrl: "https://www.nu.ac.bd",
      sourceKey: "nu.ac.bd",
      icon: "🎓",
      limit: 10,
    },
    {
      name: "ঢাকা শিক্ষা বোর্ড",
      url: "https://dhakaeducationboard.portal.gov.bd",
      selector: "a[href*='/pages/notices/']",
      baseUrl: "https://dhakaeducationboard.portal.gov.bd",
      sourceKey: "dhakaeducationboard.portal.gov.bd",
      icon: "🏫",
      limit: 10,
    },
    {
      name: "DGME (মেডিকেল)",
      url: "https://dgme.gov.bd/pages/notices",
      selector: "a[href*='/pages/notices'], a[href*='notice']",
      baseUrl: "https://dgme.gov.bd",
      sourceKey: "dgme.gov.bd",
      icon: "🏥",
      limit: 10,
    },
    {
      name: "SHED",
      url: "https://shed.gov.bd",
      selector: "a[href*='/pages/notices/'], a[href*='notice']",
      baseUrl: "https://shed.gov.bd",
      sourceKey: "shed.gov.bd",
      icon: "🏛️",
      limit: 10,
    },
  ];

  /**
   * Escape a string for safe insertion into HTML attribute values and text nodes.
   * @param {string} str
   * @returns {string}
   */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Validate that a URL starts with http/https to prevent javascript: injection.
   * @param {string} href
   * @returns {string}
   */
  function safeHref(href) {
    return /^https?:\/\//i.test(href) ? href : "#";
  }

  /**
   * Fetch a URL via the CORS proxy and return parsed HTML (Document) or null.
   * @param {string} targetUrl
   * @returns {Promise<Document|null>}
   */
  async function fetchDoc(targetUrl) {
    try {
      const res = await fetch(CORS_PROXY + encodeURIComponent(targetUrl));
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || !data.contents) return null;
      const parser = new DOMParser();
      return parser.parseFromString(data.contents, "text/html");
    } catch (_) {
      return null;
    }
  }

  /**
   * Extract notice links from a parsed document using a CSS selector.
   * @param {Document} doc
   * @param {string} selector  CSS selector targeting <a> elements
   * @param {string} baseUrl   Prepended when href is relative
   * @param {number} limit     Maximum items to return
   * @returns {{href: string, text: string}[]}
   */
  function extractLinks(doc, selector, baseUrl, limit) {
    const links = doc.querySelectorAll(selector);
    const results = [];
    const seen = new Set();

    for (const link of links) {
      if (results.length >= limit) break;

      let href = link.getAttribute("href") || "";
      const text = (link.textContent || "").trim();

      if (!href || !text || text.length < MIN_TEXT_LEN) continue;

      if (!href.startsWith("http")) {
        href = baseUrl.replace(/\/$/, "") + "/" + href.replace(/^\//, "");
      }

      // Only keep http/https links
      if (!/^https?:\/\//i.test(href)) continue;

      if (seen.has(href)) continue;
      seen.add(href);

      results.push({ href, text });
    }

    return results;
  }

  /**
   * Render a list of notice items into a container element.
   * @param {HTMLElement} container
   * @param {{href: string, text: string}[]} items
   * @param {string} sourceUrl  Fallback link when items list is empty
   */
  function renderItems(container, items, sourceUrl) {
    if (!items || items.length === 0) {
      container.innerHTML =
        '<p class="live-notice-empty">কোনো নোটিশ পাওয়া যায়নি। ' +
        '<a href="' + escHtml(safeHref(sourceUrl)) + '" target="_blank" rel="noopener">ওয়েবসাইট দেখুন →</a></p>';
      return;
    }

    container.innerHTML = items
      .map(
        (item, i) =>
          '<p class="live-notice-item">' +
          (i + 1) +
          '. <a href="' +
          escHtml(safeHref(item.href)) +
          '" target="_blank" rel="noopener">' +
          escHtml(item.text) +
          "</a></p>"
      )
      .join("");
  }

  /**
   * Build a static fallback list from eduData.governmentNotices filtered by sourceKey.
   * @param {string} sourceKey  Matches item.source in data.js (e.g. "nu.ac.bd")
   * @returns {{href: string, text: string}[]}
   */
  function buildStaticFallback(sourceKey) {
    if (typeof eduData === "undefined") return [];
    const notices = eduData.governmentNotices || [];
    return notices
      .filter((n) => n.source && n.source === sourceKey)
      .slice(0, 10)
      .map((n) => ({ href: n.sourceUrl || "#", text: n.title }));
  }

  /**
   * Load and render one source into its card container.
   * @param {object} source
   * @param {HTMLElement} card
   */
  async function loadSource(source, card) {
    const body = card.querySelector(".live-notices-body");
    if (!body) return;

    body.innerHTML = '<p class="live-notice-loading">লোড হচ্ছে...</p>';

    const doc = await fetchDoc(source.url);
    if (doc) {
      const items = extractLinks(doc, source.selector, source.baseUrl, source.limit);
      renderItems(body, items, source.url);
    } else {
      // Fall back to static data keyed by sourceKey
      const fallback = buildStaticFallback(source.sourceKey);
      if (fallback.length > 0) {
        renderItems(body, fallback, source.url);
      } else {
        body.innerHTML =
          '<p class="live-notice-empty">লোড করা সম্ভব হয়নি। ' +
          '<a href="' +
          escHtml(safeHref(source.url)) +
          '" target="_blank" rel="noopener">সরাসরি দেখুন →</a></p>';
      }
    }
  }

  /**
   * Create a card element for a source.
   * @param {object} source
   * @returns {HTMLElement}
   */
  function createCard(source) {
    const card = document.createElement("div");
    card.className = "live-notices-card sidebar-card";
    card.innerHTML =
      '<div class="live-notices-header">' +
      '<h3 class="sidebar-title" style="margin-bottom:0;border-bottom:none;padding-bottom:0;">' +
      escHtml(source.icon) +
      " " +
      escHtml(source.name) +
      "</h3>" +
      '<a href="' +
      escHtml(safeHref(source.url)) +
      '" target="_blank" rel="noopener" class="see-all-link">ওয়েবসাইট →</a>' +
      "</div>" +
      '<div class="live-notices-body"><p class="live-notice-loading">লোড হচ্ছে...</p></div>';
    return card;
  }

  /**
   * Initialise the Live Notices section.
   * Called once the DOM is ready.
   */
  function init() {
    const container = document.getElementById("live-notices-section");
    if (!container) return;

    LIVE_SOURCES.forEach(function (source) {
      const card = createCard(source);
      container.appendChild(card);
      // Fire-and-forget — each card loads independently
      loadSource(source, card);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
