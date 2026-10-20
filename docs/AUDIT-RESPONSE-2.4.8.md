# v2.4.8 — hardened release verification

Published applications disable `enableNodeCliInspectArguments` before signing and packaging. Deep fault-injection regressions run on a separate inspector-enabled build that is never uploaded. Each platform compares the complete private and release `app.asar` byte-for-byte.

The hardened application is launched normally with a disposable profile. Tests use visible controls for Sample comparison, history, real Markdown/JSON exports, quit, restart, and reopening history. Native Save dialogs are operated through OS controls. Tests never use the main-process inspector, Electron IPC calls, replaced dialogs, or modified application code. Requested `--inspect` and `--inspect-brk` ports must stay closed while the UI starts normally. Executable and archive hashes must remain unchanged after testing.

All six installers are unpacked into their runtime application layout. Their executable and archive hashes must match the tested release; Mac signatures and actual fuse bits are checked. The complete UI test runs again against those payloads. After publication, native Mac/Windows x64/ARM64 jobs download the public assets, verify checksums, compare public installers and proofs with the original immutable CI build artifacts, and repeat the checks. Mac bundles also undergo exact application-source comparison against the tag and byte comparisons of the shipped marked and DOMPurify modules against the locked install; this is not a comparison of every node_modules file.

v2.4.7 was an unpublished verification candidate. Its release remained blocked by a Windows ARM native-helper timeout. v2.4.8 uses bounded native control messages through PowerShell 7 instead of simulated keystrokes. The inspector remains disabled throughout; the 250 ms streaming responsiveness gate was not relaxed.

## Explicit test boundaries

- Renderer-only Chromium CDP is enabled by test launch arguments. It is separate from the disabled Node main-process inspector. Normal launch enables neither. This is not a claim that every Chromium debugging switch is disabled.
- Hosted Mac Sample tests use `--use-mock-keychain` to isolate them from runner Keychain interactions. Reports disclose the backend. No real credentials are used; these CI tests do not claim to validate real Keychain integration. Normal local Mac UI testing omits that switch.
- Native automation changes no system security settings. It operates only the test process's own controls. Installer tests validate the recovered application, not every interactive installation, Gatekeeper, or SmartScreen prompt.
- Mac signing remains ad-hoc and Windows installers remain unsigned. Paid signing and notarization were excluded from this work.
- Checksums detect changed downloads; they are not an independent signature against a compromised publishing account.

## Evidence and reproduction

The release tag passes 71 unit tests covering existing application behavior and negative checks for differing archives, replaced public downloads, and detectable open debugging ports. The private build retains the complete smoke, crash/fault-injection, artifact isolation, persistence, and streaming performance tests.

The v2.4.7 precursor passed local normal-Keychain app and DMG UI checks. Its tagged Intel Mac run passed the unchanged performance gate at UI p95 102 ms. A separate earlier run measured 319 ms and failed the 250 ms gate; that failure was not hidden or waived.

See [Release verification](RELEASE-VERIFICATION.md) for commands, evidence report fields, and the public-download workflow. The [pre-release native run](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39339600670) passed all four platform/architecture jobs, their private regressions, hardened UI tests, and all six installer-payload checks. The tagged release repeats these gates before publishing.

The first tagged Intel run caught a test timing race: an export file existed before its asynchronous write finished, so the harness read an empty string. Publication stayed blocked. The unchanged tagged build passed on rerun. A test-only follow-up on `main` (`777a03e`) now waits for export contents, including complete JSON, before applying the original assertions; its new regression simulates the empty/partial/complete write sequence. All 72 unit tests pass locally. No packaged application code or security setting changed, and the tag was not rewritten.

The [v2.4.8 tagged release run](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39340291973) completed successfully: all four native builds, Linux UI regressions, all six installer payloads, public checksum/source/signature verification, and all four public-download native UI jobs passed. Public installers and proofs match the original CI artifacts. Both Node inspection flags failed to open endpoints while the visible UI remained functional.

The [test-only follow-up run](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39341101206) also passed every native build and installer test with the corrected export wait and 72 unit tests.

On 2026-10-19, the published Apple Silicon DMG was downloaded to this laptop, checked against release checksums, mounted read-only, and verified with `codesign --verify --deep --strict`. Its executable and ASAR matched the published proof. The complete hardened UI test then passed with the normal native Keychain backend (no mock-keychain switch): Sample, history, real Markdown/JSON Save dialogs, native Quit, restart, and saved comparison reopening. Both requested Node inspector ports remained closed; executable and ASAR hashes were unchanged. This was an extracted/mounted-app test, not a Safari quarantine or full drag-to-Applications installation test.

Verified Mac ARM64 application archive SHA-256: `2da65cf44d92ee67d9c60c2637d53ecb1e5aa93f41b1bbc85f99cb0944baa7de`.

The [archive workflow](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39341900127) succeeded after public verification. Only v2.4.8 remains a public installer release. Previous release records are private drafts labeled OLD (DO NOT USE); historical local builds and source ZIPs are preserved in the correspondingly labeled Documents archive.
