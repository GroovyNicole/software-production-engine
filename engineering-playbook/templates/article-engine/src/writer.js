// Article writer: turns one ranked topic into a review-ready DRAFT in [FIRM]'s house voice.
//
// The writer drafts from structured machine-research claims that passed the configured source policy.
// Machine research is never labeled human verification or publication approval. The article may use a
// hard fact only when a direct claim contains it; otherwise the deterministic validator quarantines it.
//
// Safety enforcement after drafting: deDash() removes every em dash; unverifiedSpecifics() flags any
// figure/date/source in the body that the brief did not support (-> status "needs_fix").
import "./env.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { callAnthropic as requestAnthropic, textFromResponse } from "./anthropic.js";
import { fillTemplate, loadEngineConfig, makeDisclaimer } from "./config.js";

const WRITER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Verbatim, appended by us — never authored by the model.
export const DISCLAIMER = makeDisclaimer(loadEngineConfig());
const regexEscape = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MOAT_PATTERN = regexEscape(loadEngineConfig().brand.moat_label);

// Layer-2 citation-shaped patterns (ARCHITECTURE §8). Any hit in the body
// that does NOT correspond to an allowed `citation` string → quarantine.
// Extend this set as real drafts reveal citation shapes the scan misses (§14).
export const CITATION_PATTERNS = [
  new RegExp(`${MOAT_PATTERN}\\s+(?:Code|Reg\\.?|Rule|Std\\.?)\\s*§?\\s*\\d+(?::\\d+)?(?:\\.\\d+)?`, "gi"),
  /§+\s*\d+[\d.:\-]*/g,
  /\bSection\s+\d+[\d.]*/gi,
  /\b(?:Form|Spec)\s*\d{2,4}\b/g,
];

const norm = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();

// A body citation string "corresponds to" an allowed citation when, after
// whitespace/case normalization, one contains the other (handles "Form 12"
// matched inside the allowed "Ref Form 12", etc.).
function corresponds(hit, allowedNorms) {
  const h = norm(hit);
  return allowedNorms.some((c) => c && (c === h || c.includes(h) || h.includes(c)));
}

/**
 * validateDraft(bodyMarkdown, allowedAuthorities, usedAuthorityIds)
 * The deterministic enforcer. Pure — no I/O, no model — so it is trivially
 * testable and cannot be argued out of quarantining a fabricated cite.
 *
 * Returns:
 *   { survivingIds, groundingAuthority, offending[], quarantined:boolean }
 */
export function validateDraft(bodyMarkdown, allowedAuthorities, usedAuthorityIds = []) {
  const allowedById = new Map(allowedAuthorities.map((a) => [a.id, a]));
  const allowedNorms = allowedAuthorities.map((a) => norm(a.citation)).filter(Boolean);

  // (1) Resolve used ids against the allowed (verified+matched) set only.
  //     An id the model returns that is not in the allowed set is dropped.
  const survivingIds = [];
  const groundingAuthority = [];
  for (const id of usedAuthorityIds) {
    const a = allowedById.get(id);
    if (a && a.citation) {
      survivingIds.push(id);
      groundingAuthority.push(a.citation);
    }
  }

  // (2) Scan the body for citation-shaped strings. Any that do not correspond
  //     to an allowed citation are fabrications → quarantine.
  const offending = [];
  for (const re of CITATION_PATTERNS) {
    const matches = bodyMarkdown.match(re) || [];
    for (const m of matches) {
      if (!corresponds(m, allowedNorms) && !offending.includes(m.trim())) {
        offending.push(m.trim());
      }
    }
  }

  return {
    survivingIds,
    groundingAuthority,
    offending,
    quarantined: offending.length > 0,
  };
}

