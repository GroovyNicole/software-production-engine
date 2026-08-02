import test from "node:test";
import assert from "node:assert/strict";
import { loadEngineConfig, validateEngineConfig } from "../src/config.js";

test("the distributed template intentionally fails the ready-to-run customization gate", () => {
  const errors = validateEngineConfig(loadEngineConfig(), { requireCustomized: true });
  assert.ok(errors.some((error) => error.includes("customized")));
  assert.ok(errors.some((error) => error.includes("placeholder")));
});

test("a complete industry configuration passes validation", () => {
  const config = structuredClone(loadEngineConfig());
  config.customized = true;
  config.brand = {
    name: "North Star HVAC",
    field: "residential heating and cooling",
    audience: "homeowners in northern Minnesota",
    moat_label: "Northern Minnesota",
    professional_label: "licensed HVAC contractor",
    consultation_label: "estimate",
    voice_exemplars_file: "tests/fixtures/voice-exemplars.txt",
  };
  config.content.disclaimer = "General information for homeowners. Ask a licensed HVAC contractor about your home.";
  config.scope.in_scope = ["residential heating and cooling decisions"];
  config.scope.out_of_scope = ["commercial refrigeration"];
  config.ideation.moat_terms = ["Northern Minnesota", "Duluth"];
  config.ideation.example_titles = ["Should You Repair or Replace an Aging Furnace?", "What Makes a Heat Pump Work in a Cold Climate?"];
  assert.deepEqual(validateEngineConfig(config, { requireCustomized: true }), []);
});

test("unknown cluster references in source searches are rejected", () => {
  const config = structuredClone(loadEngineConfig());
  config.ideation.stack_exchange_searches.push({ site: "diy", query: "furnace", cluster: "not_real" });
  const errors = validateEngineConfig(config, { requireCustomized: false });
  assert.ok(errors.some((error) => error.includes("unknown cluster not_real")));
});
