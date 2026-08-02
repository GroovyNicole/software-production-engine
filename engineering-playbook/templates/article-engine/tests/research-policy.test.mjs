import test from "node:test";
import assert from "node:assert/strict";
import { normalizeResearchResult, sourceTier } from "../src/verify.js";

const policy = {
  version: 1,
  moat_authority: ["state.example.gov"],
  general_authority: ["agency.example.gov"],
  ideation_only: ["blog.example.com"],
};

test("source policy recognizes exact domains and their subdomains", () => {
  assert.equal(sourceTier("https://state.example.gov/rules/1", policy), "moat");
  assert.equal(sourceTier("https://data.agency.example.gov/report", policy), "general");
  assert.equal(sourceTier("https://agency.example.gov.evil.test/report", policy), null);
});

test("web claim must use a URL actually returned by search", () => {
  const raw = { claims: [{ id: "c1", statement: "The requirement applies.", scope: "general", source_url: "https://agency.example.gov/not-opened" }] };
  const result = normalizeResearchResult(raw, [{ url: "https://agency.example.gov/opened", title: "Opened" }], policy);
  assert.equal(result.claims.length, 0);
  assert.match(result.rejected_claims[0].reason, /not returned/);
});

test("general source cannot support a moat-specific claim", () => {
  const url = "https://agency.example.gov/rule";
  const raw = { claims: [{ id: "c1", statement: "A local rule applies.", scope: "moat", source_url: url }] };
  const result = normalizeResearchResult(raw, [{ url }], policy);
  assert.equal(result.claims.length, 0);
  assert.match(result.rejected_claims[0].reason, /moat-authority/);
});

test("valid returned authority URL produces a direct claim record", () => {
  const url = "https://state.example.gov/rule/42";
  const raw = { claims: [{ id: "rule-42", statement: "The local filing deadline is 30 days.", scope: "moat", source_url: url, source_title: "Rule 42" }] };
  const result = normalizeResearchResult(raw, [{ url, title: "Rule 42" }], policy);
  assert.equal(result.research_status, "completed");
  assert.equal(result.claims[0].support, "direct");
  assert.equal(result.claims[0].source_tier, "moat");
});