// ── The house-voice system prompt (identical every call → the caching target). ──
// Assembled from docs/content-profile.md; do not re-derive the voice elsewhere.
const SYSTEM = `You are a staff writer for [FIRM], a practice in [FIELD] that serves [AUDIENCE]. You draft evergreen, plain-language blog articles that demonstrate the brand's authority and attract clients. You are NOT writing professional advice to a specific person and you are NOT a news outlet.

PURPOSE (the through-line of every article): show how having an expert's guidance helps THIS reader make a BETTER decision. The piece is a decision-support article carried with expert framing: lead with the real decision the reader faces, then reveal the non-obvious risk or trap they would miss on their own, or the lever a seasoned expert knows to pull, so the reader feels the value of expert guidance WITHOUT being sold to. It is not a textbook and not generic advice; the field expertise is what makes the reader's decision better. Demonstrate that value by being genuinely useful (the consultation close is the only ask).

AUDIENCE & VOICE
- Reader: someone making or trying to understand a decision in this field — NOT a specialist. Never write to other experts.
- Voice: practical, plain-language, second-person ("you", "your situation"). Confident but not salesy. Explain terms in ordinary words.
- Length: an 800–1200 word article with a few short H2/H3 sections in markdown. No fluff, no filler restating the title.

QUALITY BAR — this must read like a sharp expert explaining things to a client, not like generic SEO filler:
- Open using the OPENING STYLE assigned for THIS article (given in the user message). [FIRM]'s writer does NOT open every piece the same way, and neither may you. NEVER default to a string of short second-person sentences or a "you did X, you did Y, except one thing" cold open — that reflex makes every article read identically and is banned unless the assigned style is explicitly the narrative one. No throat-clearing ("In today's fast-moving world…", "When it comes to…").
- VARIETY IS A HARD REQUIREMENT. Two of these articles must never feel interchangeable in their first paragraph. Vary sentence length and rhythm throughout. Do not fall into a repeating three-short-sentences pattern.
- PUNCTUATION IS NOT A CRUTCH. No single mark may become a stylistic tic. Do not fall back on the colon as a default sentence shape, the trap that merely swaps em-dash overuse for colon overuse. Keep colons rare across the whole article and semicolons rarer. Favor clean, well-built separate sentences. (See the absolute dash-and-substitute rule below.)
- Be concrete and specific: real dollars, timelines, and the actual mechanics of the decision. Use a scenario ONLY when the assigned opening calls for it, not as a reflex.
- Every section must add new information — never restate the title or pad; avoid list-after-list monotony (prose with the occasional tight list).
- End with a genuinely useful takeaway or next step, not a generic "consult an expert" paragraph (the disclaimer is appended separately).
- Sound like a person with judgment: name the tradeoffs, the common mistake, and what usually matters most. Do not hedge everything into mush.

NO EM DASHES, AND NO SUBSTITUTE PUNCTUATION CRUTCH (ABSOLUTE RULE). Never use an em dash (the "—" character), an en dash used as a dash ("–"), or a double hyphen ("--") anywhere in your output, not in the title, the dek, or the body. This is non-negotiable. But do NOT "solve" it by leaning on another single mark. When you would reach for a dash, do not drop in a comma splice, and above all do not drop in a colon or a semicolon. Trading an em-dash habit for a colon habit, the endless "setup, then a colon, then the payoff" sentence, is the exact failure to avoid here. The correct fix is almost always to write two clean, well-built sentences, or to restructure the clause so it needs no special mark at all. Treat the colon and the semicolon as rare tools. Across an ENTIRE article use at most one or two colons total, and only where a colon is genuinely the best available choice, never as a recurring sentence shape; semicolons rarer still. Write with the varied, natural rhythm of a careful human essayist. Vary sentence length and structure, use plain correct commas, allow the occasional parenthesis, and keep colons and semicolons so sparse a reader never notices them. People wrote beautifully for centuries without leaning on any one punctuation mark, and so must you.

IN-SCOPE CLUSTERS (a topic maps to exactly one):
- getting_started: foundational "what is / do I need / where do I begin" questions
- choosing: comparisons and either-or decisions
- process: how something works, step by step
- cost: pricing, budget, and ROI questions
- pitfalls: common mistakes to avoid
- standards: the rules, requirements, and best practices of the field
- advanced: specialized, edge-case, or higher-stakes situations
- planning: long-term, ongoing, and future-proofing decisions

OUT OF SCOPE — if the topic falls outside this field entirely, sits in an adjacent field the practice doesn't cover, is pure breaking-news, or is specialist-to-specialist/academic material, DO NOT write it. Instead return exactly: {"skip": true, "skip_reason": "<one sentence why>"}.

TWO EQUALLY-VALID MODES (choose per topic; do NOT force a pitfall angle):
- "informational": neutral decision-support — "What is…", "Should I…", "Can I…", "How does X work". No trap.
- "pitfall": reader-protective — warns of a trap or costly mistake ("why X fails", "what you're actually owed", "without creating a mess").

TITLE RULES (write the reader's literal question; evergreen, never reactive). Register to match:
- How Do You Do X Without Creating a Mess?
- What Is Z and When Do You Need It?
- Should You Choose X or Y?
- What Happens to Your Yourniche Setup When You Move On?
- Why Z Fails in Yourniche.

YOURNICHE MOAT (Lane B): when the topic has a material Yourniche-specific angle, LEAD with the Yourniche rule — that niche-specific answer is the whole differentiator a generic site can't replicate. Frame it Yourniche-first, not as a general piece with a Yourniche footnote.

VOICE — match [FIRM]'s writer. STYLE EXEMPLARS (real [FIRM] articles) appear at the very end of this prompt; study their cadence, structure, and confidence and write like them, WITHOUT reusing their content or topics:
- OPEN with the archetype assigned in the user message, and vary openings the way [FIRM]'s writer does across pieces (define the term; state the stakes plainly; flip a common assumption; a wry observation; a conversational hook; or reframe the reader's question). Do NOT open every article the same way.
- Use descriptive H2 headers and VARY their form. A "Topic: The Angle" colon header is fine once in a while, but it must NOT be the default; most headers should be plain descriptive phrases with no colon.
- Be concrete when the machine-researched claim list supports it. Use no figure, form, deadline, or Yourniche-specific rule outside that list (see GROUNDING).
- Confident, plain-language, peer-to-peer, decisive. An occasional first-person aside from an experienced expert ("In my experience...") fits.
- Nuanced where it earns it ("isn't enough, but isn't nothing"; "finality cuts both ways").
- Near the end, include a "Frequently Asked Questions" section of 3–4 Q&As (a "Q:" line, then a tight answer).
- Close with a short call to action to schedule a [CONSULTATION] with [FIRM].

GROUNDING — use the machine-researched claim list, but do NOT show your work. Claims have passed a source-domain check; they have NOT been approved by a human. You write for a general reader, not a specialist.
- NO SOURCE CITATIONS IN THE BODY (absolute). Never print a source or reference number (like Yourniche Code § 42 or Yourniche Rule 12:906), a bare "§" section reference, a "Section N" reference, or a form/spec number's citation shape anywhere in the article. Citing your work makes it read like a technical brief, which is exactly the wrong feel. State the RULE ITSELF in plain language instead, the way an expert explains it to a client: "Yourniche practice requires...", "an authoritative source restricts who can...", "the field's own standard says...". The specific citation stays in the behind-the-scenes brief for the expert's fact-check and NEVER appears in the article.
- You MAY use a plain-language rule, dollar figure, deadline, or named concept only when a provided claim supports it. Add that claim's id to used_claim_ids. Never attach the citation number in the reader-facing body.
- Anything in the brief's "COULD NOT VERIFY" section, or any specific NOT in the brief at all, you must NOT assert. Make that point in GENERAL terms instead (confident in tone, but no invented rule, number, or deadline). NEVER invent a source, figure, deadline, standard, or form.
- If the brief is empty or unavailable, write a solid GENERAL article, confident but with no specific figures or deadlines.
- Do NOT name sources, add footnotes, a "Sources" section, or say "according to." The research trail stays behind the scenes for human review.

OUTPUT — return TWO parts, in this EXACT order (this keeps the article body OUT of the JSON so quotes and line breaks can't break parsing):
1) FIRST, a JSON object and nothing before it (no prose, no fences):
{
  "title": "string — owner's-question title in the register above",
  "dek": "string — one-sentence standfirst shown under the title",
  "mode": "informational" | "pitfall",
  "used_claim_ids": ["ids of machine-researched claims actually used; empty when the article stays general"]
}
2) THEN a line containing exactly this delimiter and nothing else:
---ARTICLE-BODY---
3) THEN the full article in markdown (900–1300 words: thesis opening, a few descriptive H2 sections, an FAQ section of 3–4 Q&As, and a short [FIRM] [CONSULTATION] close; NO disclaimer, NO JSON, just the article prose). Do NOT repeat the title as a heading; start with the opening paragraph.

If the topic is OUT OF SCOPE, instead return ONLY {"skip": true, "skip_reason": "<one sentence>"} with no delimiter and no body.`;

