# v2.4.6 — full audit and pre-install follow-up

Reviewed the supplied v2.4.5 report. It identifies one confirmed usability defect (N1); it does not report a blocking security or installer defect. Its historical harness mismatches are not treated as new application bugs. Its reported real-Mac Sample test is independent evidence, not a Safari-quarantine first-install test performed here.

| Finding | Response |
| --- | --- |
| N1: Gemini HTTP 400 invalid key | Shared bounded (8 KiB) structured-error reader recognizes `API_KEY_INVALID` details/status and “API key not valid” messages. Save, explicit Check, and generation show a key-rejected message. Unrelated HTTP 400 responses remain request errors. Raw provider details never reach users. |
| L1: default fuses | Disable RunAsNode and Node-options environment variables; enable ASAR-only loading and embedded integrity validation. Build gates inspect actual bits in Mac/Windows packages; downloaded Mac bundles are checked again. |
| C1: duplicate archive banner | `main` already checked the existing banner before the supplied report. The workflow now also skips existing drafts entirely. |
| C2: native save errors | Both artifact saving and comparison exports translate filesystem failures into writable-folder/disk-space guidance. Fault-injected IPC tests verify errors contain no native codes or paths. |
| C2: generic icon and privacy strings | Original Y/three-answer icon for Mac and Windows; remove unused camera/microphone/audio descriptions before signing. Packaged verification checks Mac metadata and exact icon bytes. |

## Explicit limits

`EnableNodeCliInspectArguments` remains enabled because Playwright's packaged regression suite requires the main-process inspector. This release does not claim all fuses are hardened. Replacing that test mechanism and disabling the inspector is a separate hardening task. No reload/DevTools menu was added. [Electron's fuse documentation](https://www.electronjs.org/docs/latest/tutorial/fuses) explains these switches; disabling Node options also means custom `NODE_EXTRA_CA_CERTS` is not honored.

No paid provider calls, real credential changes, Apple notarization or Windows signing were performed. The report's install checklist is not a guarantee: OS warning choices and Keychain prompts vary; the portable Windows build is not a guaranteed workaround for Smart App Control. The user guide retains conditional, per-app guidance and never recommends disabling protections globally.

## Validation

- 68 unit tests pass, including bad-key variants, unrelated/malformed HTTP 400 bodies, bounded reads, cancellation of oversized bodies, split UTF-8, and existing billing behavior.
- The locally signed ARM64 Mac package passes the complete smoke, fault/crash, and performance suites. The three 24 KB streams completed in 62.4 s with UI p95 16 ms.
- Mac signature verification, actual fuse bits, absent unused privacy descriptions, and exact custom icon bytes pass.
- Final public-release verification will be recorded after publication.
