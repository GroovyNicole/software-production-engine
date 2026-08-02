# Website engineering prompts

[Back to the Website Engineering Standard](../website-engineering-standard.md)

## 1. Website intake and full baseline

Review this website project as an evidence-based engineering intake. Read the repository instructions and project specifications first. Do not modify production or external services. Produce: scope, owners, audiences, risks, platform responsibility model, URL/content/asset/integration inventories, data flows, environment plan, and one status for every Website Engineering Control 1-150. Also assess every relevant control in the Professional Software Engineering Control Register 1-200. Use Verified, Partial, Missing, Unknown, or Not Applicable; every N/A requires a rationale. Every gap needs evidence, severity, owner, tracked work item, target date, and verification method.

## 2. CSS and design-system review

Audit the website's theme.json, templates, block patterns, CSS, inline styles, and responsive behavior. Identify token drift, arbitrary values, broad selectors, collisions, excessive specificity, !important usage, dead or duplicate rules, incomplete component states, focus defects, overflow, and editor/front-end mismatches. Propose a governed token model and scoped component architecture. Do not perform a visual redesign unless requested. Map findings to Website Engineering Controls 46-60 and all affected accessibility and performance controls.

## 3. Accessible template implementation

Implement or review the named website template using semantic HTML and native controls. Meet the project design tokens and WCAG 2.2 AA engineering baseline. Verify keyboard operation, landmarks, headings, accessible names, focus behavior, zoom/reflow, contrast, errors, status messages, target sizes, reduced motion, and responsive layouts. Automated checks are supporting evidence only; include manual evidence and list any remaining Unknown or Partial controls.

## 4. Form and integration review

Review the complete form or integration flow from user input through validation, abuse controls, storage, notifications, downstream processors, retention, deletion, error recovery, monitoring, and access control. Minimize sensitive data and do not expose submission content in logs or broad email distribution. Test success, invalid input, duplicate submission, provider failure, retry, timeout, spam protection, accessibility, and user-facing recovery. Map results to Website Engineering Controls 81-110 and relevant software controls.

## 5. Migration ledger and redirect verification

Build or audit a one-row-per-URL migration ledger from the authoritative old and new crawls. For every old URL, record the intended final URL, same-URL or redirect action, content status, canonical, indexability, title, H1, metadata, asset status, internal links, owner, QA evidence, and approval. Fail the gate for missing rows, unexpected 4xx/5xx responses, redirect chains, loops, irrelevant destinations, production noindex, placeholder canonicals, missing assets, or unexplained URL changes.

## 6. Pre-release website gate

Perform a release-readiness review without changing production. Evaluate every Website Engineering Control affected by the release, controls 81-110 for any public form, integration, CMS, or tracking change, and controls 126-150 for every migration. Confirm branch and commit, approvals, backup, tested restore or rollback path, production-like crawl, accessibility evidence, responsive/browser matrix, security settings, forms, analytics, performance budgets, monitoring, DNS steps, and postlaunch owner. Report blockers separately from follow-up improvements; do not approve Unknown critical controls.

## 7. Postlaunch stabilization

Run the documented postlaunch stabilization review. Compare old and production crawls, test every critical journey, confirm redirects, canonicals, robots, sitemap, forms, analytics, consent, uptime, TLS, Core Web Vitals, accessibility regressions, security alerts, and Search Console signals. Record defects with severity, owner, issue, evidence, and rollback decision. Do not retire legacy hosting or rollback options until exit criteria are explicitly met.

## 8. Quarterly website control review

Assess all Website Engineering Controls 1-150 with no omissions or duplicates and reassess all applicable Professional Software Engineering Controls 1-200. Require current evidence for Verified status and rationale for every N/A. Reconcile privileged access, plugins, themes, dependencies, vendors, backups, restore evidence, domains, certificates, forms, privacy flows, accessibility, performance field data, crawl health, content ownership, monitoring, incident readiness, and unresolved risks. Create or update tracked remediation work for every Partial, Missing, or material Unknown control.
