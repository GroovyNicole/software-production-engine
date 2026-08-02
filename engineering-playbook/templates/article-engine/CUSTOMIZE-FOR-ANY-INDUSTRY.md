# Customize This Article Engine for Any Industry

This is the beginner version. You do not need to understand the JavaScript to customize the engine.

The big idea is simple: **you change the facts about the business in `config/`; you do not rewrite the
engine in `src/`.**

## Five words you need to know

- **Audience:** the person reading the article. Example: first-time homeowners.
- **Field:** what the business knows. Example: residential heating and cooling.
- **Moat:** the useful angle generic competitors cannot answer as well. It may be a location, specialty,
  customer type, proprietary method, or first-party dataset.
- **Cluster:** a bucket of related customer decisions. Example: furnace replacement.
- **Authority:** a source you trust to support factual claims. Example: an official regulator or standards
  organization.

## What to edit and what not to edit

| File | What you do |
|---|---|
| `config/engine.json` | **Edit first.** Brand, audience, moat, scope, clusters, weights, article length, disclaimer, and source searches. |
| `config/voice-exemplars.txt` | Paste 2-3 articles the business has approved. |
| `docs/content-profile.md` | Explain the brand's audience, voice, scope, and good-title examples in normal language. |
| `config/seeds.json` | Add phrases real customers type or say. |
| `config/sources.json` | Add trusted authority domain names. |
| `config/grounding.json` | Optional: add facts a human has personally checked. |
| `config/topic-blocklist.json` | Add known false or harmful topic assumptions. |
| `.env` | Add the API key locally. Never commit it. |
| `src/*.js` | **Do not edit for an ordinary industry customization.** |

If you find yourself changing `Yourniche` inside JavaScript, stop. The moat belongs in
`config/engine.json` now.

## Before you begin: answer this one-page worksheet

Copy these questions into a note and answer them in plain English:

1. Business name:
2. What does the business actually sell or do?
3. Who is the reader?
4. What reader situations are in scope?
5. What nearby work does the business **not** do?
6. What is the moat: location, specialty, audience, method, or proprietary knowledge?
7. What are the 5-8 most valuable customer decisions?
8. Which official organizations publish trustworthy information for the whole field?
9. Which official organizations support facts specific to the moat?
10. What bad assumptions do customers repeatedly make?
11. Which 2-3 approved articles best represent the desired voice?

Do not continue until you can answer 1-6. Vague inputs create vague articles.

## Step 1: make your own branch

From a terminal in this folder:

```text
git switch -c customize/<short-industry-name>
```

Example: `git switch -c customize/minnesota-hvac`

This keeps the untouched template separate from the client/industry version.

## Step 2: fill in `config/engine.json`

Open `config/engine.json`. Leave `customized` as `false` while you work.

### Brand section

An HVAC example:

```json
"brand": {
  "name": "North Star Heating",
  "field": "residential heating and cooling",
  "audience": "homeowners in northern Minnesota",
  "moat_label": "Northern Minnesota",
  "professional_label": "licensed HVAC contractor",
  "consultation_label": "in-home estimate",
  "voice_exemplars_file": "config/voice-exemplars.txt"
}
```

Bad audience: `everyone who needs HVAC help`.

Better audience: `homeowners in northern Minnesota comparing repair and replacement options`.

The better version tells the engine who has the decision, where they are, and what they care about.

### Content section

Choose a useful word range. Start with 900-1300 unless the business has a strong reason not to.

Write a disclaimer that fits the risk of the field. For medical, legal, financial, safety, or regulated
content, have a qualified professional approve it. Do not copy a generic disclaimer and assume it protects
the business.

### Scope section

Be concrete. Scope is not a company slogan.

```json
"scope": {
  "in_scope": [
    "residential furnace and heat-pump repair-or-replace decisions",
    "homeowner maintenance and indoor comfort decisions",
    "cold-climate equipment selection"
  ],
  "out_of_scope": [
    "commercial refrigeration",
    "industrial boilers",
    "DIY gas-line instructions",
    "breaking weather news"
  ],
  "excluded_terms": ["automotive AC"],
  "excluded_geographies": ["Florida", "Texas"]
}
```

Why exclude geography? A local brand may not want a high-ranking article about rules or climate conditions
it does not serve.

### Cluster section

A cluster is a business-relevant decision area, not just a keyword category. You may keep the default eight
ids and rewrite their descriptions, or replace them with your own snake_case ids.

`practice_value` is between 0 and 1:

- `0.9` means a strong-fit, valuable customer decision;
- `0.5` means useful but not a core commercial priority;
- `0.1` means barely worth producing.

Do not set everything to `1`. If everything is top priority, the number does no work.

Example custom cluster:

```json
{
  "id": "repair_or_replace",
  "label": "Repair or replace",
  "description": "Decisions about repairing aging equipment versus replacing it",
  "practice_value": 0.95
}
```

If you rename a cluster, use that exact id in `config/seeds.json` and each configured Stack Exchange search.
The customization checker catches mismatches.

