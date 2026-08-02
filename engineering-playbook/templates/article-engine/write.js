#!/usr/bin/env node
import "./src/env.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeArticle } from "./src/writer.js";
import { verifyTopic } from "./src/verify.js";
import { getBrief, putBrief } from "./src/briefs.js";
import { addWritten, isCovered } from "./src/ledger.js";
import { assertCustomized, loadEngineConfig } from "./src/config.js";
import { readJson, withFileLock, writeJsonAtomic, writeTextAtomic } from "./src/storage.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);

function arg(name, fallback = undefined) {
  const hit = argv.find((value) => value === `--${name}` || value.startsWith(`--${name}=`));
  if (!hit) return fallback;
  const index = hit.indexOf("=");
  return index === -1 ? true : hit.slice(index + 1);
}

const topArg = arg("top");
const OPT = {
  id: arg("id"),
  top: topArg === undefined ? null : Number(topArg),
  lane: arg("lane") ? String(arg("lane")).toUpperCase() : null,
  force: Boolean(arg("force")),
  reverify: Boolean(arg("reverify")),
  stamp: arg("stamp") ? String(arg("stamp")) : null,
  model: arg("model") ? String(arg("model")) : process.env.WRITER_MODEL || "claude-sonnet-4-6",
};
if (OPT.top !== null && (!Number.isInteger(OPT.top) || OPT.top < 1)) throw new Error("--top must be a positive integer");
if (OPT.lane && !["A", "B"].includes(OPT.lane)) throw new Error("--lane must be A or B");

const RANKED = path.join(ROOT, "output", "ranked-topics.json");
const DRAFTS_JSON = path.join(ROOT, "output", "drafts.json");
const DRAFTS_DIR = path.join(ROOT, "output", "drafts");
const PROCESS_LOCK = path.join(ROOT, "output", ".article-writer.lock");

function slugify(value) {
  return String(value).toLowerCase().replace(/['"]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80).replace(/-+$/g, "");
}

function validateTopic(topic) {
  for (const key of ["id", "topic", "cluster", "lane"]) {
    if (!topic || typeof topic[key] !== "string" || !topic[key]) throw new Error(`ranked topic is missing ${key}`);
  }
  if (!Number.isFinite(topic.score)) throw new Error(`ranked topic ${topic.id} has an invalid score`);
  if (!["A", "B"].includes(topic.lane)) throw new Error(`ranked topic ${topic.id} has lane ${topic.lane}; expected A or B`);
  return topic;
}

function selectTopics(ranked) {
  const laneA = Array.isArray(ranked.laneA) ? ranked.laneA : [];
  const laneB = Array.isArray(ranked.laneB) ? ranked.laneB : [];
  const all = [...laneA, ...laneB].map(validateTopic);
  if (OPT.id) {
    const topic = all.find((item) => item.id === OPT.id);
    if (!topic) throw new Error(`--id "${OPT.id}" was not found in output/ranked-topics.json`);
    return [topic];
  }
  const pool = OPT.lane ? all.filter((topic) => topic.lane === OPT.lane) : all;
  pool.sort((a, b) => b.score - a.score);
  return pool.slice(0, OPT.top || 3);
}

function assembleRecord(topic, part) {
  return {
    id: topic.id,
    topic: topic.topic,
    cluster: topic.cluster,
    lane: topic.lane,
    score: topic.score,
    title: part.title,
    slug: slugify(part.title || topic.topic),
    dek: part.dek,
    mode: part.mode,
    body_markdown: part.body_markdown,
    word_count: part.word_count,
    yourniche_specific: topic.lane === "B",
    moat_specific: topic.lane === "B",
    verified: false,
    machine_researched: part.machine_researched,
    research_status: part.research_status,
    research_claims: part.research_claims,
    used_claim_ids: part.used_claim_ids,
    verification_brief: part.verification_brief,
    sources: part.sources || [],
    grounding_authority: part.grounding_authority || [],
    used_authority_ids: part.used_authority_ids || [],
    needs_grounding: part.needs_grounding,
    needs_grounding_note: part.needs_grounding_note,
    validation_error: part.validation_error,
    status: part.status,
    review_status: "pending_human_review",
    human_reviewed: false,
    publishable: false,
    model: OPT.model,
    generated_at: OPT.stamp,
    ideation_sources: topic.sources || [],
  };
}

function renderMarkdown(record) {
  const lines = [`# ${record.title}`, "", `*${record.dek}*`, "", record.body_markdown, "", "---", "", "_Research trail for human review. Do not publish this section._", ""];
  if (record.validation_error) lines.push(`STOP: ${record.validation_error}`, "");
  if (record.needs_grounding) lines.push(`NEEDS GROUNDING: ${record.needs_grounding_note}`, "");
  lines.push(record.verification_brief || "No machine-researched claim passed source policy.", "");
  if (record.sources.length) lines.push("Sources supporting claims used in this draft:", ...record.sources.map((url) => `- ${url}`), "");
  lines.push("Human review status: PENDING", "Publishable: NO", "");
  return lines.join("\n");
}

async function run() {
  const config = assertCustomized(loadEngineConfig());
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add a dedicated key.");
  const ranked = readJson(RANKED, null, { strict: true });
  const selected = selectTopics(ranked);
  const existingEnvelope = readJson(DRAFTS_JSON, { drafts: [] });
  const byId = new Map((existingEnvelope.drafts || []).map((draft) => [draft.id, draft]));
  const newlyWrittenTitles = [];

  console.log(`\n=== ${config.brand.name} article writer :: ${selected.length} topic(s) ===\n`);
  for (const topic of selected) {
    const existing = byId.get(topic.id);
    if (existing?.status === "drafted" && !OPT.force) {
      console.log(`  skip already drafted (use --force): ${topic.id}`);
      continue;
    }
    if (!OPT.force && !existing && isCovered(topic.topic)) {
      console.log(`  skip already covered: ${topic.id}`);
      continue;
    }

    let research = OPT.reverify ? null : getBrief(topic.id);
    if (research) console.log(`  reusing structured research: ${topic.id}`);
    else {
      research = await verifyTopic(topic);
      putBrief(topic.id, topic.topic, research, OPT.stamp);
    }

    let part;
    try {
      part = await writeArticle(topic, research, { model: OPT.model });
    } catch (error) {
      console.error(`  error drafting ${topic.id}: ${error.message}`);
      continue;
    }
    if (part.skip) {
      console.log(`  skip out of scope: ${topic.id} - ${part.skip_reason}`);
      continue;
    }

    const record = assembleRecord(topic, part);
    byId.set(topic.id, record);
    newlyWrittenTitles.push(record.title);
    const suffix = record.status === "drafted" ? ".md" : ".NEEDS-FIX.md";
    writeTextAtomic(path.join(DRAFTS_DIR, `${record.slug}${suffix}`), renderMarkdown(record));
    console.log(`  ${record.status === "drafted" ? "drafted" : "QUARANTINED"}: ${record.slug} (${record.word_count} words, human review pending)`);
  }

  const drafts = [...byId.values()];
  writeJsonAtomic(DRAFTS_JSON, {
    generated_from: "output/ranked-topics.json",
    model: OPT.model,
    count: drafts.length,
    drafts,
  });
  newlyWrittenTitles.forEach(addWritten);
  console.log(`\nWrote ${drafts.length} draft record(s). Nothing is marked publishable.\n`);
}

withFileLock(PROCESS_LOCK, run).catch((error) => {
  console.error("FATAL:", error.message);
  process.exit(1);
});
