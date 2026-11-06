# Privacy overview

This page describes the intended data flow of the current static Study Buddy edition. It is not a jurisdiction-specific legal privacy policy.

## Data stored in the browser

- Planner state and task progress are saved in the current browser's local storage.
- The app has no cloud account service or central study-plan database in this edition.
- Local storage is not encrypted backup and may be removed when the user clears site data or changes browser/profile/device.

## What leaves the device

- The static hosting provider receives normal HTTP requests and may log metadata such as IP address, request path, and user agent.
- The optional tutor downloads the WebLLM runtime from `esm.run` and model assets from external hosts after the user chooses to load the tutor. Those hosts can observe ordinary network metadata.
- Tutor prompts are processed by the selected model in the browser in this edition; the project does not intentionally forward them to a paid remote inference API.
- External runtime/model distribution is not an offline-only workflow, and third-party terms and endpoints may change.

## What this edition does not provide

- No cloud sync, central account profile, or server-side study history.
- No browser-closed push notifications.
- No guarantee that third-party runtime/model hosts are available or that local inference works on every device.

## Responsible use

Do not enter sensitive personal information unless necessary. Before making the app available to a wider audience, review third-party service terms, age suitability, applicable privacy requirements, retention expectations, and the actual network requests made by the deployed build.
