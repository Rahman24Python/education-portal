#!/usr/bin/env python3
"""
EduBD Auto-Update Script
Fetches education data from Bangladeshi news and government sources,
merges it with existing data in js/data.js, and writes the updated file.

Usage:
    python scripts/update_data.py

Dependencies (see requirements.txt):
    requests, beautifulsoup4, lxml
"""

import json
import os
import re
import subprocess
import sys
import time
import logging
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; EduBD-Bot/1.0; "
        "+https://github.com/Rahman24Python/education-portal)"
    ),
    "Accept-Language": "bn,en;q=0.9",
}

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_JS_PATH = REPO_ROOT / "js" / "data.js"

REQUEST_DELAY = 2   # seconds between requests
REQUEST_TIMEOUT = 15  # seconds per request

MAX_HEADLINES_PER_SOURCE = 15    # max headlines scraped per news source
MAX_NOTICES_PER_SOURCE = 20      # max notice items scraped per govt source
MAX_BOARD_LINKS_TO_EXAMINE = 60  # max <a> tags examined per board page

CURRENT_YEAR = str(datetime.now(timezone.utc).year)

# News sources
NEWS_SOURCES = [
    {
        "name": "The Daily Star",
        "url": "https://www.thedailystar.net/education",
        "source_key": "The Daily Star",
        "category": "শিক্ষা",
        "selector": "h3.title, h2.title, .card-title, h2, h3",
    },
    {
        "name": "Prothom Alo",
        "url": "https://www.prothomalo.com/education",
        "source_key": "প্রথম আলো",
        "category": "শিক্ষা",
        "selector": "h2, h3",
    },
    {
        "name": "BD News 24",
        "url": "https://bdnews24.com/education",
        "source_key": "বিডি নিউজ ২৪",
        "category": "শিক্ষা",
        "selector": "h2, h3, .headline",
    },
    {
        "name": "Bangla Tribune",
        "url": "https://www.banglatribune.com/education",
        "source_key": "বাংলা ট্রিবিউন",
        "category": "শিক্ষা",
        "selector": "h2, h3, .title",
    },
]

# Government / official notice sources
GOVT_SOURCES = [
    {
        "name": "SHED",
        "url": "https://shed.gov.bd",
        "source_key": "shed.gov.bd",
        "category": "সরকারি বিজ্ঞপ্তি",
        "selector": "h2, h3, .notice-title, li a",
    },
    {
        "name": "SHED Scholarships",
        "url": "https://shed.gov.bd/pages/moedu-scholarships",
        "source_key": "shed.gov.bd",
        "category": "বৃত্তি",
        "selector": "h2, h3, .title, li a",
    },
    {
        "name": "MoEdu",
        "url": "https://moedu.gov.bd",
        "source_key": "moedu.gov.bd",
        "category": "সরকারি বিজ্ঞপ্তি",
        "selector": "h2, h3, .notice-title, li a",
    },
    {
        "name": "Education Board",
        "url": "https://educationboard.gov.bd",
        "source_key": "educationboard.gov.bd",
        "category": "শিক্ষা বোর্ড",
        "selector": "h2, h3, li a",
    },
    {
        "name": "DGME",
        "url": "https://dgme.gov.bd/pages/notices",
        "source_key": "dgme.gov.bd",
        "category": "মেডিকেল শিক্ষা",
        "selector": "h2, h3, .notice-title, li a",
    },
    {
        "name": "National University",
        "url": "https://www.nu.ac.bd",
        "source_key": "nu.ac.bd",
        "category": "জাতীয় বিশ্ববিদ্যালয়",
        "selector": "h2, h3, .notice-title, li a",
    },
]