export function systemPrompt() {
  const config = loadEngineConfig();
  return fillTemplate(SYSTEM, config)
    .replaceAll("800–1200", `${config.content.min_words}–${config.content.max_words}`)
    .replaceAll("900–1300", `${config.content.min_words}–${config.content.max_words}`);
}

// Mirror of src/claude.js house pattern: raw fetch, defensive parse. Adds a
// temperature knob (≈0.6 prose runtime, 0 in golden tests) and marks the large
// static system prompt as a prompt-cache breakpoint (FABLE-BUILD-PLAN §11).
async function callClaude({ system, user, model, temperature, maxTokens = 4096 }) {
  const data = await requestAnthropic({
    model,
    maxTokens,
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    user,
    temperature,
  });
  return textFromResponse(data);
}

function parseModelJson(raw) {
  let t = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(t);
  } catch {
    // Fallback: carve out the outermost object.
    const first = t.indexOf("{");
    const last = t.lastIndexOf("}");
    if (first !== -1 && last > first) return JSON.parse(t.slice(first, last + 1));
    throw new Error("writer: model did not return parseable JSON");
  }
}

function wordCount(md) {
  return (md.trim().match(/\S+/g) || []).length;
}

// Models (Sonnet especially) ignore a "no em dashes" instruction constantly, so we ENFORCE it
// deterministically after drafting: a focused copy-editor pass that REWRITES each dashed sentence
// (never a naive strip), looped until none remain. the maintainer's rule: correct, natural prose without dashes.
export function hasDash(s) {
  const t = String(s || "");
  if (/[—–]/.test(t)) return true;                     // em / en dash always counts
  // a "--" dash substitute counts, but a markdown horizontal rule (a line of 3+ hyphens) does NOT
  return /--/.test(t.replace(/^[ \t]*-{3,}[ \t]*$/gm, ""));
}

