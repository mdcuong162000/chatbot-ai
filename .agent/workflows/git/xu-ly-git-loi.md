---
description: Git Error Resolution — Handling push failures, SSH, conflicts, and permissions.
---

# 🔧 WORKFLOW: GIT ERROR RESOLUTION

## Description
> **Emergency Tool**: Manually triggered when Git errors occur. This is NOT an automated step in the standard pipeline.

**Call**: `/xu-ly-git-loi [error description]`
**Input**: `$ARGUMENTS` — Specific git error message (copy-paste)

> ⛔ DO NOT retry more than once without reporting to the Lead. AI **NEVER** performs an automated `git push`.
> ✅ **PATTERN: Diagnosis → Proposed Solution → Confirmation → Execution.**

---

## WHEN TO CALL THIS WORKFLOW?
- `git push` returns any error.
- `Permission denied (publickey)`.
- `Updates were rejected`.
- `Authentication failed`.
- General Git confusion.

---

## STEP 1 — Diagnosis and Classification

// turbo
```bash
cd $PWD
echo "=== GIT STATUS ==="
git remote -v
git branch --show-current
git status --short
echo ""
echo "=== ATTEMPT PUSH TO CAPTURE ERROR ==="
git push origin main 2>&1 | head -10
```

Based on the output, classify and proceed:

---

## ERROR CLASSIFICATION & SOLUTIONS

### 🔴 SSH Key Error
**Symptoms:** `Permission denied (publickey)` or `git@github.com: Permission denied`

Follow instructions to:
1. Generate new SSH key (if missing).
2. Add to SSH agent.
3. Provide public key for the user to add to GitHub Settings.
4. Test connection.

### 🟠 Push Rejected — Non-fast-forward
**Symptoms:** `rejected - non-fast-forward` or `Updates were rejected`

**Proposed Solution:** `git pull --rebase` then retry push.
> ⚠️ Risk: May require manual conflict resolution.

### 🟠 Authentication Error — HTTPS
**Symptoms:** `Authentication failed` or `remote: Repository not found`

**Proposed Solution:** Switch remote URL from HTTPS to SSH.

### 🟡 Nothing to commit
**Symptoms:** `nothing to commit, working tree clean`
**Resolution:** Code is already committed; simply proceed to push.

### 🔴 Unknown Error
If the error is unrecognized:
- **STOP** immediately.
- Report full log to the Manager.
- Do not attempt further fixes.

---

## 🔒 FINAL CONFIRMATION
Always ask for explicit "yes" before running sensitive commands like `remote set-url`, `rebase`, or `ssh-add`.

---

## USAGE EXAMPLES
- `/xu-ly-git-loi Permission denied (publickey)`
- `/xu-ly-git-loi Updates were rejected because the remote contains work`
- `/xu-ly-git-loi Authentication failed`