# All education boards
BOARD_SOURCES = [
    {"id": "dhaka",      "name": "ঢাকা শিক্ষা বোর্ড",       "url": "https://dhakaeducationboard.portal.gov.bd"},
    {"id": "rajshahi",   "name": "রাজশাহী শিক্ষা বোর্ড",    "url": "https://rajshahieducationboard.gov.bd"},
    {"id": "chittagong", "name": "চট্টগ্রাম শিক্ষা বোর্ড",  "url": "https://bise-ctg.portal.gov.bd"},
    {"id": "sylhet",     "name": "সিলেট শিক্ষা বোর্ড",      "url": "https://sylheteducationboard.gov.bd"},
    {"id": "comilla",    "name": "কুমিল্লা শিক্ষা বোর্ড",   "url": "https://comillaboard.portal.gov.bd"},
    {"id": "barisal",    "name": "বরিশাল শিক্ষা বোর্ড",     "url": "https://barisalboard.portal.gov.bd"},
    {"id": "jessore",    "name": "যশোর শিক্ষা বোর্ড",       "url": "https://jessoreboard.gov.bd"},
    {"id": "dinajpur",   "name": "দিনাজপুর শিক্ষা বোর্ড",  "url": "https://dinajpureducationboard.gov.bd"},
    {"id": "mymensingh", "name": "ময়মনসিংহ শিক্ষা বোর্ড",  "url": "https://myaborad.gov.bd"},
    {"id": "madrasah",   "name": "মাদ্রাসা শিক্ষা বোর্ড",  "url": "https://bmeb.gov.bd"},
    {"id": "technical",  "name": "কারিগরি শিক্ষা বোর্ড",   "url": "https://bteb.gov.bd"},
]


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def fetch(url: str):
    """Fetch a URL and return a BeautifulSoup object, or None on failure."""
    try:
        log.info("Fetching: %s", url)
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, "lxml")
    except Exception as exc:
        log.warning("Failed to fetch %s: %s", url, exc)
        return None


def clean_text(text: str) -> str:
    """Strip whitespace and remove redundant newlines."""
    return re.sub(r"\s+", " ", text).strip()


# ---------------------------------------------------------------------------
# Scrapers
# ---------------------------------------------------------------------------

def scrape_headlines(source: dict) -> list:
    """
    Scrape headline texts from a news source.
    Returns list of dicts compatible with eduData.latestNews format.
    """
    soup = fetch(source["url"])
    if not soup:
        return []

    results = []
    seen_titles: set = set()

    for tag in soup.select(source.get("selector", "h2, h3"))[:MAX_HEADLINES_PER_SOURCE]:
        title = clean_text(tag.get_text())
        if not title or len(title) < 10 or title in seen_titles:
            continue
        seen_titles.add(title)

        # Find nearest <a> for the link
        link_tag = tag.find("a") or tag.find_parent("a")
        href = ""
        if link_tag and link_tag.get("href"):
            href = link_tag["href"]
            if not href.startswith("http"):
                href = source["url"].rstrip("/") + "/" + href.lstrip("/")

        results.append({
            "category": source.get("category", "শিক্ষা"),
            "title": title,
            "summary": title,
            "source": source.get("source_key", source["name"]),
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "link": href or source["url"],
            "views": 0,
            "year": CURRENT_YEAR,
        })

    log.info("  -> %d headlines from %s", len(results), source["name"])
    return results


def scrape_board_notices(board: dict) -> list:
    """
    Scrape PDF/notice links from an education board website.
    Returns list of dicts for eduData.boards[].pdfLinks format.
    """
    soup = fetch(board["url"])
    if not soup:
        return []

    results = []
    seen_urls: set = set()

    for a_tag in soup.find_all("a", href=True)[:MAX_BOARD_LINKS_TO_EXAMINE]:
        href = a_tag["href"]
        title = clean_text(a_tag.get_text())

        if not title or len(title) < 5:
            continue

        is_pdf = href.lower().endswith(".pdf")
        is_notice_url = any(
            kw in href.lower()
            for kw in ["notice", "routine", "result", "circular", "notification"]
        )
        is_relevant = any(
            kw in title.lower()
            for kw in ["ssc", "hsc", "routine", "result", "notice", "circular",
                       "রুটিন", "ফলাফল", "বিজ্ঞপ্তি", "ভর্তি", "পরীক্ষা"]
        )

        if not (is_pdf or is_notice_url or is_relevant):
            continue

        if not href.startswith("http"):
            href = board["url"].rstrip("/") + "/" + href.lstrip("/")

        if href in seen_urls:
            continue
        seen_urls.add(href)

        category = "নোটিশ"
        if "routine" in href.lower() or "রুটিন" in title:
            category = "রুটিন"
        elif "result" in href.lower() or "ফলাফল" in title:
            category = "ফলাফল"
        elif is_pdf:
            category = "পিডিএফ"

        results.append({
            "title": title,
            "url": href,
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "category": category,
            "year": CURRENT_YEAR,
        })

    log.info("  -> %d notices from %s", len(results), board["name"])
    return results[:10]


