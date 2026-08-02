// Scorer: gate -> lane -> subscores -> lane-weighted composite. Two ranked lists.
import { claudeEnabled, classifyBatch } from "./claude.js";
import { loadEngineConfig } from "./config.js";

// ---- practice_value weights (source of truth: config/engine.json)
export function loadPracticeValues() {
  return Object.fromEntries(loadEngineConfig().clusters.map((cluster) => [cluster.id, Number(cluster.practice_value)]));
}

// ---- OUT-OF-SCOPE heuristic (used when Claude is off) ------------------------
const clamp = (x) => Math.max(0, Math.min(1, x));

function heuristicJudge(c) {
  const inScope = !!c.cluster_guess;
  const lane = (c.moat_flag ?? c.yourniche_flag) ? "B" : "A";
  return {
    in_scope: inScope,
    cluster: inScope ? c.cluster_guess : null,
    lane,
    differentiation: lane === "B" ? 0.8 : 0.1,
    groundability: lane === "B" ? 0.5 : 0.7, // unknown-ish without Claude/corpus
    grounding_authority: [],
    evergreen: 1.0,
  };
}

export async function scoreCandidates(candidates, { log = console.log } = {}) {
  const practiceValues = loadPracticeValues();
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return { laneA: [], laneB: [], rejected: [], mode: claudeEnabled() ? "claude" : "heuristic" };
  }

  // 1) qualitative judgments (Claude if available, else heuristic)
  let judgments = new Map();
  const useClaude = claudeEnabled();
  if (useClaude) {
    log(`Scoring with Claude (${process.env.SCORER_MODEL || "claude-sonnet-4-6"})...`);
    for (let i = 0; i < candidates.length; i += 20) {
      const batch = candidates.slice(i, i + 20);
      try {
        const res = await classifyBatch(batch);
        for (const c of batch) {
          judgments.set(c.id, res.get(c.id) || heuristicJudge(c));
        }
      } catch (e) {
        log(`  [claude batch ${i}] fell back to heuristic: ${e.message}`);
        for (const c of batch) judgments.set(c.id, heuristicJudge(c));
      }
    }
  } else {
    log("Scoring with heuristics (no ANTHROPIC_API_KEY set).");
    for (const c of candidates) judgments.set(c.id, heuristicJudge(c));
  }

  // 2) demand: normalize each signal across the batch, then balance sources so
  //    Stack Exchange view magnitude doesn't swamp autocomplete-sourced topics.
  const logViews = candidates.map((c) => (c.signals.se_view_count ? Math.log10(c.signals.se_view_count + 1) : 0));
  const vMin = Math.min(...logViews), vMax = Math.max(...logViews);
  const viewNorm = (v) => (vMax > vMin ? (v - vMin) / (vMax - vMin) : 0);
  const demandOf = (s) => {
    const vn = s.se_view_count ? viewNorm(Math.log10(s.se_view_count + 1)) : 0;
    const an = s.autocomplete_score || 0;
    const wn = s.wiki_views_30d ? viewNorm(Math.log10(s.wiki_views_30d + 1)) : 0;
    return clamp(0.55 * vn + 0.35 * an + 0.10 * wn);
  };
  const normDemand = (c) => demandOf(c.signals);

  // 3) compose
  const scored = [];
  const rejected = [];
  for (const c of candidates) {
    const j = judgments.get(c.id);
    if (!j.in_scope || !j.cluster) {
      rejected.push({ id: c.id, topic: c.topic, reason: j.cluster ? "out_of_scope" : "unscoped/no-cluster" });
      continue;
    }
    const demand = normDemand(c);
    const practice_value = practiceValues[j.cluster] ?? 0.13;
    const evergreen = clamp(j.evergreen ?? 1);
    let score;
    if (j.lane === "A") {
      score = 0.55 * demand + 0.30 * practice_value + 0.15 * evergreen;
    } else {
      const differentiation = clamp(j.differentiation ?? 0.8);
      const groundability = clamp(j.groundability ?? 0.5);
      score = 0.40 * differentiation + 0.25 * practice_value + 0.20 * groundability + 0.15 * demand;
    }
    scored.push({
      id: c.id,
      topic: c.topic,
      cluster: j.cluster,
      lane: j.lane,
      score: +score.toFixed(3),
      subscores: {
        demand: +demand.toFixed(3),
        practice_value,
        differentiation: +clamp(j.differentiation ?? (j.lane === "B" ? 0.8 : 0.1)).toFixed(3),
        groundability: +clamp(j.groundability ?? 0.5).toFixed(3),
        evergreen,
      },
      grounding_authority: j.grounding_authority || [],
      sources: c.sources,
      signals: c.signals,
    });
  }

  const laneA = scored.filter((s) => s.lane === "A").sort((a, b) => b.score - a.score);
  const laneB = scored.filter((s) => s.lane === "B").sort((a, b) => b.score - a.score);
  return { laneA, laneB, rejected, mode: useClaude ? "claude" : "heuristic" };
}