const DEDASH_SYS =
  "You are a meticulous copy editor. Rewrite the text to ELIMINATE every em dash (—), every en dash " +
  "used as punctuation (–), and every double hyphen (--). Do NOT just delete a dash and drop a comma " +
  "in its place. Restructure each affected sentence so it is grammatically correct and reads naturally " +
  "with NO dash. Split it into two clean sentences or rephrase the clause entirely. Do NOT introduce a " +
  "colon, a semicolon, or a comma splice as a substitute, which just trades one crutch for another; a " +
  "parenthesis is acceptable only for a genuine aside. Change NOTHING else: keep every heading, list, " +
  "markdown mark, citation, fact, and the meaning exactly as given. Return ONLY the corrected text, with " +
  "no preamble.";

// Colon overuse is the exact failure mode we get when we ban em dashes, so cap it deterministically the
// same way (a model rewrite pass), not just by asking the writer nicely. Prose only; a title may keep one.
const MAX_PROSE_COLONS = 2;

// Count ONLY stylistic prose colons. Source sections (Yourniche Code 37:1271), clock times, and URL schemes
// use colons legitimately and must not count, or the cap would fire on clean, citation-heavy articles.
function proseColonCount(body) {
  return String(body || "")
    .split("\n")
    .filter((l) => !/^\s*#/.test(l) && !/^\s*\*+\s*Q:/.test(l) && !/^\s*\*+\s*A:/.test(l)) // skip headings + FAQ labels
    .join("\n")
    .replace(/https?:\/\//g, "")   // URL scheme
    .replace(/\d+\s*:\s*\d+/g, "")  // source sections (37:1271) AND clock times
    .split(":").length - 1;
}

const DECOLON_SYS =
  "You are a meticulous copy editor. The text OVERUSES the colon as a sentence device (the \"setup, then " +
  "a colon, then the payoff\" shape). Rewrite so that AT MOST one or two colons remain in the ENTIRE text, " +
  "and only where a colon is genuinely the best available choice. Replace every other colon by splitting " +
  "the sentence into two clean, well-built sentences or by restructuring the clause. Do NOT introduce em " +
  "dashes, en dashes, double hyphens, comma splices, or additional semicolons as substitutes. Change " +
  "NOTHING else: keep every heading, list, markdown mark, Q and A label, citation, fact, and the meaning " +
  "exactly as given. Return ONLY the corrected text, with no preamble.";

async function deColon(text, model) {
  let out = String(text || "");
  for (let i = 0; i < 3 && proseColonCount(out) > MAX_PROSE_COLONS; i++) {
    const fixed = (await callClaude({ system: DECOLON_SYS, user: out, model, temperature: 0.2, maxTokens: 4096 })).trim();
    if (!fixed) break;
    out = fixed;
  }
  return out;
}

// No source citations in the general-reader body. We verify every detail behind the scenes, but the article
// must not read like a technical brief. This strips source/reference citations deterministically (the prompt
// alone won't hold) and lets the model restate each point in plain language. Form numbers and plain figures are kept.
// NOTE: this is the COSMETIC "no brief-like citations in the body" stripper, not the fabrication guard.
// It deliberately OMITS the Form/Spec shape: a named "Form 12" is a helpful thing the reader can act on,
// not a court-brief citation, and the writer prompt explicitly allows keeping named concepts. The Form/Spec
// shape still lives in CITATION_PATTERNS / unverifiedSpecifics so a FABRICATED form number is still caught.
const CITE_PATTERNS = [
  new RegExp(`${MOAT_PATTERN}\\s+(?:Code|Reg\\.?|Rule|Std\\.?)\\s*§?\\s*\\d+(?::\\d+)?(?:\\.\\d+)?`, "gi"),
  /§+\s*\d+[\d.:\-]*/g,                                                  // bare § 1201 references
  /\bSection\s+\d+[\d.]*/gi,                                             // Section 12 references
];

function hasCite(s) {
  const t = String(s || "");
  return CITE_PATTERNS.some((re) => { re.lastIndex = 0; return re.test(t); });
}

const DECITE_SYS =
  "You are a copy editor for a plain-language blog written for [AUDIENCE], not specialists. Remove EVERY " +
  "source citation so the text does not read like a technical brief: source and reference numbers (Yourniche " +
  "Code § 42, Yourniche Rule 12:906), bare section-symbol references (§ 1201), 'Section N' references, and " +
  "form/spec citation numbers. Do NOT delete the substance. Restate each point in plain language " +
  "the way an expert explains it to a client, for example 'Yourniche practice requires...', 'a specific " +
  "authoritative source restricts who can...', or 'the field's own standard'. KEEP verified " +
  "plain-language rules, dollar figures, deadlines, and named concepts like 'a named standard' " +
  "or 'Form 12'. Do NOT introduce em dashes, and do NOT add colons or semicolons as " +
  "connective tissue. Change NOTHING else: keep every heading, list, Q and A label, markdown mark, the " +
  "facts, and the confident tone. Return ONLY the corrected text, with no preamble.";

async function deCite(text, model) {
  let out = String(text || "");
  for (let i = 0; i < 3 && hasCite(out); i++) {
    const fixed = (await callClaude({ system: fillTemplate(DECITE_SYS, loadEngineConfig()), user: out, model, temperature: 0.2, maxTokens: 4096 })).trim();
    if (!fixed) break;
    out = fixed;
  }
  return out;
}

async function deDash(text, model) {
  let out = String(text || "");
  for (let i = 0; i < 3 && hasDash(out); i++) {
    const fixed = (await callClaude({ system: DEDASH_SYS, user: out, model, temperature: 0.2, maxTokens: 4096 })).trim();
    if (!fixed) break;
    out = fixed;
  }
  return out;
}

// Load up to 2 of the firm's real articles as STYLE EXEMPLARS (few-shot voice transfer). Read from
// "[FIRM] sample articles.txt" so the maintainer can update the voice by editing that file. Cached per process.
let _exemplars = null;
function voiceExemplars() {
  if (_exemplars !== null) return _exemplars;
  try {
    const config = loadEngineConfig();
    const raw = fs.readFileSync(path.resolve(WRITER_ROOT, config.brand.voice_exemplars_file), "utf8");
    const parts = raw.split(/\n\s*-{4,}\.?\s*\n/).map((s) => s.trim()).filter((s) => s.length > 400);
    const pick = parts.slice(0, 2).map((a, i) => `--- STYLE EXEMPLAR ${i + 1} ---\n${a}`).join("\n\n");
    _exemplars = pick
      ? `\n\n==== STYLE EXEMPLARS — match this VOICE (cadence, structure, confidence); do NOT reuse their content or topics ====\n\n${pick}`
      : "";
  } catch {
    _exemplars = "";
  }
  return _exemplars;
}

// Detect hard-fact shapes that are absent from every retained direct claim statement.
const HARD_FACT_PATTERNS = [
  /\$\s?\d[\d,]*(?:\.\d+)?/g,
  /\b\d+(?:\.\d+)?\s?%/g,
  /\b\d+(?:\.\d+)?\s+(?:hours?|business\s+days?|days?|weeks?|months?|years?)\b/gi,
  /\b(?:19|20)\d{2}\b/g,
  /\b(?:Form|Spec|Standard|Rule|Code|Section)\s*[A-Z-]*\d+[\d.:-]*/gi,
  /§+\s*\d+[\d.:-]*/g,
];

function hardFactTokens(text) {
  const tokens = [];
  for (const pattern of HARD_FACT_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of String(text || "").match(pattern) || []) {
      const normalized = match.toLowerCase().replace(/\s+/g, " ").trim();
      if (!tokens.includes(normalized)) tokens.push(normalized);
    }
  }
  return tokens;
}

export function unverifiedSpecifics(text, research = {}) {
  const claims = Array.isArray(research?.claims) ? research.claims.filter((claim) => claim.support === "direct") : [];
  const claimText = claims.map((claim) => String(claim.statement || "").toLowerCase().replace(/\s+/g, " "));
  return hardFactTokens(text).filter((fact) => !claimText.some((statement) => statement.includes(fact)));
}

export function validateUsedClaims(usedIds, research = {}) {
  const allowed = new Set((research.claims || []).filter((claim) => claim.support === "direct").map((claim) => claim.id));
  const surviving = [];
  const rejected = [];
  for (const id of Array.isArray(usedIds) ? usedIds : []) {
    if (allowed.has(id)) {
      if (!surviving.includes(id)) surviving.push(id);
      continue;
    }
    if (!rejected.includes(id)) rejected.push(id);
  }
  return { surviving, rejected };
}

export function inferClaimIdsFromSpecifics(text, research = {}) {
  const facts = hardFactTokens(text);
  if (!facts.length) return [];
  return (research.claims || [])
    .filter((claim) => claim.support === "direct")
    .filter((claim) => {
      const statement = String(claim.statement || "").toLowerCase().replace(/\s+/g, " ");
      return facts.some((fact) => statement.includes(fact));
    })
    .map((claim) => claim.id);
}

// Opening archetypes drawn from [FIRM]'s writer's REAL range (the articles do NOT all open the same way).
// One is assigned deterministically per topic so a batch never opens with the same rhythm twice, and the
// engine stops defaulting to the "you did X, you did Y, except one thing" narrative cold open.
const OPENING_ARCHETYPES = [
  "DEFINITIONAL: open by defining the core term in plain words and why it matters to the reader. A calm, declarative first sentence (e.g., 'A standing agreement is a document that sets the baseline terms between two parties...'). No 'you' scene.",
  "THESIS / STAKES: open with a flat declarative sentence about why this topic is overlooked, consequential, or commonly gotten wrong. No scenario, no second-person setup (e.g., 'The handoff step is one of the most overlooked parts of the whole process.').",
  "ASSUMPTION-FLIP: state what most people assume, then flip it in the next sentence. A first-person aside fits (e.g., 'Most Yourniche owners assume the default setup takes over if something happens to them. It usually does not work the way they think.').",
  "OBSERVATIONAL: open with one wry, true observation about how people actually behave (e.g., 'Most people spend years building something, then about four weeks trying to hand it off.'). One or two medium sentences, not a burst of short ones.",
  "CONVERSATIONAL: a direct, conversational hook that names a shared experience (e.g., 'If you have ever signed up for something, you have almost certainly skimmed the fine print. Most people skip right past it.').",
  "QUESTION-REFRAME: restate the reader's real question and why the honest answer is more complicated than it looks, in a couple of medium-length sentences. Do NOT use a list of short sentences.",
  "PLAIN-CONTEXT: open with the practical situation in ONE flowing sentence of normal length, then the stakes. Avoid the choppy three-short-sentence rhythm entirely.",
];

function pickArchetype(seedStr) {
  let h = 0;
  for (const ch of String(seedStr || "x")) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return fillTemplate(OPENING_ARCHETYPES[h % OPENING_ARCHETYPES.length], loadEngineConfig());
}

/**
 * writeArticle(topic, brief, opts) → DraftPartial | SkipMarker
 *
 * brief: { brief: string, sources: string[], available: bool } from src/verify.js — the verified
 *   research the writer drafts from. If empty/unavailable, the writer stays general (no specifics).
 * opts: { model, temperature=0.6, maxTokens }
 *
 * Returns { skip, skip_reason } for out-of-scope topics; otherwise the draft fields + the verification
 * trail (verification_brief, sources) for the console's fact-check pane.
 */
export async function writeArticle(topic, brief = {}, opts = {}) {
  const config = loadEngineConfig();
  const {
    model = process.env.WRITER_MODEL || "claude-sonnet-4-6",
    temperature = 0.6,
    maxTokens = 4096,
  } = opts;

  const claims = Array.isArray(brief?.claims) ? brief.claims.filter((claim) => claim.support === "direct") : [];
  const briefText = claims.length
    ? JSON.stringify(claims.map(({ id, statement, scope }) => ({ id, statement, scope })), null, 2)
    : "";
  const userPayload =
    `TOPIC: ${topic.topic}\n` +
    `CLUSTER: ${topic.cluster}\n` +
    `MOAT-SPECIFIC (${config.brand.moat_label}): ${topic.lane === "B" ? "yes, lead with the moat-specific answer" : "not especially"}\n\n` +
    `OPENING STYLE FOR THIS ARTICLE (use it; do NOT open with short second-person sentences unless this IS the narrative style):\n${pickArchetype(topic.id || topic.topic)}\n\n` +
    (briefText
      ? `MACHINE-RESEARCHED CLAIMS THAT PASSED SOURCE POLICY (assert specifics ONLY from these; a human still reviews the draft):\n\n${briefText}`
      : `MACHINE-RESEARCHED CLAIMS: none passed source policy. Write a useful GENERAL article with NO specific figures, percentages, dates, deadlines, citation numbers, or numbered forms.`);

  const raw = await callClaude({
    system: systemPrompt() + voiceExemplars(),
    user: userPayload,
    model,
    temperature,
    maxTokens,
  });

  // Split the JSON header from the markdown body on the delimiter (keeps the body out of the JSON).
  const DELIM = "---ARTICLE-BODY---";
  const di = raw.indexOf(DELIM);
  const parsed = parseModelJson(di !== -1 ? raw.slice(0, di) : raw);

  if (parsed.skip === true) {
    return { skip: true, skip_reason: parsed.skip_reason || "out of scope" };
  }

  let body = String(di !== -1 ? raw.slice(di + DELIM.length).trim() : (parsed.body_markdown || ""));
  body = body.replace(/^[ \t]*-{3,}[ \t]*$/gm, "").replace(/\n{3,}/g, "\n\n").trim();  // drop markdown rules

  // NO-EM-DASH enforcement (prompt alone doesn't hold): rewrite title/dek/body to remove every dash.
  let title = String(parsed.title || "").trim();
  let dek = String(parsed.dek || "").trim();
  if (hasDash(title)) title = (await deDash(title, model)).trim();
  if (hasDash(dek)) dek = (await deDash(dek, model)).trim();
  body = await deDash(body, model);
  body = await deColon(body, model);                    // cap colon overuse (mirror of deDash)
  body = await deCite(body, model);                     // strip legal citations from the lay-reader body
  if (hasDash(body)) body = await deDash(body, model);  // later passes must not leave a dash
  if (proseColonCount(body) > MAX_PROSE_COLONS) body = await deColon(body, model); // or a colon crutch

  const wc = wordCount(body);

  const claimUse = validateUsedClaims(parsed.used_claim_ids, brief);
  const validatedText = `${title}\n${dek}\n${body}`;
  const offending = unverifiedSpecifics(validatedText, brief);
  const validationErrors = [];
  if (claimUse.rejected.length) validationErrors.push(`Unknown or unsupported claim ids: ${claimUse.rejected.join(", ")}`);
  if (offending.length) validationErrors.push(`Specifics not supported by a validated claim: ${offending.join("; ")}`);
  if (hasDash(`${title}\n${dek}\n${body}`)) validationErrors.push("Dash-removal invariant failed after copy editing");
  if (proseColonCount(body) > MAX_PROSE_COLONS) validationErrors.push("Colon limit still exceeded after copy editing");
  if (wc < config.content.min_words || wc > config.content.max_words) {
    validationErrors.push(`Word count ${wc} is outside configured range ${config.content.min_words}-${config.content.max_words}`);
  }
  const status = validationErrors.length ? "needs_fix" : "drafted";
  const validationError = validationErrors.length ? validationErrors.join(" | ") : null;
  const usedClaimIds = [...new Set([...claimUse.surviving, ...inferClaimIdsFromSpecifics(validatedText, brief)])];
  const usedClaims = claims.filter((claim) => usedClaimIds.includes(claim.id));
  const needsGrounding = claims.length === 0 || offending.length > 0 || claimUse.rejected.length > 0;

  return {
    title,
    dek,
    mode: parsed.mode === "pitfall" ? "pitfall" : "informational",
    body_markdown: `${body.trim()}\n\n${DISCLAIMER}`,
    word_count: wc,
    verified: false,
    machine_researched: claims.length > 0,
    research_status: brief?.research_status || "unavailable",
    research_claims: claims,
    used_claim_ids: usedClaimIds,
    verification_brief: brief?.brief || "",
    sources: [...new Set(usedClaims.map((claim) => claim.source_url))],
    needs_grounding: needsGrounding,
    needs_grounding_note: needsGrounding ? "Human fact-check required; one or more specifics lack validated machine research." : "",
    grounding_authority: usedClaims.filter((claim) => claim.origin === "human_curated").map((claim) => claim.source_title).filter(Boolean),
    used_authority_ids: usedClaims.filter((claim) => claim.origin === "human_curated").map((claim) => claim.id),
    human_reviewed: false,
    publishable: false,
    validation_error: validationError,
    status,
  };
}
