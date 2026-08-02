# Website operating model and lifecycle

[Back to the Website Engineering Standard](../website-engineering-standard.md)

## Operating rules

- Assess all 150 website controls during initial and quarterly reviews.
- Assess all affected controls for each pull request, CMS release, migration, or platform change.
- Use Verified, Partial, Missing, Unknown, or Not Applicable; every N/A requires a rationale.
- Give every gap an owner, tracked issue, target date, and verification method.
- Treat critical Unknown controls as release blockers.
- Reassess all applicable controls from the 200-control software register.

## Lifecycle gates

| Gate | Evidence required |
|---|---|
| Gate 0 - Intake | Purpose, owner, scope, risk, legal review, source systems, and success measures are recorded. |
| Gate 1 - Inventory | Every URL, asset, template, integration, data flow, tracking tag, and migration decision is represented in a controlled inventory. |
| Gate 2 - Architecture | Platform responsibilities, environments, repository, design system, plugin strategy, backup, deploy, and rollback paths are approved. |
| Gate 3 - Foundation | Semantic templates, CSS tokens, responsive behavior, accessibility primitives, security settings, and monitoring are proven before bulk content entry. |
| Gate 4 - Content migration | Each ledger row is implemented, reviewed, and supported by content, metadata, asset, link, and redirect evidence. |
| Gate 5 - Verification | Automated and manual testing covers every template and complete user process; unexplained failures are blockers. |
| Gate 6 - Release | A signed release checklist, backup, rollback decision, production crawl, form tests, and monitoring are ready before cutover. |
| Gate 7 - Stabilization | Postlaunch defects, search signals, performance, accessibility, forms, and security alerts are monitored until legacy rollback is retired. |

## Core implementation requirements

- Keep custom theme code, patterns, CSS, configuration, tests, and documentation in version control.
- Use a single design-token source, scoped low-specificity CSS, complete component states, and content-driven responsive rules.
- Use semantic HTML and WCAG 2.2 AA as the engineering baseline; overlays do not replace native remediation.
- Require MFA, least privilege, supported dependencies, minimal plugins, verified headers, protected forms, and tested recovery.
- Inventory data flows and third-party scripts; minimize collection and review consent, masking, retention, access, and deletion.
- Set performance budgets and target good Core Web Vitals at the 75th percentile.
- Use a one-row-per-URL migration ledger and complete old/new crawls; do not rely on spot checks.
- Preserve URLs when practical and verify one-hop relevant permanent redirects for every intentional change.

## Sources of truth

| System | Authoritative for | Must not become |
|---|---|---|
| GitHub | Theme and custom code, patterns, CSS, configuration, tests, engineering documentation, and deployment history | A store for secrets, production data, or unreviewed generated files |
| WordPress or another CMS | Approved production content, editorial state, media, and controlled CMS configuration | The only copy of custom code or undocumented design decisions |
| Linear | Requirements, owners, risks, decisions, defects, acceptance evidence, and release work | A replacement for code, content, or permanent technical documentation |
| Design system | Approved tokens, components, patterns, states, and responsive behavior | A collection of copied one-off page styles |
| Password manager | Credentials, recovery codes, API keys, and privileged-access records | A README, chat, browser note, or source file |
| Analytics and Search Console | Observed production behavior and search signals | The definition of requirements, consent, or correctness |

Cross-computer work always starts from the repository, current work item, approved specifications, and environment documentation. Conversation memory is never the source of truth.
