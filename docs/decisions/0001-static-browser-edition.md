# Decision 0001: Keep the public edition static and browser-first

- **Status:** Accepted for the current edition
- **Context:** The project needs a simple local and public deployment path without a paid AI inference API or an application database.

## Decision

Keep the current edition as static HTML, CSS, and JavaScript. Store planning state in browser local storage. Generate study plans deterministically. Make optional tutoring an explicit browser action that loads WebLLM and a small model on demand.

## Consequences

### Benefits

- No backend hosting or database is required.
- The planner works without downloading a model.
- The project can be deployed to a static host with minimal configuration.
- The data flow is relatively easy to inspect.

### Trade-offs

- State is tied to the current browser profile and does not sync across devices.
- Optional AI tutoring depends on WebGPU, browser compatibility, memory, and third-party downloads.
- A browser-only app cannot provide durable server-side reminders or centralized account management.
- Rule-based study guardrails are imperfect and cannot replace a full semantic classifier.

## Revisit this decision if

The project adds accounts, cross-device sync, server-side notifications, or a hosted model. Any such change should include a separate privacy, security, cost, and deployment review before implementation.
