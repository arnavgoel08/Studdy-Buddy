# Instant Planner behavior

The Instant Planner is a deterministic scheduling module. It does not call a language model, use a paid AI endpoint, or need the optional browser tutor to be loaded.

## Inputs

Each exam includes a subject and an ISO-style date (`YYYY-MM-DD`). Topics are optional; topic objects may also carry a confidence rating and a last-practiced timestamp. The UI collects the daily study-time budget.

The planner validates the date format and calendar date, ignores invalid or past exam entries, and returns a readable error if no valid upcoming exam remains. The UI separately validates academic-looking subject names using `study-guard.js`.

## Scheduling rules

- Daily study budget: 0.5–10 hours, converted to minutes.
- Planning horizon: one to fourteen days, depending on the nearest exam dates.
- Tasks per day: no more than four.
- Minimum scheduled task: 15 minutes.
- No-topic fallback: `Core concepts`, `Practice questions`, and `Revision and self-test`.
- Same-day exam: short recall and key-point review, not a new long learning block.
- Candidate ranking: combines self-rated confidence, time until exam, time since last assignment/practice, and how often a topic has already been scheduled.

The output contains a plan, summary stats, and warnings where relevant. The algorithm is intentionally explainable and bounded; it does not promise that every topic can be covered before an exam.

## Test coverage

`scripts/test-instant-planner.cjs` checks local plan generation, the daily budget, generic topic fallback, same-day exam behavior, invalid time budgets, and past/invalid dates. UI-oriented checks also verify that the current planner controls remain wired to the task page.

## When changing the algorithm

1. Add or update a focused test before changing scheduling behavior.
2. Keep generated tasks within the selected daily budget.
3. Handle same-day exams conservatively.
4. Return explicit validation errors rather than silently creating an empty plan.
5. Update this page and `CHANGELOG.md` if user-visible behavior changes.