### Moat terms

List phrases that should route a topic to Lane B.

```json
"moat_terms": ["Northern Minnesota", "Duluth", "cold climate", "subzero"]
```

The moat does not have to be geographic:

- B2B SaaS: `multi-location dental groups`, `insurance eligibility workflow`;
- fitness: `postpartum runners`, if the brand is genuinely qualified to serve that group;
- accounting: `independent breweries`, if that is the firm's real specialty;
- manufacturing: a proprietary process or dataset, if the business can substantiate it.

### Stack Exchange searches

Choose a Stack Exchange site that contains relevant reader questions. Do not leave the template's `money`
site just because it is there.

```json
"stack_exchange_searches": [
  { "site": "diy", "query": "furnace replace repair", "cluster": "repair_or_replace" },
  { "site": "diy", "query": "heat pump cold climate", "cluster": "choosing" }
]
```

If there is no relevant Stack Exchange community, use an empty array. Bad data is worse than less data.

### Published topics

Paste the titles or core subjects of existing articles into `published_topics`. This prevents the engine from
pitching obvious duplicates.

## Step 3: add real voice examples

Open `config/voice-exemplars.txt`, delete the starter instructions, and paste 2-3 articles the business owns
and has approved. Separate articles with a line containing four hyphens:

```text
First approved article...

----

Second approved article...
```

Good examples are accurate, on-brand, and representative. Do not use:

- a competitor's copyrighted article;
- confidential client information;
- one unusually formal announcement that does not represent normal writing;
- AI text nobody has approved.

## Step 4: rewrite `docs/content-profile.md`

This is the plain-English editorial brief. Replace every bracketed placeholder, every `Yourniche`, and every
section labeled `EXAMPLE`.

Include:

- exactly who reads the blog;
- what they are deciding;
- how the brand should sound;
- what is in and out of scope;
- 8-12 title examples you would be happy to publish;
- the moat and why it matters;
- what makes a topic commercially valuable.

Write your own examples. If the examples are generic, the model's output will be generic too.

## Step 5: replace the search seeds

Open `config/seeds.json`. A seed is the beginning of a question used to collect autocomplete suggestions.
Generic stems such as `what is` are usually too broad by themselves.

HVAC examples:

```json
{
  "seeds": [
    { "stem": "should I repair or replace my furnace", "cluster": "repair_or_replace" },
    { "stem": "best heat pump for cold climate", "cluster": "choosing" },
    { "stem": "why is one room colder than the rest", "cluster": "pitfalls" },
    { "stem": "Northern Minnesota furnace requirements", "cluster": "standards" }
  ]
}
```

Start with 15-30 specific stems. More is not automatically better.

## Step 6: configure trusted source domains

Open `config/sources.json`.

Only enter domain names, not search queries or full articles.

```json
{
  "version": 1,
  "moat_authority": [
    "dli.mn.gov",
    "codes.iccsafe.org"
  ],
  "general_authority": [
    "energy.gov",
    "energystar.gov"
  ],
  "ideation_only": [
    "example-trade-magazine.com"
  ]
}
```

Use the tiers correctly:

- `moat_authority`: may support claims specific to the moat;
- `general_authority`: may support broad claims, but not moat-specific claims;
- `ideation_only`: may inspire a topic and may **not** prove a fact.

Prefer original primary/official sources. A blog that quotes an official standard is not the standard.

Before adding a domain, ask:

1. Who owns it?
2. Are they the original authority for this claim?
3. Is the page current?
4. Does the page apply to the audience and location?
5. May the business rely on it commercially?

In regulated or high-stakes industries, have a qualified professional approve the domain list.

## Step 7: optionally build the human-curated grounding file

`config/grounding.json` is for reusable facts a human has checked. Do not fill it with plausible-looking AI
citations.

Start every new entry as `"verified_by": "unverified"`. A qualified human checks the exact statement,
citation, URL, applicability, and currentness. Only then may they change it to `"human"`.

```json
{
  "id": "mn-example-rule",
  "citation": "Exact official citation",
  "jurisdiction": "Northern Minnesota",
  "topic_tags": ["standards", "repair_or_replace"],
  "summary": "One precise statement the source actually supports.",
  "source_url": "https://official-domain.gov/exact-page",
  "verified_on": "2026-07-14",
  "verified_by": "unverified"
}
```

Never change `verified_by` to `human` because the AI said the source looked good.

## Step 8: replace the false-premise blocklist

Open `config/topic-blocklist.json`. Remove irrelevant examples and add mistakes specific to the industry.

Examples:

- an HVAC engine should block a premise that refrigerant can be casually vented;
- a financial education engine should block guaranteed-return framing;
- a health engine should block claims that one symptom proves a diagnosis;
- a SaaS engine may block a false product capability or unsupported integration.

Each rule is a case-insensitive regular expression. If you do not know regular expressions, start with a
plain phrase such as `guaranteed returns`. Test it before making the pattern complicated.

## Step 9: create `.env`

Copy `.env.example` to `.env` and add the dedicated API key:

