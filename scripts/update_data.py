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
from urllib.parse import urlparse

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger(__name__)

try:
    import trafilatura
    _TRAFILATURA_AVAILABLE = True
except ImportError:  # pragma: no cover
    _TRAFILATURA_AVAILABLE = False
    log.warning("trafilatura not installed — scholarship text extraction will use BeautifulSoup fallback")

try:
    from ddgs import DDGS
    _DDGS_AVAILABLE = True
except ImportError:
    try:
        from duckduckgo_search import DDGS
        _DDGS_AVAILABLE = True
    except ImportError:  # pragma: no cover
        _DDGS_AVAILABLE = False
        log.warning("duckduckgo-search not installed — scholarship scraping will be skipped")

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
MIN_TITLE_LEN = 5                # minimum meaningful title length

CURRENT_YEAR = str(datetime.now(timezone.utc).year)

# ---------------------------------------------------------------------------
# Scholarship scraper configuration
# ---------------------------------------------------------------------------

# Map English country names to (Bengali name, flag emoji) for data.js schema
COUNTRY_TO_BENGALI = {
    "USA": ("যুক্তরাষ্ট্র", "🇺🇸"),
    "United States": ("যুক্তরাষ্ট্র", "🇺🇸"),
    "UK": ("যুক্তরাজ্য", "🇬🇧"),
    "United Kingdom": ("যুক্তরাজ্য", "🇬🇧"),
    "Canada": ("কানাডা", "🇨🇦"),
    "Australia": ("অস্ট্রেলিয়া", "🇦🇺"),
    "Germany": ("জার্মানি", "🇩🇪"),
    "France": ("ফ্রান্স", "🇫🇷"),
    "Netherlands": ("নেদারল্যান্ডস", "🇳🇱"),
    "Sweden": ("সুইডেন", "🇸🇪"),
    "Italy": ("ইতালি", "🇮🇹"),
    "Japan": ("জাপান", "🇯🇵"),
    "China": ("চীন", "🇨🇳"),
    "Turkey": ("তুরস্ক", "🇹🇷"),
    "Hungary": ("হাঙ্গেরি", "🇭🇺"),
    "New Zealand": ("নিউজিল্যান্ড", "🇳🇿"),
    "Ireland": ("আয়ারল্যান্ড", "🇮🇪"),
    "Belgium": ("বেলজিয়াম", "🇧🇪"),
    "Denmark": ("ডেনমার্ক", "🇩🇰"),
    "Finland": ("ফিনল্যান্ড", "🇫🇮"),
    "Norway": ("নরওয়ে", "🇳🇴"),
    "South Korea": ("দক্ষিণ কোরিয়া", "🇰🇷"),
    "Singapore": ("সিঙ্গাপুর", "🇸🇬"),
    "Austria": ("অস্ট্রিয়া", "🇦🇹"),
    "Switzerland": ("সুইজারল্যান্ড", "🇨🇭"),
    "Spain": ("স্পেন", "🇪🇸"),
}

# Trusted domains for scholarship pages
TARGET_SCHOLARSHIP_DOMAINS = [
    "scholarships.com",
    "scholarshipportal.com",
    "opportunitiescorners.com",
    "daad.de",
    "chevening.org",
    "fulbright.org",
    "studyin-canada.com",
    "mastersportal.com",
    "topuniversities.com",
]

# Countries to search for in scholarship pages
SCHOLARSHIP_COUNTRIES = list(COUNTRY_TO_BENGALI.keys())

# Search queries for DuckDuckGo scholarship search
SCHOLARSHIP_QUERIES = [
    "international students scholarship 2026",
    "Bangladesh students scholarship 2026",
    "scholarship for Bangladeshi students 2026 2027",
    "fully funded scholarship masters PhD 2026",
    "government scholarship developing countries 2026",
]

_MONTHS_PATTERN = (
    "january|february|march|april|may|june|july|august|"
    "september|october|november|december|"
    "jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec"
)

SCHOLARSHIP_DATE_PATTERNS = [
    (
        r"\b(?:deadline|application deadline|last date|closing date|apply by|"
        r"applications close|deadline to apply)\b[:\s\-]*([A-Za-z0-9,\-/ ]{4,40})"
    ),
    rf"\b((?:{_MONTHS_PATTERN})\s+\d{{1,2}},?\s+\d{{4}})\b",
    r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b",
    r"\b(\d{4}-\d{2}-\d{2})\b",
]

