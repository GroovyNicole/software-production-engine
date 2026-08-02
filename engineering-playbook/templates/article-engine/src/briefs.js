// Structured machine-research cache. Cache entries remain research artifacts,
// never human verification or publication approval.
import path from "node:path";
import { ROOT } from "./config.js";
import { mutateJson, readJson } from "./storage.js";

const FILE = path.join(ROOT, "output", "briefs.json");

function load() {
  const value = readJson(FILE, {});
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("output/briefs.json must contain an object keyed by topic id");
  return value;
}

export function getBrief(id) {
  const cached = load()[id];
  if (!cached || cached.version !== 2 || !Array.isArray(cached.claims)) return null;
  return { ...cached, cached: true };
}

export function putBrief(id, topic, research, stamp = null) {
  if (!research || !Array.isArray(research.claims) || research.claims.length === 0) return;
  mutateJson(FILE, {}, (all) => {
    all[id] = {
      ...research,
      topic,
      researched_at: stamp,
      human_reviewed: false,
    };
    return all;
  });
}

export function briefCount() {
  return Object.keys(load()).length;
}
