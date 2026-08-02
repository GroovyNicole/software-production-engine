// Persistent near-duplicate memory. Approved/published topics come from config;
// generated proposals and completed drafts live in output/covered.json.
import path from "node:path";
import { ROOT, loadEngineConfig } from "./config.js";
import { mutateJson, readJson } from "./storage.js";

const FILE = path.join(ROOT, "output", "covered.json");
const EMPTY = { proposed: [], written: [] };
const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const STOP = new Set(["the", "and", "for", "you", "your", "with", "what", "when", "how", "does", "can", "a", "an", "in", "of", "to", "do", "is", "are", "should", "why"]);
const sig = (value) => new Set(norm(value).split(" ").filter((word) => word.length > 2 && !STOP.has(word)));

export function loadCovered() {
  const value = readJson(FILE, EMPTY);
  return {
    proposed: Array.isArray(value.proposed) ? value.proposed : [],
    written: Array.isArray(value.written) ? value.written : [],
  };
}

export function coveredTitles() {
  const covered = loadCovered();
  return [...covered.written, ...covered.proposed, ...(loadEngineConfig().ideation.published_topics || [])];
}

export function isCovered(title, threshold = 0.55) {
  const words = sig(title);
  if (words.size < 2) return false;
  for (const existing of coveredTitles()) {
    const other = sig(existing);
    if (other.size < 2) continue;
    let intersection = 0;
    for (const word of words) if (other.has(word)) intersection++;
    if (intersection / (words.size + other.size - intersection) >= threshold) return true;
  }
  return false;
}

export function addProposed(titles) {
  mutateJson(FILE, EMPTY, (covered) => {
    covered.proposed = Array.isArray(covered.proposed) ? covered.proposed : [];
    covered.written = Array.isArray(covered.written) ? covered.written : [];
    const seen = new Set(covered.proposed.map(norm));
    for (const title of titles || []) {
      if (title && !seen.has(norm(title))) {
        covered.proposed.push(title);
        seen.add(norm(title));
      }
    }
    return covered;
  });
}

export function addWritten(title) {
  if (!title) return;
  mutateJson(FILE, EMPTY, (covered) => {
    covered.proposed = Array.isArray(covered.proposed) ? covered.proposed : [];
    covered.written = Array.isArray(covered.written) ? covered.written : [];
    if (!covered.written.some((value) => norm(value) === norm(title))) covered.written.push(title);
    return covered;
  });
}
