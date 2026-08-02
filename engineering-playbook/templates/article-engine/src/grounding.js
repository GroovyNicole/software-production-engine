// Grounding corpus loader + topic→authority matcher.
// The corpus (config/grounding.json) is BOTH the accuracy rail (writer may cite
// nothing outside it) and the configured moat.
//
// Safety gate (§5.2): an authority is citable ONLY if verified_by === "human"
// AND it has a non-empty `citation`. Seed data ships "unverified" so it can
// inform plain-language explanation but can never be printed until a human
// (the maintainer/an expert) confirms the exact text + URL and flips verified_by.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEngineConfig } from "./config.js";

const HERE = path.dirname(fileURLToPath(import.meta.url)); // .../src
const DEFAULT_CORPUS = path.join(HERE, "..", "config", "grounding.json");

function tokens(s) {
  return (String(s).toLowerCase().match(/[a-z0-9]+/g) || []);
}

// Words that carry no matching signal — ignored in keyword overlap.
const STOP = new Set([
  "a", "an", "the", "to", "of", "in", "on", "for", "and", "or", "is", "are",
  "do", "does", "you", "your", "what", "when", "how", "why", "with", "business",
  "my", "i", "can", "should", "if",
]);

/** loadCorpus(): { version, authorities, byId:Map<id,Authority> } */
export function loadCorpus(corpusPath = DEFAULT_CORPUS) {
  const raw = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
  const authorities = Array.isArray(raw.authorities) ? raw.authorities : [];
  const byId = new Map(authorities.map((a) => [a.id, a]));
  return { version: raw.version, authorities, byId };
}

/** An authority is citable only when a human has verified it AND it prints a cite. */
export function isCitable(a) {
  return a && a.verified_by === "human" && typeof a.citation === "string" && a.citation.trim() !== "";
}

/**
 * matchAuthorities(topic, corpus?) → Authority[]  (verified-only; §5.2)
 *
 * Scores each CITABLE authority against the topic's cluster (primary),
 * keyword overlap on topic_tags vs. the topic string, the free-text
 * grounding_authority HINT (which may name the citation), and jurisdiction.
 * Returns the ranked list handed to the writer as `allowed_authorities`.
 * Empty array is a normal, expected result (e.g. every Lane-A topic, and any
 * Lane-B topic whose law is still unverified) → the writer takes the
 * needs_grounding route rather than fabricating.
 */
export function matchAuthorities(topic, corpus = loadCorpus()) {
  const config = loadEngineConfig();
  const stop = new Set([...STOP, ...tokens(config.brand.moat_label)]);
  const cluster = topic.cluster;
  const hintText = (topic.grounding_authority || []).join(" ").toLowerCase();
  const topicWords = new Set(
    [...tokens(topic.topic), ...tokens(topic.id)].filter((t) => !stop.has(t))
  );

  const scored = [];
  for (const a of corpus.authorities) {
    if (!isCitable(a)) continue; // the hard gate: unverified/blank cannot be cited
    let score = 0;
    const tags = a.topic_tags || [];

    if (tags.includes(cluster)) score += 3; // cluster is the strongest signal

    for (const tag of tags) {
      for (const t of tokens(tag)) {
        if (!stop.has(t) && topicWords.has(t)) score += 1;
      }
    }

    // The classifier's free-text hint sometimes names the exact cite.
    if (hintText && a.citation && hintText.includes(a.citation.toLowerCase())) score += 4;

    // Moat authority gets a Lane-B boost; general/national authority can fit either lane.
    if (["moat", config.brand.moat_label].includes(a.jurisdiction) && topic.lane === "B") score += 1;
    if (["general", "US", "National"].includes(a.jurisdiction)) score += 0.5;

    if (score > 0) scored.push({ a, score });
  }

  scored.sort((x, y) => y.score - x.score);
  return scored.map((s) => s.a);
}
