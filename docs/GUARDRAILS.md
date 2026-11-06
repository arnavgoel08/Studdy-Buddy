# Study-only guardrails

Study Buddy is intended to support learning. The current implementation uses local heuristics and model instructions to discourage unrelated use, while keeping the behavior simple enough to inspect and test.

## Request path

1. A user enters a prompt in Problem Solver or Code & Concepts.
2. The UI calls `SBStudyGuard.isStudyRequest(...)` before invoking the optional tutor adapter.
3. If the prompt is classified as outside study scope, the UI displays the shared redirect instead of sending that prompt for model inference.
4. Accepted prompts are passed to the local browser model with tutor instructions that reinforce academic scope.

Planner subjects use `SBStudyGuard.isAcademicSubject(...)` before being added. The app also checks saved exams before rebuilding a plan, so a previously saved non-academic subject cannot silently bypass the current planner check.

## What the local rules look for

The guard combines patterns for common school/college subjects, academic task language (such as explaining, solving, debugging, or making revision notes), and common off-topic requests (such as generic entertainment, relationship, shopping, travel, and workout prompts). It normalizes case and whitespace before checking.

This is a deliberately small rule-based layer. It does not perform a full language understanding pass, and it does not call an external moderation service.

## Known failure modes

- **False positive:** a legitimate learning request may be rejected if it uses unusual wording or omits the subject/context.
- **False negative:** an unrelated request may be accepted if it does not match known off-topic patterns or contains enough academic framing.
- **Mixed requests:** the model is instructed to answer only the academic portion, but this is not guaranteed by the rule-based filter alone.
- ****Image-only input:** the local guard cannot inspect image contents or run OCR. The current browser AI adapter does not support image-based solving and rejects image options. Do not treat the guard as image moderation.
- **Model compliance:** accepted prompts still depend on the model following its instructions.

## Maintenance rules

- Add tests for both the expected allow and expected reject path when adding a pattern.
- Include an example where an academic keyword appears inside an unrelated request, so keyword presence alone does not decide the outcome.
- Keep the redirect consistent across tutor entry points.
- Do not describe the guard as a perfect filter, security control, or guarantee.
- If stronger semantic enforcement becomes necessary, evaluate a separate moderation/classification layer with explicit latency, privacy, and cost trade-offs.

## Test file

Run `node scripts/test-study-guard.cjs` for focused tests covering academic prompts, off-topic prompts, mixed requests, planner subject validation, image handling, and wiring across the tutor pages and planner form.
