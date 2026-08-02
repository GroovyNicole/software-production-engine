import test from "node:test";
import assert from "node:assert/strict";
import { blockedBy, loadBlocklist } from "../src/llm_ideas.js";

test("topic blocklist file is valid and returns an array", () => {
  assert.ok(Array.isArray(loadBlocklist()));
});

test("deterministic premise gate rejects a matching pattern", () => {
  const rules = [{ pattern: "guaranteed returns", reason: "Guarantees are not supportable." }];
  assert.equal(blockedBy("Can this promise guaranteed returns?", rules)?.reason, "Guarantees are not supportable.");
});

test("deterministic premise gate allows a nonmatching topic", () => {
  const rules = [{ pattern: "guaranteed returns", reason: "Guarantees are not supportable." }];
  assert.equal(blockedBy("How should I compare two options?", rules), null);
});

test("malformed customer regex is ignored instead of crashing ideation", () => {
  assert.equal(blockedBy("A normal topic", [{ pattern: "[", reason: "bad regex" }]), null);
});
