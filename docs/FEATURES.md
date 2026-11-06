# Features and limitations

Use this page as the current behavior reference. It distinguishes implemented behavior from things that may look possible in the UI but are not part of this static edition.

## Planner and task tracking

### Included

- Add upcoming exams with a subject, date, and optional topics.
- Generate a deterministic plan without a model download or AI API.
- Set a daily study-time budget.
- Review tasks on notebook page 2 and mark sessions complete.
- Track completion through the existing progress view.
- Read today's tasks or all pending tasks aloud.
- Rebuild the plan after changing exams or time available.

### Boundaries

- Dates must be valid and upcoming.
- The daily study-time budget is limited to 0.5–10 hours.
- A plan covers up to 14 days at a time; it is a rolling window, not a semester planner.
- The generator uses supplied subjects, topics, confidence, exam urgency, and recency heuristics. It does not fetch a syllabus or infer your course outline.
- If no topics are supplied, the planner uses generic review/practice topics.
- Exam-day tasks are limited to short recall/review sessions.
- Planning data is saved only in the current browser.

## Voice

### Included

- Browser speech synthesis for reading scheduled tasks.
- Controls to speak today's pending tasks, read all pending tasks, or stop speech.
- Voice commands for supported navigation and task actions where browser speech recognition is available.

### Boundaries

- Available voices and pronunciation depend on the operating system/browser.
- Speech recognition may be unavailable or inaccurate; use typed controls if it is not available.
- Browser permission and microphone setup can affect recognition.

## Optional AI tutoring

### Included

- Problem Solver and Code & Concepts tutor entry points.
- Opt-in loading of WebLLM and a supported SmolLM2 model in the browser.
- Streaming responses where supported, with a non-streaming fallback when streaming fails before producing text.
- A recovery path for known GPU device-loss errors.

### Boundaries

- Requires WebGPU and a compatible browser/device.
- First load downloads a runtime and model assets from third-party hosts.
- The tutor is experimental and can be slow or inaccurate.
- The current adapter is text-focused; image solving and remote research modes are not supported.
- No paid inference API is configured by this project.

## Study-only guardrails

### Included

- A local check for common unrelated prompt patterns.
- Academic-subject checks for planner subjects.
- A consistent redirect for prompts classified as outside the app's study scope.
- Tutor instructions reinforcing study-only behavior.

### Boundaries

- The guard is based on text patterns and intent cues, not a trained semantic classifier.
- It may block an academic request or allow an unrelated one it does not recognize.
- Image-only uploads are not OCR-classified by the local guard.
- The prompt instructions are a second layer, not a guarantee that a model always follows them.

## Not included in this edition

- Cloud login or account recovery.
- Cross-device synchronization or a central study-plan database.
- Browser-closed push notifications or background reminders.
- Paid cloud AI inference, remote research, or guaranteed image-based solving.
- A guarantee that generated tutor responses are correct.
