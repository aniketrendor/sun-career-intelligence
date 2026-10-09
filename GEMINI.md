# Repository Guidelines & Rules

## 1. Automatic GitHub Commit & Push
- After completing any code changes, bug fixes, or new features in the repository, **ALWAYS** commit the changes with a clear, descriptive conventional commit message (e.g. `fix(...)`, `feat(...)`, `refactor(...)`).
- Immediately push the committed changes to `origin/main` using `git push origin main`.
- Before pushing, ensure the code builds cleanly (`npm run build` or typecheck) to avoid breaking deployments.

## 2. Automatic Vercel Deployment
- The repository (`aniketrendor/sun-career-intelligence`) is connected to Vercel at `sun-career-intelligence.vercel.app`.
- Pushing to `origin/main` automatically triggers a production deployment on Vercel.
- Always keep Vercel updated after every change by completing the commit and push workflow immediately.
