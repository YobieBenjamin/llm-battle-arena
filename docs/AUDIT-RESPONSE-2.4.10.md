# v2.4.10 audit follow-up

## T1 and T2: code whitespace

The previous parser expanded tabs during list processing and compensated for indentation only on backtick fences. Answers now use markdown-it 15.0.3 with raw HTML disabled, followed by the existing DOMPurify allowlist and trusted code controls. The browser bundle is pinned and included in the public-release byte check.

Fixtures cover Makefile, Go, and Python tabs in numbered and bulleted steps; nested lists and blockquotes; and backtick/tilde fences indented one, two, and three spaces. Code trailing blank lines are preserved as well. The Electron corpus checks exact displayed text in all three cards at three window sizes and clicks every code-copy button against independently specified expected content. Copy answer and exports still use the original answer.

## M1: network errors

Fetch rejection and stream-read failure now use fixed, actionable messages without exposing transport exceptions. Empty non-SSE responses suggest checking connectivity and Wi-Fi sign-in. Preservation wording is appended only when actual answer text exists, including cancellation and timeout cases. Partial text and Retry remain available; network failures do not trigger automatic retry.

## M2: Claude refusal

A message delta with `stop_reason: refusal` now reports a declined request, keeps any received text and output usage, and cannot become Done. Tests cover refusals both before and after visible text. This follows [Anthropic’s streaming-refusal guidance](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/handle-streaming-refusals).

## Validation

- 104 unit tests passed locally.
- Electron smoke, fault-injection, performance, and expanded code-copy regressions passed locally.
- Three simultaneous synthetic 24KB answers completed in about 62 seconds; UI query latency was 17ms at the 95th percentile.
- No real API keys or paid provider calls were used. Refusal/network behavior uses deterministic fixtures.
- Release CI separately tests private regression builds, hardened installers, and public downloads. Its result is the authority for packaged-platform verification; local source tests alone do not establish installer success.
