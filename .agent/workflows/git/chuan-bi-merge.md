---
description: Show changes, test results, and ask for confirmation to merge into main branch.
---

# 🔀 WORKFLOW: PREPARE MERGE

## Description
> Called from **`/tho-code`** after AI-CP3 PASS and **`/tu-tao-test`** PASS.

**INPUT:** Feature name ($ARGUMENTS)

---

## ❌ DO NOT
- Auto-merge without showing changed files
- Merge when tests are failing
- Push to remote (follow NO AUTO PUSH rule)

---

## EXECUTION STEPS

### Step 1 — Display report BEFORE asking

// turbo
```bash
cd $PWD

echo "=== CHANGED FILES ==="
git status --short

echo ""
echo "=== RECENT TEST RESULTS ==="
npm test -- --reporter=minimal 2>&1 | tail -5

echo ""
echo "=== TYPE & LINT CHECK ==="
npx tsc --noEmit && npm run lint
```

Display summary table:

```
--- PREPARE MERGE: $ARGUMENTS ---
Current branch: [branch name]
Files changed : [X]
Test result   : ✅ PASS
Build result  : ✅ PASS

⚠️ ACTION: Merge branch [name] into main.
Impact: New code will be integrated into the main branch.

Do you want to proceed with the merge?
→ "yes" : perform local merge
→ "no"  : keep separate branch, do not merge
----------------------------------
```

⏸️ **STOP — Wait for "yes" or "no".**

---

### Step 2 — Perform Merge (ONLY after "yes")

```bash
cd $PWD

# Switch to main and pull latest
git checkout main
git pull origin main

# Merge feature branch
git merge [feature-branch-name] --no-ff -m "merge: $ARGUMENTS"

echo "✅ Merged locally into main"
git log --oneline -3
```

**If there's a conflict:**
```
🔴 MERGE CONFLICT
Conflicting files: [list]

→ Report to Architect immediately: /tu-debug conflict
```

---

## 🤖 AI-CP-MERGE — SAFE MERGE VERIFICATION

```
□ Displayed change report to PO?
□ Waited for and received "yes" from PO?
□ Pulled latest main before merging?
□ Merge successful, no conflicts?
□ Ran npm run build again after merge?
```

**PASS Condition:** All 5 boxes ticked
**FAIL Condition:** Conflict or build failure after merge → call `/tu-debug`

```
DONE: AI-CP-MERGE [PASS/FAIL]
RESULT: Merged branch [name] into main
```

**NEXT:** `/kiem-tra` (Tester picks up work on main)
