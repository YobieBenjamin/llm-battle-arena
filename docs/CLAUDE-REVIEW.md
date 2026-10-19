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
