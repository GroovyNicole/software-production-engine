# Article Engine Template Manifest

## Copy boundary

The complete reusable package is the `templates/article-engine/` directory. Copy that directory's contents to the root of a new repository.

## Included

- Runtime entry points: `run.js`, `write.js`
- Reusable implementation: `src/`
- Fail-closed starter configuration: `config/`
- Offline and optional golden tests: `tests/`
- Customization readiness script: `scripts/check-customization.mjs`
- CI matrix: `.github/workflows/ci.yml`
- Architecture, build philosophy, customization instructions, and design notes
- Scope-specific engineering guides and quality gates

## Deliberately excluded

- Git history and remotes from the source project
- Project-specific review reports, issue history, and generated output
- `.env`, API keys, credentials, caches, and `node_modules/`
- A publishing UI, CMS integration, authentication system, database, queue, or multi-tenant service

## Expected generated state

Runtime artifacts belong under `output/` and remain local by default. If a later system consumes them, document the schema/version contract, retention, access, backup, and migration behavior before tracking or exporting them.

## Updating the reusable package

Make generic code fixes in this canonical template, add or update tests, run all offline gates, and record material changes in the engineering playbook changelog. Apply changes to existing industry instances through reviewed diffs rather than overwriting their configuration.
