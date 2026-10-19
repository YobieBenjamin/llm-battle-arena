# v2.4.7 — unpublished hardening candidate

This tag was never released as an installer. Its Windows ARM native test helper timed out, so publication stayed blocked. See the subsequent v2.4.8 work for the corrected helper.

The release configuration sets `enableNodeCliInspectArguments: false` before signing and packaging. Deep regressions run against a separate ephemeral build with that fuse enabled. That private application is never uploaded. Each native build job compares the entire private and release `app.asar` byte-for-byte after the deep tests.

The hardened test launches the actual signed/packaged executable and operates visible controls through Chromium's renderer automation connection. It does not attach to the main-process inspector, invoke app IPC directly, replace dialogs, or modify the application. Native Save dialogs write real Markdown and JSON files, whose contents are checked. Quit and restart must preserve history. Both `--inspect` and `--inspect-brk` must leave the requested Node debugging port closed and permit normal startup. The test rechecks executable and archive hashes afterward.

Each installer is unpacked into its runtime application layout (Mac DMGs are mounted read-only). Its executable and archive must match the tested release, its fuse must be disabled, and its UI must pass again. Public-download verification repeats these checks on native Mac/Windows x64/ARM64 runners, with SHA-256 checksums for installers and evidence reports. Mac source and dependency bytes are also compared with the tag and locked dependency install.

## Test boundaries

- Chromium renderer CDP is enabled only by test launch arguments. This is distinct from the disabled Node main-process inspector. We do not claim every possible Chromium debugging switch is disabled.
- Hosted Mac Sample tests use `--use-mock-keychain` to avoid the runner's Keychain interaction blocking startup. Reports explicitly identify that test backend. No real keys are involved, and CI does not claim to test real Keychain integration. Local app and DMG tests passed with normal Keychain behavior, without that switch.
- CI uses native accessibility/keyboard controls for file dialogs. It does not disable OS security protections. Window scheduling switches keep occluded CI windows rendering.
- Installer payload tests do not claim to test every interactive installation, Gatekeeper, or SmartScreen prompt. Mac signing remains ad-hoc; Apple notarization and paid Windows signing were not added.

## Local evidence

- All 70 unit tests pass, including negative tests for mismatched application archives and open debugging ports.
- The private ARM64 Mac app passes the complete smoke, fault-injection/crash, and performance suites. Three simultaneous 24 KB streams completed in about 62 seconds with UI p95 16 ms.
- The hardened ARM64 Mac app and the app recovered from its DMG pass Sample, history, native Markdown and JSON export, normal quit, restart, and restored history. Both inspector launch flags remain ineffective; executable and application archive hashes are unchanged.
- The Mac private/release archive SHA-256 is `00d76ee8485ae996178083cbca41ae74b793e355cdb140eef120378310c3eacb`.

See [Release verification](RELEASE-VERIFICATION.md) for reproduction steps and the workflow for public-download checks.

Pre-release native verification passed the hardened app and both installer payloads on Windows x64/ARM64, and the app/DMG on Mac ARM64. Intel Mac also passed the full pipeline in an earlier run; a later repeat passed functional tests but measured UI p95 319 ms against the unchanged 250 ms limit. The tagged release must pass the same gate; the performance limit has not been relaxed.
