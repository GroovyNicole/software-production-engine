// Qualitative topic classification. Demand numbers never come from the model.
import "./env.js";
import { anthropicEnabled, callAnthropic, parseJsonResponse, textFromResponse } from "./anthropic.js";
import { clusterPrompt, fillTemplate, loadEngineConfig, scopePrompt } from "./config.js";

export function claudeEnabled() {
  return anthropicEnabled();
}

function systemPrompt(config) {
  return fillTemplate(`You are the classification stage of a blog-topic scorer for [FIRM], a [FIELD] brand.

The allowed topic clusters are:
${clusterPrompt(config)}

${scopePrompt(config)}

For each candidate decide:
- in_scope (boolean) and cluster (one allowed id, or null)
- lane: "A" for broad informational content; "B" only when the topic has a material Yourniche-specific angle
- differentiation (0-1): how much the Yourniche-specific answer beats generic content
- groundability (0-1): whether trusted primary sources can support the answer
- grounding_authority: source names as research HINTS only, never claims or citations
- evergreen (0-1)

Return only a JSON array in input order:
[{"id":"...","in_scope":true,"cluster":"planning","lane":"B","differentiation":0.9,"groundability":0.6,"grounding_authority":["official source name"],"evergreen":1}]`, config);
}

export async function classifyBatch(candidates) {
  const config = loadEngineConfig();
  const model = process.env.SCORER_MODEL || "claude-sonnet-4-6";
  const input = candidates.map((candidate) => ({
    id: candidate.id,
    topic: candidate.topic,
    cluster_guess: candidate.cluster_guess,
    moat_flag: candidate.moat_flag ?? candidate.yourniche_flag,
  }));
  const data = await callAnthropic({
    model,
    maxTokens: 4096,
    temperature: 0,
    system: systemPrompt(config),
    user: JSON.stringify(input),
  });
  const parsed = parseJsonResponse(textFromResponse(data), "topic-classifier response");
  if (!Array.isArray(parsed)) throw new Error("topic classifier must return an array");
  return new Map(parsed.filter((item) => item?.id).map((item) => [item.id, item]));
}
