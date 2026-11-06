# Changelog

Notable user-visible changes are listed here. Dates refer to the project snapshots used for this static edition.

## 0.4.0 — Study-only guardrails (2026-10-29)

- Added a local study-scope check before tutor prompts are sent to the optional browser model.
- Added consistent redirect text for common unrelated requests and instructions for mixed requests.
- Validated planner subjects when adding exams and again before rebuilding from saved state.
- Added focused guardrail tests for academic, off-topic, mixed, and planner-subject cases.

## 0.3.0 — Instant Planner voice page (2026-10-29)

- Replaced the page-two Buddy chat with a task view for the current plan.
- Added controls to speak today's tasks, read all pending tasks, and stop speech.
- Kept page-two checkboxes connected to the same task state and progress view.
- Removed the AI plan-generation path; the planner uses the deterministic scheduling module.

## 0.2.0 — Instant Planner (2026-10-29)

- Added a deterministic scheduling engine with a bounded horizon and daily study-time budget.
- Added generic review tasks when no topics are supplied.
- Added validation for daily hours, dates, and missing upcoming exams.
- Added automated planner tests and connected them to the main test command.

## 0.1.1 — Browser AI stability update (2026-10-27)

- Pinned the optional WebLLM runtime to `0.2.82` following a reported GPU regression on one setup.
- Selected SmolLM2 360M as the default lightweight model.
- Added handling for streaming fallback and GPU-device loss.

## Earlier static edition

- Added the notebook-style interface, local browser state, optional WebGPU tutoring, bundled KaTeX assets, and Vercel static configuration.
- Added basic setup, privacy, security, third-party license, and troubleshooting notes.

## 0.4.1 — Documentation and verification (2026-10-29)

- Reworked the README into a guided overview with an accurate feature/limitation matrix and setup instructions.
- Added architecture, planner, guardrail, testing, deployment, roadmap, and decision-record documentation.
- Added a local Markdown-link check to the test command.
- Clarified that automated checks do not replace real-browser testing and that study-only filtering is heuristic.
