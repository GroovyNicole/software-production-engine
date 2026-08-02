# Forms, privacy, data, and third-party services controls 96-110

[Standard index](../website-engineering-standard.md) | [Previous module](controls-081-095-security.md) | [Next module](controls-111-125-performance.md)

## Controls

96. Forms collect only information necessary for the stated purpose and avoid open-ended requests for sensitive or confidential detail when it is not required.
97. Each collection point provides a clear purpose, recipient, expected response, privacy notice, and any required terms or acknowledgments.
98. Professional-service intake forms clearly warn users not to submit confidential or emergency information until the responsible business and legal owners approve different language.
99. Form validation runs on the server or trusted service, rejects unexpected fields and values, and does not rely only on browser validation.
100. Spam, bot, credential-stuffing, and submission abuse controls are proportionate, accessible, rate-limited, and tested for false positives.
101. File uploads, if allowed, restrict type, size, quantity, filename handling, storage, retrieval authorization, retention, and malware risk.
102. Submission data is encrypted in transit and protected at rest by the platform and downstream services appropriate to its sensitivity.
103. Email and chat notifications minimize submitted data, avoid credentials and sensitive attachments, and direct authorized staff to the protected source record.
104. Retention, deletion, correction, export, backup persistence, and legal-hold behavior are documented and implementable.
105. Access to submissions is least-privilege, auditable, periodically reviewed, and revoked promptly when roles change.
106. Cookie, storage, advertising, and nonessential tracking behavior follows an approved consent and privacy design appropriate to applicable requirements.
107. Analytics tags and properties are deduplicated, documented, tested, filtered for internal traffic as appropriate, and prevented from collecting prohibited data.
108. Session recording, heatmaps, chat, and replay tools receive explicit privacy, masking, consent, performance, and vendor review before activation.
109. Third-party processors have documented data flows, retention, security, subprocessor, regional, contract, deletion, and incident considerations.
110. Every form and integration is tested end to end for success, validation failure, provider outage, duplicate submission, retry, notification, storage, and user-facing recovery.

## Applying this module

Record status, evidence or Not Applicable rationale, risk, owner, tracked work, target date, verification method, and recheck trigger for every applicable control. Store project-specific decisions and evidence locations in the project's `AGENTS.md` and linked state files.
