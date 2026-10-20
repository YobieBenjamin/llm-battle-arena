# Release verification

Published builds set `enableNodeCliInspectArguments: false` before code signing and installer creation. Deep regression tests still need Electron's main-process inspector, so CI builds a separate, temporary application with that one fuse enabled. It is never included in uploaded artifacts or GitHub releases.

## Required gates

1. Install the locked dependencies and run unit tests.
2. Build the private application, verify its expected fuse settings, then run `npm run test:ui`. These tests inject failures and exercise hostile previews, persistence, exports, and performance.
3. Build the hardened application and installers. Verify fuse bits in the actual binary; on Mac verify the sealed signature. Compare the complete `app.asar` SHA-256 with the private build. Any application-code difference fails the job.
4. Launch the hardened executable with a temporary profile. Use visible controls for Sample comparison, history, Markdown and JSON export through real native Save dialogs, and quit. Restart, reopen history, and quit again.
5. During those launches try `--inspect` and `--inspect-brk` on reserved loopback ports. The UI must initialize and the Node inspector endpoint must remain closed. Verify the executable and application archive were unchanged by testing.
6. Unpack each installer (read-only mount for DMG), compare its executable and application archive with the tested build, and repeat the hardened UI test.
7. Upload only hardened installers and verification reports. After publication download them, check checksums, compare every public installer and proof byte-for-byte against the original immutable CI build artifact, and repeat the payload/fuse/UI checks on native runners for each architecture. Both Mac bundles also undergo source-versus-tag checks; dependency byte comparisons specifically cover the shipped markdown-it and DOMPurify renderer modules, not every file in node_modules.

The UI driver uses a temporary loopback **Chromium renderer CDP** connection to operate visible controls. It never uses Playwright's Electron launcher, main-process evaluation, direct IPC calls, or substituted file dialogs. The disabled fuse controls the **Node main-process inspector**; this does not claim that Chromium's explicit remote-debugging switches are disabled. Normal app launch supplies neither debugging switch. Test launches also disable Chromium background throttling so an occluded CI window continues to render; this is a launch-only scheduling setting, not a change to the shipped application or its security controls.

Reports (`proof-PLATFORM-ARCH.json`) identify the tested executable and application archive. Checksums detect changed downloads; they are not an independent signature or protection against compromise of the publishing account.

## Reproduce on a Mac

From the repository folder after `npm ci`:

```sh
npm test
npm exec electron-builder -- --mac --arm64 --dir --publish never -c.directories.output=dist/private -c.electronFuses.enableNodeCliInspectArguments=true
ARENA_ELECTRON_PATH="$PWD/dist/private/mac-arm64/LLM Battle Arena.app/Contents/MacOS/LLM Battle Arena" npm run test:ui
npm exec electron-builder -- --mac --arm64 --publish never -c.directories.output=dist/release
node scripts/compare-builds.cjs 'dist/private/mac-arm64/LLM Battle Arena.app' 'dist/release/mac-arm64/LLM Battle Arena.app'
ARENA_MANUAL_NATIVE=1 ARENA_RELEASE_REPORT=dist/release/proof-mac-arm64.json node scripts/release-smoke.cjs 'dist/release/mac-arm64/LLM Battle Arena.app'
```

When the last command prints `NATIVE save`, save in the temporary path it prints. When it prints `NATIVE quit`, use the app's Quit menu. Repeat for JSON and the second launch. These steps use a disposable profile and human-written Sample answers; they require no API keys. CI operates those same native controls using OS accessibility automation. Local automation does not change Accessibility permissions or other security settings.

Use `--x64` and `mac` instead of `--arm64` and `mac-arm64` on Intel Macs. Windows CI runs natively on x64 and ARM64. The installer tests exercise the recovered application payload, not every interactive installer/SmartScreen/Gatekeeper prompt. Real browser download and first-launch checks remain a useful human check. Mac builds are ad-hoc signed, not notarized; no paid signing service has been added.

Do not share `dist/private`. Remove that temporary build after testing, or archive it clearly as `OLD (DO NOT USE) — private test build` outside download/install locations.

On hosted Mac runners the Sample-only UI test uses Chromium’s `--use-mock-keychain` launch switch, as Playwright’s private Electron driver already does. This avoids a hosted runner Keychain prompt blocking the main loop. No real credentials are saved or used. Reports identify this backend explicitly; these CI checks do not validate real Keychain integration. Local manual-native tests omit the switch and exercise normal OS startup. The signed binary, ASAR and fuse bits are identical in both cases.

An explicit `--remote-debugging-port` launch can give a local caller control of the renderer, including its `window.arena` bridge. The Node inspector fuse does not prevent this Chromium feature. Tests use it only with disposable profiles; do not enable remote debugging on a profile containing real keys or private history. Normal launches do not open this endpoint.
