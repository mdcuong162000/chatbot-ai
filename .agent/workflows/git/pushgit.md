---
description: Automatically bundle current changes and push code to GitHub quickly.
---

# 🚀 WORKFLOW: QUICK GIT PUSH

## Description
> Called when the user types `/pushgit` or `pushgit`.

Automatically checks, commits (if changes exist), and pushes code to the remote repository following [Git Rules](file:///.agent/rules/process/git-rules.md).

**Input parameter:**
- Optional commit message: `/pushgit fix button bug`
- Default (if empty): `chore: automated update $(date '+%Y-%m-%d')`

---

## ❌ DO NOT
- Skip confirmation BEFORE commit/push.
- Auto-retry if "push rejected" (requires manual pull/rebase).

---

## EXECUTION STEPS

### Step 1 — Check current changes

// turbo
```bash
cd $PWD
git status --short
git branch --show-current
```

- If `git status` is empty → Proceed to **Step 2b** (Push existing commits).
- If files are changed/added → Proceed to **Step 2a** (Commit then push).

---

### Step 2a — Commit and Push

Display changes to PO:

```
--- PREPARING GIT PUSH ---
Branch: [branch name]
Changes: [file list]

Do you want to add, commit, and push these changes?
→ "yes" : execute
→ "no"  : cancel
------------------------------
```

⏸️ **STOP — Wait for "yes".**

// turbo
```bash
git add -A
MSG="${ARGUMENTS:-chore(auto): update $(date '+%Y-%m-%d %H:%M')}"
git commit -m "$MSG"
git push origin $(git branch --show-current)
```

---

### Step 2b — Push only (clean working tree)

```
--- PREPARING GIT PUSH ---
Working tree clean. Pushing existing commits to GitHub.

Continue? (yes/no)
------------------------------
```

⏸️ **STOP — Wait for "yes".**

// turbo
```bash
git push origin $(git branch --show-current)
```

---

## USAGE EXAMPLES
- `/pushgit fix UI banner`
- `/pushgit`
