# Data Source Registry — article-engine-template

**Purpose:** Canonical, build-ready list of data sources for the pipeline (data ingestion → ideation → scorer → article writer, orchestrated by a Claude developer API key on rails).

**Audience the blog serves:** [AUDIENCE] — the everyday reader/practitioner in your field, NOT [FIELD] experts. Two pillars:
1. Broad [FIELD] topics from a practical, decision-making standpoint.
2. Yourniche-specific [FIELD] topics from the reader's standpoint (the niche moat — the questions that only have a good answer for your specific niche/jurisdiction).

**Use is COMMERCIAL** (monetized blog) — "free for non-commercial/personal use only" sources are traps, not wins.

**Verification date:** June 2026. ⚠️ All ToS/pricing/rate limits are time-sensitive — re-verify any GREEN/YELLOW source before relying on it in production.

---

## Legend

**Signal types:**
- (a) trending questions / pain points
- (b) keyword / search demand
- (c) authoritative grounding
- (d) regulatory / news changes

**Roles:**
- BACKBONE — primary idea engine (real reader questions + demand)
- CHANGE — regulatory-change idea stream ("what changed that affects the reader")
- GROUND — fact-check layer so the writer doesn't get the facts wrong

**Verdicts:**
- 🟢 GREEN — free + ToS clearly permits commercial automated use
- 🟡 YELLOW — free but restricted/ambiguous (commercial, storage, consume-only, or unofficial)
- 🔴 RED — paid or prohibited; do not build on it

---

## 🟢 BACKBONE — reader-question / demand sources

### Stack Exchange API — 🟢 GREEN (the backbone)
- **Endpoint:** `https://api.stackexchange.com/2.3/` — `/questions`, `/search/advanced` · sites: pick the Stack Exchange sites relevant to your field
- **Auth:** free API key (register at stackapps.com); no OAuth for reads
- **Limits:** 10,000 req/day with key (300 without); ~30 req/sec backoff
- **Returns:** question title, body, tags, score, view_count, answer_count, creation_date, links
- **Signals:** (a) questions + (b) view_count/score = demand
- **License/ToS:** content CC BY-SA 4.0 — attribution + share-alike required if quoted; commercial use OK
- **Role:** BACKBONE
- **Catch:** must attribute. NOTE: the separate bulk *Data Dump* is RED (see below) — use the API, not the dump.

### Google Autocomplete — 🟡 YELLOW
- **Endpoint:** `https://suggestqueries.google.com/complete/search?client=firefox&q=` (or `https://www.google.com/complete/search?client=chrome&q=`)
- **Auth:** none · **Limits:** unofficial; throttled per IP — keep volume low
- **Returns:** array of query-completion strings
- **Signals:** (b) demand + (a) real question phrasings
- **ToS:** undocumented/unofficial endpoint; automated use is ToS-gray
- **Role:** BACKBONE
- **Catch:** no SLA; can change/block without notice. Best phrasing source despite this.

### YouTube Data API v3 — 🟡 YELLOW (free + commercial, with discipline)
- **Endpoint:** `https://www.googleapis.com/youtube/v3/` — `search.list`, `commentThreads.list`, `videos.list`
- **Auth:** free API key (Google Cloud project)
- **Limits:** 10,000 units/day — search=100 units, commentThreads=1, videos=1
- **Returns:** video titles/descriptions, comment text, view/like counts
- **Signals:** (a) comments = pain points + (b) view counts
- **ToS:** 30-day storage cap (delete/refresh stored API data after 30 days); no "competing dataset"; bulk-harvest use cases audited
- **Role:** BACKBONE
- **Catch:** rolling 30-day window only — no permanent comment warehouse.

### Lemmy — 🟢 GREEN (low volume)
- **Endpoint:** `https://{instance}/api/v3/` (e.g. `lemmy.world`) — `/post/list`, `/search`, `/comment/list`
- **Auth:** none for many reads (varies by instance) · **Limits:** per-IP rate limiting (server-side calls share one IP → throttled sooner)
- **Returns:** post title/body, comments, community
- **Signals:** (a)
- **License:** instance/user-dependent
- **Role:** BACKBONE
- **Catch:** far smaller volume than Reddit; the compliant Reddit substitute.

