# Data controls 21-50

[Standard index](../software-engineering-standard.md) | [Review method](review-method.md) | [Previous module](controls-001-020-critical.md) | [Next module](controls-051-085-security.md)

## Controls

21. Database constraints enforce required values, uniqueness, valid relationships, and ownership where applicable.
22. Data integrity is not entrusted solely to application code when the database can enforce it.
23. Money uses integer minor units or an appropriate decimal type, not binary floating point.
24. Time is stored canonically with the timezone context needed to interpret business events.
25. Daylight-saving transitions and timezone conversion are tested where scheduling matters.
26. Record identifiers are never treated as secrets or authorization.
27. Sequential identifiers remain safe because every access is authorized.
28. Schema changes use a documented, versioned migration strategy.
29. Production database structure is not edited manually outside a controlled emergency procedure.
30. Destructive migrations have backups, compatibility planning, verification, and rollback or recovery steps.
31. A documented data-retention policy defines what is retained, why, and for how long.
32. Account deletion has a documented model and verified workflow.
33. Account deletion addresses related records, files, indexes, logs, backups, billing records, and disclosed exceptions.
34. Required legal, financial, security, or operational records are retained appropriately instead of being deleted blindly.
35. Soft deletion and permanent deletion are distinguished and used intentionally.
36. Foreign keys, cleanup jobs, or other controls prevent orphaned records.
37. Foreign-key relationships exist wherever referential integrity requires them.
38. Common and high-cost queries have appropriate indexes verified against realistic data.
39. Application code does not load entire growing tables into memory without a justified bound.
40. Search and export queries are bounded and protected against excessive resource use.
41. Growing collections use pagination or another bounded retrieval strategy.
42. Duplicate detection exists where duplicate records or operations would cause harm.
43. Each important fact has a canonical source of truth.
44. Duplicated information has an explicit synchronization and conflict rule.
45. Concurrent editing cannot silently overwrite another user's changes without detection or a deliberate policy.
46. Important records have appropriate version history or change history.
47. Data exports are tested for completeness, authorization, format, scale, and privacy.
48. Exports include the related data, dates, attachments, and identifiers users are promised.
49. Imports are validated, previewed or reversible where appropriate, and safe against partial corruption.
50. Character encoding preserves names, symbols, and non-English text end to end.

## Applying this module

For every applicable control, record status, evidence or Not Applicable rationale, risk, owner, tracked work, verification method, and recheck trigger using the [review method](review-method.md). Project-specific decisions and evidence locations belong in the project's `AGENTS.md` and linked state files.
