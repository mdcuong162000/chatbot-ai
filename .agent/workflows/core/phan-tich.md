# 📋 WORKFLOW: ANALYSIS

## Description
> 📍 **Step 2/8**: `/giao-viec` → **`/phan-tich`** & `/thiet-ke-ui` → [CP1]

**Input:** `$ARGUMENTS` — PO Request

---

## EXECUTION STEPS

### 1. Requirements Analysis & KAIZEN
Analyze for Business Goal, KPI, Platform, User, and UI.
- **[KAIZEN]**: Challenge PO's idea if better technical patterns exist (Anti-Sycophancy).
- Use **[Analysis Rules](file:///.agent/rules/business/analysis-rules.md)** and **[Tailored Discipline](file:///.agent/rules/system/tailored-discipline.md)** to choose the Track.

### 2. User Story & AC
- Format: "As a [role], I want [feature] so that [goal]."
- Write **BDD Acceptance Criteria** (Given-When-Then).

### 3. PO Approval (CP1)
Display the sync summary to PO.
- **PASS**: `yes` → `/thiet-ke-ky-thuat $ARGUMENTS`
- **FAIL**: `no` → Revise.

---

## 🤖 AI-CP1 — BA SELF-CHECK
```
□ Request clear?
□ BDD format used?
□ Edge cases covered? (rules/business/analysis-rules.md)
□ User story complete?
```

**NEXT:** `/thiet-ke-ky-thuat $ARGUMENTS`
