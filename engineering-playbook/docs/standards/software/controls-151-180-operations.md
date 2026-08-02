# Operational controls 151-180

[Standard index](../software-engineering-standard.md) | [Review method](review-method.md) | [Previous module](controls-121-150-product-workflow.md) | [Next module](controls-181-200-ai.md)

## Controls

151. An inventory identifies vendors and external services used by the product.
152. A data map records where user and company data is stored and transmitted.
153. Subprocessors are identified and reviewed where required.
154. An incident-response plan defines detection, roles, containment, communication, recovery, and learning.
155. A monitored security contact or reporting channel exists.
156. A process receives, triages, remediates, and discloses vulnerability reports appropriately.
157. Production systems have named owners.
158. Production access is inventoried and reviewable.
159. Former employees and contractors lose access promptly.
160. Credentials and privileged access are reviewed periodically.
161. Keys and long-lived credentials have a rotation schedule appropriate to risk.
162. Domains use renewal protection and ownership controls.
163. Alerts cover failed renewals, certificates, payment methods, and expiring credentials.
164. Email deliverability and bounce or complaint signals are monitored.
165. SPF, DKIM, and DMARC are configured appropriately for sending domains.
166. Transactional email uses a suitable managed identity or service rather than an unmanaged personal mailbox.
167. Marketing and critical transactional email are separated operationally where appropriate.
168. Support tooling enables necessary diagnosis without unsafe direct production access.
169. Support roles receive only the data and privileges required.
170. Administrative changes to user data are logged and reviewable.
171. The deployment process is documented and reproducible.
172. The application can be maintained by someone other than the person or AI session that originally built it.
173. Architecture documentation describes components, boundaries, and key decisions.
174. A dependency map identifies critical internal and external dependencies.
175. A data-flow diagram or equivalent description covers sensitive and consequential paths.
176. Environment variables and configuration are documented without exposing secrets.
177. Scheduled tasks, webhooks, queues, and external integrations are inventoried and owned.
178. Disaster-recovery priorities identify critical services and dependencies.
179. Recovery-time and recovery-point objectives are defined where the business needs them.
180. A procedure exists for maintenance mode, traffic draining, or safe service suspension where needed.

## Applying this module

For every applicable control, record status, evidence or Not Applicable rationale, risk, owner, tracked work, verification method, and recheck trigger using the [review method](review-method.md). Project-specific decisions and evidence locations belong in the project's `AGENTS.md` and linked state files.
