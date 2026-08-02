// Net-new idea generation plus a fail-closed false-premise gate.
import "./env.js";
import fs from "node:fs";
import path from "node:path";
import { callAnthropic, parseJsonResponse, textFromResponse } from "./anthropic.js";
import { clusterPrompt, fillTemplate, loadEngineConfig, ROOT, scopePrompt } from "./config.js";
import { writeJsonAtomic } from "./storage.js";

const AUDIT_FILE = path.join(ROOT, "output", "premise-audit.json");
const BLOCKLIST_FILE = path.join(ROOT, "config", "topic-blocklist.json");

function ideaSystem(config) {
  return fillTemplate(`You generate fresh reader-question article ideas for [FIRM], a [FIELD] brand serving [AUDIENCE].

Every idea must represent a real decision where the brand's expertise materially improves the reader's choice.
Reject generic encyclopedia subjects, simple fact lookups, breaking news, expert-to-expert material, and any
question built on a premise you are not confident is sound.

${scopePrompt(config)}

ALLOWED CLUSTERS (use only these exact ids):
${clusterPrompt(config)}

Lane-B/moat ideas must have a material ${config.brand.moat_label}-specific answer, not a generic answer with a
label attached. Produce a useful mix of broad and moat ideas. Do not repeat or lightly reword the examples or
covered topics provided by the user. Use plain evergreen question phrasing. Do not use em dashes, en dashes as
punctuation, or double hyphens.

Return only JSON:
[{"topic":"reader question","cluster":"one configured id","moat":true}]`, config);
}

function auditSystem(config) {
  return fillTemplate(`You are a senior [FIELD] expert auditing proposed topics for false, misleading, or
nonsensical premises. Reject a topic if it assumes a rule, transfer, entitlement, capability, cause, guarantee,
or distinction that is false or doubtful. Reject when uncertain; dropping an idea is safer than building a
brand article on a false premise.

${scopePrompt(config)}

Return only a JSON array in input order:
[{"index":0,"keep":true,"reason":"short explanation"}]`, config);
}

async function ask(model, system, user, maxTokens = 3000) {
  const data = await callAnthropic({ model, system, user, maxTokens });
  return parseJsonResponse(textFromResponse(data), "idea-stage response");
}

export async function generateIdeas(n = 40, examples = [], covered = []) {
  if (!process.env.ANTHROPIC_API_KEY) return [];
  const config = loadEngineConfig();
  const user = [
    `Generate ${n} genuinely new ideas.`,
    "",
    "STYLE CALIBRATION ONLY. Do not reuse or reword these:",
    ...(examples.slice(0, 20).map((value) => `- ${value}`)),
    "",
    "ALREADY COVERED. Do not repeat these:",
    ...(covered.length ? covered.slice(0, 120).map((value) => `- ${value}`) : ["- none"]),
  ].join("\n");
  const parsed = await ask(process.env.IDEAS_MODEL || "claude-sonnet-4-6", ideaSystem(config), user);
  const allowed = new Set(config.clusters.map((cluster) => cluster.id));
  const ideas = (Array.isArray(parsed) ? parsed : []).filter((item) =>
    item && typeof item.topic === "string" && allowed.has(item.cluster)
  );
  return screenIdeas(ideas);
}

export function loadBlocklist() {
  try {
    const parsed = JSON.parse(fs.readFileSync(BLOCKLIST_FILE, "utf8"));
    return Array.isArray(parsed.banned) ? parsed.banned : [];
  } catch {
    return [];
  }
}

export function blockedBy(topic, banned) {
  for (const item of banned || []) {
    try {
      if (new RegExp(item.pattern, "i").test(topic)) return item;
    } catch {
      // A malformed customer pattern is ignored here and can be corrected from the audit/config review.
    }
  }
  return null;
}

export async function screenPremises(ideas, model = process.env.AUDIT_MODEL || "claude-sonnet-4-6") {
  if (!ideas.length) return { kept: [], rejected: [] };
  const config = loadEngineConfig();
  const list = ideas.map((item, index) => `${index}. [${item.cluster}] ${item.topic}`).join("\n");
  const verdicts = await ask(model, auditSystem(config), `Audit these topic premises:\n\n${list}`, 2000);
  const byIndex = new Map((Array.isArray(verdicts) ? verdicts : []).map((verdict) => [verdict.index, verdict]));
  const kept = [];
  const rejected = [];
  ideas.forEach((item, index) => {
    const verdict = byIndex.get(index);
    if (verdict?.keep === true) kept.push({ ...item, premise_checked: true });
    else rejected.push({ topic: item.topic, cluster: item.cluster, reason: verdict?.reason || "no verdict returned; dropped fail-closed" });
  });
  return { kept, rejected };
}

function writeAudit({ generated, kept, blocked, rejected }) {
  writeJsonAtomic(AUDIT_FILE, {
    generated,
    kept_count: kept.length,
    blocked_count: blocked.length,
    rejected_count: rejected.length,
    kept: kept.map((item) => ({ topic: item.topic, cluster: item.cluster, origin: "ai-invented", premise_checked: true })),
    blocked_by_list: blocked,
    rejected_by_gate: rejected,
  });
}

async function screenIdeas(ideas) {
  const survived = [];
  const blocked = [];
  const banned = loadBlocklist();
  for (const item of ideas) {
    const match = blockedBy(item.topic, banned);
    if (match) blocked.push({ topic: item.topic, cluster: item.cluster, reason: match.reason });
    else survived.push(item);
  }

  let kept = [];
  let rejected = [];
  try {
    ({ kept, rejected } = await screenPremises(survived));
  } catch (error) {
    rejected = survived.map((item) => ({
      topic: item.topic,
      cluster: item.cluster,
      reason: `premise audit failed; dropped fail-closed: ${String(error.message || error).slice(0, 120)}`,
    }));
  }
  writeAudit({ generated: ideas.length, kept, blocked, rejected });
  return kept;
}
