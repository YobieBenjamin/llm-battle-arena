# Maintainer setup (no coding required)

These features are for the person maintaining the GitHub project. Friends installing the app do not need GitHub accounts or secrets.

## Weekly live provider check

The workflow runs Mondays at 16:23 UTC and can also be started manually. Providers without dedicated secrets are skipped; nothing is read from a laptop's saved app keys. Configured providers make a small paid request asking for “OK,” with a 256-token output cap and a two-minute deadline. Some tokens may be spent on reasoning. Costs depend on the models and provider prices; there is no fixed monthly-price promise. The normal one-time overload retry still applies. A too-small reasoning budget reports INCONCLUSIVE rather than claiming the provider is down; inspect the selected model and choose a suitable low-cost model via the variables below.

1. Visit each provider's API dashboard and create a **separate test key**, preferably in a separate project with a low spending limit. Do not use an unrestricted personal production key.
2. Open **YobieBenjamin/llm-battle-arena** on GitHub in your browser.
3. Click **Settings → Secrets and variables → Actions → New repository secret**.
4. Add whichever providers you want enabled, using these exact names:
   - `ARENA_LIVE_CLAUDE_KEY`
   - `ARENA_LIVE_OPENAI_KEY`
   - `ARENA_LIVE_GEMINI_KEY`
5. Paste only the matching API key into each secret's Value box and save. Do not paste keys into an issue, code file or chat.
6. Under the **Variables** tab, optionally set `ARENA_LIVE_CLAUDE_MODEL`, `ARENA_LIVE_OPENAI_MODEL`, or `ARENA_LIVE_GEMINI_MODEL` to an account-supported inexpensive text model. Otherwise the app defaults are checked.
7. Open **Actions → Weekly live provider check → Run workflow** for a manual check. Read the job summary: OK means visible text was returned; INCONCLUSIVE means the small budget ended before visible text. A green workflow alone is not proof of provider health. When no keys are configured, the live job is skipped. Logs explicitly show skipped providers. A skipped provider has not been verified. Failed runs use GitHub's normal notification settings. No prompts, answers or credentials are printed.
8. To stop paid checks, remove the dedicated secrets or disable this workflow under Actions. It never runs on pull requests, including Dependabot PRs.

## Dependabot

`.github/dependabot.yml` checks npm and GitHub Actions weekly and opens up to five PRs for each. PRs run unit, source UI, packaged Mac UI and installer build checks. Review and merge updates manually; automatic merging is not enabled. Live-check secrets are not used by these PR checks.

## Public release verification

After publishing, a macOS job downloads the public release assets. It checks all six installer hashes against SHA256SUMS.txt, mounts both DMGs read-only, verifies each app's existing ad-hoc signature, compares bundled src/desktop/index files with the release-tag checkout, and checks the packaged Markdown libraries against npm ci's locked versions. The package version, entrypoint and dependencies must also match. This checks the published bytes, not just local build output.

A failed post-publication job does not automatically remove a release: inspect it promptly and mark or withdraw broken downloads. Checksums beside the release detect corruption, not a compromised GitHub account. Signature verification is not Apple notarization or a Safari-first-launch test. Windows installers receive checksum verification here, not an installation test. Signing and notarization are unchanged.

## API references

- [OpenAI model list](https://developers.openai.com/api/reference/resources/models/methods/list)
- [Claude model list](https://platform.claude.com/docs/en/api/models/list)
- [Gemini models](https://ai.google.dev/api/models)
- [OpenRouter key authentication](https://openrouter.ai/docs/api/api-reference/api-keys/get-current-api-key)
- [OpenRouter chat streaming](https://openrouter.ai/docs/api/api-reference/chat/create-a-chat-completion)


## Audit regression gates

`npm run test:ui` runs the UI smoke suite, disposable-profile fault injection, and a three-provider 24 KB streaming test. The latter uses 12-character chunks every 30 ms, requires completion within 1.5 times stream duration and UI round-trip p95 below 250 ms, and verifies a second instance exits. The same command runs against the packaged Apple Silicon app in CI. Fixtures replace network and credential storage only where stated; they do not certify real provider billing or OS keychain prompts.

Before recommending a release widely, a person should download it with Safari on an Apple Silicon Mac and install it on Windows, including first-launch prompts and an upgrade from the preceding release. CI signature/checksum checks do not replace those tests. Do not bypass OS protections to claim a successful first launch.


## Keep only the current installers public

The **Archive superseded installers** workflow runs after a successful tagged Desktop installers workflow, including public-file verification. It checks that the verified tag is still the latest release, then converts older public stable releases to drafts. Source tags remain intact. It does not execute code or artifacts from the triggering run and ignores failed runs, branch builds and fork runs. If a newer release has appeared meanwhile, it changes nothing.
