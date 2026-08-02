# Reliability controls 86-120

[Standard index](../software-engineering-standard.md) | [Review method](review-method.md) | [Previous module](controls-051-085-security.md) | [Next module](controls-121-150-product-workflow.md)

## Controls

86. Automated tests cover the most important user and business workflows.
87. Tests include failure and recovery paths, not only successful paths.
88. Tests verify permission and tenant boundaries.
89. Payment tests cover failure, delay, cancellation, dispute, and duplicate events where applicable.
90. Tests cover expired, revoked, and invalid sessions.
91. Tests cover duplicate and retried requests.
92. Tests cover deletion, restoration, and related-data behavior.
93. Backup restoration is tested on a defined cadence.
94. Service health checks reflect meaningful dependency health.
95. Uptime or availability is monitored for user-facing services.
96. Database connectivity, capacity, and important failure signals are monitored.
97. Queues and background jobs are monitored for age, failure, retry, and backlog.
98. Background-task failures are visible and actionable rather than silent.
99. Long-running email, export, report, or media work is moved out of request paths when timeouts or retries require it.
100. Long-running operations can retry, resume, or recover safely.
101. Retries are bounded, delayed appropriately, and protected from retry storms.
102. External API calls have explicit connection and response timeouts.
103. Dependency failures are contained with circuit breaking, backoff, or graceful error behavior where appropriate.
104. One third-party service failure does not unnecessarily disable the entire application.
105. The application degrades gracefully when optional features or dependencies are unavailable.
106. Capacity and concurrency limits are defined and tested for likely load.
107. Storage usage is measured and limited according to the product model.
108. Unexpectedly expensive database or search queries are bounded, observed, and remediated.
109. Unexpectedly expensive AI requests are bounded, observed, and remediated.
110. Cloud, AI, email, storage, and third-party services have budgets or spending alerts.
111. Deployments have a tested rollback or forward-recovery method.
112. Production deployments pass staging, preview, canary, or equivalent validation appropriate to risk.
113. Code, schema, and configuration changes are sequenced for compatibility and recovery.
114. High-risk releases use feature flags, staged exposure, or another kill switch where appropriate.
115. Configuration changes are versioned or documented and reviewable.
116. Configuration drift is detected or regularly reconciled.
117. Dependencies are pinned with disciplined lockfile management.
118. Automatic dependency updates are tested and reviewed before production adoption.
119. APIs and integrations have a deprecation process.
120. Compatibility is planned for existing clients, users, and stored data.

## Applying this module

For every applicable control, record status, evidence or Not Applicable rationale, risk, owner, tracked work, verification method, and recheck trigger using the [review method](review-method.md). Project-specific decisions and evidence locations belong in the project's `AGENTS.md` and linked state files.
