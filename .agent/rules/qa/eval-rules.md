# 📊 RULES: EVALUATION & GRADING

## AI Agent Evaluation Framework

We measure agent quality through **Capability Tasks** and **Regression Tasks**.

### 1. Capability Tasks
- Measure the agent's ability to handle new, complex tasks (Difficulty 3-5).
- Goal: Pass rate should increase over time as workflows improve.

### 2. Regression Tasks
- Ensure that fixing one bug doesn't break existing features.
- Goal: **MUST be ≥ 95%** at all times.

---

## Grading Rubric (0-100 Points)

| Grade | Meaning | Description |
|---|---|---|
| **100** | Perfect | Passes all graders, no lint/type errors, minimal turns used. |
| **85-99** | Pass | Passes core graders but might have minor style issues or used more turns than optimal. |
| **70-84** | Marginal | Only passes some graders or has major warnings (lint). Needs improvement. |
| **<70** | Fail | Fails core requirement or causes system crash. |

---

## Metrics to Track

- **Pass@1**: Pass on the first attempt.
- **Pass@3**: Pass in at least 1 out of 3 attempts.
- **Pass^3**: Pass consistently (all 3 attempts pass).
- **n_turns**: Average number of steps to complete a task.
- **n_aicp**: Number of AI checkpoints passed correctly.

---

## Task Schema Format

Every evaluation task must follow this standard YAML structure:

```yaml
task_id: [ID]
loai: [capability/regression]
mo_ta: [description]
input: |
  [Input instructions]
expected_outcome:
  - [outcome 1]
graders:
  positive: [must happen]
  negative: [must NOT happen]
diem_pass: 85
trang_thai: [OPEN/PASS]
```
