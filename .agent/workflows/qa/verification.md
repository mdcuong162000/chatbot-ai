---
description: Auto-generate test cases from TypeScript interfaces and run actual npm test.
---

# 🧪 WORKFLOW: VERIFICATION

## Description
> Called from **`/tho-code`** after coding is complete. Developer verifies code before reporting to Tester.

**INPUT:** TypeScript interface from `knowledge/api-contracts.md` + file name to test

---

## ❌ DO NOT (Developer)
- Skip edge cases, only test happy path
- Tick PASS without actually running `npm test`
- Write tests for interfaces not yet approved by Architect
- Ignore TDD spirit — must follow **Red-Green-Refactor** and **AAA (Arrange-Act-Assert)** framework.

---

## EXECUTION STEPS

### Step 1 — Read interface to test

// turbo
```bash
cd $PWD

echo "=== CURRENT FILE STRUCTURE ==="
find src -name "*.ts" -o -name "*.tsx" | grep -i "$ARGUMENTS" | head -10

echo ""
echo "=== INTERFACE FROM API-CONTRACTS ==="
grep -A 20 "$ARGUMENTS" .agent/knowledge/api-contracts.md || echo "(No entry found — check if Architect defined it)"
```

### Step 2 — Generate test cases

Create test file: `src/__tests__/[name].test.ts` following the [Testing Rules](file:///.agent/rules/qa/testing-rules.md).

**Mandatory Template (AAA Rules):**
> ⚠️ All Unit Tests must strictly follow the **Arrange-Act-Assert** model.

```typescript
// src/__tests__/[name].test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('[component/function name]', () => {
  // ✅ HAPPY PATH (AAA)
  // 🔢 EDGE CASES (Zero, null, undefined, extreme values)
  // 🔴 ERROR CASES (401, 500, timeout, wrong format)
  // 📊 KPI CALCULATIONS (CTR, ROAS...)
})
```

### Step 3 — Run actual tests

// turbo
```bash
cd $PWD

echo "=== RUNNING TESTS ==="
npm test -- --reporter=verbose 2>&1 | tail -30

echo ""
echo "=== COVERAGE ==="
npm test -- --coverage 2>&1 | grep -E "All files|[0-9]+\.[0-9]+%" | head -5
```

### Step 4 — Evaluate results

**If PASS (≥80% test pass & coverage):**
```
✅ VERIFICATION PASS: $ARGUMENTS
Test: [X/Y pass]
Coverage: [%]
→ Proceed to /kiem-tra
```

**If FAIL:**
```
❌ Test fail: [list of failed tests]
→ Automatically trigger /tu-debug with error message
```

---

## 🤖 AI-CP-TEST — ACTUAL TEST VERIFICATION

> ⛔ Must tick all **6/6 boxes** as per [Testing Rules](file:///.agent/rules/qa/testing-rules.md).

---

## 📝 SUMMARY FOR SUPERVISOR

```
• Done: Verification for $ARGUMENTS — generated AAA tests and ran npm test
• Result: PASS — [X/Y] tests passed, [%] coverage
• Note: [specific test case / "-"]
```

**NEXT:** `/chuan-bi-merge $ARGUMENTS` (if PASS) | `/tu-debug` (if test FAIL)
