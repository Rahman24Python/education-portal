/**
 * EduBD Notice Detail Page
 * Reads URL query parameters and renders the notice detail card.
 *
 * Expected query parameters:
 *   title   — Notice title (required)
 *   source  — Source name (e.g. "জাতীয় বিশ্ববিদ্যালয়")
 *   url     — Original notice URL (for the "মূল লিংক দেখুন" button)
 *   date    — Publication date string
 *   brief   — Short description / brief (optional)
 *   icon    — Emoji icon (optional)
 */

(function () {
  "use strict";

  /**
   * Escape a string for safe insertion into HTML text nodes and attributes.
   * @param {string} str
   * @returns {string}
   */
  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Validate that a URL starts with http/https.
   * @param {string} href
   * @returns {string}
   */
  function safeHref(href) {
    return /^https?:\/\//i.test(href) ? href : "#";
  }

  /**
   * Parse all query parameters from the current URL.
   * @returns {Object}
   */
  function getQueryParams() {
    var params = {};
    var search = window.location.search.slice(1);
    if (!search) return params;
    search.split("&").forEach(function (part) {
      var idx = part.indexOf("=");
      if (idx === -1) return;
      var key = decodeURIComponent(part.slice(0, idx).replace(/\+/g, " "));
      var val = decodeURIComponent(part.slice(idx + 1).replace(/\+/g, " "));
      params[key] = val;
    });
    return params;
  }

  /**
   * Render the notice detail card from query parameters.
   */
  function renderDetail() {
    var params = getQueryParams();
    var card = document.getElementById("notice-detail-card");
    if (!card) return;

    var title  = params.title  || "নোটিশ বিস্তারিত";
    var source = params.source || "";
    var url    = params.url    || "";
    var date   = params.date   || "";
    var brief  = params.brief  || "";
    var icon   = params.icon   || "📋";

    // Update page title and breadcrumb
    document.title = escHtml(title) + " — EduBD";
    var bc = document.getElementById("breadcrumb-title");
    if (bc) bc.textContent = title.length > 60 ? title.slice(0, 60) + "…" : title;
    var bcSource = document.getElementById("breadcrumb-source");
    if (bcSource && source) bcSource.textContent = source;

    var safeUrl = safeHref(url);

    var sourceHtml = source
      ? '<span class="notice-detail-source-tag">' + escHtml(icon) + " " + escHtml(source) + "</span>"
      : "";

    var dateHtml = date
      ? '<span class="notice-detail-date">📅 ' + escHtml(date) + "</span>"
      : "";

    var briefHtml = brief
      ? '<p class="notice-detail-brief">' + escHtml(brief) + "</p>"
      : "";

    var btnHtml = safeUrl !== "#"
      ? '<a href="' + escHtml(safeUrl) + '" target="_blank" rel="noopener" class="btn btn-primary notice-detail-btn">' +
        "🔗 মূল লিংক দেখুন (নতুন ট্যাবে খুলবে)" +
        "</a>"
      : "";

    card.innerHTML =
      '<div class="notice-detail-header">' +
        '<h1 class="notice-detail-title">' + escHtml(title) + "</h1>" +
        '<div class="notice-detail-meta">' + sourceHtml + dateHtml + "</div>" +
      "</div>" +
      '<div class="notice-detail-body">' +
        briefHtml +
        '<div class="notice-detail-divider"></div>' +
        '<p class="notice-detail-instruction">নিচের বাটনে ক্লিক করে মূল নোটিশ / তথ্য দেখতে পারবেন। এটি একটি সরকারি/অফিসিয়াল ওয়েবসাইটে নিয়ে যাবে।</p>' +
        btnHtml +
      "</div>";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderDetail);
  } else {
    renderDetail();
  }
})();
