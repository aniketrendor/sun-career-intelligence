# Automatic GitHub Commit & Vercel Deployment Rule

## Policy
1. **Auto-Commit**:
   - After completing any requested changes or modifications, stage and commit all modified/created files using conventional commit syntax (e.g. `feat: ...`, `fix: ...`).
2. **Auto-Push to GitHub**:
   - Push commits directly to `origin/main` (`git push origin main`).
3. **Auto-Update Vercel via Deploy Hook**:
   - Immediately trigger the production Deploy Hook after pushing:
     `powershell -Command "Invoke-RestMethod -Uri 'https://api.vercel.com/v1/integrations/deploy/prj_yi2ZODS9dre6QX2VrPmW7LGi2X2h/OeTQOZouKx' -Method Post"`
   - Never leave changes undeployed on Vercel.
