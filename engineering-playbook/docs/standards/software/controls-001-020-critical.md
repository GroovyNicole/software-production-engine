# Critical controls 1-20

[Standard index](../software-engineering-standard.md) | [Review method](review-method.md) | [Previous module](../software-engineering-standard.md) | [Next module](controls-021-050-data.md)

## Controls

1. Real server-side authorization checks protect every read, change, export, and delete operation.
2. Tenant isolation prevents one user or company from accessing another's data by changing an identifier, URL, request, or query.
3. Secrets are absent from frontend code, repositories, logs, browser storage, screenshots, and documentation.
4. All untrusted input is validated on the server, not only in the browser.
5. The authentication lifecycle covers sign-up, verification, reset, expiration, logout, recovery, revocation, and compromised accounts.
6. Database backups exist and restoration has been tested.
7. Destructive actions are scoped, confirmed, reversible where appropriate, and protected from accidental bulk impact.
8. Multi-step operations use transaction boundaries or compensating behavior so partial success cannot corrupt state.
9. Race conditions and duplicate processing are handled for clicks, retries, concurrent requests, jobs, and redelivered events.
10. Retryable operations are idempotent or otherwise safely deduplicated.
11. The server derives and verifies prices, roles, plans, user IDs, ownership, permissions, and completion state instead of trusting the client.
12. File uploads restrict type, size, name, content, storage location, malware risk, and retrieval permissions.
13. Login, reset, email, search, upload, public form, expensive API, and AI endpoints have rate limits and abuse controls.
14. Payment entitlement is based on verified provider events, not a browser success page.
15. Webhook signatures are verified; events are deduplicated; retries and out-of-order delivery are handled.
16. Errors are handled meaningfully without blank screens, false success, swallowed exceptions, or corrupted intermediate state.
17. Monitoring and alerting detect important failures promptly.
18. Consequential actions have an audit trail, including permissions, exports, deletions, billing, and administrative access.
19. Logs exclude passwords, tokens, payment data, private documents, sensitive personal data, and unnecessary user content.
20. A tested recovery plan covers failed deployments, corrupt data, compromised keys, failed migrations, and deleted storage.

## Applying this module

For every applicable control, record status, evidence or Not Applicable rationale, risk, owner, tracked work, verification method, and recheck trigger using the [review method](review-method.md). Project-specific decisions and evidence locations belong in the project's `AGENTS.md` and linked state files.
