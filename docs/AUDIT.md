# One-time code and documentation audit — 2.2.0

Performed October 18, 2026 (America/Los_Angeles) by the implementation assistant. This is a source review and verification record, not an independent security certification or a promise that all defects have been found. It is a one-time audit, not a scheduled monitor.

## Scope

Reviewed the desktop process and IPC bridge, renderer, provider streaming adapters, encrypted settings store, token counters/exports, artifact extraction and the preview/save boundary, package configuration, installer/release workflow, README, novice start guide, user/developer guides, and issue-reporting flow.

The review looked for credential exposure, unsafe HTML/navigation, request validation, provider error states, local-data recovery, token-label accuracy, scrolling, download clarity, stale instructions, and release asset naming.

## Findings fixed in this release

| Finding | Change | Evidence |
| --- | --- | --- |
| Clicking the brand's `#` link could change the document URL and invalidate the strict IPC URL check. | The brand is now non-navigating text. | Desktop smoke check clicks the title, verifies no fragment, and continues through settings/export actions. |
| Valid JSON with an invalid settings shape (such as `null`) was not rejected at load. | The store validates provider IDs, entry/model shape, and encoded secrets before use. Damaged files reach the existing recovery message. | Malformed-settings tests reject invalid saved shapes; persistence/removal tests still pass. |
| Invalid provider JSON could put raw response fragments into a parse-error message. | SSE parse failures now use a generic error and preserve partial results. | A malformed stream containing a fake secret never echoes that text to the UI. |
| A filtered partial Gemini answer could appear complete; non-token OpenAI incompletion could be labeled as an output-limit event. | Filtered/stopped outputs now report an error; only an explicit output-token-limit reason is labeled that way. | Provider fixture tests cover both outcomes and preserve partial text. |
| Streaming updates could disturb a reader's scroll position. | Rendering preserves the position when reading above the bottom and follows new text when already at the bottom. Unchanged text is not rewritten. | Source review plus scrolling desktop smoke checks. |
| The checksum manifest included an unnecessary `release/` path prefix. | Checksums are generated inside the asset directory using plain filenames. | Workflow YAML reviewed and parsed. |
| Token estimates could be mistaken for exact usage, prices, or counts of a new draft instead of the recorded comparison. | Tiny Q/A counters mark estimates with `~`, explain limits, preserve the original prompt per result, and export count/source metadata. | Token unit tests, all three providers' usage fixtures, and UI tests for draft edits and both export formats. |
| New users could mistake GitHub's source files for the installer. | README starts with START HERE and direct downloads; the novice guide explains Downloads, Assets, Source code, first launch, keys, and first use without assuming GitHub knowledge. | Documentation walkthrough, local-link check, release filename mapping, and novice issue form. |

## Verification

- **30 automated unit tests passed.** Coverage includes request validation, identical prompts, SSE/Unicode boundaries, independent provider outcomes, missing keys, cancellation, timeout, malformed/filtered streams, partial answers, output caps, settings persistence and malformed-file rejection, token estimates, provider input/output usage, and reasoning metadata.
- **Desktop UI smoke check passed on Apple Silicon Mac** with a temporary profile and no paid API calls: sample counters, draft estimates, original-question counts after editing a draft, token metadata in JSON and Markdown, title click, prompt/answer/manual scrolling, Help, safe HTML-looking pasted text, three missing-key errors, and Connections save. Artifact checks additionally exercised Y hover/pin/hide, multiple files, source view, save payloads, and an HTML artifact whose attempted script, external image request, and app-bridge access were blocked. No renderer errors were observed.
- JavaScript syntax and whitespace checks passed. Workflow and novice issue-form YAML parsed successfully. Local documentation links were checked.
- Release publishing is gated on successful Windows x64, Windows ARM64, macOS ARM64, and macOS x64 build/test jobs. Download names in the novice guides match the configured assets. Public assets are verified after the tagged release publishes.

A visual check also caught the preview covering the rightmost Y badge. The panel now opens below the card headers, keeping all badges clickable for pin/unpin. The sample smoke check verifies its top edge stays below the triggering badge.

## Artifact review added within this same audit

Artifact content is untrusted. Complete labeled fences are detected locally with count/size bounds. Regular answers/source remain plain text. HTML/SVG rendering is confined to an iframe with an empty sandbox and child CSP denying scripts, network access, forms, remote resources, and objects. Desktop frame-navigation controls prevent previews from navigating to local or external files; the preview has no preload/app bridge. The parent permits inline CSS for the static frame but still forbids inline JavaScript. Save validates a fixed filename/extension set and uses a native save dialog; saved files are not automatically executed.

Unit tests cover incomplete/mismatched fences, supported formats, count/size bounds, and preview restrictions. Desktop tests exercised a script and remote-image attempt and confirmed neither ran/requested; the iframe also had no `window.arena`. This is not a general-purpose hostile-browser penetration test. Private provider cloud artifacts are not fetched; detection only covers embedded labeled files.

## Dependency audit result

A single `npm audit --json` run reported **0 critical, 0 high, 8 moderate, 0 low** advisories. The affected development dependency chain includes `sprintf-js`, `roarr`, `global-agent`, `@electron/get`, `app-builder-lib`, `dmg-builder`, `electron-builder`, and `electron-builder-squirrel-windows`.

These are packaging/download tooling dependencies, not production npm modules bundled as app dependencies. This does not make the advisories irrelevant: build machines still execute development tools. Compatible fixes had already been applied; remaining moderate advisories are disclosed rather than treated as a clean audit. No unsupported major-version migration was made just to silence the report.

## Known limits and remaining risks

- Downloads remain unsigned and not Apple-notarized. OS approval prompts and managed-machine restrictions can still prevent installation. The user guide explains per-app approval without recommending that users disable security globally.
- Live API calls were not run using private user keys. Fixture tests validate protocols and accounting, not the user's billing, current model access, or every live provider behavior.
- Windows/Intel/ARM build success is not hands-on runtime testing on all those devices. Desktop runtime checks were performed on Apple Silicon Mac.
- Local token estimates use about four Unicode characters per token. They can be substantially wrong for other languages, code, emoji, and different model tokenizers. Reported provider usage can include formatting/caching/reasoning categories and is not a cross-provider price comparison. No extra token-count API request is made.
- OS-backed key encryption does not protect against someone who controls the logged-in user account. Exported files and clipboard contents are not encrypted by this app.
- There is no persistent answer history, auto-updater, hosted service, or automated website submission. These limitations are stated in the user guide.

[Beginner start guide](../START-HERE.md) · [User guide](USER_GUIDE.md) · [Developer guide](DEVELOPMENT.md)
