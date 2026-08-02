# Website testing, evidence, and Definition of Done

[Back to the Website Engineering Standard](../website-engineering-standard.md)

## Testing and evidence

| Area | Minimum evidence |
|---|---|
| Templates and content | Every template and content type, plus unusually long, short, missing, and media-heavy content |
| Responsive and browser | Supported browsers and representative phone, tablet, laptop, and wide layouts; zoom and reflow included |
| Accessibility | Automated checks plus manual keyboard, focus, contrast, zoom/reflow, and screen-reader process notes |
| Forms and integrations | Success, validation, abuse, duplicate, outage, retry, notification, storage, consent, and recovery behavior |
| Security | Accounts, MFA, roles, updates, plugins, secrets, headers, errors, logs, rate limits, backups, restoration, and incident path |
| Performance | Representative templates, mobile and desktop lab reports, budgets, third-party impact, and available field data |
| SEO and migration | Full crawls, ledger reconciliation, redirects, canonicals, robots, sitemap, structured data, links, images, and Search Console |
| Operations | Deploy, rollback, monitoring, domain and TLS alerts, content ownership, and stabilization exit |

A release evidence packet records the tested branch, commit, environment, date, tester, tools, results, evidence location, exceptions, approval, backup identifier, rollback threshold, deployment steps, DNS actions, production smoke tests, and stabilization decision.

## Definition of Done

- The approved scope, owners, risks, environments, platform responsibilities, and acceptance criteria are current.
- The implementation is reproducible from versioned source and documented configuration; no critical behavior exists only in an assistant chat or an undocumented dashboard edit.
- Every old URL has a migration-ledger outcome, and prelaunch crawl results reconcile to the expected new site.
- Templates use semantic HTML, governed design tokens, scoped CSS, complete interactive states, and responsive layouts without unexplained exceptions.
- WCAG 2.2 AA acceptance evidence includes automated checks and manual keyboard, zoom/reflow, focus, and screen-reader testing of complete processes.
- Privileged accounts use multi-factor authentication, least privilege, named ownership, and reviewed access.
- Core, themes, plugins, dependencies, vendors, external scripts, and data flows are inventoried and justified.
- Forms and integrations pass success, failure, abuse, accessibility, storage, notification, retention, and recovery testing.
- The site meets approved security-header, logging, monitoring, backup, tested restoration, and rollback requirements.
- Representative pages meet the approved performance budgets and target good Core Web Vitals at the 75th percentile when field data is available.
- Titles, headings, canonicals, robots directives, sitemap entries, structured data, internal links, images, and downloadable assets are verified.
- The production release, DNS, smoke tests, monitoring, communications, and stabilization responsibilities are documented and assigned.
- Every Website Engineering Control 1-150 and every applicable software control has a recorded status, evidence, and remediation tracking where needed.
- No unsupported claim is made that the website is secure, compliant, accessible, private, or production-ready.

## Official references

- [W3C Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) - Accessibility baseline and conformance model.
- [OWASP Application Security Verification Standard 5.0.0](https://owasp.org/www-project-application-security-verification-standard/) - Web application security requirements and verification rigor.
- [OWASP Cheat Sheet Series](https://owasp.org/www-project-cheat-sheets/) - Implementation guidance for input, CSRF, headers, logging, uploads, and related controls.
- [WordPress Advanced Administration - Security](https://developer.wordpress.org/advanced-administration/security/) - WordPress security ownership and maintenance guidance.
- [WordPress Hardening](https://developer.wordpress.org/advanced-administration/security/hardening/) - WordPress hardening, updates, access, backups, logging, and monitoring.
- [WordPress theme.json reference](https://developer.wordpress.org/block-editor/reference-guides/theme-json-reference/) - Current design-token and global-style schema guidance.
- [WordPress.com Business plan features](https://wordpress.com/support/plan-features/business-plan/) - Current staging, backups, developer access, and deployment capabilities.
- [WordPress.com security guidance](https://wordpress.com/support/security/) - Host-provided security controls and two-step authentication guidance.
- [Google Search Central - Redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects) - Permanent redirects and search migration behavior.
- [Google Search Central - Site moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) - Sequencing and monitoring for migrations involving URL changes.
- [Google Search Central - SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) - Useful content, crawlability, URLs, canonicals, titles, and site structure.
- [web.dev - Web Vitals](https://web.dev/articles/vitals) - Current LCP, INP, and CLS measurement model.
- [web.dev - Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds) - Good thresholds and the 75th-percentile evaluation model.
