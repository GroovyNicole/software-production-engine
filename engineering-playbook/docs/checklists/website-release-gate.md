# Website release gate

- **Owner:** Release owner
- **When:** Before every production website release, migration cutover, material CMS configuration change, or tracking/form change
- **Governing standard:** `docs/standards/website-engineering-standard.md`
- **Evidence location:** Release work item or approved durable evidence folder
- **Exception rule:** Record the affected control, risk, accountable approver, expiration date, and remediation issue; critical Unknown controls are blockers

## Scope and source

- [ ] Release scope, repository, branch, commit, environment, owner, and approver are recorded.
- [ ] Requirements, acceptance criteria, affected Website Engineering Controls, and applicable software controls are identified.
- [ ] The working tree is clean and the build is reproducible from versioned source.
- [ ] Dashboard-only changes are documented and exportable or recoverable.
- [ ] Content, design, legal, privacy, accessibility, and advertising approvals are complete where required.

## Code, templates, and CSS

- [ ] Formatting, linting, validation, static analysis, and build checks pass.
- [ ] Every affected template and content type was tested with representative and extreme content.
- [ ] Design tokens remain the source for color, typography, spacing, widths, borders, and motion.
- [ ] CSS is component-scoped, low-specificity, free of unexplained `!important`, and within budget.
- [ ] Default, hover, focus-visible, active, disabled, loading, error, and success states are complete where applicable.
- [ ] Narrow, medium, wide, zoomed, and reflowed layouts have no unintended overflow, clipping, overlap, or unreadable content.

## Accessibility

- [ ] Automated accessibility checks pass or every finding has a reviewed disposition.
- [ ] Keyboard operation, focus order, focus visibility, skip navigation, and complete critical journeys were tested manually.
- [ ] Headings, landmarks, labels, names, roles, values, errors, status messages, and alternative text were reviewed.
- [ ] Contrast, color independence, target size, 200 percent text zoom, and responsive reflow were verified.
- [ ] Representative screen-reader testing covers every changed critical process.
- [ ] No overlay or plugin score is being used as the sole accessibility evidence.

## Security, privacy, and administration

- [ ] Privileged accounts are named, least-privilege, current, and protected by multi-factor authentication.
- [ ] Core, themes, plugins, dependencies, and external services are supported, updated, and inventoried.
- [ ] Unused plugins and themes are removed; no overlapping security or platform plugins were added without need.
- [ ] HTTPS, mixed content, security headers, production error behavior, logging, rate limits, and monitoring were verified.
- [ ] No secrets, private production data, or sensitive form content appears in code, URLs, analytics, logs, or broad notifications.
- [ ] Cookie, tracking, session-replay, consent, privacy notice, retention, access, deletion, and vendor implications were approved.

## Forms and integrations

- [ ] Each form was tested for success, invalid input, required fields, preserved values, accessible errors, and duplicate submission.
- [ ] Server-side validation, abuse controls, CSRF protection, file restrictions, and rate limiting are appropriate and functioning.
- [ ] Storage, recipient access, notifications, downstream processors, retention, deletion, and audit behavior match the approved data flow.
- [ ] Provider outage, timeout, retry, spam false positive, and user-facing recovery were tested.
- [ ] Scheduling, email marketing, maps, downloads, search, payments, analytics, consent, and other changed integrations were tested end to end.

## Performance and resilience

- [ ] Page-weight, request, JavaScript, CSS, image, font, and third-party budgets pass for representative templates.
- [ ] LCP, INP, and CLS meet the approved targets in lab testing and available field data.
- [ ] Images, fonts, CSS, JavaScript, caching, CDN behavior, and third-party loading were reviewed.
- [ ] Slow network, blocked third-party, unavailable embed, JavaScript error, 404, and other failure states remain understandable and recoverable.
- [ ] Uptime, TLS, domain, and critical-journey monitoring is active with tested alerts.

## Content, SEO, and migration

- [ ] Every old URL has a migration-ledger row with an approved final outcome.
- [ ] Prelaunch crawl results reconcile to the expected URL, status, canonical, indexability, title, H1, metadata, link, and asset inventory.
- [ ] Same-URL migrations return the intended content; changed URLs use one-hop relevant permanent redirects to successful final pages.
- [ ] Production robots directives, canonicals, sitemap, feeds, structured data, and Search Console ownership are correct.
- [ ] Important pages are unique, useful, factually approved, internally linked, and free of placeholder or copied-location errors.
- [ ] Images and downloadable assets use controlled URLs, correct metadata, accessible alternatives, and tested inbound links.

## Deployment, rollback, and stabilization

- [ ] Change freeze, deploy steps, DNS actions, owners, communications, maintenance window, and verification sequence are recorded.
- [ ] A current backup exists and restoration or rollback has been tested proportionate to release risk.
- [ ] Rollback thresholds, decision owner, prior version, data implications, and verification steps are explicit.
- [ ] Staging is protected before release; production noindex, staging canonicals, and placeholder domains are confirmed absent.
- [ ] Immediate production smoke tests cover navigation, forms, redirects, analytics, consent, and critical pages.
- [ ] A complete postlaunch crawl and monitoring review is scheduled with owners and escalation thresholds.
- [ ] Legacy hosting or rollback options remain available until stabilization exit criteria are approved.

## Approval

- **Decision:** Approve / Approve with documented exception / Block
- **Accountable approver:**
- **Date and time:**
- **Evidence link:**
- **Open risks and issues:**
- **Stabilization exit date:**
