# Troubleshooting optional browser AI

The Instant Planner does not depend on AI. This guide applies only to Problem Solver and Code & Concepts.

## Before loading a model

- Use a current desktop Chrome or Edge browser.
- Open the site over `https://` or `http://localhost`; direct `file://` use is not recommended.
- Confirm that the browser/device supports WebGPU.
- Make sure enough storage and GPU memory are available.
- Expect a substantial first download. The lightweight SmolLM2 360M option is selected by default.

## Model does not load

1. Check the status text near **Load AI tutor**.
2. Confirm the device has a compatible WebGPU adapter and updated graphics drivers.
3. Check network access to `esm.run` and the model asset host shown in the browser Network panel.
4. Try the lightweight model before the larger 1.7B option.
5. If a GPU device-loss error appears, close **all** Chrome windows and restart the browser before trying again. Do not repeatedly retry inside a broken GPU session.

## Streaming failure

The adapter attempts a normal, non-streaming completion only if streaming fails before any answer text has been emitted. It does not restart a partially delivered answer, because doing so could duplicate or contradict output.

## Known GPU issue

This edition pins WebLLM to `0.2.82` based on a reported issue where a later runtime reproduced GPU-device errors on one system: [WebLLM issue #844](https://github.com/mlc-ai/web-llm/issues/844). This is a compatibility workaround, not proof that the pinned version works on every device.

## Still stuck?

When reporting an issue, include browser/OS, the selected model, whether WebGPU is available, and the exact error text. Do not include passwords, tokens, or private study prompts. See [Security](SECURITY.md) before sharing diagnostic information publicly.
