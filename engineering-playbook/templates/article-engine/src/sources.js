// Free, no-key data sources for the thin ideation feed.
// Each function is resilient: on failure it throws, and callers log + continue.

function decodeEntities(s = "") {
  return s
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

// ---- Google Autocomplete (free, no key) -------------------------------------
export async function fetchAutocomplete(stem) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(stem)}`;
  const res = await fetch(url, { headers: { "User-Agent": "article-engine/0.1" } });
  if (!res.ok) throw new Error(`autocomplete HTTP ${res.status}`);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("autocomplete parse error"); }
  return Array.isArray(data) && Array.isArray(data[1]) ? data[1] : [];
}

// ---- Stack Exchange API (free; optional key) --------------------------------
// Pulls top-voted questions from a site. Gzip is auto-decompressed by fetch.
export async function fetchSEQuestions(site, { pagesize = 40, sort = "votes" } = {}) {
  const key = process.env.STACKEXCHANGE_KEY ? `&key=${process.env.STACKEXCHANGE_KEY}` : "";
  const url = `https://api.stackexchange.com/2.3/questions?order=desc&sort=${sort}&site=${site}&pagesize=${pagesize}&filter=default${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`stackexchange HTTP ${res.status}`);
  const data = await res.json();
  if (data.error_message) throw new Error(`stackexchange: ${data.error_message}`);
  return (data.items || []).map((q) => ({
    title: decodeEntities(q.title),
    view_count: q.view_count ?? 0,
    score: q.score ?? 0,
    answer_count: q.answer_count ?? 0,
    tags: q.tags || [],
    link: q.link,
  }));
}

// Topical search on a site (better than top-votes: returns ON-TOPIC questions).
export async function fetchSESearch(site, query, { pagesize = 15 } = {}) {
  const key = process.env.STACKEXCHANGE_KEY ? `&key=${process.env.STACKEXCHANGE_KEY}` : "";
  const url = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&q=${encodeURIComponent(query)}&site=${site}&pagesize=${pagesize}&filter=default${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`stackexchange search HTTP ${res.status}`);
  const data = await res.json();
  if (data.error_message) throw new Error(`stackexchange: ${data.error_message}`);
  return (data.items || []).map((q) => ({
    title: decodeEntities(q.title),
    view_count: q.view_count ?? 0,
    score: q.score ?? 0,
    answer_count: q.answer_count ?? 0,
    tags: q.tags || [],
    link: q.link,
  }));
}

// ---- Wikipedia pageviews (free, no key) -- optional demand enrichment --------
// Best-effort: find the best-matching article, return its 30-day pageviews.
export async function fetchWikipediaPageviews(topic, { endDate = process.env.WIKIPEDIA_END_DATE || null } = {}) {
  // 1) resolve topic -> article title via MediaWiki search
  const sUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&srlimit=1&origin=*`;
  const sRes = await fetch(sUrl, { headers: { "User-Agent": "article-engine/0.1" } });
  if (!sRes.ok) throw new Error(`wiki search HTTP ${sRes.status}`);
  const sData = await sRes.json();
  const hit = sData?.query?.search?.[0]?.title;
  if (!hit) return { article: null, views_30d: 0 };
  // 2) pull last ~30 days of pageviews
  const endDay = endDate ? new Date(`${endDate}T00:00:00Z`) : new Date();
  if (Number.isNaN(endDay.getTime())) throw new Error("WIKIPEDIA_END_DATE must use YYYY-MM-DD");
  const startDay = new Date(endDay);
  startDay.setUTCDate(startDay.getUTCDate() - 30);
  const compact = (date) => date.toISOString().slice(0, 10).replaceAll("-", "");
  const end = compact(endDay);
  const start = compact(startDay);
  const article = encodeURIComponent(hit.replace(/ /g, "_"));
  const pUrl = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${article}/daily/${start}/${end}`;
  const pRes = await fetch(pUrl, { headers: { "User-Agent": "article-engine/0.1" } });
  if (!pRes.ok) return { article: hit, views_30d: 0 };
  const pData = await pRes.json();
  const views = (pData.items || []).reduce((a, b) => a + (b.views || 0), 0);
  return { article: hit, views_30d: views };
}
