#!/usr/bin/env node
// Optional live evaluation. Industry instances should replace the starter fixtures with
// real representative topics before using this command.
import "../src/env.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertCustomized, loadEngineConfig } from "../src/config.js";
import { DISCLAIMER, writeArticle } from "../src/writer.js";
import { loadCorpus } from "../src/grounding.js";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("SKIP: ANTHROPIC_API_KEY is not set. Offline tests are available through npm test.");
  process.exit(2);
}
assertCustomized(loadEngineConfig());

const here = path.dirname(fileURLToPath(import.meta.url));
const corpus = loadCorpus();
const files = fs.readdirSync(path.join(here, "fixtures")).filter((file) => file.endsWith(".json"));
let failures = 0;

for (const file of files) {
  const fixture = JSON.parse(fs.readFileSync(path.join(here, "fixtures", file), "utf8"));
  const claims = (fixture.corpus_ids_available || []).map((id) => corpus.byId.get(id)).filter(Boolean).map((authority) => ({
    id: authority.id,
    statement: authority.summary,
    scope: authority.jurisdiction === "US" || authority.jurisdiction === "general" ? "general" : "moat",
    source_url: authority.source_url,
    source_title: authority.citation,
    source_tier: authority.jurisdiction === "US" || authority.jurisdiction === "general" ? "general" : "moat",
    support: "direct",
    origin: "human_curated",
  }));
  const research = {
    version: 2,
    research_status: claims.length ? "completed" : "unavailable",
    available: claims.length > 0,
    claims,
    brief: claims.map((claim) => `[${claim.id}] ${claim.statement} (${claim.source_url})`).join("\n"),
  };

  let output;
  try {
    output = await writeArticle(fixture.topic, research, { temperature: 0 });
  } catch (error) {
    console.error(`FAIL ${fixture.name}: ${error.message}`);
    failures++;
    continue;
  }
  const expected = fixture.expect || {};
  const errors = [];
  if (expected.skip === true && output.skip !== true) errors.push("expected the topic to be skipped");
  if (expected.skip !== true && output.skip === true) errors.push(`unexpected skip: ${output.skip_reason}`);
  if (!output.skip) {
    if (expected.mode_in && !expected.mode_in.includes(output.mode)) errors.push(`unexpected mode ${output.mode}`);
    if (expected.word_count_range) {
      const [min, max] = expected.word_count_range;
      if (output.word_count < min || output.word_count > max) errors.push(`word count ${output.word_count} outside ${min}-${max}`);
    }
    if (expected.must_end_with_disclaimer && !output.body_markdown.endsWith(DISCLAIMER)) errors.push("missing disclaimer");
    if (typeof expected.needs_grounding === "boolean" && output.needs_grounding !== expected.needs_grounding) errors.push(`needs_grounding was ${output.needs_grounding}`);
    if (output.publishable !== false || output.human_reviewed !== false || output.verified !== false) errors.push("unsafe review/publication state");
  }
  if (errors.length) {
    failures += errors.length;
    errors.forEach((error) => console.error(`FAIL ${fixture.name}: ${error}`));
  } else {
    console.log(`PASS ${fixture.name}`);
  }
}

console.log(failures ? `\nFAILED: ${failures} live invariant(s)` : "\nALL LIVE INVARIANTS PASSED");
process.exit(failures ? 1 : 0);
