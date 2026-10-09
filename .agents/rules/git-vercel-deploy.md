# Automatic GitHub Commit & Vercel Deployment Rule

## Policy
1. **Auto-Commit**:
   - After completing any requested changes or modifications, stage and commit all modified/created files using conventional commit syntax (e.g. `feat: ...`, `fix: ...`).
2. **Auto-Push to GitHub**:
   - Push commits directly to `origin/main` (`git push origin main`).
3. **Auto-Update Vercel**:
   - Pushes to `main` automatically deploy to the live production site at `https://sun-career-intelligence.vercel.app`.
   - Never leave changes only locally in the working directory; always push to keep Vercel in sync after every task.
