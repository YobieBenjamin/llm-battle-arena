# Response to the independent v2.4.0 audit

The external audit examined tag `v2.4.0` (`792e2e5`). This response tracks the patch in v2.4.1. It distinguishes code fixes and fixture evidence from installation or live-provider checks that have not been performed.

| Finding | Change and verification |
| --- | --- |
| F1: streamed answers freeze the renderer | Render at most once per card per 100 ms; use plain text while streaming; format and scan artifacts at termination. `scripts/performance.cjs` sends three 24 KB answers in 12-character chunks every 30 ms through real Electron IPC. It enforces completion below 1.5× stream time and UI p95 below 250 ms. |
| F2: raw HTML swallows prose | Escape Markdown HTML tokens before sanitizing. UI regressions preserve text after script, iframe, title, style, textarea and SVG tags; executable elements and passive content requests remain blocked. |
| F3: instances overwrite profiles | Acquire Electron's single-instance lock before reading settings; a second launch restores/focuses the first window and exits. The performance harness launches a second real process and requires it to exit. |
| F4: docs describe an unpublished version | Prepare v2.4.1, including v2.4 features. Beginner docs explicitly distinguish source instructions from the older downloadable release until publication. Do not claim a release exists merely because its tag was pushed. |
| F5: unhelpful billing errors | HTTP 402 and recognized HTTP 400 credit/billing failures give actionable credit/billing guidance. Read only a bounded error response; never display its raw contents. Tests use a private-body canary. |
| F6: failed backup prevents startup | Catch history/preferences load or backup failures and offer a temporary session, the data folder, or Quit. Temporary storage never overwrites the original. Tests inject failed backup renames and verify original bytes survive. |
| F7: unrelated outages block Save | Validate new keys or changed active-provider settings. Unchanged saved keys are not rechecked. Errors use display names. Electron regression verifies an unchanged Save works while every fixture provider is offline. |
| F8: malformed update metadata claims current | Missing or malformed release tags produce an error. Unit fixtures cover missing, null and invalid tags. |
| F9: tally saved but history fails | Preferences are authoritative for the vote. Return the durable winner even if history fails, with a warning. Duplicate IPC requests return the existing winner without counting twice; reopening reconciles history. Electron disk-failure injection verifies this. |
| F10: raw storage errors and stale checkbox | Friendly preference, connection, encryption and decryption messages; failed update preference restores the checkbox. Unit and Electron fault tests cover these paths. |

## Other observations addressed

- Vote buttons have Answer-letter accessible names. They stay in place and disabled after voting; an in-flight guard prevents duplicate clicks.
- View menu restores Zoom In, Zoom Out and Reset Zoom, keeping the compact default layout.
- Connections cannot close with its button or Escape while Save is pending.
- Updating/reopening history preserves its position. A mixed history file backs up the original and salvages valid entries instead of discarding all entries.
- Markdown exports now include the connection route.
- Renderer termination offers Reload or Quit rather than leaving a blank window.
- Repeated catalog cursors abort promptly. OpenAI's heuristic menu excludes legacy GPT-3.5 and instruct models; it still cannot guarantee every model's generation compatibility.
- A weekly workflow with no keys skips its live job. Summaries distinguish success, missing-key skips, failures and budget-only inconclusive outcomes.

## Hypotheses and remaining real-world checks

- **H1:** Metadata or keep-alives before visible text retain the 120-second allowance; after visible text the idle allowance is 45 seconds. The five-minute overall cap remains. A timed metadata fixture verifies the mechanism. Actual long-thinking provider behavior has not been tested with a paid request.
- **H2:** A completed reasoning-only response that exhausts the 256-token cap is reported as INCONCLUSIVE, not provider failure. It does not trigger a more expensive retry. No dedicated live secrets were used.
- **H3:** A fresh Safari download, Gatekeeper approval, Windows SmartScreen/Smart App Control, installation and upgrade need real-machine checks after publication. Local packaged-app launch and signature verification do not certify those flows. Windows is unavailable in this test environment.
- **H4:** Credential-store failures have friendly messages and transactional settings. Denying a real Keychain or DPAPI unlock remains unverified; tests use synthetic failures without touching personal credentials.

Paid signing and Apple notarization remain excluded as requested. The app uses the existing ad-hoc Mac signing configuration. This patch does not claim signing removes operating-system warnings.

## Reproducing the checks

Use Node 22 or newer, then run `npm ci`, `npm test`, and `npm run test:ui` from the repository. UI tests open Electron with disposable profiles and synthetic data. No personal keys or paid provider calls are used. Linux CI uses Xvfb; macOS runs normally. Set `ARENA_ELECTRON_PATH` to a packaged executable to run the same suites against packaged code.

The performance harness replaces generation with timed main-process IPC emissions; provider streaming parsers have separate unit fixtures. Fault tests replace network and credential storage, and selectively reject filesystem writes inside disposable profiles. These boundaries are intentional and do not establish live-provider or real-keychain behavior.

## Local results (2026-10-19)

- 62/62 unit tests passed on macOS ARM64.
- Source UI smoke and fault-injection suites passed.
- Packaged Mac UI smoke and fault-injection suites passed using the app's `app.asar` entrypoint.
- Source performance: 62.400 seconds total versus 62.215 seconds of synthetic streaming; UI p95 18 ms.
- Packaged performance: 62.324 seconds total versus 62.184 seconds of synthetic streaming; UI p95 14 ms.
- The packaged Mac bundle passed `codesign --verify --deep --strict`.
- The live-check script with no dedicated keys explicitly reported SKIPPED and made no requests.

These timings describe this Mac and the stated fixtures, not a performance guarantee for all laptops. Public installer verification results belong to the release workflow, not these local results.
