# Contributing to Study Buddy

Thanks for taking the time to report an issue or suggest an improvement. Clear reproduction steps are more useful than a large, unverified patch.

## Before opening an issue

1. Check the [README](README.md), [known limitations](docs/FEATURES.md), and [roadmap](docs/ROADMAP.md).
2. Include browser/version, OS/device, and exact steps to reproduce.
3. For AI issues, include the selected model and whether WebGPU is available.
4. For voice issues, note whether speech synthesis or speech recognition failed.
5. Remove API keys, passwords, tokens, private study notes, and other personal data from logs or screenshots.

## Before proposing code

Open an issue to discuss the scope first. The original Study Buddy source is all rights reserved and is not offered under an open-source license; do not assume that public visibility grants reuse or redistribution rights. Any external contribution must be original or properly licensed, and permission for use of submitted code must be agreed with the project owner before merging.

## Engineering expectations

- Keep the Instant Planner deterministic and independent of AI/network calls.
- Add a focused test when changing planner or guardrail behavior.
- Do not describe the study-only guard as perfect; document new known failure modes.
- Preserve a no-paid-inference-API path.
- Keep documentation links relative and update the relevant docs when behavior changes.
- Keep commits focused: one meaningful concern per commit, with a message that explains the change. Do not manufacture historical commits or hide unrelated changes behind generic messages.
- Run `npm test` before requesting review.

## Pull requests

A pull request should explain the user-visible change, why it is needed, how it was tested, and any limitations that remain. Small, focused changes are easier to review and revert.
