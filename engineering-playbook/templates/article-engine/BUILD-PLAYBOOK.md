# Build Playbook

This is the operating philosophy behind the engine. The exact runtime contract is in `ARCHITECTURE.md`; the
beginner customization steps are in `CUSTOMIZE-FOR-ANY-INDUSTRY.md`.

## 1. Write about decisions, not keywords

An article earns its place when the brand's expertise materially improves a decision the reader faces.

Reject three common failures:

- encyclopedia copy with no decision or expert edge;
- opinion with no concrete reader action;
- a simple fact lookup that a search result answers better.

The useful test is: “Would the brand's expertise measurably change how this reader makes this decision?”

## 2. Separate traffic from differentiation

Do not collapse every topic into one leaderboard.

- Lane A earns attention through broad demand and strong execution.
- Lane B earns attention through a real moat: location, specialty, first-party knowledge, method, or audience.

A city name pasted onto a generic answer is not a moat. The specialty must change the answer.

## 3. Treat research, verification, and approval as different jobs

Machine research can find and organize evidence. It cannot assume a qualified person's accountability.

The code should preserve these boundaries:

1. Research proposes individual claims and source URLs.
2. Deterministic policy checks verify that search returned the URL and the hostname belongs to an approved
   authority tier.
3. The writer uses only retained claim statements for hard facts.
4. Deterministic checks quarantine unsupported fact shapes.
5. A qualified human checks meaning, applicability, currentness, context, and final wording.
6. A separate workflow records approval and handles publishing.

Never call step 2 “human verified.” Never let step 4 pretend it proves complete semantic correctness.

## 4. Validate the machine's weak points

Prompt instructions are preferences. Deterministic checks are guardrails.

When a model repeatedly fails in a recognizable way:

- define the bad shape;
- reject or quarantine it in code;
- add a planted-bad-input test that proves the guard fires;
- keep a human decision for failures that cannot be expressed safely in code.

A safety check that has never rejected a planted violation is not yet demonstrated.

## 5. Gate invented ideas

AI-generated topics have no demand-source guarantee and may contain an elegant false premise. Use both:

- deterministic known-bad patterns;
- a fail-closed expert-premise audit.

Record only ideas that survive the scorer. Otherwise rejected ideas pollute the duplicate ledger and quietly
starve future discovery.

## 6. Source policy is product configuration

Do not bury trusted domains inside prompts or source code. Each industry instance must identify:

- moat authorities that can support specialty-specific claims;
- general authorities that can support broad claims;
- inspiration sources that may suggest topics but never prove facts.

Prefer the original authority. A page that quotes a rule is not the rule. Review the policy over time because
domains, rules, APIs, and commercial-use terms change.

## 7. Punctuation and voice

No em dashes. Do not “fix” them by manufacturing a colon or semicolon habit. The best repair is usually two
clean sentences or a restructured clause.

Watch for substitution loops: a dash-removal pass can add colons, and a colon-removal pass can add dashes.
Recheck invariants after the last copy pass.

Voice examples must be owned and approved. They teach cadence, not facts. Do not use competitor articles or
confidential client material.

## 8. Control cost deliberately

Research and full-article copy passes are expensive. The largest levers are:

- configure narrow, trustworthy source domains;
- cache only structured research that passed policy;
- do not cache empty failures;
- reuse research for redrafts;
- keep scoring on its own model variable;
- start with one draft, then a batch of three;
- record cost/latency telemetry before claiming savings;
- reduce redundant full-body copy passes only after measuring quality.

## 9. Build and change in thin slices

For a new industry:

1. make customization validation pass;
2. inspect topic discovery and both ranking lanes;
3. test one topic's research claims;
4. draft one article;
5. fact-check it manually;
6. tune configuration and prompts;
7. only then draft a small batch.

Correct the machine, not just the one bad article.

## 10. Preserve contracts and state honestly

Treat `output/drafts.json` as add-only when another tool consumes it. Add fields rather than renaming or
removing old ones.

Use these distinct concepts:

- drafted versus quarantined;
- machine research completed versus unavailable;
- grounding complete versus missing;
- human reviewed versus pending;
- publishable versus not publishable.

No model call should silently flip the last two.

## 11. Test invariants, not prose

Good offline tests cover source policy, claim support, state transitions, configuration relationships,
storage safety, and planted violations. They should not compare full generated articles word for word.

Live golden tests can evaluate word range, voice tendencies, mode, and prompt behavior, but they cost money and
vary by model. Use them as an additional evaluation layer.

## 12. Customize through configuration

Ordinary industry work belongs in `config/engine.json`, the other config files, the content profile, and the
voice examples. Core JavaScript should not gain a new client name, city, profession, or authority domain.

If an industry truly requires a new claim shape, data connector, or workflow, add the capability generically
and test it. Do not smuggle one customer's assumptions into shared code.