WHO_CAN_APPLY_HINTS = [
    "who can apply", "eligibility", "eligible applicants", "eligibility criteria",
    "requirements", "applicants must", "open to", "available for",
    "international students", "undergraduate", "master", "phd", "doctoral",
]

MAX_SCHOLARSHIPS_TOTAL = 50   # cap on total scholarships kept in data.js
SCHOLARSHIP_REQUEST_DELAY = 1.5  # polite delay between scholarship page requests
MAX_ELIGIBILITY_LENGTH = 300     # max chars stored in the eligibility field
MAX_DESCRIPTION_ELIGIBILITY_LENGTH = 200  # max eligibility chars in description

# News sources — use URL-pattern selectors to grab real article links
NEWS_SOURCES = [
    {
        "name": "The Daily Star",
        "url": "https://www.thedailystar.net/education",
        "source_key": "The Daily Star",
        "category": "শিক্ষা",
        "selector": "a[href*='/education/']",
        "base_url": "https://www.thedailystar.net",
    },
    {
        "name": "Prothom Alo",
        "url": "https://www.prothomalo.com/education",
        "source_key": "প্রথম আলো",
        "category": "শিক্ষা",
        "selector": "a[href*='/education/']",
        "base_url": "https://www.prothomalo.com",
    },
    {
        "name": "BD News 24",
        "url": "https://bdnews24.com/education",
        "source_key": "বিডি নিউজ ২৪",
        "category": "শিক্ষা",
        "selector": "a[href*='/education/'], a[href*='/education-']",
        "base_url": "https://bdnews24.com",
    },
    {
        "name": "Bangla Tribune",
        "url": "https://www.banglatribune.com/education",
        "source_key": "বাংলা ট্রিবিউন",
        "category": "শিক্ষা",
        "selector": "a[href*='/education/']",
        "base_url": "https://www.banglatribune.com",
    },
]

# Government / official notice sources — use URL-pattern selectors for real notice links
GOVT_SOURCES = [
    {
        "name": "Dhaka Education Board",
        "url": "https://dhakaeducationboard.portal.gov.bd",
        "source_key": "dhakaeducationboard.portal.gov.bd",
        "category": "ঢাকা শিক্ষা বোর্ড",
        "selector": "a[href*='/pages/notices/']",
        "base_url": "https://dhakaeducationboard.portal.gov.bd",
    },
    {
        "name": "SHED",
        "url": "https://shed.gov.bd",
        "source_key": "shed.gov.bd",
        "category": "সরকারি বিজ্ঞপ্তি",
        "selector": "a[href*='/pages/notices/'], a[href*='/pages/notice'], a[href*='notice']",
        "base_url": "https://shed.gov.bd",
    },
    {
        "name": "SHED Scholarships",
        "url": "https://shed.gov.bd/pages/moedu-scholarships",
        "source_key": "shed.gov.bd",
        "category": "বৃত্তি",
        "selector": "a[href*='/pages/']",
        "base_url": "https://shed.gov.bd",
    },
    {
        "name": "MoEdu",
        "url": "https://moedu.gov.bd",
        "source_key": "moedu.gov.bd",
        "category": "সরকারি বিজ্ঞপ্তি",
        "selector": "a[href*='notice'], a[href*='/pages/']",
        "base_url": "https://moedu.gov.bd",
    },
    {
        "name": "Education Board",
        "url": "https://educationboard.gov.bd",
        "source_key": "educationboard.gov.bd",
        "category": "শিক্ষা বোর্ড",
        "selector": "a[href*='result'], a[href*='notice']",
        "base_url": "https://educationboard.gov.bd",
    },
    {
        "name": "DGME",
        "url": "https://dgme.gov.bd/pages/notices",
        "source_key": "dgme.gov.bd",
        "category": "মেডিকেল শিক্ষা",
        "selector": "a[href*='/pages/notices'], a[href*='notice']",
        "base_url": "https://dgme.gov.bd",
    },
    {
        "name": "National University",
        "url": "https://www.nu.ac.bd",
        "source_key": "nu.ac.bd",
        "category": "জাতীয় বিশ্ববিদ্যালয়",
        "selector": "a[href*='uploads/notices']",
        "base_url": "https://www.nu.ac.bd",
    },
]

