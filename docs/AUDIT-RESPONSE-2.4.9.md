# v2.4.9 — code-rendering audit follow-up

The supplied `audit-2.4.8-evidence.zip` confirmed release hardening and identified seven rendering/usability improvements. All seven are addressed:

| Finding | Change | Regression coverage |
| --- | --- | --- |
| R1: compressed headings | Answer heading tracking resets to normal. | Computed heading spacing in all cards at 880, 1280 and 1920 px. |
| R2: broken table words | Table cells use normal word breaking; headers stay on one line; wide tables scroll. | Header and cell styles plus unchanged exact code corpus. |
| R3: invisible Mac horizontal scrolling | Code has a permanent custom scrollbar when overflowing and a small scrolling hint. | Chromium scrollbar styling and contained wide blocks; published UI gate checks the control. |
| R4: inaccessible keyboard scrolling | Each code area is a labeled, focusable region with a visible focus outline. | Actual ArrowRight input must increase horizontal scroll in all cards. |
| R5: small code/tabs | Code is 12 px, with four-column displayed tabs. | Computed font and tab widths; exact text still preserves original tabs. |
| R6: no individual Copy | Each code block gets Copy code. Errors have a readable status and the button can be retried. | Exact block copy, full-answer copy unchanged, clipboard failure recovery. |
| R7: wrapped artifact source | Artifact source uses the same unwrapped, scrollable, keyboard-accessible code view. | Source styles, focus and exact source copy. |

Controls are constructed by trusted application code after sanitization. Model HTML cannot supply buttons, event handlers, or accessibility attributes. The copied block excludes its toolbar. Copy answer and exports retain the original Markdown. Existing hostile-preview and Markdown isolation tests remain in place.

The auditor's data-only 16-case code corpus is retained in `test/fixtures/code-corpus.cjs`, attributed here to the supplied independent audit. Its original harness is not executed. `scripts/code-render.cjs` runs with the existing private regression suite on every native CI build. Fenced-block terminal-newline behavior follows the existing Markdown renderer; indentation, internal blank lines, tabs, entities and trailing spaces remain unchanged.

Documentation now explicitly narrows dependency byte checks to the shipped marked and DOMPurify modules. It also explains that Chromium renderer debugging can access the renderer bridge when explicitly enabled; disabling Node inspection does not disable Chromium CDP. Normal app launch opens neither endpoint.

## Validation and boundaries

Local validation uses disposable profiles and no paid calls. The 72 unit tests pass. The full local offline UI suite passed, including smoke, fault injection, code rendering, and streaming performance (UI p95 15 ms against the unchanged 250 ms limit). Native packaged-release/public-download gates remain required before release completion. The release fuse remains disabled, private build ASARs must match hardened build ASARs, and private test builds are never published.

Live provider testing requires configured credentials. At the start of this follow-up neither the normal local app profile nor dedicated GitHub live-test secrets contained keys. No real provider response or billing behavior is claimed from offline fixtures. Keys should be entered in Connections or dedicated GitHub Secrets, never committed or pasted into an audit report.

Paid signing/notarization, Safari quarantine installation, real Windows installer prompts, and real provider coverage remain separate from the offline tests. Existing platform CI tests run the extracted installer payloads.

The [v2.4.9 tagged release run](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39347000514) passed all 11 jobs: Linux regressions, four native private/hardened builds, publication, public source/signature/checksum verification, and four native downloaded-installer UI jobs. Each of the six installer payloads passed, including the new code controls. No gate was relaxed or retry needed.

Live testing is intentionally deferred until the owner enters keys in the released app’s Connections screen, as requested.

Local downloaded-Mac follow-up: checksums, sealed signature, fuse checks, and executable/ASAR identity passed. The normal-Keychain UI run then blocked during startup. A short process sample showed the main thread waiting in `SecItemCopyMatching` / `SecKeychainItemCopyContent` / `SecurityServer::ClientSession::decrypt`, with SecurityAgent running. The automation tool explicitly prohibits accessing SecurityAgent, so the owner was asked to handle any OS authorization prompt directly. This local UI run is not claimed as a pass; CI's explicitly disclosed mock-Keychain UI tests passed. No Keychain settings, permissions, or credentials were changed by the agent.

Superseded v2.4.8 installers are private OLD (DO NOT USE) drafts after the successful [archive workflow](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39347906837). Its local installer and tagged source ZIP are preserved in the OLD (DO NOT USE) archive.
