# Repository Guidelines & Rules

## 1. Automatic GitHub Commit & Push
- After completing any code changes, bug fixes, or new features in the repository, **ALWAYS** commit the changes with a clear, descriptive conventional commit message (e.g. `fix(...)`, `feat(...)`, `refactor(...)`).
- Immediately push the committed changes to `origin/main` using `git push origin main`.
- Before pushing, ensure the code builds cleanly (`npm run build` or typecheck) to avoid breaking deployments.

## 2. Automatic Vercel Deployment
- The repository (`aniketrendor/sun-career-intelligence`) is connected to Vercel at `sun-career-intelligence.vercel.app`.
- After every git push to `origin/main`, **ALWAYS** trigger the Vercel Deploy Hook to guarantee instant production deployment:
  ```powershell
  Invoke-RestMethod -Uri 'https://api.vercel.com/v1/integrations/deploy/prj_yi2ZODS9dre6QX2VrPmW7LGi2X2h/OeTQOZouKx' -Method Post
  ```
- Always verify that the deployment completes cleanly.
