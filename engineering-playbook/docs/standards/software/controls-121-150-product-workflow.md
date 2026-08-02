# Product and workflow controls 121-150

[Standard index](../software-engineering-standard.md) | [Review method](review-method.md) | [Previous module](controls-086-120-reliability.md) | [Next module](controls-151-180-operations.md)

## Controls

121. Recovery, cancellation, and error paths receive the same design attention as the happy path.
122. Users can undo consequential actions when safe and appropriate.
123. Confirmations state exactly what will be deleted, sent, charged, published, or shared.
124. Success is shown only after the operation actually succeeds or is accurately described as pending.
125. Submission controls prevent duplicate actions while a request is in progress.
126. Form data is preserved after recoverable errors.
127. Refreshing or navigating does not unexpectedly destroy important unfinished work.
128. Long-form or valuable input has autosave, draft recovery, or an explicit loss warning where appropriate.
129. Expired links have a clear, safe recovery path.
130. Ownership transfer is documented and secure.
131. Departed employees or administrators can be removed without losing control of systems or data.
132. Invitations are bound to the intended identity and cannot be accepted by the wrong account without safeguards.
133. Email address changes require appropriate re-verification and notification.
134. Password changes revoke old sessions according to the security policy.
135. Permission changes invalidate cached or existing access promptly enough for the risk.
136. Disabled users cannot continue using old sessions or tokens beyond the defined revocation window.
137. Users can view and revoke active sessions where the risk and product warrant it.
138. The application has an accessibility review and an owned remediation process.
139. Keyboard navigation supports all essential workflows.
140. Meaning is not communicated only through color.
141. Forms use programmatically associated labels and understandable instructions.
142. Destructive controls are clearly distinguished from ordinary actions.
143. Responsive and mobile behavior is tested for supported devices.
144. Supported browser behavior is defined and tested.
145. Large realistic datasets remain usable and do not break core screens.
146. Empty, loading, success, error, and degraded states are intentionally designed.
147. The product does not imply legal, medical, financial, or compliance capabilities it was not designed and reviewed to provide.
148. Product claims do not exceed verified technical behavior.
149. Claims such as secure, encrypted, preserved, anonymous, or compliant have a defined and verified basis.
150. Marketing promises are treated as engineering obligations and reviewed before publication.

## Applying this module

For every applicable control, record status, evidence or Not Applicable rationale, risk, owner, tracked work, verification method, and recheck trigger using the [review method](review-method.md). Project-specific decisions and evidence locations belong in the project's `AGENTS.md` and linked state files.
