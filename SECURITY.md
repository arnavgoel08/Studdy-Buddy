# Security policy

The static Browser AI Edition is experimental and has not undergone a formal security audit.

## Reporting a vulnerability

If GitHub Private Vulnerability Reporting is enabled for the repository, use **Security → Report a vulnerability**. Otherwise, open a low-detail issue asking the maintainer for a private contact method. Do not publish exploit steps, credentials, personal information, or private study data in a public issue.

## Practical precautions

- Never commit `.env` files, passwords, API keys, tokens, private study notes, or account data.
- Use the official HTTPS deployment or localhost when testing WebGPU features.
- Optional AI loading imports WebLLM from an external ESM CDN and downloads model assets from third-party hosts. Those services have their own security and update practices.
- The study-only guard is a scope heuristic, not a security boundary or a substitute for moderation.
- AI-generated educational answers can be wrong; verify important claims with course material or a trusted source.
- Before a high-assurance launch, review dependencies, CDN pinning, response headers, and supply-chain controls.

See [Privacy](PRIVACY.md) and [Architecture](docs/ARCHITECTURE.md).
