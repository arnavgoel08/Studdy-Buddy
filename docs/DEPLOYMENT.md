# Deployment

Study Buddy is a static website. It does not need a backend, a server-side build, or environment variables for the current feature set.

## Prepare a GitHub repository

1. Create a new repository named `study-buddy` (or another name you prefer).
2. Choose public visibility only if you are comfortable making the code visible. Public visibility does not grant others a license to reuse the original source; see [Copyright](../COPYRIGHT.md).
3. Push the contents of this project folder to the repository root. The root should contain `index.html`, `package.json`, and `vercel.json`.
4. Keep `.gitignore`, `.github/`, `vendor/`, and `docs/` in the repository. Do not upload the ZIP as one file.
5. Do not commit `.env` files, API keys, passwords, tokens, or private study records.

### Preserve the prepared commit history

If you received the repository as a Git bundle, clone the bundle rather than uploading the source ZIP. This preserves the separate feature and documentation commits:

```bash
git clone /path/to/study-buddy-repository.bundle study-buddy
cd study-buddy
git remote add origin https://github.com/YOUR_USERNAME/study-buddy.git
git push -u origin main
```

Create an **empty** GitHub repository first (do not initialize it with a README, license, or `.gitignore`), and replace `YOUR_USERNAME` with your GitHub username. On Windows, quote the bundle path if it contains spaces. A source ZIP is useful for reviewing or uploading files, but uploading a ZIP through the GitHub website does not preserve its commit history.

## Deploy on Vercel

1. Sign in to Vercel and choose **Add New Project**.
2. Import the new GitHub repository.
3. Use **Other** as the framework preset.
4. Keep the root directory at `./`.
5. Leave the build command empty; do not add a build output directory or environment variables for this static edition.
6. Deploy and wait for Vercel to show a completed deployment.
7. Open the generated HTTPS URL and run the [manual browser checklist](TESTING.md#manual-browser-checklist).

The `vercel.json` file defines baseline response headers. Review them if the app later adds APIs, external embeds, microphone permissions, or other capabilities.

## Local preview

```bash
npm run preview
```

Then open `http://localhost:3000`. The preview server is for local development and is not intended as a production backend.

## Updating a deployment

Push changes to the branch connected to Vercel. After the deployment finishes, test the actual deployed URL rather than assuming a successful build proves the browser UI works.

## Rollback

Use Vercel's deployment history to promote a previously successful deployment if a release introduces a production issue. Keep the matching Git commit recorded so the code and deployment can be compared.

## Before sharing the public URL

- [ ] `npm test` passes.
- [ ] The site has been manually checked in desktop Chrome/Edge.
- [ ] The layout and navigation have been checked at a narrow mobile width.
- [ ] Planner persistence and voice fallback behavior have been checked.
- [ ] The optional tutor's experimental status and network downloads are documented.
- [ ] No secrets, private data, or stale screenshots are included.
- [ ] The rights and third-party license notes are accurate.