def scrape_govt_notices(source: dict) -> list:
    """
    Scrape government notices from a government website.
    Returns list of dicts for eduData.governmentNotices format.
    """
    soup = fetch(source["url"])
    if not soup:
        return []

    results = []
    seen_titles: set = set()

    for tag in soup.select(source.get("selector", "h2, h3, li a"))[:MAX_NOTICES_PER_SOURCE]:
        title = clean_text(tag.get_text())
        if not title or len(title) < 10 or title in seen_titles:
            continue
        seen_titles.add(title)

        link_tag = tag if tag.name == "a" else (tag.find("a") or tag.find_parent("a"))
        href = source["url"]
        if link_tag and link_tag.get("href"):
            href = link_tag["href"]
            if not href.startswith("http"):
                href = source["url"].rstrip("/") + "/" + href.lstrip("/")

        results.append({
            "title": title,
            "sourceUrl": href,
            "date": datetime.now(timezone.utc).strftime("%B %Y"),
            "year": CURRENT_YEAR,
            "description": title,
            "source": source.get("source_key", source["name"]),
        })

    log.info("  -> %d notices from %s", len(results), source["name"])
    return results[:10]


# ---------------------------------------------------------------------------
# Load / Save js/data.js
# ---------------------------------------------------------------------------

def load_existing_data() -> dict:
    """
    Parse js/data.js and return its content as a Python dict.
    Tries Node.js first (most reliable), then falls back to regex+JSON.
    """
    abs_path = str(DATA_JS_PATH.resolve())

    # Strategy 1: use Node.js to serialize the file properly
    try:
        node_script = (
            f"const d = require({json.dumps(abs_path)}); "
            "console.log(JSON.stringify(d));"
        )
        result = subprocess.run(
            ["node", "-e", node_script],
            capture_output=True, text=True, timeout=30,
            cwd=str(REPO_ROOT),
        )
        if result.returncode == 0 and result.stdout.strip():
            log.info("Parsed data.js via Node.js")
            return json.loads(result.stdout.strip())
        log.warning("Node.js parse returned non-zero: %s", result.stderr[:200])
    except FileNotFoundError:
        log.info("Node.js not available; falling back to regex parser")
    except Exception as exc:
        log.warning("Node.js parse error: %s", exc)

    # Strategy 2: regex + JSON (works after first write, which produces valid JSON)
    raw = DATA_JS_PATH.read_text(encoding="utf-8")

    # Find the object literal assigned to eduData
    match = re.search(r"const\s+eduData\s*=\s*(\{[\s\S]+\})\s*;", raw)
    if not match:
        log.error("Could not locate eduData object in %s", DATA_JS_PATH)
        return {}

    js_obj = match.group(1)
    # Strip single-line JS comments
    js_obj = re.sub(r"//[^\n]*", "", js_obj)
    # Remove trailing commas before } or ]
    js_obj = re.sub(r",(\s*[}\]])", r"\1", js_obj)
    # Quote unquoted object keys (e.g. breakingNews: -> "breakingNews":)
    # Exclude JSON reserved literals: true, false, null
    js_obj = re.sub(
        r'(?<!["\w])(?!true\b)(?!false\b)(?!null\b)([a-zA-Z_][a-zA-Z0-9_]*)\s*:',
        r'"\1":',
        js_obj,
    )
    # Remove duplicate quotes introduced above (e.g. ""key"":)
    js_obj = re.sub(r'""([^"]+)"":', r'"\1":', js_obj)

    try:
        return json.loads(js_obj)
    except json.JSONDecodeError as exc:
        log.error("JSON parse failed: %s — cannot safely proceed.", exc)
        return {}


def save_data(data: dict) -> None:
    """Write the updated eduData back to js/data.js."""
    json_str = json.dumps(data, ensure_ascii=False, indent=2)

    content = (
        "// EduBD - Bangladesh Education Portal - Data\n"
        "// Auto-updated by scripts/update_data.py — do not edit manually.\n"
        f"const eduData = {json_str};\n\n"
        "// Make data available globally\n"
        "if (typeof module !== 'undefined' && module.exports) {\n"
        "  module.exports = eduData;\n"
        "}\n"
    )

    DATA_JS_PATH.write_text(content, encoding="utf-8")
    log.info("Wrote updated data to %s", DATA_JS_PATH)


