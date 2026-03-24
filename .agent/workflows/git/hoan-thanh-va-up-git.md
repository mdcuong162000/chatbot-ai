---
description: Complete task, summarize, and prepare for Git commit.
---

# 🎉 WORKFLOW: TASK COMPLETION

## Description
> 📍 **Step 8/8** in the pipeline: `/giam-sat-va-bao-cao` → **`/hoan-thanh-va-up-git`**

Official task closing workflow. AI summarizes progress and updates knowledge base. **User manually executes Git commands when ready.**

**Input parameter:** `$ARGUMENTS` — Completed feature name

> ⚠️ Only run after `/giam-sat-va-bao-cao` reports ✅ all roles PASS and PO approved at CP3.

---

## ❌ DO NOT
- **Execute any Git commands automatically** — under any circumstances.
- Finish task before AI-CP-WEBHOOK is fully ticked (5/5).

---

## EXECUTION STEPS

### Step 1 — Final Summary Report

// turbo
```bash
cd $PWD
echo "=== FILES TO BE COMMITTED ==="
git status --short
echo ""
echo "=== CHANGE STATISTICS ==="
git diff --stat HEAD 2>/dev/null
```

Display summary table to PO:

```
╔══════════════════════════════════════════════════╗
║         TASK COMPLETION REPORT                  ║
╠══════════════════════════════════════════════════╣
║ Feature: $ARGUMENTS                             ║
╠══════════════════════════════════════════════════╣
║ ROLE SUMMARIES:                                 ║
║ ✅ BA / ✅ Designer / ✅ Architect               ║
║ ✅ Developer / ✅ Tester                         ║
╠══════════════════════════════════════════════════╣
║ PROPOSED COMMIT MESSAGE:                         ║
║ "feat: $ARGUMENTS"                              ║
╚══════════════════════════════════════════════════╝
```

### Step 2 — Update Knowledge Base (KAIZEN)

Analyze and record lessons, decisions, and API contracts.

// turbo
```bash
cd $PWD
# Update .agent/knowledge/lessons-learned.md
# Update .agent/knowledge/decisions.md
# Update .agent/knowledge/api-contracts.md
```

---

## 🤖 AI-CP-WEBHOOK — SYSTEM UPDATE CONFIRMATION

> ⛔ Mandatory checklist before task exit. See [Git Rules](file:///.agent/rules/process/git-rules.md) for commit standards.

```
□ lessons-learned.md updated?
□ decisions.md updated (if applicable)?
□ api-contracts.md updated (if new API)?
□ checklist.md updated with new lessons?
□ Project is clean (no console.log, no temp files)?
□ Prepared Semantic Commit message?
```

**Final Instructions:**
```
📌 You can review the code and make final adjustments.
📌 When ready, follow this manual procedure:
   1. npm run lint && npx tsc --noEmit
   2. git add -A
   3. git commit -m "feat: $ARGUMENTS"
   4. git push origin main
```

**NEXT:** `/luu-tri-nho $ARGUMENTS` (to save final snapshot)
