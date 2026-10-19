# Follow-up to the independent v2.4.3 verification

Reviewed the supplied `llm-battle-arena-v2.4.3-verification.zip`, including its report, result files and the harness assertions behind conflicting results. The verifier independently reproduced all ten original fixes, checked the published release, and found the four low-priority observations below. No supplied harness was executed automatically.

| Observation | Disposition |
| --- | --- |
| O1: Windows source copies use CRLF | Added `.gitattributes` with `* text=auto eol=lf`, so Windows checkouts use LF for text before packaging. Binary assets remain binary. Public Windows installer verification still checks hashes; it does not unpack Windows payloads. |
| O2: stale vote accessible names after reveal | Blind buttons retain Answer-letter action labels. Revealed buttons announce the provider and their actual status, such as “Claude: Winner” or “Gemini: Not selected.” UI regression checks all three revealed labels. |
| O3: provider checks run before encryption availability | Save checks the complete submission for new secrets and refuses before any provider request when secure OS storage is unavailable, including the insecure Linux `basic_text` backend. Tests cover first/later direct-provider fields and OpenRouter, zero network calls and unchanged stored settings. The store still checks encryption when writing, in case availability changes during validation. |
| O4: unchanged saved keys are not revalidated | Retained intentionally. The guide explains that successful Save does not certify unchanged keys; use “Check key & load models” explicitly, or handle revocation on the next comparison. This avoids unrelated provider outages blocking changes. |

## Reading the evidence

Some raw result files preserve older assertions or intermediate attempts; they should not be counted as additional confirmed application defects without examining their fixtures. `check-e6` supersedes the older dialog-close observation, and `repro-vote-between2` isolates and passes the split-write vote case. The old vote test expects buttons to disappear; the app deliberately retains disabled buttons to prevent a double-click from hitting a shifted Copy control. Their stale accessible names are addressed above.

The artifact cap fixture marked Y1 as failed because it expected no Python artifact. Its mismatched `~~~` does not close the Python block, but a later bare triple-backtick fence does. That is a valid closing fence, so the observed Python artifact is consistent with the parser. The cap remained 12. The focused Y3/Y4 tests pass exact-byte saving and cancellation, superseding the earlier B5 attempt. No additional parser change is warranted by those results.

## Limits unchanged

The report did not verify real Safari first launch, Windows installation/upgrade/uninstall and security prompts, real Keychain/DPAPI denial, paid provider calls, or the earlier unpublished local `/private/tmp` fallback startup timeout. Fixture checks and bundle verification do not establish those outcomes. Signing and notarization remain outside the requested scope.


## Validation and publication status

The 62 unit tests, source UI smoke suite, updated fault-injection suite and three-stream performance test passed locally. The streaming test completed in 62.375 seconds against 62.213 seconds of streaming, with UI p95 17 ms. A checkout with `core.autocrlf=true` retained LF in all 15 checked app-source files.

The [v2.4.4 release workflow](https://github.com/YobieBenjamin/llm-battle-arena/actions/runs/39319614074) has passed Windows builds and Linux UI regressions; Mac runner allocation was still pending when this note was written. The local packaged Mac attempt reproduced the earlier startup timeout and is not counted as a pass. Its HTML and bridge load, but answer cards do not initialize. Removing the extra session request hook in a disposable diagnostic process did not resolve the timeout. No changes were made to the user's older running app windows.

Publication remains behind the release gates. A follow-up workflow archives older installers only after the tagged release workflow succeeds, preserving the owner's current-release-only policy. The beginner guides use the latest-release link, so they do not promise an unpublished installer.