# ---------------------------------------------------------------------------
# Merge helpers
# ---------------------------------------------------------------------------

def next_id(items: list) -> int:
    existing = [item.get("id", 0) for item in items if isinstance(item.get("id"), int)]
    return (max(existing) + 1) if existing else 1


def merge_news(existing: list, new_items: list) -> list:
    """Prepend new news items, deduplicated by title. Keeps at most 50."""
    existing_titles = {item.get("title", "") for item in existing}
    nid = next_id(existing)
    added = 0
    for item in new_items:
        if item["title"] not in existing_titles:
            item["id"] = nid
            nid += 1
            existing.insert(0, item)
            existing_titles.add(item["title"])
            added += 1
    log.info("  merged %d new news items (total %d)", added, len(existing))
    return existing[:50]


def merge_notices(existing: list, new_items: list) -> list:
    """Prepend new notices, deduplicated by title. Keeps at most 30."""
    existing_titles = {item.get("title", "") for item in existing}
    nid = next_id(existing)
    added = 0
    for item in new_items:
        if item["title"] not in existing_titles:
            item["id"] = nid
            nid += 1
            existing.insert(0, item)
            existing_titles.add(item["title"])
            added += 1
    log.info("  merged %d new notices (total %d)", added, len(existing))
    return existing[:30]


def merge_board_links(boards: list, board_id: str, new_links: list) -> list:
    """Merge new PDF/notice links into the matching board entry."""
    for board in boards:
        if board.get("id") == board_id:
            existing = board.setdefault("pdfLinks", [])
            existing_urls = {lnk.get("url", lnk.get("href", "")) for lnk in existing}
            added = 0
            for lnk in new_links:
                url = lnk.get("url", lnk.get("href", ""))
                if url and url not in existing_urls:
                    existing.insert(0, lnk)
                    existing_urls.add(url)
                    added += 1
            board["pdfLinks"] = existing[:10]
            if added:
                log.info("  added %d links to board %s", added, board_id)
            break
    return boards


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    log.info("=== EduBD Auto-Update started ===")

    data = load_existing_data()
    if not data:
        log.error("Could not load existing data — aborting to avoid data loss.")
        return 1

    # ------------------------------------------------------------------
    # 1. News sources
    # ------------------------------------------------------------------
    log.info("--- Scraping news sources ---")
    all_news: list = []
    for source in NEWS_SOURCES:
        try:
            items = scrape_headlines(source)
            all_news.extend(items)
        except Exception as exc:
            log.warning("Error scraping %s: %s", source["name"], exc)
        time.sleep(REQUEST_DELAY)

    if all_news:
        data["latestNews"] = merge_news(data.get("latestNews", []), all_news)
        # Refresh breaking-news ticker with the freshest headlines
        new_breaking = [item["title"] for item in all_news[:5]]
        existing_breaking = data.get("breakingNews", [])
        for headline in new_breaking:
            if headline not in existing_breaking:
                existing_breaking.insert(0, headline)
        data["breakingNews"] = existing_breaking[:15]

    # ------------------------------------------------------------------
    # 2. Government / notice sources
    # ------------------------------------------------------------------
    log.info("--- Scraping government sources ---")
    all_notices: list = []
    for source in GOVT_SOURCES:
        try:
            items = scrape_govt_notices(source)
            all_notices.extend(items)
        except Exception as exc:
            log.warning("Error scraping %s: %s", source["name"], exc)
        time.sleep(REQUEST_DELAY)

    if all_notices:
        data["governmentNotices"] = merge_notices(
            data.get("governmentNotices", []), all_notices
        )

    # ------------------------------------------------------------------
    # 3. Education boards
    # ------------------------------------------------------------------
    log.info("--- Scraping education boards ---")
    for board_cfg in BOARD_SOURCES:
        try:
            new_links = scrape_board_notices(board_cfg)
            if new_links and data.get("boards"):
                data["boards"] = merge_board_links(
                    data["boards"], board_cfg["id"], new_links
                )
        except Exception as exc:
            log.warning("Error scraping board %s: %s", board_cfg["name"], exc)
        time.sleep(REQUEST_DELAY)

    # ------------------------------------------------------------------
    # 4. Set lastUpdated and save
    # ------------------------------------------------------------------
    data["lastUpdated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    log.info("lastUpdated = %s", data["lastUpdated"])

    save_data(data)
    log.info("=== EduBD Auto-Update complete ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
