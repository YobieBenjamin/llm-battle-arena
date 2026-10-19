## v2.4.7 — hardened release, separate regression build

- Disable the Node command-line inspector in published applications before signing and packaging.
- Keep deep fault-injection regressions on an ephemeral private build that is never uploaded.
- Compare the entire application archive byte-for-byte between the private and release builds.
- Exercise the hardened app through its UI: Sample, history, native Markdown/JSON export, quit, and history after restart.
- Check both `--inspect` and `--inspect-brk`: the app must start normally and no Node debugging endpoint may open.
- Repeat fuse, payload identity, and UI checks on installer payloads and public downloads, on native Mac and Windows runners.

See [release verification](https://github.com/YobieBenjamin/llm-battle-arena/blob/main/docs/RELEASE-VERIFICATION.md) for the test boundary and reproduction steps. Mac signing remains ad-hoc; Windows installers remain unsigned.

## v2.4.6 — pre-install audit follow-up

- Explain invalid Gemini keys correctly during Save, Check key, and Compare, including Google's HTTP 400 response. Provider bodies are size-limited and never shown verbatim.
- Give friendly file-save and export errors for unwritable destinations and full disks.
- Disable Electron RunAsNode and NODE_OPTIONS, require ASAR loading, and enable embedded ASAR integrity checks. CI verifies the actual packaged fuse bits.
- Add an original Arena Y icon and remove unused Mac camera/microphone permission descriptions before signing.
- Skip existing draft releases during automatic archival.

See [the audit response](https://github.com/YobieBenjamin/llm-battle-arena/blob/main/docs/AUDIT-RESPONSE-2.4.6.md) for validation and limitations.

## v2.4.5 — Mac build reliability and historical archives

- Includes the v2.4.4 audit fixes listed below (v2.4.4 was never published).
- Pin Apple Silicon CI to macOS 15 and Intel CI to macOS 15 Intel; test both packaged architectures natively.
- Run public download verification on Intel capacity rather than competing for ARM runners.
- Use timer-based readiness polling so obscured Mac windows do not stall automated startup checks.
- Detect already-running Arena apps before local packaged Mac tests and give an actionable message instead of a startup timeout.
- Mark superseded releases and historical source archives **OLD (DO NOT USE)**. Retain tags for auditing; keep obsolete installers private.

## v2.4.4 — verification follow-up

- Normalize text files to LF on every platform before packaging.
- Announce actual vote results to screen readers after reveal.
- Refuse saving new API keys before provider checks when secure OS encryption is unavailable.
- Clarify how to deliberately recheck an unchanged saved key.

See [the verification follow-up](https://github.com/YobieBenjamin/llm-battle-arena/blob/main/docs/AUDIT-RESPONSE-2.4.4.md) for the audit review and remaining real-machine checks.

## v2.4.3 — independent audit fixes

- Responsive streaming: coalesce updates, show plain text while streaming, then render safe Markdown and artifact badges once the answer stops.
- Raw HTML examples remain readable; a second app launch focuses the existing window instead of racing to overwrite saved data.
- Clear credit/billing messages, targeted key checks, safer settings saves, recoverable history/preferences failures and durable, idempotent blind votes.
- Restore user zoom controls; preserve history order and recover valid entries from mixed damaged history; include route in Markdown exports.
- Thinking models retain the longer initial grace period until visible text; weekly budget-only outcomes are inconclusive, and unconfigured live jobs are skipped.
- Regression tests cover three 24 KB streams, single-instance behavior, raw HTML prose, disk-write failures, saved votes and setup errors. Packaged Mac CI runs the same UI gates.

This patch includes the v2.4.0 features below. It also adds renderer-level HTTP/HTTPS blocking and a loopback test that measures actual preview traffic. The unpublished v2.4.1 tag was held by its Mac UI test gate. All earlier installer releases are archived, with their tags retained for history. The v2.4.0 tag did not produce a public installer release because hosted macOS build runners were unavailable. Signing/notarization remains unchanged.

## v2.4.0 — blind battles, simpler setup and maintenance

- Blind battles shuffle cards, hide identities until a vote or reveal, and keep local win tallies.
- Connections adds model dropdowns and key checks without generation, plus an optional one-key OpenRouter route with a clear privacy disclosure.
- Optional GitHub update notices (off initially), and one cancellable retry for initial HTTP 503/529 busy responses.
- CI verifies published checksums, both Mac bundle signatures and source correspondence; Dependabot and a weekly live-check workflow are included. Live checks skip unconfigured dedicated secrets.
- Novice setup and maintainer instructions are expanded. Existing signing/notarization remains unchanged.

## v2.3.0 — formatted answers and local history

- Read headings, tables, lists and code as formatted Markdown. Copy and exports keep the original text. Website assist has Read formatted / Edit pasted answer controls.
- History automatically keeps the last 50 comparisons on your laptop. Reopen a comparison without an API request, delete one, or confirm clearing all. History is plain text and may contain sensitive prompts and answers.
- Packaged Apple Silicon Mac apps now run the UI regression suite in CI before release, alongside Linux source checks.

## v2.2.2 — readable artifact docks on laptops

- Stacked pinned previews now keep 360px for the cards and 360px for the preview. Scroll inside the results area to reach both.
- Ctrl/Cmd+Enter works with a pinned preview; website-answer paste boxes remain protected.
- Restored standard Mac About, Hide, Close and Minimize actions without enabling reload or DevTools.
- Providers get two minutes before the first response bytes, then 45 seconds between chunks, with the existing five-minute total cap.
- Regression checks measure visible answer and preview heights at 880×650, 1280×720 and 1440×900, rather than checking only overlap.

Mac bundles remain ad-hoc signed, not Apple notarized. A fresh Safari download and first launch on a real Mac has not been certified. See the novice guide below.

One question. Three answers. A small, free desktop curiosity toy for comparing Claude, OpenAI, and Gemini.

## Download

- **Most Windows PCs:** `LLM-Battle-Arena-Windows-x64-Setup.exe`
- **Windows ARM / Snapdragon:** `LLM-Battle-Arena-Windows-arm64-Setup.exe`
- **Apple Silicon Mac:** `LLM-Battle-Arena-macOS-arm64.dmg`
- **Intel Mac:** `LLM-Battle-Arena-macOS-x64.dmg`

Windows: double-click Setup; the one-click installer opens the app. Mac: open the DMG, drag the app into Applications, and open it there. Optional Windows Portable EXEs are also included.

[START HERE: novice installation guide](https://github.com/YobieBenjamin/llm-battle-arena/blob/main/START-HERE.md) · [Full user guide](https://github.com/YobieBenjamin/llm-battle-arena/blob/main/docs/USER_GUIDE.md)

## Start playing

1. Try **Sample → Show sample** immediately, with no setup or charge. Samples are fixed written examples.
2. Open **Connections**, paste your own API keys, and Save connections.
3. Type a question and click **Compare** to stream three independent answers.

API usage may be billed by your providers. Chat website subscriptions and API access are separate. Without keys, **Website assist** helps you copy/paste between official websites and the comparison cards manually.

## Corrective release 2.2.1

- Mac app bundles are now explicitly ad-hoc signed and must pass strict deep signature verification in CI. They are still not Developer ID signed or notarized; OS approval can still be required or blocked.
- Ctrl/Cmd+Enter inside a Website-assist paste box preserves pasted answers.
- A consistently estimates visible answer text; R separately shows reported reasoning. Raw provider output usage is retained in both exports and the hover explanation.
- Pinned artifacts dock beside or below the cards without covering Copy/Retry controls.
- Friendly IPC errors, distinct key-unlock failures, idle-aware timeouts, settings reset with backup, and display-aware window sizing.
- A reproducible UI regression harness now gates releases.

[Findings and verification limits](https://github.com/YobieBenjamin/llm-battle-arena/blob/main/docs/CLAUDE-REVIEW.md)

## Previous: 2.2.0

- A small Y badge for detected artifacts: hover to preview, click to pin, click again to hide. Static HTML/SVG previews, JSON/source views, multiple-file tabs, and Save file. Includes a sample artifact with no API calls.

- Tiny question/answer token counters on every card and a draft-question estimate. `~` means estimated; provider-reported usage replaces estimates when available. No extra API requests.
- A novice **START HERE** guide explaining downloads without assuming any GitHub knowledge.
- A one-time documented code/documentation audit and fixes for title navigation, malformed settings, safe stream errors, incomplete response status, and checksum paths.

## Included

- Standalone Mac/Windows app; no Git, Node, Python, or terminal needed for users.
- Slim toolbar with no oversized title block; compact scrolling prompt and answer cards that fill the remaining window.
- Side-by-side streamed answers, Stop, per-provider Retry, Copy, Markdown/JSON export.
- OS-encrypted local keys, editable model IDs, and built-in How to play.
- Plain-language installation, troubleshooting, privacy, and uninstall instructions.

Windows builds are unsigned; Mac builds are ad-hoc sealed but not verified-publisher or notarized releases. macOS/Windows may show first-launch prompts; managed computers may block them. See the guide for per-app approval information. No automatic updater or hosted service is included.

SHA-256 checksums accompany the downloads. CI builds/tests run for all four OS/CPU targets. Local runtime smoke checks were performed on Apple Silicon Mac; live API calls require your keys. Cross-platform build success is not a claim of hands-on runtime testing on every laptop.
