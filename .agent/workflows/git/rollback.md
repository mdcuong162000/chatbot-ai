---
description: Rollback code to a previous commit — technical git revert only. Usually called from /xu-ly-su-co.
---

# ⏪ WORKFLOW: ROLLBACK

## Description
Rollback code to a specific commit when an incident is detected after pushing to Git.

**Input parameter:** `$ARGUMENTS` — Commit hash to rollback to (from `git log`)

> ⚠️ Only run after the Manager decides to rollback in **`/xu-ly-su-co`** Step 2.

---

## EXECUTION STEPS

### Step 1 — Display Information BEFORE Asking

// turbo
```bash
cd $PWD
echo "=== LATEST 5 COMMITS ==="
git log --oneline -5
echo ""
echo "=== CURRENT STATUS ==="
git branch --show-current
git status --short
```

Analyze risks and display:
```
--- ROLLBACK ANALYSIS ---
Current HEAD: [hash] — [message] — [date]

⚠️ IF ROLLBACK TO $ARGUMENTS:
LOSS: All changes AFTER commit $ARGUMENTS
KEEP: Code state at exactly $ARGUMENTS

Type of rollback:
A. Full (revert commits) — restore state to $ARGUMENTS
B. Specific files only — keep other files as is

→ Choose A or B? If B, which files?
--------------------------
```

⏸️ **STOP — Wait for PO/Manager response (A or B).**

---

### Step 2 — Final Confirmation

```
--- CONFIRM ROLLBACK ---
Type    : [A - Full / B - Specific files]
Target  : $ARGUMENTS
WILL BE LOST: [specific description of lost work]
THIS ACTION CANNOT BE UNDONE.

Are you sure you want to rollback? (yes/no)
--------------------------
```

⏸️ **STOP — Wait for "yes".**

---

### Step 3 — Perform technical rollback (ONLY after "yes")

**Option A (Full Revert):**
```bash
git revert HEAD...$ARGUMENTS --no-commit
echo "✅ Revert staged — not yet committed"
```

**Option B (File Checkout):**
```bash
git checkout $ARGUMENTS -- [file-path]
echo "✅ File(s) checked out to $ARGUMENTS"
```

---

### Step 4 — Post-rollback verification

// turbo
```bash
npm run build 2>&1 | tail -5
git log --oneline -3
```

Display result:
```
⏪ ROLLBACK COMPLETE
Target: $ARGUMENTS
Status: ✅ Stable build

📌 Manual command to finalize:
git commit -m "revert: rollback to $ARGUMENTS due to critical incident"
git push origin main
```

Return to **`/xu-ly-su-co`** to continue root cause analysis.
