# 🆘 RULES: INCIDENT RESOLUTION (INCIDENT RULES)

## 5-Why Root Cause Analysis Framework

When a critical incident (Bug Level 3 or complete rejection) occurs, the Architect and BA must perform a deep analysis:

1. **WHY 1: Symptom** - How did the incident manifest?
2. **WHY 2: Direct Cause** - What code or logic change caused the symptom?
3. **WHY 3: Source of Error** - Why does that error exist? (Validation missing, wrong assumption?)
4. **WHY 4: Detection Failure** - Why was it not caught earlier?
5. **WHY 5: Process Gap** - What was missing in our checklist or tests that allowed this through?

---

## Impact Assessment Levels

| Level | Severity | Action |
|---|---|---|
| **Level 3** | Critical | **STOP IMMEDIATELY**. Report to Lead/PO. Rollback likely. |
| **Level 2** | Medium | Proceed with fix on separate branch. Fix before merge. |
| **Level 1** | Minor | Log as technical debt. Fix in next iteration. |

---

## Rollback vs. Fix-forward

- **Rollback**: Default action if the bug affects production stability or data integrity. Priority is to restore a "Known Good" state.
- **Fix-forward**: Only allowed if the fix is trivial (< 15 mins) and doesn't risk further regression.

---

## Post-Mortem Documentation

Every Level 3 incident MUST result in:
1. An entry in `knowledge/lessons-learned.md`.
2. A new regression test case in `knowledge/regression-tasks.md`.
3. A failed transcript saved in `.agent/knowledge/failed-transcripts/` for AI learning.
