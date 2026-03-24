---
description: DevOps role — package, run CI, and deploy project to Server/Vercel.
---

# 🚀 WORKFLOW: PACKAGING & DEPLOYMENT (DEPLOY CI/CD)

## Description
> 📍 **Step 9/9** in the pipeline: Occurs after `/hoan-thanh-va-up-git` (if live app requested).

Prepares production build, sets up environment, runs final smoke tests, and executes deploy commands.

**Input parameter:** `$ARGUMENTS` (`preview` or `production`). Defaults to `preview`.

> ⛔ Ensure everything is PUSHED using `/pushgit` before running this. App must pass 100% of tests.

---

## EXECUTION STEPS

### Step 1 — Local System Health Check

// turbo
```bash
cd $PWD
echo "=== STEP 1: LINTING & TYPE CHECK ==="
npm run lint 2>&1 | tail -5
npx tsc --noEmit 2>&1 | tail -5

echo "=== STEP 2: TEST PRODUCTION BUILD ==="
npm run build 2>&1 | tail -10
```

If Step 1 **FAILS**:
- 🔴 `STOP DEPLOY!`
- Return to `/tu-debug`. **Do not proceed**.

---

### Step 2 — Deployment Report (PRE-REPORT)

Display this notification to the Product Owner:

```
╔════════════════════════════════════════════╗
║        🚀 PREPARING CLOUD DEPLOY           ║
╠════════════════════════════════════════════╣
║ Environment: ${ARGUMENTS:-preview}         ║
║ Lint & Type: ✅ OK                         ║
║ Build Prod : ✅ OK                         ║
╠════════════════════════════════════════════╣
║ Server platform (Vercel/AWS) must be       ║
║ connected. Ensure all production ENV (.env)║
║ are configured in the dashboard.           ║
╚════════════════════════════════════════════╝

Do you want to run PUSH TO DEPLOY command?
→ "yes" : execute
→ "no"  : output build files only, for local viewing
----------------------------------------------
```

⏸️ **STOP — Wait for "yes".**

---

### Step 3 — Execute Deploy (ONLY IF "yes")

```bash
cd $PWD
npx vercel --prod
```

**Report Deployment Result:**
Extract the live URL:
```
✅ APPLICATION IS LIVE!
Production URL: [Vercel URL]
```

---

## 🤖 AI-CP-DEPLOY — DEVOPS SAFETY CONFIRMATION

```
□ Health Check (TypeScript, Linting, Build) passed 100%?
□ Prod environment variables documented in .env.example without leaking real tokens?
□ Received explicit "yes" from PO before Deploying live?
```

**NEXT:** 
Project complete. Open Champagne! 🍾
