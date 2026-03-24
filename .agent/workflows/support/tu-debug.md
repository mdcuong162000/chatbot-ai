---
description: Tự debug lỗi TypeScript/Runtime — tối đa 3 lần, sau đó báo Architect
---

# 🐛 WORKFLOW: SELF-DEBUG

## Description
> Called from **`/tho-code`** or **`/verification`** when build or test errors occur.

**INPUT:** Error message + stack trace + affected file

---

## ❌ DO NOT
- Attempt to fix more than 3 times without notifying the Architect.
- Change TypeScript interfaces defined by the Architect.
- Add new external libraries just to "fix" an error.

---

## EXECUTION STEPS

### Step 1 — Error Classification

```
Attempt: [1/3]
Error: $ARGUMENTS

CLASSIFICATION:
□ Syntax error    → Fix immediately
□ Type error      → Check TS interface
□ Runtime error   → Check logic + edge cases
□ Import error    → Check paths + exports
□ Build error     → Check config + dependencies
```

### Step 2 — Locate Error

// turbo
```bash
cd $PWD
echo "=== BUILD LOG ==="
npm run build 2>&1 | head -40
echo ""
echo "=== TYPE CHECK ==="
npx tsc --noEmit 2>&1 | head -20
```

### Step 3 — Fix and Verify

Apply the fix to the specific location, then verify:

// turbo
```bash
npx tsc --noEmit 2>&1 | head -10
npm run lint 2>&1 | head -10
npm run build 2>&1 | tail -5
```

### Step 4 — Evaluate Result

**If PASS:**
```
✅ SELF-DEBUG PASS: $ARGUMENTS
Attempt: [X/3]
Resolution: [Short description of the fix]
→ Return to caller workflow.
```

**If FAIL (after 3 attempts) — ACTIVATE ROOT-CAUSE GRAPH:**
> ⛔ STOP coding immediately. Analyze why the error persists.

```
╔═════════════════════════════════════════════╗
║    🔴 ROOT-CAUSE GRAPH (HARD ERROR)         ║
╠═════════════════════════════════════════════╣
║ 1. Symptom: [e.g., Typing error]            ║
║ 2. Why?    [Component expects field X]      ║
║ 3. Why?    [API doesn't provide field X]    ║
║ 4. Root Architecture Flaw: [Invalid Contract]║
╠═════════════════════════════════════════════╣
║ CONCLUSION: Needs Architect redesign.        ║
╚═════════════════════════════════════════════╝

→ Trigger: /xu-ly-su-co "$ARGUMENTS — architectural root cause detected"
```

---

## 🤖 AI-CP-DEBUG — FIX VERIFICATION

> ⛔ Must tick all **5/5 boxes** before reporting PASS.

```
□ Ran npm run build after fixing?
□ Build passes completely with no errors?
□ Only affected the buggy code (check diff)?
□ No new errors introduced elsewhere?
□ Fixed within 3 attempts?
```

**NEXT:** Return to calling workflow (if PASS) or `/xu-ly-su-co` (if FAIL after 3 attempts).
