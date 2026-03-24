---
description: Senior Reviewer role — review code, scan for Security, Memory Leaks before Tester/QA.
---

# 🕵️ WORKFLOW: DEEP CODE REVIEW

## Description
> 📍 **Step 5.5/9** in the pipeline: `/tho-code` → **`/code-review`** → `/kiem-tra`

When `/code-review` is called, the Agent acts as a Senior Developer to review code against 3 pillars: Clean Code, Database, and Security.

**Input parameter:** `$ARGUMENTS` — Feature name vừa code xong.

---

## ❌ DO NOT
- Auto-fix source code — only comment and force Developer (`/tho-code`) to redo if CRITICAL ERRORS are found.

---

## EXECUTION STEPS

### Step 1 — Scan all recent changes

// turbo
```bash
cd $PWD
echo "=== RECENTLY CHANGED FILES ==="
git diff HEAD 2>/dev/null || git status --short
echo ""
echo "=== NEW CODE DETAILS ==="
git diff HEAD -U0 | grep '^[+]' | grep -Ev '^\+\+\+ |^[-]|^--' | head -n 50
```

---

### Step 2 — Analyze based on 3 Pillars

Follow the rules in `.agent/rules/`:
1. **Security Rules**: No `dangerouslySetInnerHTML`, Zod validation present, no leaked secrets.
2. **Database Rules**: No N+1 queries, no hard deletes.
3. **Clean Code**: UI/Logic separation, no memory leaks (`useCallback`/`useMemo`), proper `key` props.

---

### Step 3 — Code Review Report

Display to Product Owner (PO):

```
╔════════════════════════════════════════════╗
║      🕵️ CODE REVIEW RESULTS (SENIOR)       ║
╠════════════════════════════════════════════╣
║ Feature: $ARGUMENTS                        ║
╠════════════════════════════════════════════╣
║ 🛡️ SECURITY     : [PASS / WARNING]         ║
║ 🗄️ DATABASE     : [PASS / WARNING]         ║
║ 🌟 CLEAN CODE   : [PASS / WARNING]         ║
╠════════════════════════════════════════════╣
║ DETAILED FINDINGS:                         ║
║ 1. [File name / Issue found - if any]      ║
║ 2. [Issue 2...]                            ║
╚════════════════════════════════════════════╝
```

**Senior Reviewer Decision:**

- If **PASS 3/3**:
  `✅ CLEAN CODE. Proceed to functional testing.` → NEXT: `/kiem-tra $ARGUMENTS`.
  
- If **FAIL** (Security / Database risk):
  `🔴 REJECTED. Structural or security risks detected.` → NEXT: Call `/tho-code` again to fix specific review findings.

---

## 🤖 AI-CP-REVIEW — SENIOR REVIEWER CONFIRMATION

```
□ Read actual Code blocks / Diffs instead of just Interfaces?
□ Check: No N+1 Queries, uses transactions (if backend)?
□ Check: No XSS/CSRF, Form has Zod validation (if frontend)?
□ Check: Logic does not exceed 300 lines in a single UI Component?
□ Warned Developer if 'Magic Number' found > 3 times?
```

**NEXT:**
PASS → `/kiem-tra $ARGUMENTS`
FAIL → Return to `/tho-code $ARGUMENTS`
