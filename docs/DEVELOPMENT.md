# Developer guide

Most people should use [the installers](https://github.com/YobieBenjamin/llm-battle-arena/releases/latest). This page is for changing the code or producing a release.

## Run from source

Requires Git and Node.js 22.12 or newer.

```sh
git clone https://github.com/YobieBenjamin/llm-battle-arena.git
cd llm-battle-arena
npm ci
npm test
npm start
```

Electron downloads its development runtime on first use if it is not already cached. No Python, Vercel, `.env`, or external backend is required. Enter keys through Connections. Do not commit keys.

## Architecture

| File | Responsibility |
| --- | --- |
| `index.html`, `src/styles.css` | Bundled local interface; compact, independently scrolling prompt and answer areas. |
| `src/app.js` | Three modes, comparison state, card rendering, help, connection form, copy/export controls. |
| `desktop/main.cjs` | Sandboxed window, trusted IPC, parallel request orchestration, cancellation, clipboard, native save dialogs, fixed external links. |
| `desktop/preload.cjs` | Minimal allowlisted bridge; no arbitrary IPC access exposed to renderer. |
| `desktop/store.js` | Atomic settings updates and OS-encrypted key persistence. |
| `src/providers.js` | Request validation, fixed official endpoints, SSE decoding, provider adapters, statuses and usage. |
| `src/artifacts.js`, `src/artifact-view.js` | Complete fenced-file detection, isolated preview, hover/pin/hide interactions, source tabs, and native save. |
| `src/tokens.js` | Rough local estimates, provider-count validation, formatting, and estimated/reported metadata. |
| `test/` | Behavioral tests with provider fixtures and a fake encryption adapter. |
| `.github/workflows/desktop.yml` | Four architecture-specific installer builds and tag-triggered release publishing. |

Live mode uses Anthropic Messages streaming, OpenAI Responses streaming (`store: false`), and Gemini `streamGenerateContent`. Every selected adapter receives the unchanged prompt. Requests have separate cancellation/error outcomes, a two-minute first-byte allowance followed by a 45-second idle deadline refreshed by stream bytes, and a five-minute overall cap. API errors are simplified for users; the app does not display raw provider error bodies. Partial text is retained. Retries are explicit rather than automatic to avoid surprise repeat charges.

No persistent chat history or analytics is implemented. Sample answers are fixed written fixtures. Website assist opens fixed official URLs and lets the user paste answers manually. Model IDs are editable because account access and provider catalogs change; defaults are not a guarantee of equal capabilities or current availability.

## Security boundaries

The renderer has Node integration disabled, context isolation and sandboxing enabled, a restrictive content policy, and no remote scripts/fonts. IPC validates the calling window/main-frame URL. Keys never return through the bridge. Regular answers/source views enter the DOM through `textContent`. HTML/SVG artifact previews alone use `srcdoc` inside an iframe with an empty sandbox, restrictive child CSP, no scripts, no networking, no forms, no app bridge, and blocked frame navigation. The parent permits inline styling for these static previews; it still forbids inline scripts. File saving validates a fixed extension allowlist and uses a native save dialog. External navigation is limited to allowlisted provider/key links opened in the system browser.

Encrypted credentials are outside the checkout in Electron's app-data directory. Linux `basic_text` fallback storage is refused. Malformed settings offer Reset connections (preserving a backup), Open settings folder, or Quit. Unreadable keys produce a distinct unlock/re-enter message. Do not log request headers, plaintext keys, or private prompts.

## Artifact previews

Detection is local and does not alter prompts, fetch links, or make extra API calls. Supported labeled fences become bounded files only once closed. Hover reveals a single shared preview panel; a click pins it; a second click hides it. Explicit clicks can switch between providers while hovering cannot replace a different pinned preview. The sample includes a fixed illustrative HTML card.

Scripts are not executed in preview, even for HTML. Nonvisual code/CSV/Markdown is source text; JSON is formatted locally. Save file never automatically executes its output. Saved HTML can run scripts and make network requests when opened in a browser. It is outside the in-app sandbox.

## Token counts

Each result preserves its original prompt. Input, provider output, and separately reported reasoning remain in `inputTokens`, `tokens`, and `reasoningTokens`. The UI/exports show Q input (reported or estimated), A visible text (always estimated using the same rule), and R reported reasoning (null/— when unavailable). OpenAI output minus reasoning can still include hidden formatting, so it is not labeled exact visible output. Raw provider output is retained in tooltips, JSON, and Markdown. No extra API request is made.

Official usage reference: [OpenAI output counts](https://developers.openai.com/api/docs/guides/token-counting).

## Tests and manual checks

```sh
npm test
npm run test:ui
```

Tests cover request validation, unchanged prompts, header-only credentials, arbitrary SSE/UTF-8 boundaries, provider streaming fixtures, missing keys, safe HTTP errors, partial EOF, cancellation, timeout, independent failure, output caps, encrypted persistence with a fake adapter, removal, and transactional settings validation.

Before releasing, exercise the actual app with a temporary user-data directory:

1. Sample mode produces three clearly labeled examples with no network access.
2. Long prompt text scrolls inside the compact prompt box.
3. Long answers scroll independently inside fixed-height cards; Copy/Export include offscreen text.
4. Website assist lets the user paste plain text safely, including HTML-looking content.
5. Missing keys produce a terminal error on each selected card and restore the controls.
6. Connections opens/saves; closing it clears entered key fields from the interface.
7. How to play opens/closes, and its dialog blocks the send keyboard shortcut.
8. With your own keys, verify one short real comparison, cancellation, and one-provider retry. This can incur provider charges.

Fixture tests and packaged-app smoke checks do not establish current paid account/model access. Live provider calls have not been performed by the agent without user-supplied keys. The committed `scripts/smoke.cjs` harness uses temporary settings and no paid calls; it runs in CI under Xvfb on Linux. Linux CI uses `--no-sandbox` for runner compatibility, so it is not a certification of OS sandboxing. Mac source and packaged tests run without that flag. Set `ARENA_ELECTRON_PATH` to a packaged executable to test it, and `ARENA_SCREENSHOTS=1` to refresh screenshots. Windows builds are exercised in CI; runtime smoke testing was performed on the local Mac, not every OS/CPU combination.

## Build installers locally

```sh
npm run dist:win   # NSIS one-click installer plus portable EXE on Windows
npm run dist:mac   # drag-to-Applications DMG on macOS
npm run pack       # unpacked app for the current OS
```

Choose architecture explicitly when needed:

```sh
npm exec electron-builder -- --win --x64 --publish never
npm exec electron-builder -- --win --arm64 --publish never
npm exec electron-builder -- --mac --arm64 --publish never
npm exec electron-builder -- --mac --x64 --publish never
```

For ad-hoc-signed Mac development builds set `CSC_IDENTITY_AUTO_DISCOVERY=false` in your shell before building; otherwise electron-builder may discover a local Apple certificate. CI sets that variable. Mac downloads are ad-hoc sealed (`mac.identity: "-"`), verified with `codesign --verify --deep --strict` in CI, and not notarized. Windows downloads are unsigned. Ad-hoc signing does not establish a trusted publisher or ensure Gatekeeper approval. Verified signing/notarization requires deliberately configured publisher credentials, which are not included. Do not disable OS security globally as an installation workaround.

## Publish a release

The default branch is `main` in **YobieBenjamin/llm-battle-arena**. This repository continues the original project and retains its Git history.

1. Update the version in `package.json` and the root/package entries in `package-lock.json`.
2. Update `docs/RELEASE_NOTES.md` and the user guide for changed behavior.
3. Run tests and manual checks. Commit and push to main.
4. Tag the reviewed commit with the matching version, for example `git tag v2.2.2`, then push the tag.
5. The **Desktop installers** workflow builds Windows x64, Windows ARM64, macOS ARM64, and macOS x64. All four build jobs and the UI regression job must pass before publishing.
6. The release job combines artifacts, produces `SHA256SUMS.txt`, and publishes GitHub Release downloads using the workflow token.
7. Check the public release and README links. The download filenames remain stable across versions, so `/releases/latest/download/...` always selects the newest release.

Branch/PR builds upload workflow artifacts but never publish releases. Packaging always uses `--publish never`; only the explicit release job publishes. A workflow_dispatch run builds artifacts only. A failed tagged run publishes nothing; repair the issue and publish a new version/tag rather than silently replacing a public binary.

Windows Setup is per-user, one-click, and launches after installation. Portable EXEs use the same app-data folder. Mac disk images provide the usual Applications drag target. There is no auto-updater; users download a newer installer manually.

## Dependency audit

Compatible security fixes have been applied. Moderate advisories remain in the development-only electron-builder download/logging dependency chain. There are no production npm dependencies copied into the app; Electron itself supplies the runtime. Keep Electron and packaging tooling updated and review advisories before broader distribution.
