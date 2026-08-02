# AI-specific controls 181-200

[Standard index](../software-engineering-standard.md) | [Review method](review-method.md) | [Previous module](controls-151-180-operations.md) | [Next module](../software-engineering-standard.md)

## Controls

181. Model output is treated as untrusted, probabilistic data.
182. Model output cannot directly perform database, financial, email, or administrative actions without validated boundaries.
183. Consequential AI-assisted actions require appropriate human confirmation.
184. Prompt-injection threats are considered for tools, retrieval, documents, and external content.
185. User-provided documents and retrieved content are treated as untrusted data, not privileged instructions.
186. AI receives only the data and tools required for the task.
187. AI retrieval enforces per-user and per-tenant authorization.
188. Retrieval tests prevent one user or tenant from receiving another's records.
189. Sensitive data is sent to models only under an explicit policy and user or contractual disclosure where required.
190. Model-vendor retention, training, region, security, and subprocessors are understood and reviewed.
191. Model-generated facts, links, and citations are verified before being presented as authoritative.
192. Extraction and classification have confidence thresholds, validation, or safe fallback behavior.
193. Deterministic validation follows AI extraction before data is trusted or committed.
194. AI outputs retain traceability to source material where decisions or evidence depend on it.
195. Prompts, models, retrieval logic, and extraction logic are versioned for consequential workflows.
196. Model changes are tested because they can change application behavior.
197. Token and model spending have per-user, per-workflow, and overall controls appropriate to cost risk.
198. Input length, file size, and context volume are bounded.
199. Users cannot repeatedly trigger unbounded expensive AI jobs.
200. AI errors are communicated as probabilistic outputs, not authoritative decisions, when uncertainty matters.

## Applying this module

For every applicable control, record status, evidence or Not Applicable rationale, risk, owner, tracked work, verification method, and recheck trigger using the [review method](review-method.md). Project-specific decisions and evidence locations belong in the project's `AGENTS.md` and linked state files.
