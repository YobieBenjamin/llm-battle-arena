# Response to the independent Claude review — 2.2.1

The user supplied an independent audit of v2.2.0 (`e474eed`). The findings were checked against the source and local Mac builds. The reviewer’s reproduction scripts were not attached in this chat; this release adds its own portable regression harness instead of claiming to have run those scripts.

## Findings and dispositions

| Finding | Verification and correction |
| --- | --- |
| Mac bundle not sealed | **Confirmed:** the old local 2.2.0 bundle failed `codesign --verify --deep --strict` with “code has no resources but signature indicates they must be present.” `mac.identity: "-"` now explicitly signs the whole bundle. A new Apple Silicon bundle passes strict deep verification; its identifier is `com.yobieben.llmbattlearena`, its signature is ad-hoc, and it has sealed resources. Every Mac CI build must pass the same verification. This fixes bundle sealing, not publisher trust/notarization. |
| Manual paste shortcut clears answers | **Confirmed in source; regression tested:** global Ctrl/Cmd+Enter no longer starts/reset comparisons from a `.manual-answer` field. The UI test pastes two answers, presses both shortcut variants, and asserts neither changes. |
| Incomparable A counters | **Confirmed:** output usage categories differ. The correction uses the same visible-text estimate for A on every provider and shows reported reasoning separately as R. Q still uses reported input where available. Raw output usage remains in tooltips, JSON, and Markdown. Subtracting OpenAI reasoning is not labeled exact visible text because non-visible formatting can remain. |
| Raw Electron IPC prefix | **Confirmed in source:** main-process actions return a success/error envelope. The preload throws only the friendly error. The UI regression asserts an invalid artifact save yields exactly “Invalid artifact file.” |
| Two-minute total cap | **Confirmed design limit, not a reproduced slow live-model failure:** replaced with 45 seconds idle and five minutes overall. Every received stream chunk refreshes idle time, including heartbeat bytes. Tests cover idle expiry, continuing chunks, overall timeout, and cancellation. |
| Unreadable key looks missing | **Confirmed source behavior; defensive fix:** decryption failure is now a distinct unlock/re-enter error. A provider fixture checks that it is not reported as “Add an API key.” An actual denied Keychain prompt was not reproduced. |
| Pinned preview covers Gemini | **Confirmed layout concern:** pinned previews dock beside cards at wide widths and below them at smaller widths. Hover previews remain temporary overlays. Automated geometry checks require no overlap with Gemini’s controls and check a minimum-size window. |
| Damaged settings recovery | Reset connections now asks before resetting, renames the damaged file to a timestamped backup, and starts fresh. The dialog shows the file path and also offers Open settings folder or Quit. Malformed settings tests remain in place; a production user’s settings were not reset to test this. |
| Oversized default window | Initial dimensions and minimum dimensions are capped to the primary display’s available work area. Small-window UI regressions pass. |
| Permissions/default menu | App permission requests/checks are explicitly denied. The application menu retains editing/quit operations and omits default reload, zoom, and DevTools menu accelerators. Electron fuse changes are deferred; no claim is made that defaults are fully hardened. |
| Saved HTML wording | The guide now explicitly says saved HTML can run scripts and make network requests in an external browser. In-app preview restrictions do not accompany saved files. |
| Checksums / runtime updates | Checksums detect corruption, not an attacker who can replace the release and manifest. There is still no auto-updater. Maintainers must keep Electron supported/patched and publish rebuilds. Neither point is presented as solved by this patch. |

## Mac first-launch limits

The corrected **bundle seal** has been tested on an Apple Silicon Mac. A copy with a Safari-style quarantine attribute was also assessed without changing global security settings: `spctl --assess --type execute` still rejected it, as an ad-hoc build has no trusted Developer ID or notarization. LaunchServices returned success for an open request, but that is not proof of a successful first launch or approval flow; UI inspection did not establish a new test window distinct from existing app instances.

A fresh Safari-download → Applications → first-launch approval flow has **not** been certified. Do not interpret strict signature verification as Gatekeeper approval, or promise that Open Anyway always appears. A “damaged” message should be reported with the exact OS version. No quarantine removal or global Gatekeeper bypass is recommended. Developer ID signing plus notarization remains the proper public-distribution solution.

## Verification

- **34 unit tests pass**, including the new timeout, unreadable-key, and comparable-answer-estimate cases.
- The committed `scripts/smoke.cjs` passes on the local Mac: paste preservation, friendly errors, Q/A/R exports, artifact hover/pin/hide, source/save payloads, script/network/bridge isolation checks, and non-overlap at wide and 880×650 window sizes.
- `npm run test:ui` is now a required Linux/Xvfb CI job before release. It uses temporary settings and no real keys or paid API calls. Linux CI uses `--no-sandbox` for runner compatibility, so it is not a certification of the OS-level Chromium sandbox. The local Mac test does not use that flag.
- Mac installer jobs verify the signed bundle with `codesign --verify --deep --strict` before uploading assets. Release publishing requires all four platform builds and the UI job.
- Windows/macOS cross-build success is not hands-on first-launch testing of every CPU/OS or SmartScreen policy. Live provider accounts and billing remain untested here.

