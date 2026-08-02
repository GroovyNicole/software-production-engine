# Testing, release, and continuous operation controls 141-150

[Standard index](../website-engineering-standard.md) | [Previous module](controls-126-140-content-seo-migration.md) | [Next module](../website-engineering-standard.md)

## Controls

141. A risk-based test matrix covers every template, content type, critical journey, supported browser, viewport class, input method, and relevant user state.
142. Automated checks cover formatting, linting, build integrity, HTML or template validation, links, accessibility, security, and performance where the stack permits.
143. Manual release testing covers keyboard operation, zoom and reflow, representative screen-reader use, focus behavior, and complete user processes.
144. All forms, scheduling, downloads, search, payments, email, analytics, consent, maps, and third-party integrations are tested in their production-like configuration.
145. Visual regression or disciplined template screenshots detect unintended layout, typography, responsive, and content changes across releases.
146. Prelaunch security review covers privileged accounts, multi-factor authentication, access, updates, plugins, headers, forms, secrets, logging, backups, and recovery.
147. A complete content and technical crawl is reconciled against the migration ledger before approval, with no unexplained URL or asset omissions.
148. The release plan defines change freeze, backup, deployment steps, DNS actions, verification, rollback thresholds, owners, and communication.
149. Postlaunch smoke tests and monitoring begin immediately and continue through a defined stabilization period before legacy hosting or rollback options are removed.
150. Active production websites receive a complete 150-control review at least quarterly, with affected controls reviewed for every material change and evidence retained.

## Applying this module

Record status, evidence or Not Applicable rationale, risk, owner, tracked work, target date, verification method, and recheck trigger for every applicable control. Store project-specific decisions and evidence locations in the project's `AGENTS.md` and linked state files.