### Reddit `.rss` — 🟡 YELLOW (inspiration only)
- **Endpoint:** `https://www.reddit.com/r/{sub}/.rss`, `/r/{sub}/search.rss?q=` (the subreddits for your field)
- **Auth:** none · **Returns:** post titles + links
- **Signals:** (a)
- **ToS:** Public Content Policy restricts commercial automated use regardless of access method
- **Role:** manual inspiration only (NOT pipeline-safe)
- **Catch:** the Data API for compliant commercial use is RED (~$12k/yr).

---

## 🟢 CHANGE + GROUND — regulatory / authoritative sources

### Federal Register API — 🟢 GREEN
- **Endpoint:** `https://www.federalregister.gov/api/v1/` — `/documents.json`, `/documents/search`
- **Auth:** none · **Limits:** generous, undocumented
- **Returns:** rules/proposed rules/notices — title, abstract, agencies, dates, comment periods, full-text links
- **Signals:** (d) + (c) · **License:** public domain · **Role:** CHANGE+GROUND
- **Catch:** none. Cleanest source available.

### GovInfo API — 🟢 GREEN
- **Endpoint:** `https://api.govinfo.gov/` · **Auth:** free `api.data.gov` key · **Limits:** ~1,000/hr
- **Collections:** regulatory bulletins, CFR, US Code, Bills; custom RSS from any search (since Sept 2024)
- **Returns:** metadata + full-text packages
- **Signals:** (c) + (d) · **License:** public domain · **Role:** CHANGE+GROUND
- **Catch:** this is the real federal-guidance path — many agencies have no usable comprehensive news RSS (only email-only newsletters), so GovInfo search + RSS is the automatable route.

### Regulations.gov API v4 — 🟢 GREEN
- **Endpoint:** `https://api.regulations.gov/v4/` — `/documents`, `/comments`, `/dockets` · **Auth:** free `api.data.gov` key · **Limits:** 1,000/hr
- **Returns:** proposed rules + public comments
- **Signals:** (a) comments = pain points + (d) · **License:** public domain · **Role:** CHANGE
- **Catch:** none.

### LegiScan — 🟢 GREEN (Yourniche layer)
- **Endpoint:** `https://api.legiscan.com/?key=KEY&op=` — `getMasterList`, `getBill`, `getSearch`, `getDataset` · bulk: `https://legiscan.com/Yourniche/datasets` (weekly JSON/CSV)
- **Auth:** free key · **Limits:** 30,000 queries/month free (paid tiers only add volume/real-time, not commercial rights)
- **Returns:** Yourniche-level regulatory item title, status, history, sponsors, full text, votes
- **Signals:** (d) + (c) · **License:** commercial use explicitly permitted · **Role:** CHANGE+GROUND
- **Catch:** only free structured path to Yourniche-level *pending changes* (codified primary-source text is a gap — see below).

