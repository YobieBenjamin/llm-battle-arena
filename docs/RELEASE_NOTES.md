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
