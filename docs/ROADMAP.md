# Project roadmap

This is a working list of gaps and possible next steps, not a delivery promise. Items should be prioritized based on real user feedback and test results.

## Current baseline

- [x] Static notebook-style interface.
- [x] Deterministic instant study planner with bounded daily time.
- [x] Page-two task list with completion and progress wiring.
- [x] Browser speech synthesis for reading tasks.
- [x] Optional WebGPU/WebLLM tutor with streaming fallback and GPU-loss handling.
- [x] Study-only prompt heuristics and planner subject validation.
- [x] Automated core tests, static checks, and GitHub Actions workflow.
- [x] Setup, architecture, privacy, security, deployment, and troubleshooting documentation.

## Quality improvements to consider

- [ ] Add browser-driven end-to-end tests for navigation, planner form submission, and task completion.
- [ ] Test and document behavior on a representative set of Windows, macOS, Android, and iOS browsers.
- [ ] Improve study-scope classification based on documented false positives and false negatives.
- [ ] Add accessibility checks for keyboard navigation, focus visibility, labels, and reduced motion.
- [ ] Add screenshot capture only after the screenshots match a verified current build.
- [ ] Split the largest UI script into modules when there is a tested migration plan.
- [ ] Review third-party runtime/model hosting and dependency pinning before a high-assurance public release.

## Explicitly out of scope for the current static edition

Cloud accounts, cross-device sync, browser-closed push notifications, a remote AI API, and a server-side database are not currently implemented. Adding any of them would require a separate architecture, privacy, security, and cost review.
