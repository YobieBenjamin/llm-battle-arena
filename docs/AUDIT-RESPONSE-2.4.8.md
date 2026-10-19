# v2.4.8 — hardened release verification

Published applications disable `enableNodeCliInspectArguments` before signing and packaging. Deep fault-injection regressions run on a separate inspector-enabled build that is never uploaded. Each platform compares the complete private and release `app.asar` byte-for-byte.

The hardened application is launched normally with a disposable profile. Tests use visible controls for Sample comparison, history, real Markdown/JSON exports, quit, restart, and reopening history. Native Save dialogs are operated through OS controls. Tests never use the main-process inspector, Electron IPC calls, replaced dialogs, or modified application code. Requested `--inspect` and `--inspect-brk` ports must stay closed while the UI starts normally. Executable and archive hashes must remain unchanged after testing.

All six installers are unpacked into their runtime application layout. Their executable and archive hashes must match the tested release; Mac signatures and actual fuse bits are checked. The complete UI test runs again against those payloads. After publication, native Mac/Windows x64/ARM64 jobs download the public assets, verify checksums, compare public installers and proofs with the original immutable CI build artifacts, and repeat the checks. Mac bundles also undergo exact source/dependency comparison against the tag and locked install.

v2.4.7 was an unpublished verification candidate. Its release remained blocked by a Windows ARM native-helper timeout. v2.4.8 uses bounded native control messages through PowerShell 7 instead of simulated keystrokes. The inspector remains disabled throughout; the 250 ms streaming responsiveness gate was not relaxed.

## Explicit test boundaries

- Renderer-only Chromium CDP is enabled by test launch arguments. It is separate from the disabled Node main-process inspector. Normal launch enables neither. This is not a claim that every Chromium debugging switch is disabled.
- Hosted Mac Sample tests use `--use-mock-keychain` to isolate them from runner Keychain interactions. Reports disclose the backend. No real credentials are used; these CI tests do not claim to validate real Keychain integration. Normal local Mac UI testing omits that switch.
- Native automation changes no system security settings. It operates only the test process's own controls. Installer tests validate the recovered application, not every interactive installation, Gatekeeper, or SmartScreen prompt.
- Mac signing remains ad-hoc and Windows installers remain unsigned. Paid signing and notarization were excluded from this work.
- Checksums detect changed downloads; they are not an independent signature against a compromised publishing account.

## Evidence and reproduction

All 71 unit tests cover the existing application behavior plus negative checks for differing archives and detectable open debugging ports. The private build retains the complete smoke, crash/fault-injection, artifact isolation, persistence, and streaming performance tests.

The v2.4.7 precursor passed local normal-Keychain app and DMG UI checks. Its tagged Intel Mac run passed the unchanged performance gate at UI p95 102 ms. A separate earlier run measured 319 ms and failed the 250 ms gate; that failure was not hidden or waived.

See [Release verification](RELEASE-VERIFICATION.md) for commands, evidence report fields, and the public-download workflow. The [pre-release native run](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39339600670) passed all four platform/architecture jobs, their private regressions, hardened UI tests, and all six installer-payload checks. The tagged release repeats these gates before publishing.
