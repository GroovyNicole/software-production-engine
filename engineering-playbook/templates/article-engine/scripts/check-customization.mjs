#!/usr/bin/env node
import { loadEngineConfig, validateProjectCustomization } from "../src/config.js";

const errors = validateProjectCustomization(loadEngineConfig());
if (errors.length) {
  console.error("\nCUSTOMIZATION INCOMPLETE\n");
  errors.forEach((error) => console.error(`  - ${error}`));
  console.error("\nFollow CUSTOMIZE-FOR-ANY-INDUSTRY.md from Step 1 onward.\n");
  process.exit(1);
}

console.log("\nCustomization check passed. The engine has no known starter placeholders.\n");
