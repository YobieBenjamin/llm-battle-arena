> Historical evidence for **OLD (DO NOT USE)** code. See [the current audit response](AUDIT-RESPONSE-2.4.6.md).

# v2.4.5 — archive and Mac validation follow-up

## Changes

GitHub reported that both v2.4.4 Mac jobs could not acquire hosted runners, with explicit ARM capacity notices. The workflow now pins ARM to `macos-15`, Intel to `macos-15-intel`, tests both packages natively, and runs public verification on Intel. The first complete workflow with these labels passed on both Macs and Windows: [39322801934](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39322801934).

Local packaged startup was investigated using isolated profiles, without real keys or provider calls. Clean rebuilds, unpacking ASAR, and disabling hardened runtime in disposable copies did not reliably fix the timeout. Historical processes were inspected; only default/sample content was present, so they were closed before their files were archived. Timer-based readiness polling then detected initialized cards immediately. Tests now poll every 100 ms instead of depending on animation frames in an obscured Mac window. Production signing, sandboxing, app identity and ASAR remain unchanged. A preflight refuses concurrent packaged tests with a clear save-and-quit instruction.

## Validation

- 63/63 unit tests pass, including process-preflight matching.
- Fresh local v2.4.5 signed package passes the full UI, fault/crash, and streaming suite; three 24 KB answers completed in 62.3 s, UI p95 17 ms.
- `codesign --verify --deep --strict` passes on the local v2.4.5 package.
- [Tagged release workflow 39323605482](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39323605482) passed: all four installers, Linux UI, both native packaged Mac suites, and public download verification (all six checksums, both Mac signatures, and bundled code matching tag `96362c8`).
- [Archive workflow 39324585441](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39324585441) passed. v2.4.5 is the only public release; all 11 historical release records are private drafts titled OLD (DO NOT USE).
- No real API calls, credentials, Safari quarantine/first-install flow, or Windows interactive install were tested locally.

## Historical material

Historical GitHub installer releases are private drafts marked **OLD (DO NOT USE)**. Source tags remain intact for reproducibility and are labeled historical in `archive/README.md`. They are not supported installation choices. Local old source snapshots, installers and test bundles are preserved in `Documents/LLM Battle Arena - OLD (DO NOT USE)`; the active build is in `dist/v2.4.5`. Audit attachments remain unchanged as evidence. The previous v2.4.3 public installer was retired after v2.4.5 public downloads passed verification.
