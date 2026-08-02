# Content Profile — target output calibration (EXAMPLE — rewrite for your field)

**Purpose:** Defines what a "good" article looks like for your brand, so the engine ideates topics and the
scorer ranks toward the right output. This is **load-bearing** — the prompts derive from it. The version below
is a neutral, domain-agnostic scaffold. Replace the bracketed placeholders and every EXAMPLE with your own.
Pairs with [source-registry.md](source-registry.md).

## Strategic goal
- The blog exists to give your brand **visibility and demonstrated authority** (marketing / SEO / lead-gen).
  It is NOT a news outlet and does not compete on timeliness or scoops.
- Implication: topics win on **evergreen value + real search demand**. "Do people actually search this?" is a
  primary ranking input, not a tiebreaker — so search-demand signals (autocomplete, pageviews) are CORE
  scorer inputs.

## Audience & voice
- **Reader:** `[AUDIENCE]` — someone making a decision or trying to understand something in your field, NOT a
  specialist. (e.g. "small-business owners", "new homeowners", "people choosing a first CRM").
- **Voice:** practical, plain-language, second-person. Confident, not salesy. Explain terms in ordinary words.
- **Two equally-valid modes** (do NOT force the pitfall angle):
  - **Informational** — "What is…", "Should I…", "Can I…", "How does X work". Neutral decision-support.
  - **Pitfall** — "Why X fails", "the mistake that costs you…", "without creating a mess". Reader-protective.
- **Your moat:** the differentiator a generic national site can't replicate — your first-party data, local
  presence, proprietary method, or hard-won expertise. `Yourniche`-specific angles are your Lane B.

## Scope (generate ideas ONLY where you can actually serve the reader)
Every topic should map to something your brand actually offers, so the blog converts readers to customers.

**IN SCOPE (EXAMPLE — replace):** the decisions and questions in `[FIELD]` that your product/service helps
with; comparisons a buyer faces; the recurring "how do I / should I / can I" questions your customers ask.
**OUT OF SCOPE (hard reject — replace):** adjacent areas you don't serve; pure breaking-news; specialist-to-
specialist / academic material; anything with no realistic audience search demand.

## Example titles (EXAMPLE gold standard — replace with your own)
1. How Do You Do X Without Creating a Mess?
2. What You Actually Get When Someone Promises Y and Doesn't Deliver
3. What Is Z and When Do You Need It?
4. What Happens to A When You Do B?
5. Should You Choose X or Y?
6. Why X Fails (and the One Thing That Prevents It)

Purely-informational examples (educational mode, no pitfall framing):
- "Should I do X?"  ·  "Can I undo Y later?"  ·  "What is Z?" explainers generally.

## Title pattern
- Form: the reader's literal question — "How do you…", "What happens to…", "What is… and when do you need
  it", "Why … fails", "X or Y?"
- POV: reader-protective; reveal the non-obvious risk or lever ("without creating a mess", "what you actually
  get", "why X fails").
- Timing: EVERGREEN explainers answering a recurring decision or fear — NOT reactive news.

## Topic clusters (the reader's decision areas — rename to YOUR service/product categories)
The engine buckets every topic into exactly one cluster and weights clusters by business value
(`config/engine.json`). This neutral set works for most fields; rename to yours.

1. **getting_started** — "what is / do I need / where do I begin" foundational topics.
2. **choosing** — comparisons and either/or decisions ("X or Y?", "which should I pick?").
3. **process** — how something works, step-by-step.
4. **cost** — pricing, value, budget, and ROI decisions.
5. **pitfalls** — mistakes to avoid, what goes wrong, reader-protective.
6. **standards** — the rules, requirements, and best practices of your field.
7. **advanced** — specialized, edge-case, or higher-stakes decisions.
8. **planning** — long-term, ongoing, or future-proofing decisions.

## Engine implications (load-bearing)
1. **Two lanes.** Lane A = broad / national / informational topics (win on search demand). Lane B = your
   **moat** topics (win on differentiation — the thing a generic competitor can't answer as well). Treat "a
   `Yourniche`-specific angle exists" as a HIGH-score state even when external forum signal is thin.
2. **Grounding is your accuracy rail — and often your #1 build constraint.** Web claims must pass the source
   tiers in `config/sources.json`; reusable human-checked claims may live in `config/grounding.json`.
   Anything unsupported is stated generally or flagged `needs_grounding`. See `BUILD-PLAYBOOK.md` §3–6.

## Scorer signals
**Hard scope filter (reject before scoring):** topic must map to an in-scope area you actually serve.
**Primary input (goal = brand visibility):** real search demand — does the audience actually search this?
High-volume evergreen questions win.
**Reward:** reader-relevant question framing in EITHER mode · a `Yourniche`-specific (moat) angle exists ·
evergreen (not date-bound) · intersection of two areas you serve.
**Do NOT penalize:** lacking a pitfall/dispute angle — purely informational topics are equally valid.
**Penalize:** pure breaking-news / timeliness plays · specialist-to-specialist / academic framing ·
off-audience · topics with no realistic search demand.
