import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ENGINE_CONFIG_PATH = path.join(ROOT, "config", "engine.json");
const PLACEHOLDER = /\[(?:FIRM|FIELD|AUDIENCE|PROFESSIONAL|CONSULTATION)\]|Yourniche/i;

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read valid JSON from ${path.relative(ROOT, file)}: ${error.message}`);
  }
}

export function loadEngineConfig(file = ENGINE_CONFIG_PATH) {
  return readJson(file);
}

export function validateEngineConfig(config, { requireCustomized = true } = {}) {
  const errors = [];
  if (!config || typeof config !== "object") return ["config/engine.json must contain a JSON object"];
  if (config.version !== 1) errors.push("version must be 1");
  if (requireCustomized && config.customized !== true) errors.push("set customized to true after replacing every example value");

  const requiredBrand = ["name", "field", "audience", "moat_label", "professional_label", "consultation_label", "voice_exemplars_file"];
  for (const key of requiredBrand) {
    const value = config.brand?.[key];
    if (typeof value !== "string" || !value.trim()) errors.push(`brand.${key} is required`);
    else if (requireCustomized && PLACEHOLDER.test(value)) errors.push(`brand.${key} still contains a template placeholder: ${value}`);
  }

  const min = config.content?.min_words;
  const max = config.content?.max_words;
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < 300 || max <= min) {
    errors.push("content.min_words and content.max_words must be sensible integers with max_words greater than min_words");
  }
  const disclaimer = config.content?.disclaimer;
  if (typeof disclaimer !== "string" || !disclaimer.trim()) errors.push("content.disclaimer is required");
  else if (requireCustomized && PLACEHOLDER.test(disclaimer)) errors.push("content.disclaimer still contains template placeholders");

  for (const key of ["in_scope", "out_of_scope"]) {
    const values = config.scope?.[key];
    if (!Array.isArray(values) || values.length === 0) errors.push(`scope.${key} must be a non-empty array`);
    else if (requireCustomized && values.some((value) => PLACEHOLDER.test(String(value)) || /^\s*EXAMPLE\b/i.test(String(value)))) errors.push(`scope.${key} still contains EXAMPLE text`);
  }

  const clusters = config.clusters;
  if (!Array.isArray(clusters) || clusters.length === 0) {
    errors.push("clusters must be a non-empty array");
  } else {
    const ids = new Set();
    for (const [index, cluster] of clusters.entries()) {
      if (!/^[a-z][a-z0-9_]*$/.test(cluster?.id || "")) errors.push(`clusters[${index}].id must be snake_case`);
      if (ids.has(cluster?.id)) errors.push(`duplicate cluster id: ${cluster.id}`);
      ids.add(cluster?.id);
      if (!cluster?.description) errors.push(`cluster ${cluster?.id || index} needs a description`);
      if (!(Number(cluster?.practice_value) >= 0 && Number(cluster?.practice_value) <= 1)) errors.push(`cluster ${cluster?.id || index} practice_value must be between 0 and 1`);
    }
    for (const [index, search] of (config.ideation?.stack_exchange_searches || []).entries()) {
      if (!search.site || !search.query) errors.push(`ideation.stack_exchange_searches[${index}] needs site and query`);
      if (!ids.has(search.cluster)) errors.push(`ideation.stack_exchange_searches[${index}] references unknown cluster ${search.cluster}`);
    }
  }

  if (!Array.isArray(config.ideation?.moat_terms) || config.ideation.moat_terms.length === 0) {
    errors.push("ideation.moat_terms must list at least one phrase that identifies Lane B");
  } else if (requireCustomized && config.ideation.moat_terms.some((term) => PLACEHOLDER.test(String(term)))) {
    errors.push("ideation.moat_terms still contains Yourniche");
  }
  if (requireCustomized && (config.ideation?.example_titles || []).some((title) => PLACEHOLDER.test(String(title)) || /\b[XYZ]\b/.test(String(title)))) {
    errors.push("ideation.example_titles still contains template placeholders");
  }

  const exemplar = config.brand?.voice_exemplars_file;
  if (typeof exemplar === "string" && exemplar.trim()) {
    const resolved = path.resolve(ROOT, exemplar);
    if (!resolved.startsWith(ROOT + path.sep)) errors.push("brand.voice_exemplars_file must stay inside this repository");
    else if (!fs.existsSync(resolved)) errors.push(`voice exemplar file does not exist: ${exemplar}`);
    else if (requireCustomized && /PASTE TWO OR THREE|Use a line containing four hyphens/i.test(fs.readFileSync(resolved, "utf8"))) errors.push("voice exemplar file still contains starter instructions instead of real approved writing");
  }
  return errors;
}

export function validateProjectCustomization(config = loadEngineConfig()) {
  const errors = validateEngineConfig(config, { requireCustomized: true });
  const clusters = new Set((config.clusters || []).map((cluster) => cluster.id));
  const read = (relative) => {
    try { return fs.readFileSync(path.join(ROOT, relative), "utf8"); }
    catch (error) { errors.push(`${relative} cannot be read: ${error.message}`); return ""; }
  };
  const parse = (relative) => {
    try { return JSON.parse(read(relative)); }
    catch (error) { errors.push(`${relative} is not valid JSON: ${error.message}`); return {}; }
  };

  const seeds = parse("config/seeds.json").seeds || [];
  if (!Array.isArray(seeds) || seeds.length === 0) errors.push("config/seeds.json must contain at least one seed");
  for (const [index, seed] of (Array.isArray(seeds) ? seeds : []).entries()) {
    if (!seed?.stem) errors.push(`config/seeds.json seed ${index} has no stem`);
    else if (PLACEHOLDER.test(seed.stem)) errors.push(`config/seeds.json seed ${index} still contains a template placeholder`);
    if (!clusters.has(seed?.cluster)) errors.push(`config/seeds.json seed ${index} uses unknown cluster ${seed?.cluster}`);
  }

  const sources = parse("config/sources.json");
  for (const tier of ["moat_authority", "general_authority"]) {
    const values = sources[tier];
    if (!Array.isArray(values)) errors.push(`config/sources.json ${tier} must be an array`);
    for (const domain of Array.isArray(values) ? values : []) {
      if (PLACEHOLDER.test(domain) || /\.example\b/i.test(domain)) errors.push(`config/sources.json ${tier} still contains a template domain: ${domain}`);
    }
  }

  const grounding = parse("config/grounding.json");
  if (PLACEHOLDER.test(JSON.stringify(grounding.authorities || [])) || /\bEXAMPLE\b|\.example\b/i.test(JSON.stringify(grounding.authorities || []))) {
    errors.push("config/grounding.json still contains template authorities");
  }

  const blocklist = parse("config/topic-blocklist.json");
  if (PLACEHOLDER.test(JSON.stringify(blocklist.banned || [])) || /\bEXAMPLE\b/i.test(JSON.stringify(blocklist.banned || []))) errors.push("config/topic-blocklist.json still contains template rules");
  for (const [index, rule] of (blocklist.banned || []).entries()) {
    try { new RegExp(rule.pattern, "i"); } catch { errors.push(`config/topic-blocklist.json rule ${index} has an invalid regular expression`); }
  }

  if (PLACEHOLDER.test(read("docs/content-profile.md")) || /\bEXAMPLE\b/i.test(read("docs/content-profile.md"))) errors.push("docs/content-profile.md still contains template/example content");
  return [...new Set(errors)];
}

export function assertCustomized(config = loadEngineConfig()) {
  const errors = validateProjectCustomization(config);
  if (errors.length) {
    throw new Error(`Template customization is incomplete:\n- ${errors.join("\n- ")}\n\nRun npm run check:customization for the same checklist.`);
  }
  return config;
}

export function fillTemplate(text, config = loadEngineConfig()) {
  return String(text)
    .replaceAll("[FIRM]", config.brand.name)
    .replaceAll("[FIELD]", config.brand.field)
    .replaceAll("[AUDIENCE]", config.brand.audience)
    .replaceAll("[PROFESSIONAL]", config.brand.professional_label)
    .replaceAll("[CONSULTATION]", config.brand.consultation_label)
    .replace(/Yourniche/gi, config.brand.moat_label);
}

export function clusterPrompt(config = loadEngineConfig()) {
  return config.clusters.map((c) => `- ${c.id}: ${c.description}`).join("\n");
}

export function scopePrompt(config = loadEngineConfig()) {
  return `IN SCOPE:\n${config.scope.in_scope.map((x) => `- ${x}`).join("\n")}\n\nOUT OF SCOPE:\n${config.scope.out_of_scope.map((x) => `- ${x}`).join("\n")}`;
}

export function makeDisclaimer(config = loadEngineConfig()) {
  return `*${fillTemplate(config.content.disclaimer, config)}*`;
}