```text
ANTHROPIC_API_KEY=your-secret-value
```

Use stage-specific model overrides only when you have a reason. Never commit `.env`.

## Step 10: flip the switch and run checks

After the files above are complete, set this in `config/engine.json`:

```json
"customized": true
```

Then run:

```text
npm run check:customization
npm test
```

Do not bypass a failed customization check. Read each bullet and fix it.

## Step 11: run a small ideation test

```text
node run.js --top=10
```

Open `output/ranked-topics.json`. Review at least the top 20 from each lane and ask:

- Is the reader real and correctly described?
- Is the topic actually in scope?
- Is Lane A broad and Lane B genuinely moat-specific?
- Would the business want a lead from this question?
- Is the premise true?
- Is the cluster correct?
- Do the business weights produce sensible rankings?

If the answer is repeatedly no, fix configuration and seeds before drafting anything.

## Step 12: draft exactly one article first

Pick one topic id from `output/ranked-topics.json`:

```text
node write.js --id=<paste-topic-id-here>
```

Review both:

- the article file under `output/drafts/`;
- the structured record in `output/drafts.json`.

Check the source URLs yourself. Confirm that each factual statement means what the source means. A draft
with `machine_researched: true` still says `verified: false` and `publishable: false` until a human completes
that work.

Only after one article behaves correctly should you try `node write.js --top=3`.

### Optional live evaluation fixtures

`npm test` is offline and industry-neutral. Before running the API-backed `npm run test:golden`, replace the
starter JSON files in `tests/fixtures/` with 4-8 representative topics for the new industry and adjust their
expected word ranges. Include at least one out-of-scope topic and one topic with deliberately missing
grounding. Live tests consume API usage.

## Three industry examples

| Industry | Audience | Lane-A example | Moat | Lane-B example |
|---|---|---|---|---|
| Residential HVAC | Homeowners comparing repair and replacement | “Should I repair or replace a 15-year-old furnace?” | Cold-climate regional expertise | “What changes when you size a heat pump for subzero Northern Minnesota weather?” |
| B2B SaaS | Operations leaders evaluating workflow software | “Build or buy an eligibility workflow?” | Proprietary multi-location dental workflow data | “Which bottleneck appears only after a dental group reaches ten locations?” |
| Specialty accounting | Independent brewery owners | “Cash or accrual accounting for a growing business?” | Brewery inventory and excise-tax specialty | “How should a brewery separate taproom and distribution inventory decisions?” |

The moat must be real. Adding a city name to a generic article is not differentiation.

## Common mistakes

1. **Leaving generic seeds.** The engine collects noise and then ranks noise elegantly.
2. **Calling every source authoritative.** A source tier is a trust decision, not a bookmark list.
3. **Using an audience that means everyone.** The prose loses focus.
4. **Setting every cluster weight to 1.** Business value disappears from ranking.
5. **Treating machine research as approval.** It is still a draft.
6. **Running ten drafts before reviewing one.** You pay to repeat the same configuration mistake.
7. **Using a fake moat.** A location word tacked onto a national answer is not expertise.
8. **Editing `src/` for client names.** That creates fragile forks and defeats the template.

## Troubleshooting

**“Customization is incomplete.”** Fix every listed placeholder. Do not just set `customized` to true.

**Lane B is empty.** Add real moat phrases to seeds and `ideation.moat_terms`; confirm the niche actually
changes the answer.

**Topics are irrelevant.** Replace generic seeds, remove irrelevant Stack Exchange searches, strengthen
scope, and add excluded terms.

**Every draft says needs grounding.** Check the authority domains, confirm web search is available for the
key, and add human-curated claims only after verification.

**A valid source was rejected.** Confirm the exact hostname is in the correct tier and that search actually
opened that URL. Redirects and alternate subdomains may need an allowlist entry.

**A draft is `needs_fix`.** Read `validation_error`; do not rename the `.NEEDS-FIX.md` file. Correct the
research or prompt/configuration and redraft with `--force --reverify`.

**Articles sound generic.** Improve the content profile and paste better approved voice examples. Do not
solve a weak editorial brief by increasing word count.

## Final launch checklist

- [ ] `config/engine.json` contains no starter placeholders.
- [ ] Audience, scope, and moat are specific.
- [ ] Cluster weights reflect real business value.
- [ ] Voice exemplars are owned and approved.
- [ ] Seeds are industry-specific.
- [ ] Stack Exchange searches are relevant or removed.
- [ ] Authority domains were reviewed by someone qualified.
- [ ] Grounding entries are unverified until a human checks them.
- [ ] False-premise patterns fit the industry.
- [ ] Disclaimer was approved for the industry's risk.
- [ ] `npm run check:customization` passes.
- [ ] `npm test` passes.
- [ ] A human reviewed the top topics from both lanes.
- [ ] One article was drafted and fact-checked before a batch.
- [ ] Nobody has added automatic publishing.

That is the entire customization path. If these steps are complete, ordinary industry changes should not
require a JavaScript edit.
