---
description: Monitor the entire workload and consolidate confirmations from all roles before completing the task.
---

# 🎯 WORKFLOW: MONITORING & REPORTING

## Description
> 📍 **Step 7/8** in the pipeline: `/kiem-tra` → **`/giam-sat-va-bao-cao`** → [CP3] → `/hoan-thanh-va-up-git`

Ensures **all roles have passed (PASS)** before allowing code to be pushed.

**Input parameter:** `$ARGUMENTS` — Feature name to monitor

> 💡 **Parallel Optimization**: You can start consolidating reports for individual modules as soon as the Tester confirms PASS for them — no need to wait for the entire test suite.

---

## ❌ DO NOT
- Proceed to `/hoan-thanh-va-up-git` without "ok" from the Product Owner (PO).
- Confirm PASS if any role has not completed their checklist.
- Skip `.env` file checks before pushing.

---

## EXECUTION STEPS

### Step 1 — Verify all roles have reported PASS

Cross-check role checklists:
- **BA (Analysis)**: User Story & AC clear?
- **Designer (UI)**: Design approved?
- **Architect**: Architecture reviewed?
- **Developer**: Code complete & no hardcoding?
- **Tester**: Lint, TS, Test, Build all PASS?

### Step 2 — List changed files

// turbo
```bash
cd $PWD
echo "=== 📁 CHANGED FILES ==="
git status --short
echo ""
echo "=== 📊 CHANGE SUMMARY ==="
git diff --stat HEAD 2>/dev/null
echo ""
echo "=== 🌿 BRANCH & UNPUSHED COMMITS ==="
git branch --show-current
git log origin/main..HEAD --oneline 2>/dev/null
```

### Step 3 — Consolidate Lessons Learned

Record any technical issues, architectural decisions, or API quirks encountered during the task `$ARGUMENTS`.

### Step 4 — Display Summary Notification

```
╔══════════════════════════════════════════════════╗
║    🎯 MONITORING COMPLETE: $ARGUMENTS           ║
╠══════════════════════════════════════════════════╣
║  ✅ BA confirmed requirements & AC             ║
║  ✅ Designer: UI design approved               ║
║  ✅ Architect: architecture reviewed           ║
║  ✅ Developer: code complete, correct stack    ║
║  ✅ Tester: all test cases PASS                ║
╠══════════════════════════════════════════════════╣
║  🟢 PIPELINE OK — Ready to push to Git         ║
╚══════════════════════════════════════════════════╝
```

### Step 5 — 🔴 CHECKPOINT 3: Product Owner Review

> ⛔ **STOP** — Do not push to Git without "ok" from the Product Owner.

```
╔══════════════════════════════════════╗
║     PLEASE REVIEW THE RESULTS        ║
╠══════════════════════════════════════╣
║ All tests passed ✅                  ║
║                                      ║
║ Please run:                          ║
║   npm run dev                        ║
║                                      ║
║ Verify feature: $ARGUMENTS           ║
╠══════════════════════════════════════╣
║ Outcome:                             ║
║ → ok             : commit & complete ║
║ → need fix [desc]: back to Dev       ║
║ → restart/fail   : /xu-ly-su-co      ║
╚══════════════════════════════════════╝
```

---

## 📝 SUMMARY FOR SUPERVISOR

```
• Done: Monitoring & consolidation for $ARGUMENTS
• Result: PASS CP3 — PO reviewed and approved
• Note: [lessons learned or technical debt / "-"]
```