## Sources for the implementation choices

- Installed electron-builder 26.15.3 explicitly recognizes `identity: "-"` in `MacTargetHelper.findSigningIdentity`; its default Mac entitlements include JIT and disabled library validation for Electron’s hardened runtime.
- [OpenAI output-token accounting](https://developers.openai.com/api/docs/guides/token-counting) explains why output minus reasoning is not necessarily visible text.

[Start here](../START-HERE.md) · [User guide](USER_GUIDE.md) · [Historical 2.2.0 audit](AUDIT.md)

## v2.2.2 follow-up to the independent re-audit

The 2.2.1 non-overlap check missed an actual readability regression: stacking the dock divided a fixed-height area into tiny panes. The corrected stacked workspace scrolls vertically and reserves 360px each for cards and preview. The UI regression now asserts every answer body and the preview body are at least 150px tall at 880×650, 1280×720 and 1440×900, and checks scroll access to preview controls. It also verifies Compare's keyboard shortcut with the dock pinned and standard menu roles, while keeping paste boxes protected.

The first-byte wait is now 120 seconds, followed by 45-second inactivity windows after bytes arrive; the total remains five minutes. New unit fixtures distinguish silent initial thinking from a stalled stream. All 36 unit tests and the local Electron regression passed without real keys or paid calls. The earlier Mac first-launch limitations still apply.

Release verification: all four GitHub installer builds, the Linux UI gate, and download publication passed. The local 2.2.2 Apple Silicon bundle passed strict deep signature verification and the packaged Electron UI harness. One initial packaged run failed with its cause obscured by a harness error-reporting scope bug; the reporter was fixed, and the rerun passed. This does not replace a quarantined Safari-download first launch test.

## v2.3.0: formatted answers and local history

Scope: Markdown rendering, the last 50 local comparisons, and packaged Mac smoke tests. Blind voting, OpenRouter, model catalogs, update checks and paid live CI checks are not part of this release.

Answers use marked 18.1.1 and DOMPurify 3.4.17 with a narrow tag/attribute allowlist. Passive images, styles, scripts, SVG and embedded objects are excluded; only clicked HTTP/HTTPS links can open through validated main-process IPC. Copy/export/artifacts retain original source. This follows [Marked's sanitization guidance](https://marked.js.org/using_advanced) and [DOMPurify's allowlist configuration](https://github.com/cure53/DOMPurify).

History is local plaintext, atomically replaced and capped at 50 entries. Saved fields are allowlisted so credentials cannot be included as extra fields. Users can reopen without requests, delete one entry or confirm deleting all. Corrupt history is backed up with a visible path. Partial saves run roughly every 500ms and normal shutdown requests a final flush; abrupt termination can lose the newest fragment. Sensitive content deliberately typed into a prompt is still saved.

Local verification: 39 unit tests passed. The Electron source and signed packaged Apple Silicon app passed Markdown heading/table/emphasis and hostile-content checks, full quit/restart history recovery, deletion, and the earlier token/artifact/layout regressions. Cold packaged startup initially stalled in the harness; it now explicitly waits for renderer initialization, and failure cleanup is bounded. No live paid API requests were made. Mac ARM64 CI now tests the packaged app before upload; other CPU variants are built but not runtime-tested by that step. Existing notarization/first-download limitations still apply.

## v2.4.0 implementation audit

Added the remaining requested features except signing/notarization: blind voting, OpenRouter routing, key checks, model menus, opt-in update notices, initial-overload retry, public-release verification, weekly secret-gated live checks, and Dependabot.

- Blind identities, models, timing, tokens and artifacts are hidden until reveal; order is randomized. Main-process votes require completed nonempty answers from every participant and persist once per comparison. History reload reconciles the recorded winner. This is casual anonymity, not protection against inspection of local files or self-identifying model text.
- Direct and router credentials remain OS-encrypted; route changes never silently send direct keys to OpenRouter. Its public model list is preceded by authenticated /key verification. Model-list success is not a billing/generation guarantee.
- Update checks are off by default, once per launch when enabled, time-bounded and fixed to the canonical repo. Download navigation ignores arbitrary API-supplied URLs.
- Only initial HTTP 503/529 gets one retry; rate limits, network exceptions, and stream errors do not. Stop cancels backoff.
- Public-release verification checks all six hashes, both mounted read-only Mac bundles, source file sets/content against the tag and packaged Markdown dependencies against the lockfile install. It does not certify Windows installation or Apple notarization.
- Weekly live checks print status only, use dedicated GitHub secrets, and skip unconfigured providers. No dedicated secrets were present during implementation, so no paid live check was run. Dependabot PRs cannot run the paid workflow.

Verification before packaging: 51 unit tests passed, including routing/key persistence, catalog pagination, retry boundaries/cancellation, version comparison, and duplicate-vote prevention. The Electron UI suite passed simulated blind voting/history reopening, model dropdowns, update controls, and all existing Markdown/artifact/layout/restart checks. Provider generation and catalog responses in these UI checks were fixtures; they are not a claim of live account compatibility.
