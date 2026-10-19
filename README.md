# LLM Battle Arena

One question. Three perspectives. A small desktop app for comparing Claude, OpenAI, and Gemini side by side.

![Desktop sample preview](desktop-preview.png)

## Use it

The packaged app opens in its own window. End users do not need Node.js or a browser for Live API mode. Internet access and your own API keys are required for live answers.

1. Open **Connections** and paste your three API keys. Leave a field blank to keep an existing key.
2. Choose **Live API · automatic**.
3. Type a question and click **Compare**, or press Ctrl+Enter (Cmd+Enter on macOS).
4. Answers stream independently. Stop a run, retry one provider, copy answers, or export Markdown/JSON.

You can include one, two, or three providers. A missing key or provider error affects only its card. Each comparison is a fresh question with no prior conversation context. The output limit applies independently to each model; some models spend part of that allowance on reasoning. Retrying makes a new API request and may incur additional usage charges.

### Three modes

- **Live API:** automatic requests to the three official APIs. API billing is separate from chat website subscriptions. OpenAI here means an OpenAI API model, not the ChatGPT website experience.
- **Website assist:** no API keys. Prepare a comparison, click Open on each card to copy the prompt and visit its official website, then paste the answers back. This is a manual convenience mode; website login, free limits, and model selection are controlled by each provider. There is no promised free question allowance.
- **Sample:** fixed, human-written illustrative answers to one example question. Works offline. These are explicitly labeled samples, not actual responses from the providers.

### Connections

Get keys from [OpenAI](https://platform.openai.com/api-keys), [Anthropic](https://platform.claude.com/settings/keys), and [Google AI Studio](https://aistudio.google.com/api-keys).

Default model IDs are `claude-sonnet-4-6`, `gpt-5-mini`, and `gemini-2.5-flash`. Change model IDs in Connections to use models available to your account. These are starting choices, not a claim that models have equal cost or capability. Availability changes over time. A 404 generally means the model ID needs changing.

## Run from source

Requires Node.js 22.12 or later.

```sh
npm ci
npm start
```

No Vercel account, server deployment, Python, or `.env` file is needed. The plain HTML interface can also be opened for an offline sample preview; live calls and secure Connections require the desktop app.

## Package

```sh
npm run dist:win   # Windows installer and portable executable; build on Windows
npm run dist:mac   # macOS ZIP; build on macOS
npm run pack       # unpacked app for your current OS
```

Build outputs go to `dist/`. The GitHub Actions desktop workflow tests and builds on Windows and macOS and uploads downloadable artifacts. These are unsigned development builds; Windows/macOS may show an unknown-publisher warning. Public distribution with a verified publisher requires signing credentials. No release is automatically published.

## Local data and security

- Keys are encrypted through Electron `safeStorage`, backed by OS credential protection. Plaintext/unsupported Linux storage is refused. The encrypted connection file is in Electron's app user-data directory, outside this repository.
- The interface receives connection status and model IDs, never saved keys. Keys are used only by the desktop process for fixed official API endpoints.
- The interface is sandboxed with Node integration off, context isolation on, a restrictive content policy, and no remote scripts or fonts.
- Answers are rendered as plain text, including any Markdown source. Model output cannot inject executable HTML.
- No analytics, app account, hosted backend, automatic prompt history, or shared credentials. Prompt and answer data stay in memory until an explicit export or clipboard action. Providers process live prompts under their own terms. Clipboard content remains available to other apps according to your OS settings.
- No website passwords are collected. Website assist opens the system browser so you sign in directly with the provider.

## Verify

```sh
npm test
```

Tests exercise streamed provider fixtures, UTF-8/frame boundaries, identical prompt delivery, missing keys, independent failures, cancellation, timeout, premature disconnects, output caps, and connection persistence using a fake encryption adapter. They do not call paid APIs or certify current account/model access. Live end-to-end verification requires your own keys.

## Layout

- `desktop/main.cjs`: window, constrained IPC, request orchestration, clipboard/export
- `desktop/preload.cjs`: minimal bridge
- `desktop/store.js`: encrypted connection persistence
- `src/providers.js`: validation, official API requests, stream parsing
- `src/app.js`, `src/styles.css`, `index.html`: local interface
- `test/`: behavioral tests

The current build-tool dependency audit includes moderate advisories in the electron-builder download/logging chain. They are development dependencies, not shipped application dependencies. Compatible security updates have been applied.

MIT license. A curiosity project by Yobie Benjamin.
