# Website security, performance, content, and migration

[Back to the Website Engineering Standard](../website-engineering-standard.md)

## Security, privacy, and forms

- Require multi-factor authentication for the CMS, host, registrar, DNS, email marketing, analytics, Search Console, scheduling, payments, and any account that can publish or redirect traffic.
- Use named least-privilege accounts, protect recovery codes, review access periodically, and remove former users promptly.
- Keep core, themes, plugins, PHP, and dependencies supported and current. Remove unused code rather than merely disabling it.
- Verify HTTPS, mixed-content absence, security headers, safe production errors, logging, rate limiting, abuse controls, platform protections, backups, restoration, and incident response.
- Minimize form data; validate on the server or trusted service; protect against CSRF, spam, and abuse; control uploads; limit access; and define retention and deletion.
- Keep confidential or sensitive submission details out of broad email notifications, URLs, analytics, error messages, logs, and session-replay tools.
- Review every third-party tag for purpose, consent classification, masking, data destination, performance cost, vendor risk, and removal trigger.
- Add a third-party security plugin only for a documented unmet requirement and after checking compatibility with managed-host protections.

## Performance and reliability

- Set budgets for page weight, request count, JavaScript, CSS, images, fonts, and third-party scripts before repeating templates across the site.
- Target good Core Web Vitals at the 75th percentile: LCP at or below 2.5 seconds, INP at or below 200 milliseconds, and CLS at or below 0.1.
- Use responsive, compressed images with explicit dimensions. Lazy-load below-the-fold media without delaying the likely LCP element.
- Minimize font families and weights, use an approved hosting/privacy strategy, and prevent prolonged invisible text.
- Remove unused CSS and JavaScript; defer or split noncritical work; verify caching, CDN behavior, compression, and invalidation.
- Design useful 404, unavailable, validation, empty, and third-party-failure states. Never show success before the operation succeeds.
- Monitor uptime, TLS, domain expiration, critical forms, and other business-critical journeys with actionable alerts.

## Content, SEO, and migration

- Assign every page and reusable content type a purpose, audience, owner, review date, and update trigger.
- Require qualified review for professional, legal, financial, statistical, testimonial, case-result, and advertising claims.
- Each indexable page must provide distinct, useful value. Programmatic or city pages must not be thin keyword substitutions or unsupported location claims.
- Preserve existing URLs when practical. A tidier folder structure is not enough reason to accept migration risk.
- Maintain one migration-ledger row for every old URL, even when the URL remains unchanged.
- Each row records the intended final URL, action, content status, title, H1, metadata, canonical, indexability, assets, internal links, owner, QA evidence, and approval.
- Use one-hop permanent redirects to the closest relevant successful destination. Prohibit chains, loops, blanket redirects to the homepage, and unexplained errors.
- Compare complete old, staging, and production crawls. Sampling cannot prove that a large migration is complete.
- Verify production robots directives, canonicals, sitemap, feeds, structured data, images, downloadable assets, analytics, and Search Console after cutover.
