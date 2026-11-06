# Start here

This is the static Study Buddy edition. The Instant Planner creates schedules without AI; optional AI tutoring is separate and experimental.

## Run on Windows

1. Extract the project into a new folder.
2. Open that folder in File Explorer, click the address bar, type `cmd`, and press Enter.
3. Run:

   ```cmd
   npm run preview
   ```

4. Open `http://localhost:3000` in Chrome or Edge.
5. Open **Instant Planner**, add an upcoming subject and exam date, set your daily study hours, and generate a plan.
6. Open notebook page 2 to mark tasks complete or try **Speak today's tasks**.

To run the automated checks, open a second terminal in the same folder and run `npm test`. Node.js and Python 3 are required for the full check suite; no `npm install` is needed.

## What needs extra setup?

Problem Solver and Code & Concepts can use an optional local browser model. Choose **Load AI tutor** and allow the first download to complete. This needs a supported WebGPU browser/device and internet access. The planner does not need AI.

## Read next

- [README](README.md) — overview and quick start
- [Planner behavior](docs/PLANNER.md) — how schedules are created
- [Testing](docs/TESTING.md) — automated and manual checks
- [Deployment](docs/DEPLOYMENT.md) — GitHub and Vercel setup
- [AI troubleshooting](AI_TROUBLESHOOTING.md) — model loading and GPU failures
