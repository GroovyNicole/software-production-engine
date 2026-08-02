import test from "node:test";
import assert from "node:assert/strict";
import { DISCLAIMER, validateDraft } from "../src/writer.js";
import { isCitable, matchAuthorities } from "../src/grounding.js";
import { loadEngineConfig, makeDisclaimer } from "../src/config.js";

const config = loadEngineConfig();
const moat = config.brand.moat_label;
const allowed = [{ id: "rule-42", citation: `${moat} Code § 42`, summary: "A rule applies." }];

test("curated-authority validator accepts the exact allowed citation", () => {
  const result = validateDraft(`Under ${moat} Code § 42, the rule applies.`, allowed, ["rule-42"]);
  assert.equal(result.quarantined, false);
  assert.deepEqual(result.survivingIds, ["rule-42"]);
});

test("curated-authority validator quarantines an unapproved citation number", () => {
  const result = validateDraft(`Under ${moat} Code § 999, the rule applies.`, allowed, []);
  assert.equal(result.quarantined, true);
  assert.ok(result.offending.some((value) => value.includes("999")));
});

test("unknown model-returned authority ids are dropped", () => {
  const result = validateDraft("A general explanation.", allowed, ["invented", "rule-42"]);
  assert.deepEqual(result.survivingIds, ["rule-42"]);
});

test("human verification and a nonblank citation are both required", () => {
  assert.equal(isCitable({ verified_by: "unverified", citation: "Rule 1" }), false);
  assert.equal(isCitable({ verified_by: "human", citation: "" }), false);
  assert.equal(isCitable({ verified_by: "human", citation: "Rule 1" }), true);
});

test("curated authority matching is driven by cluster and generic moat jurisdiction", () => {
  const authority = {
    id: "planning-rule",
    citation: "Official Rule 1",
    jurisdiction: "moat",
    topic_tags: ["planning"],
    summary: "A planning rule applies.",
    source_url: "https://authority.example/rule",
    verified_by: "human",
  };
  const corpus = { version: 1, authorities: [authority], byId: new Map([[authority.id, authority]]) };
  const topic = { id: "planning-topic", topic: "How should I plan?", cluster: "planning", lane: "B", grounding_authority: [] };
  assert.deepEqual(matchAuthorities(topic, corpus).map((item) => item.id), ["planning-rule"]);
});

test("disclaimer is generated from the current engine configuration", () => {
  assert.equal(DISCLAIMER, makeDisclaimer(config));
});
