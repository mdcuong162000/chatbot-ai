---
description: Run scheduled eval to measure agent quality — called before major updates or periodically.
---

# 📊 WORKFLOW: RUN EVAL

## Description
> Measure agent quality through capability tasks and regression tasks.
> **DO NOT fix anything — just measure and report.**

**INPUT:** None — called periodically or before major workflow updates

---

## ❌ DO NOT
- Self-fix workflow when eval fails — report only
- Confuse with `/review-kien-thuc` (review-knowledge cleans lessons, run-eval measures quality)
- Run eval during an active task (avoid interference)

---

## EXECUTION STEPS

### Step 1 — Read evaluation tasks

// turbo
```bash
cd $PWD

echo "=== CAPABILITY TASKS ==="
cat .agent/knowledge/capability-tasks.md | grep -E "^### |trang_thai:|diem_pass:"

echo ""
echo "=== REGRESSION TASKS ==="
cat .agent/knowledge/regression-tasks.md | grep -E "^### |diem_pass:"

echo ""
echo "=== PREVIOUS EVAL RESULTS ==="
tail -20 .agent/knowledge/eval-results.md
```

Follow [Evaluation Rules](file:///.agent/rules/qa/eval-rules.md) for task selection.

---

### Step 2 — Run tasks (Simulated)

For each task, run through the agent flow 3 times (Pass@3):

```
Task: [task_id] — [description]
Lần 1: [Simulation result — PASS/FAIL + score]
Lần 2: [Repeat with same input — PASS/FAIL + score]
Lần 3: [Repeat third time — PASS/FAIL + score]

pass@1: [PASS/FAIL]
pass@3: [X/3 times PASS]
pass^3: [PASS only if all 3 pass]
```

---

### Step 3 — Measure KPIs per task

Record metrics as defined in [Evaluation Rules](file:///.agent/rules/qa/eval-rules.md):
`task_id`, `n_turns`, `n_aicp`, `result`, `score`.

---

### Step 4 — Comparative Analysis

Compare with previous results from `knowledge/eval-results.md`.

---

### Step 5 — Save results

Append to `.agent/knowledge/eval-results.md` using the standard format.

---

### Step 6 — Report to User

```
--- EVAL RESULTS [timestamp] ---
Capability: [X/Y] pass ([%]) [↑↓→]
Regression: [X/Y] pass ([%]) [↑↓→]
Avg Score : [X/100]

⚠️ Warnings: [regression task failures]
📋 New fails: [list]
💡 Proposed actions: [fix workflow / add harder tasks / do nothing]
---------------------------------
DO NOT self-fix — wait for User decision
```

---

## 📝 AI-CP FINAL

```
DONE: chay-eval [PASS/FAIL]
RESULT: capability [%] | regression [%] | avg score [X/100]
```
