#!/usr/bin/env node
import "./src/env.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCandidates } from "./src/ideation.js";
import { scoreCandidates } from "./src/scorer.js";
import { assertCustomized, loadEngineConfig } from "./src/config.js";
import { addProposed } from "./src/ledger.js";
import { writeJsonAtomic, writeTextAtomic } from "./src/storage.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const rawTop = (argv.find((value) => value.startsWith("--top=")) || "--top=15").split("=")[1];
const topN = Number(rawTop);
if (!Number.isInteger(topN) || topN < 1) throw new Error("--top must be a positive integer");

function table(rows) {
  if (!rows.length) return "  (none)";
  return rows.map((row, index) =>
    `  ${String(index + 1).padStart(2)}. [${row.score.toFixed(3)}] ${row.topic}\n` +
    `      cluster=${row.cluster}  demand=${row.subscores.demand}  pv=${row.subscores.practice_value}` +
    (row.lane === "B" ? `  diff=${row.subscores.differentiation}  ground=${row.subscores.groundability}` : "") +
    (row.grounding_authority?.length ? `\n      research hints: ${row.grounding_authority.join("; ")}` : "")
  ).join("\n");
}

async function main() {
  const config = assertCustomized(loadEngineConfig());
  const seedConfig = JSON.parse(fs.readFileSync(path.join(ROOT, "config", "seeds.json"), "utf8"));
  if (!Array.isArray(seedConfig.seeds) || seedConfig.seeds.length === 0) throw new Error("config/seeds.json must contain at least one seed");
  const clusterIds = new Set(config.clusters.map((cluster) => cluster.id));
  for (const [index, seed] of seedConfig.seeds.entries()) {
    if (!seed?.stem || typeof seed.stem !== "string") throw new Error(`config/seeds.json seed ${index} needs a stem`);
    if (!clusterIds.has(seed.cluster)) throw new Error(`config/seeds.json seed "${seed.stem}" uses unknown cluster ${seed.cluster}`);
  }

  console.log(`\n=== ${config.brand.name} :: ideation + scorer ===`);
  console.log(`Seeds: ${seedConfig.seeds.length} | fetching configured demand sources...\n`);
  const candidates = await buildCandidates(seedConfig.seeds);
  console.log(`\nCandidates generated: ${candidates.length}`);

  const { laneA, laneB, rejected, mode } = await scoreCandidates(candidates);
  addProposed([...laneA, ...laneB].filter((topic) => topic.sources?.includes("llm")).map((topic) => topic.topic));

  console.log(`\nScoring mode: ${mode.toUpperCase()}`);
  console.log(`Rejected (out of scope / unscoped): ${rejected.length}`);
  console.log(`\n-------- LANE A - broad / informational (top ${topN}) --------`);
  console.log(table(laneA.slice(0, topN)));
  console.log(`\n-------- LANE B - ${config.brand.moat_label} moat (top ${topN}) --------`);
  console.log(table(laneB.slice(0, topN)));

  const output = path.join(ROOT, "output");
  const stamp = {
    mode,
    generated_from: "config/seeds.json",
    counts: { candidates: candidates.length, laneA: laneA.length, laneB: laneB.length, rejected: rejected.length },
  };
  writeJsonAtomic(path.join(output, "ranked-topics.json"), { ...stamp, laneA, laneB, rejected });

  const csvEsc = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const csvRows = [["lane", "rank", "score", "cluster", "topic", "demand", "practice_value", "differentiation", "groundability", "research_hints"]];
  for (const [lane, list] of [["A", laneA], ["B", laneB]]) {
    list.forEach((row, index) => csvRows.push([
      lane, index + 1, row.score, row.cluster, csvEsc(row.topic), row.subscores.demand,
      row.subscores.practice_value, row.subscores.differentiation, row.subscores.groundability,
      csvEsc((row.grounding_authority || []).join("; ")),
    ]));
  }
  writeTextAtomic(path.join(output, "ranked-topics.csv"), csvRows.map((row) => row.join(",")).join("\n") + "\n");
  console.log("\nFull results written to output/ranked-topics.json and output/ranked-topics.csv\n");
}

main().catch((error) => {
  console.error("FATAL:", error.message);
  process.exit(1);
});
