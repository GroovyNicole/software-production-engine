# Security and privileged administration controls 81-95

[Standard index](../website-engineering-standard.md) | [Previous module](controls-061-080-accessibility.md) | [Next module](controls-096-110-forms-data.md)

## Controls

81. HTTPS is enforced for all traffic, mixed content is absent, certificates are monitored, and HSTS is evaluated and configured safely.
82. Applicable response headers are deliberately configured and verified, including CSP or a staged CSP plan, frame protection, referrer policy, MIME sniffing protection, and permissions policy.
83. Every privileged CMS, hosting, registrar, DNS, analytics, email, and integration account uses multi-factor authentication or passkeys where supported.
84. Administrators use unique named accounts, least-privilege roles, no shared credentials, and separate daily-use and privileged access where practical.
85. Privileged access and active sessions are inventoried, reviewed periodically, and revoked promptly when no longer needed.
86. Login, password-reset, form, search, and expensive public endpoints have appropriate rate limiting and abuse detection.
87. WordPress core, themes, plugins, PHP, build tools, and dependencies receive supported security updates through a monitored process.
88. Each plugin and theme has a documented purpose, vendor, maintenance status, data access, permissions, update owner, and removal plan.
89. Unused, abandoned, duplicated, or disabled plugins and themes are removed rather than left installed.
90. Dashboard code editing, arbitrary code execution, unsafe uploads, and unnecessary remote interfaces are disabled or restricted where the platform permits.
91. All untrusted input is validated and normalized; output is escaped for its context; database access uses safe platform APIs or parameterization.
92. State-changing requests use WordPress nonces or equivalent CSRF protections in addition to authorization checks.
93. XSS exposure is reduced through safe templating and sanitization, with Content Security Policy used as defense in depth rather than the only control.
94. Production errors do not expose stack traces, filesystem paths, SQL details, tokens, or personal data, and security logs avoid sensitive content.
95. Security events, file or configuration changes, uptime, certificates, and vendor alerts are monitored under a documented incident-response process.

## Applying this module

Record status, evidence or Not Applicable rationale, risk, owner, tracked work, target date, verification method, and recheck trigger for every applicable control. Store project-specific decisions and evidence locations in the project's `AGENTS.md` and linked state files.