### SBA — 🟢 GREEN
- **Endpoint:** `https://developer.sba.gov/` (Content API), `https://data.sba.gov/` (CKAN API) · **Auth:** free
- **Returns:** SBA articles/guidance, office data, datasets, SCORE chapter info
- **Signals:** (c) + (d) · **License:** public domain · **Role:** CHANGE+GROUND
- **Catch:** none. (A useful general-business source; keep or swap for your field's equivalent public guidance API.)

### Public domain-registry API (EXAMPLE — swap for your field) — 🟢 GREEN
- Many fields have an official public registry (records, certifications, filings, licenses, permits) exposed via a free API — often the strongest GROUND source for domain-specific facts. Wire in the one for your field.
- **Signals:** (c) · **License:** typically public records · **Role:** GROUND
- **Catch:** confirm the ToS and rate limits before building on it; the template ships this as a placeholder, not a live wiring.

### Census Business Formation Statistics / Census Data API — 🟢 GREEN
- **Endpoint:** `https://api.census.gov/data/timeseries/bfs/bfs` · **Auth:** free key · **Returns:** new business application counts by state (Yourniche), monthly
- **Signals:** (b)/(d) data hooks · **License:** public domain · **Role:** CHANGE
- **Catch:** must display "not endorsed by Census" disclaimer.

### FRED API — 🟢 GREEN
- **Endpoint:** `https://api.stlouisfed.org/fred/series/observations` · **Auth:** free key · **Limits:** 120/min
- **Returns:** 800k+ economic time series (wraps Census BFS)
- **Signals:** (b)/(d) · **License:** free, commercial OK · **Role:** CHANGE
- **Catch:** none.

### Wikimedia Pageviews API — 🟢 GREEN
- **Endpoint:** `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/{project}/{access}/{agent}/{article}/{granularity}/{start}/{end}`
- **Auth:** none · **Returns:** daily pageview counts per article
- **Signals:** (b) demand proxy · **License:** pageview counts are facts (free); article text is CC BY-SA · **Role:** BACKBONE-support
- **Catch:** don't reuse article text without attribution/share-alike.

---

## 🟡 CONSUME-ONLY feeds (ideation/grounding; never republish full text)

| Source | Endpoint | Signals | Catch |
|---|---|---|---|
| **Industry-news RSS** | your field's leading trade/news publishers' RSS | (c)(d) | Consume-only. Publisher-friendly but exact reuse terms often UNCONFIRMED — read before republishing. |
| **Aggregator RSS** | customizable feeds that aggregate 3rd-party blogs | (c)(d) | Aggregates 3rd-party content → their copyright. Consume-only. |
| **Substack per-pub RSS** | `https://{pub}.substack.com/feed` | (a)(c) | No API; ToS bans scraping. RSS consume-only. |
| **Hacker News Algolia** | `hn.algolia.com/api/v1/search?query=` | (a)(b) | Free, no key; commercial terms UNSTATED; relevance varies by field. |
| **DuckDuckGo IA API** | `api.duckduckgo.com/?q=&format=json` | (b) | Non-commercial without email approval; thin data. |
| **Field Q&A / advice sites** | web only | (a) | Often no API — manual inspiration only; ToS-gated. |

---

## 🔴 RED — paid or prohibited (do not build on)

| Source | Disqualifier |
|---|---|
| **Reddit Data API (commercial)** | ~$12,000/yr floor + $0.24/1k requests, contract required |
| **Stack Exchange Data Dump** | Post–July 2024: login-gated, commercial use + LLM training prohibited (use the API instead) |
| **Listen Notes API** | "Free" = 300 requests/month = effectively paid (use podcast RSS directly) |
| **Quora** | No public API; ToS bans scraping |
| **Bing Autosuggest** | Retiring; 1k/month; declining |
| **NPR API/feeds** | Non-commercial license; no AI training |
| **Google Trends / pytrends** | Official API alpha-only; pytrends archived Apr 2025; scraping violates ToS |
| **ScrapingBee · Apify · DataForSEO · SerpAPI · AnswerThePublic · Data365** | Paid services with trial credits dressed as "free"; don't absolve source ToS |

---

## ⚖️ Two rules that govern all feed use (bake into the rails)

1. **Feed-consumption principle:** consuming a feed grants no right to commercially republish full text (an established rule in feed-scraping disputes). The pipeline may ingest feeds for *ideation/grounding* and publish only ORIGINAL synthesized articles with links + short attributed quotes (fair use).
2. **Confirmed GAP — Yourniche primary-source text:** no free API/bulk may exist for your niche's codified primary sources (a Yourniche official site may be HTML-only; LegiScan covers *pending changes*, not codified text). Seed the Yourniche authority corpus manually once for grounding the niche-specific articles.

---

## MVP stack (all clean, build against this first)

- **Backbone (reader questions):** Stack Exchange API + Google Autocomplete + YouTube comments (30-day window) + Lemmy
- **Change ideas + data hooks:** Federal Register + GovInfo + Regulations.gov + LegiScan (Yourniche) + Census BFS/FRED + SBA + your field's public registry API
- **Grounding:** Federal Register + GovInfo + LegiScan + Wikimedia + your field's authority corpus
- **Manual inspiration only:** field Q&A/advice sites, Reddit, Substack, podcast titles

## Residual uncertainties (not fully pinned — confirm at build)

- Exact commercial-reuse terms for industry-news RSS, aggregator RSS, and Hacker News/Algolia (all consume-only, low-stakes).
- All pricing/ToS/rate limits are as of June 2026 — re-verify before production.
