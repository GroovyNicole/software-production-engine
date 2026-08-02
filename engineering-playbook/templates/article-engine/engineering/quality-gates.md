# Article Engine Quality Gates

## Before customization

- Copy the entire `article-engine` directory into a new repository.
- Preserve `AGENTS.md`, architecture, tests, scripts, configuration schemas, and engineering documents.
- Create an industry customization branch.
- Do not add secrets or generated output to Git.

## Customization gate

1. Answer the worksheet in `CUSTOMIZE-FOR-ANY-INDUSTRY.md`.
2. Replace every starter value in `config/`, the content profile, source policy, blocklist, and voice examples.
3. Keep `customized: false` until the configuration is genuinely complete.
4. Run `npm run check:customization`; it must pass before live discovery or drafting.

## Offline engineering gate

Run:

```text
npm test
```

Required evidence includes configuration relationships, source-tier enforcement, returned-URL validation, unsupported-hard-fact quarantine, claim-id filtering, premise blocking, atomic storage, and lock cleanup. New deterministic guardrails require planted-failure tests.

## Controlled live evaluation

- Use a dedicated least-privilege API key stored only in `.env`.
- Start with one topic and one draft; inspect retained claims and the hidden review trail.
- Run `npm run test:golden` only with explicit cost authorization.
- Record model/version, prompt/config revision, latency, failures, and approximate usage before making quality or savings claims.
- Treat network, model, search, parsing, and authority-policy failures as visible incomplete states, never silent success.

## Human review and release gate

- A qualified reviewer checks source meaning, applicability, currentness, professional risk, voice, and final wording.
- Unsupported or ambiguous drafts remain quarantined.
- The engine must leave `verified`, `human_reviewed`, and `publishable` false.
- Publishing requires a separate documented workflow with explicit authorization, audit evidence, rollback, and any newly applicable website/API controls.
