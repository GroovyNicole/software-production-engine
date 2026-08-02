# Article Engine Template

This directory is a complete reusable package. Copy its contents into a new repository, then follow this README and [`engineering/README.md`](engineering/README.md). The engineering section is intentionally specific to this pipeline and links to the central playbook instead of duplicating it.

A zero-runtime-dependency Node.js pipeline for expertise brands. It discovers topic ideas, separates broad
search-demand topics from brand-moat topics, scores them, researches claims against configured authority
domains, and creates review-ready article drafts.

Nothing auto-publishes. Machine research, human review, and publishability are deliberately separate states.

## Start here

This repository intentionally ships **not ready to run**. Customize the example data first:

1. Follow [`CUSTOMIZE-FOR-ANY-INDUSTRY.md`](CUSTOMIZE-FOR-ANY-INDUSTRY.md).
2. Run `npm run check:customization` until it passes.
3. Copy `.env.example` to `.env` and add `ANTHROPIC_API_KEY`.
4. Run `npm test`.
5. Run `node run.js`, inspect the ranked topics, then draft a small batch with `node write.js --top=3`.

Do **not** perform a repository-wide find/replace and hope for the best. Runtime customization belongs in
`config/engine.json` and the other files under `config/`.

## Commands

```text
npm run check:customization     explain anything still left as starter content
npm test                        offline safety/configuration tests; no API key required
node run.js --top=15            discover and rank topics
node write.js --top=3           research and draft three topics
node write.js --id=<topic-id>   research and draft one topic
node write.js --id=<id> --force --reverify
npm run test:golden             optional live model/evaluation run; costs API usage
```

Node 18 or newer is supported. There are no runtime npm dependencies.

## Trust model

- Search demand comes from external sources, not invented model numbers.
- A web-researched claim survives only when its URL was returned by the search tool and its hostname belongs
  to the configured authority tier.
- A moat-specific claim can use only a moat-authority domain.
- The writer may use hard facts only when a retained claim contains them. Unsupported figures, percentages,
  dates, deadlines, numbered forms, and citations quarantine the draft.
- `machine_researched: true` does **not** mean `verified: true`.
- New drafts are always `human_reviewed: false` and `publishable: false`.

This reduces fabrication risk. It does not replace a qualified human fact-checker.

## Repository map

| Path | Purpose |
|---|---|
| `config/engine.json` | brand, audience, moat, scope, clusters, weights, length, disclaimer, searches |
| `config/seeds.json` | search stems used to discover reader questions |
| `config/sources.json` | moat/general authority-domain allowlists |
| `config/grounding.json` | optional human-curated authority claims |
| `config/topic-blocklist.json` | known false-premise patterns |
| `src/ideation.js`, `src/scorer.js` | candidate discovery and two-lane ranking |
| `src/verify.js` | structured claim research and deterministic source-policy validation |
| `src/writer.js` | drafting, copy cleanup, claim/fact checks, quarantine logic |
| `src/storage.js` | atomic JSON/text writes and process locks |
| `output/` | generated local pipeline artifacts |
| `tests/` | offline safety, policy, configuration, storage, and legacy guard tests |
| `engineering/` | scope, applicable central controls, copy boundary, and required quality gates |

The maintained design contract is [`ARCHITECTURE.md`](ARCHITECTURE.md).
