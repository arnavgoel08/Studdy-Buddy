# Testing and release checklist

Automated checks are dependency-light and run in GitHub Actions. They cover core logic and static wiring; they do not simulate every browser, GPU, microphone, or speech voice.

## Requirements

- Node.js 22 or a compatible recent Node version.
- Python 3 for structural and documentation-link checks.
- No `npm install` is needed for the current test suite.

## Commands

Run all checks:

```bash
npm test
```

Run one focused suite:

```bash
node scripts/test-instant-planner.cjs
node scripts/test-browser-ai.cjs
node scripts/test-study-guard.cjs
python scripts/validate.py
python scripts/check-doc-links.py
```

## Automated coverage

| Check | What it verifies | What it does not verify |
| --- | --- | --- |
| Instant Planner tests | Scheduling output, budgets, generic topics, exam-day behavior, and invalid input. | Whether the schedule is ideal for a particular student's syllabus. |
| Browser AI tests | Streaming fallback and handling of simulated GPU-device loss. | Actual WebGPU model downloads or generated-answer quality on a real GPU. |
| Study guard tests | Common academic/off-topic/mixed prompt cases and planner subject checks. | Every possible wording, language, image, or adversarial prompt. |
| Structural validator | Required assets, Vercel JSON, expected UI wiring, and common secret patterns. | A full security audit or browser rendering. |
| Documentation link check | Relative Markdown links point to existing files/directories. | External link availability or heading-anchor correctness. |
| GitHub Actions | Runs `npm test` on pushes and pull requests. | Tests requiring a real browser, microphone, GPU, or external model host. |

## Manual browser checklist

Before publishing a change, test these in a real browser:

- [ ] Homepage loads without a fatal console error.
- [ ] Navigation between notebook pages works at desktop and mobile widths.
- [ ] A valid upcoming exam can be added and an instant plan appears.
- [ ] Invalid dates, past dates, and out-of-range daily hours show useful feedback.
- [ ] The page-two task list matches the current plan.
- [ ] Completing a task updates the progress view and survives a refresh in the same browser.
- [ ] Speak today's tasks, read all pending tasks, and stop voice behave as expected where speech synthesis exists.
- [ ] Voice command controls give a clear fallback when speech recognition is unsupported or denied.
- [ ] Common off-topic prompts redirect consistently in both tutor pages.
- [ ] Academic prompts still reach the tutor when the optional model is loaded.
- [ ] The model loader handles unsupported WebGPU, a failed download, and GPU device loss without an endless retry loop.
- [ ] A Vercel HTTPS deployment loads static assets and the planner without build-time environment variables.

Record browser, OS, and model information for bugs. Remove tokens, personal notes, and private prompts from logs or screenshots.

## Interpreting test output

The browser AI tests deliberately simulate failure cases. Console messages about mocked streaming failure or a mocked GPU device-loss exception can appear while the test still passes. Judge the result by the explicit `PASS`/exit status, not by the presence of a simulated error log alone.
