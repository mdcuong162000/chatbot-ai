---
description: Create new eval test case from a recent bug — add to regression suite.
---

# 🧩 WORKFLOW: CREATE EVAL TASK

## Description
> After every bug fix, create a test case to ensure the bug doesn't regress.
> **Separate from `lessons-learned.md`**: lessons-learned stores LESSONS, this creates SPECIFIC TEST CASES.

**INPUT:** Description of the bug or error that occurred

---

## ❌ DO NOT
- Copy entire task spec into `lessons-learned.md` (keep it short)
- Duplicate existing tasks in the suite
- Self-fix the bug — only create the test case
- Self-run the test — call `/tu-tao-test` or `/chay-eval` instead

---

## EXECUTION STEPS

### Step 1 — Bug Analysis

```
Bug: $ARGUMENTS

Analysis:
- Which step in the workflow failed? [workflow + step]
- What input triggered the bug?     [trigger]
- Erroneous result?                [actual]
- Correct result?                  [expected]
```

---

### Step 2 — Create Task using Standard Format

Follow the YAML schema in [Evaluation Rules](file:///.agent/rules/qa/eval-rules.md):

```yaml
task_id: bug-$(date '+%Y%m%d')-XXX
loai: regression
mo_ta: [short description]
input: |
  [Trigger instructions]
graders:
  positive: [PASS conditions]
  negative: [FAIL conditions]
diem_pass: 85
trang_thai: OPEN
```

---

### Step 3 — Duplicate Check

// turbo
```bash
cd $PWD
grep -E "^### |mo_ta:" .agent/knowledge/regression-tasks.md
grep -E "^### |mo_ta:" .agent/knowledge/capability-tasks.md
```

### Step 4 — Save to Regression Suite

// turbo
```bash
# Append task to .agent/knowledge/regression-tasks.md
# Log short lesson to .agent/knowledge/lessons-learned.md
```

---

## 📝 AI-CP FINAL

```
DONE: tao-task-eval [task_id]
RESULT: Task [OPEN/PASS] | Added to regression suite
```

**NEXT:** `/chay-eval` to verify the update.