# All education boards — specific selectors target real notice/circular links
BOARD_SOURCES = [
    {"id": "dhaka",      "name": "ঢাকা শিক্ষা বোর্ড",       "url": "https://dhakaeducationboard.portal.gov.bd",  "selector": "a[href*='/pages/notices/'], a[href*='.pdf']"},
    {"id": "rajshahi",   "name": "রাজশাহী শিক্ষা বোর্ড",    "url": "https://rajshahieducationboard.gov.bd",      "selector": "a[href*='notice'], a[href*='circular'], a[href*='.pdf']"},
    {"id": "chittagong", "name": "চট্টগ্রাম শিক্ষা বোর্ড",  "url": "https://bise-ctg.portal.gov.bd",             "selector": "a[href*='/pages/notices/'], a[href*='.pdf']"},
    {"id": "sylhet",     "name": "সিলেট শিক্ষা বোর্ড",      "url": "https://sylheteducationboard.gov.bd",        "selector": "a[href*='notice'], a[href*='circular'], a[href*='.pdf']"},
    {"id": "comilla",    "name": "কুমিল্লা শিক্ষা বোর্ড",   "url": "https://comillaboard.portal.gov.bd",         "selector": "a[href*='/pages/notices/'], a[href*='.pdf']"},
    {"id": "barisal",    "name": "বরিশাল শিক্ষা বোর্ড",     "url": "https://barisalboard.portal.gov.bd",         "selector": "a[href*='/pages/notices/'], a[href*='.pdf']"},
    {"id": "jessore",    "name": "যশোর শিক্ষা বোর্ড",       "url": "https://jessoreboard.gov.bd",                "selector": "a[href*='notice'], a[href*='circular'], a[href*='.pdf']"},
    {"id": "dinajpur",   "name": "দিনাজপুর শিক্ষা বোর্ড",  "url": "https://dinajpureducationboard.gov.bd",      "selector": "a[href*='notice'], a[href*='circular'], a[href*='.pdf']"},
    {"id": "mymensingh", "name": "ময়মনসিংহ শিক্ষা বোর্ড",  "url": "https://myaborad.gov.bd",                    "selector": "a[href*='notice'], a[href*='circular'], a[href*='.pdf']"},
    {"id": "madrasah",   "name": "মাদ্রাসা শিক্ষা বোর্ড",  "url": "https://bmeb.gov.bd",                        "selector": "a[href*='notice'], a[href*='circular'], a[href*='.pdf']"},
    {"id": "technical",  "name": "কারিগরি শিক্ষা বোর্ড",   "url": "https://bteb.gov.bd",                        "selector": "a[href*='notice'], a[href*='circular'], a[href*='.pdf']"},
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
    Scrape headline links from a news source using source-specific selectors.
    When the selector targets <a> tags directly (e.g. a[href*='/education/']),
    href and text are extracted from the tag itself; otherwise the nearest <a>
    ancestor/descendant is used.  Deduplicates by URL.
    Returns list of dicts compatible with eduData.latestNews format.
    """
    soup = fetch(source["url"])
    if not soup:
        return []

    results = []
    seen_urls: set = set()
    base_url = source.get("base_url", source["url"].rstrip("/"))

    for tag in soup.select(source.get("selector", "h2, h3"))[:MAX_HEADLINES_PER_SOURCE]:
        # When the selector already targets <a> tags, use them directly
        if tag.name == "a":
            href = tag.get("href", "")
            title = clean_text(tag.get_text())
        else:
            title = clean_text(tag.get_text())
            link_tag = tag.find("a") or tag.find_parent("a")
            href = link_tag["href"] if link_tag and link_tag.get("href") else ""

        if not title or len(title) < MIN_TITLE_LEN:
            continue

        if not href:
            href = source["url"]
        elif not href.startswith("http"):
            href = base_url.rstrip("/") + "/" + href.lstrip("/")

        if href in seen_urls:
            continue
        seen_urls.add(href)

        results.append({
            "category": source.get("category", "শিক্ষা"),
            "title": title,
            "summary": title,
            "source": source.get("source_key", source["name"]),
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "link": href,
            "views": 0,
            "year": CURRENT_YEAR,
        })

    log.info("  -> %d headlines from %s", len(results), source["name"])
    return results[:10]


def scrape_board_notices(board: dict) -> list:
    """
    Scrape PDF/notice links from an education board website.
    Uses the board-specific selector (e.g. a[href*='/pages/notices/'], a[href*='.pdf'])
    when provided; otherwise falls back to examining all <a> tags with keyword filtering.
    Returns list of dicts for eduData.boards[].pdfLinks format.
    """
    soup = fetch(board["url"])
    if not soup:
        return []

    results = []
    seen_urls: set = set()
    base_url = board.get("base_url", board["url"].rstrip("/"))

    selector = board.get("selector")
    if selector:
        candidates = soup.select(selector)[:MAX_BOARD_LINKS_TO_EXAMINE]
    else:
        candidates = soup.find_all("a", href=True)[:MAX_BOARD_LINKS_TO_EXAMINE]

    for tag in candidates:
        # Resolve <a> tag whether selected directly or via generic find_all
        if tag.name == "a":
            href = tag.get("href", "")
            title = clean_text(tag.get_text())
        else:
            link_tag = tag.find("a") or tag.find_parent("a")
            href = link_tag["href"] if link_tag and link_tag.get("href") else ""
            title = clean_text(tag.get_text())

        if not title or len(title) < MIN_TITLE_LEN:
            continue

        # When no explicit selector was given, apply the old relevance filter
        if not selector:
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

        if not href:
            continue
        if not href.startswith("http"):
            href = base_url.rstrip("/") + "/" + href.lstrip("/")

        if href in seen_urls:
            continue
        seen_urls.add(href)

        category = "নোটিশ"
        if "routine" in href.lower() or "রুটিন" in title:
            category = "রুটিন"
        elif "result" in href.lower() or "ফলাফল" in title:
            category = "ফলাফল"
        elif href.lower().endswith(".pdf"):
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
    Scrape government notices from a government website using source-specific selectors.
    When the selector targets <a> tags (e.g. a[href*='/pages/notices/']), href and text
    are extracted directly.  Deduplicates by URL.
    Returns list of dicts for eduData.governmentNotices format.
    """
    soup = fetch(source["url"])
    if not soup:
        return []

    results = []
    seen_urls: set = set()
    base_url = source.get("base_url", source["url"].rstrip("/"))

    for tag in soup.select(source.get("selector", "a[href*='notice']"))[:MAX_NOTICES_PER_SOURCE]:
        if tag.name == "a":
            href = tag.get("href", "")
            title = clean_text(tag.get_text())
        else:
            title = clean_text(tag.get_text())
            link_tag = tag.find("a") or tag.find_parent("a")
            href = link_tag["href"] if link_tag and link_tag.get("href") else ""

        if not title or len(title) < MIN_TITLE_LEN:
            continue

        if not href:
            href = source["url"]
        elif not href.startswith("http"):
            href = base_url.rstrip("/") + "/" + href.lstrip("/")

        if href in seen_urls:
            continue
        seen_urls.add(href)

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
# Scholarship scraper
# ---------------------------------------------------------------------------

def _normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _scholarship_search_urls(query: str, max_results: int = 20) -> list:
    """Use DuckDuckGo to search for scholarship URLs on trusted domains."""
    if not _DDGS_AVAILABLE:
        return []
    urls = []
    try:
        with DDGS() as ddgs:
            results = ddgs.text(query, max_results=max_results)
            for r in results:
                url = r.get("href") or r.get("url")
                if not url:
                    continue
                domain = urlparse(url).netloc.lower()
                if any(site in domain for site in TARGET_SCHOLARSHIP_DOMAINS):
                    urls.append(url)
    except Exception as exc:
        log.warning("DuckDuckGo search failed for query '%s': %s", query, exc)
    return list(dict.fromkeys(urls))


def _fetch_scholarship_html(url: str) -> str:
    """Fetch raw HTML from a scholarship page."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return resp.text
    except Exception as exc:
        log.warning("Failed to fetch scholarship page %s: %s", url, exc)
        return ""


def _extract_clean_text(html: str, url: str) -> str:
    """Extract clean text from HTML using trafilatura or BeautifulSoup fallback."""
    if _TRAFILATURA_AVAILABLE:
        try:
            extracted = trafilatura.extract(
                html, url=url, include_comments=False,
                include_tables=True, favor_precision=True,
            )
            if extracted:
                return extracted
        except Exception:
            pass
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    return soup.get_text("\n", strip=True)


def _find_scholarship_name(soup: BeautifulSoup, text: str) -> str:
    if soup.title and soup.title.text.strip():
        title = soup.title.text.strip()
        title = re.split(r"\||\-", title)[0].strip()
        if len(title) > 5:
            return title
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    for line in lines[:10]:
        if 5 < len(line) < 160:
            return line
    return "Not found"


def _find_country(text: str) -> str:
    for country in SCHOLARSHIP_COUNTRIES:
        if re.search(rf"\b{re.escape(country)}\b", text, flags=re.I):
            return country
    return "Not found"


def _find_last_date(text: str) -> str:
    for pattern in SCHOLARSHIP_DATE_PATTERNS:
        match = re.search(pattern, text, flags=re.I)
        if match:
            value = match.group(1).strip(" .,:;")
            return value
    return "Not found"


def _extract_relevant_sentences(text: str, keywords: list, max_sentences: int = 3) -> str:
    sentences = re.split(r"(?<=[.!?])\s+", text)
    picked = []
    for sentence in sentences:
        s = _normalize_whitespace(sentence)
        if any(k.lower() in s.lower() for k in keywords):
            if 20 <= len(s) <= 300:
                picked.append(s)
        if len(picked) >= max_sentences:
            break
    return " ".join(picked) if picked else "Not found"


def _find_who_can_apply(text: str) -> str:
    result = _extract_relevant_sentences(text, WHO_CAN_APPLY_HINTS, max_sentences=4)
    if result != "Not found":
        return result
    lines = text.splitlines()
    candidates = []
    for line in lines:
        line_clean = _normalize_whitespace(line)
        if any(k in line_clean.lower() for k in WHO_CAN_APPLY_HINTS):
            if 20 <= len(line_clean) <= 350:
                candidates.append(line_clean)
        if len(candidates) >= 3:
            break
    return " ".join(candidates) if candidates else "Not found"


def _extract_scholarship_record(url: str) -> dict:
    """Scrape a single scholarship page and return a raw record dict."""
    html = _fetch_scholarship_html(url)
    if not html:
        return {}
    try:
        soup = BeautifulSoup(html, "lxml")
        text = _extract_clean_text(html, url)
        if not text or len(text) < 200:
            return {}
        return {
            "Scholarship Name": _find_scholarship_name(soup, text),
            "Country": _find_country(text),
            "Who can apply": _find_who_can_apply(text),
            "last date": _find_last_date(text),
            "Source URL": url,
        }
    except Exception as exc:
        log.warning("Failed to parse scholarship page %s: %s", url, exc)
        return {}


def _infer_level(who_can_apply: str) -> str:
    text_lower = who_can_apply.lower()
    if "phd" in text_lower or "doctoral" in text_lower:
        return "পিএইচডি"
    if "master" in text_lower or "postgrad" in text_lower:
        return "মাস্টার্স"
    if "undergraduate" in text_lower or "bachelor" in text_lower:
        return "স্নাতক"
    return "মাস্টার্স/পিএইচডি"


def _map_scholarship_to_schema(record: dict, new_id: int) -> dict:
    """Convert a raw scraped record to the data.js scholarships schema."""
    country_en = record.get("Country", "Not found")
    bengali_name, flag = COUNTRY_TO_BENGALI.get(country_en, ("আন্তর্জাতিক", "🌍"))

    name = record.get("Scholarship Name", "Unknown Scholarship")
    eligibility = record.get("Who can apply", "")
    if eligibility == "Not found":
        eligibility = "আন্তর্জাতিক শিক্ষার্থীদের জন্য"
    source_url = record.get("Source URL", "")
    deadline_raw = record.get("last date", "Not found")
    deadline = deadline_raw if deadline_raw != "Not found" else f"{CURRENT_YEAR}-12-31"

    return {
        "id": new_id,
        "name": name,
        "country": bengali_name,
        "flag": flag,
        "type": "সম্পূর্ণ বৃত্তি",
        "level": _infer_level(eligibility),
        "amount": "বিস্তারিত দেখুন",
        "deadline": deadline,
        "deadlineDisplay": deadline_raw if deadline_raw != "Not found" else "বিস্তারিত দেখুন",
        "eligibility": eligibility[:MAX_ELIGIBILITY_LENGTH] if eligibility else "আন্তর্জাতিক শিক্ষার্থীদের জন্য",
        "link": source_url,
        "description": f"{name}. {eligibility[:MAX_DESCRIPTION_ELIGIBILITY_LENGTH]}" if eligibility else name,
        "benefits": [],
        "requirements": [],
        "applicationProcess": "অনলাইনে আবেদন করুন",
        "numberOfAwards": "বিস্তারিত দেখুন",
        "duration": "বিস্তারিত দেখুন",
        "website": source_url,
        "year": CURRENT_YEAR,
    }


def scrape_scholarships() -> list:
    """
    Search DuckDuckGo for scholarship pages on trusted domains,
    scrape each page, and return a list of scholarship dicts
    in the data.js schema format.
    """
    if not _DDGS_AVAILABLE:
        log.warning("Skipping scholarship scraping — duckduckgo-search not available")
        return []

    log.info("--- Scraping scholarships via DuckDuckGo ---")
    all_urls: list = []
    for query in SCHOLARSHIP_QUERIES:
        urls = _scholarship_search_urls(query, max_results=15)
        log.info("  Query '%s' → %d URLs", query, len(urls))
        all_urls.extend(urls)
        time.sleep(REQUEST_DELAY)

    # Deduplicate URLs
    all_urls = list(dict.fromkeys(all_urls))
    log.info("  Total unique scholarship URLs found: %d", len(all_urls))

    raw_records = []
    for url in all_urls:
        record = _extract_scholarship_record(url)
        if record:
            raw_records.append(record)
        time.sleep(SCHOLARSHIP_REQUEST_DELAY)

    # Filter to only actual scholarship entries (mirrors user's filter logic)
    filtered = [
        r for r in raw_records
        if re.search(
            r"scholar|fellowship|grant|award|bursary",
            r.get("Scholarship Name", ""),
            flags=re.I,
        )
        or re.search(
            r"international|undergraduate|master|phd|doctoral",
            r.get("Who can apply", ""),
            flags=re.I,
        )
    ]

    # Deduplicate by name + URL
    seen = set()
    deduped = []
    for r in filtered:
        key = (r.get("Scholarship Name", "").lower(), r.get("Source URL", ""))
        if key not in seen:
            seen.add(key)
            deduped.append(r)

    log.info("  Scraped %d scholarship records (after filter+dedup)", len(deduped))
    return deduped


def merge_scholarships(existing: list, scraped_records: list) -> list:
    """
    Merge newly scraped scholarships with existing ones.
    Deduplicates by lowercased scholarship name.
    Keeps existing manually curated entries and adds new ones at the end.
    Limits total to MAX_SCHOLARSHIPS_TOTAL.
    """
    existing_names = {item.get("name", "").lower() for item in existing}
    nid = next_id(existing)
    added = 0

    for record in scraped_records:
        name_lower = record.get("Scholarship Name", "").lower()
        if not name_lower or name_lower == "not found":
            continue
        # Skip if a scholarship with this name already exists
        if name_lower in existing_names:
            continue
        scholarship = _map_scholarship_to_schema(record, nid)
        existing.append(scholarship)
        existing_names.add(name_lower)
        nid += 1
        added += 1

    log.info("  merged %d new scholarships (total %d)", added, len(existing))
    return existing[:MAX_SCHOLARSHIPS_TOTAL]


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
    # 4. Scholarships (DuckDuckGo + trafilatura)
    # ------------------------------------------------------------------
    log.info("--- Scraping scholarships ---")
    try:
        scraped_records = scrape_scholarships()
        if scraped_records:
            data["scholarships"] = merge_scholarships(
                data.get("scholarships", []), scraped_records
            )
    except Exception as exc:
        log.warning("Error in scholarship scraping: %s", exc)

    # ------------------------------------------------------------------
    # 5. Set lastUpdated and save
    # ------------------------------------------------------------------
    data["lastUpdated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    log.info("lastUpdated = %s", data["lastUpdated"])

    save_data(data)
    log.info("=== EduBD Auto-Update complete ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
