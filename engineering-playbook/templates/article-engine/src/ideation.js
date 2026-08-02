// Thin ideation feed: seeds -> free sources + net-new LLM ideas -> normalized, deduped candidates.
import { fetchAutocomplete, fetchSESearch } from "./sources.js";
import { generateIdeas } from "./llm_ideas.js";
import { coveredTitles, isCovered } from "./ledger.js";
import { loadEngineConfig } from "./config.js";

// Customer-configured exclusions are applied before qualitative scope judgment.
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const termsRegex = (values) => values?.length ? new RegExp(`\\b(?:${values.map(escapeRegex).join("|")})\\b`, "i") : null;

// keyword -> cluster mapping (used to classify Stack Exchange items, which are not seeded)
const CLUSTER_KEYWORDS = {
  getting_started: ["what is", "do i need", "where do i start", "getting started", "beginner", "basics", "first step", "how to start"],
  choosing: ["vs", "versus", "compare", "comparison", "difference between", "which is better", "either", "choose between", "pros and cons"],
  process: ["how does", "how do you", "step by step", "how it works", "process", "walkthrough", "procedure", "workflow"],
  cost: ["cost", "price", "pricing", "how much", "budget", "fee", "worth it", "roi", "expensive", "cheap"],
  pitfalls: ["mistake", "avoid", "fail", "pitfall", "trap", "gotcha", "problem", "risk", "common error"],
  standards: ["requirement", "rule", "standard", "best practice", "compliance", "guideline", "regulation", "required"],
  advanced: ["advanced", "edge case", "complex", "high stakes", "specialized", "expert level", "deep dive", "uncommon"],
  planning: ["long term", "future", "plan", "planning", "ongoing", "maintenance", "roadmap", "succession", "over time"],
};

function guessCluster(text, clusters = []) {
  const t = text.toLowerCase();
  let best = null, bestHits = 0;
  const configured = Object.fromEntries(clusters.map((cluster) => {
    const words = `${cluster.id.replaceAll("_", " ")} ${cluster.label || ""} ${cluster.description || ""}`
      .toLowerCase().match(/[a-z0-9]+/g) || [];
    return [cluster.id, [...new Set([...(CLUSTER_KEYWORDS[cluster.id] || []), ...words.filter((word) => word.length > 3)])]];
  }));
  for (const [cluster, kws] of Object.entries(configured)) {
    const hits = kws.filter((k) => t.includes(k)).length;
    if (hits > bestHits) { best = cluster; bestHits = hits; }
  }
  return best; // null if nothing matched -> unscoped
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
export async function buildCandidates(seeds, { warn = console.warn } = {}) {
  const config = loadEngineConfig();
  const excluded = termsRegex([...(config.scope.excluded_terms || []), ...(config.scope.excluded_geographies || [])]);
  const moat = termsRegex(config.ideation.moat_terms || [config.brand.moat_label]);
  const exampleTitles = (config.ideation.example_titles || []).map(norm);
  const searches = (config.ideation.stack_exchange_searches || []).map((item) => ({
    site: item.site,
    q: item.query,
    cluster: item.cluster,
  }));
  const byKey = new Map();

  const add = (topic, source, cluster, signals) => {
    const key = norm(topic);
    if (!key || key.length < 6) return;
    if (excluded?.test(topic)) return;
    if (exampleTitles.some((e) => key === e || key.includes(e) || e.includes(key))) return;
    if (!byKey.has(key)) {
      byKey.set(key, {
        id: key.replace(/ /g, "-").slice(0, 60),
        topic: topic.trim(),
        sources: new Set(),
        cluster_guess: cluster || null,
        moat_flag: Boolean(moat?.test(topic)),
        signals: { autocomplete_score: 0, se_view_count: 0, se_score: 0, se_answer_count: 0, wiki_views_30d: 0 },
      });
    }
    const c = byKey.get(key);
    c.sources.add(source);
    if (!c.cluster_guess && cluster) c.cluster_guess = cluster;
    for (const [k, v] of Object.entries(signals)) c.signals[k] = Math.max(c.signals[k] || 0, v);
  };

  // 1) Google Autocomplete over seed stems
  for (const seed of seeds) {
    try {
      const suggestions = await fetchAutocomplete(seed.stem);
      suggestions.forEach((sug, i) => {
        const acScore = (suggestions.length - i) / suggestions.length; // higher = ranked earlier
        add(sug, "autocomplete", seed.cluster, { autocomplete_score: acScore });
      });
      // Raw stems are expansion inputs, not candidates. This prevents the engine from echoing setup text.
    } catch (e) {
      warn(`  [autocomplete] "${seed.stem}" -> ${e.message}`);
    }
  }

  // 2) Customer-configured Stack Exchange topical searches.
  for (const s of searches) {
    try {
      const qs = await fetchSESearch(s.site, s.q);
      for (const q of qs) {
        // require a real cluster-keyword match; no blind prior (keeps off-topic SE noise out in heuristic mode)
        const cluster = guessCluster(q.title, config.clusters) || s.cluster;
        add(q.title, `stackexchange:${s.site}`, cluster, {
          se_view_count: q.view_count, se_score: q.score, se_answer_count: q.answer_count,
        });
      }
    } catch (e) {
      warn(`  [stackexchange:${s.site} "${s.q}"] -> ${e.message}`);
    }
  }

  // 3) Net-new model ideas. They have no external demand signal, so premise screening is mandatory.
  try {
    const ideas = await generateIdeas(40, config.ideation.example_titles || [], coveredTitles());
    for (const idea of ideas) {
      if (!idea || !idea.topic) continue;
      if (isCovered(idea.topic)) continue;               // ledger dedup: no repeats of covered topics
      add(idea.topic, "llm", idea.cluster || guessCluster(idea.topic, config.clusters), {});
      const c = byKey.get(norm(idea.topic));
      if (c && (idea.moat ?? idea.yourniche)) c.moat_flag = true;
    }
  } catch (e) {
    warn(`  [llm-ideas] -> ${e.message}`);
  }

  // finalize
  return [...byKey.values()].map((c) => ({ ...c, sources: [...c.sources] }));
}
