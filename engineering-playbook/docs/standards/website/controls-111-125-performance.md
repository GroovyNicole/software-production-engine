# Performance, resilience, and delivery quality controls 111-125

[Standard index](../website-engineering-standard.md) | [Previous module](controls-096-110-forms-data.md) | [Next module](controls-126-140-content-seo-migration.md)

## Controls

111. The project defines measurable page-weight, request-count, JavaScript, CSS, image, font, and third-party performance budgets.
112. Representative page groups target a 75th-percentile Largest Contentful Paint of 2.5 seconds or less using field data when available.
113. Representative page groups target a 75th-percentile Interaction to Next Paint of 200 milliseconds or less using field data when available.
114. Representative page groups target a 75th-percentile Cumulative Layout Shift of 0.1 or less using field data when available.
115. Images use appropriate formats, dimensions, compression, responsive srcset or sizes, and an intentional media-derivative policy.
116. Images and embeds reserve dimensions to prevent layout shift; below-the-fold media is lazy-loaded without delaying the likely LCP element.
117. Fonts are licensed, minimized by family and weight, served under an approved privacy strategy, and loaded without prolonged invisible text.
118. CSS and JavaScript are minimized, split or deferred when useful, and do not block rendering or ship unused framework payloads without justification.
119. Caching, CDN behavior, compression, cache invalidation, and authenticated-page exclusions are configured and verified rather than assumed.
120. Every third-party script has a business owner, consent classification, loading strategy, failure behavior, performance cost, and removal trigger.
121. The critical user journey remains understandable during slow networks, blocked third-party requests, unavailable embeds, and JavaScript errors.
122. Templates avoid excessive DOM depth, duplicated hidden markup, unnecessary wrappers, and layout techniques that cause repeated reflow.
123. Helpful 404, empty, unavailable, validation, and error states preserve navigation and avoid false success messages.
124. External monitoring covers uptime, TLS, domain expiration, critical forms, and other business-critical journeys with actionable alerts.
125. Load and resilience testing are proportionate to expected traffic, campaign spikes, bot exposure, and the cost of dependent services.

## Applying this module

Record status, evidence or Not Applicable rationale, risk, owner, tracked work, target date, verification method, and recheck trigger for every applicable control. Store project-specific decisions and evidence locations in the project's `AGENTS.md` and linked state files.
