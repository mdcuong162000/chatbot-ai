---
description: Analyze requirements from the Product Owner and assign tasks to the team.
---

# 📋 WORKFLOW: MASTER ORCHESTRATOR

## Description
Central workflow for **$PROJECT_NAME**. Analyzes and orchestrates the entire flow.

**Input parameter:** Product Owner's chat content

---

## 🗺️ ORCHESTRATION FLOW (Simplified)
`/giao-viec` → `/phan-tich` + `/thiet-ke-ui` → [CP1] → `/thiet-ke-ky-thuat` → [CP2] → `/tho-code` → `/kiem-tra` → `/giam-sat` → [CP3] → `/hoan-thanh-va-up-git`

---

## ❌ DO NOT (Manager)
- Skip checkpoints (CP1, CP2, CP3).
- Open new tasks before CP2.
- Push without PO confirmation.

---

## EXECUTION STEPS

### Step 1 — Requirement Analysis
- Analyze request for goal, KPI, platform, and UI needs.
- **KAIZEN**: Challenge PO for real data/API if vague.

### Step 2 — Assignment
- **Architect**: Design flow/interfaces. [Template](file:///.agent/rules/process/command-templates.md#🏗️-command-for-architect)
- **Developer**: Execute implementation. [Template](file:///.agent/rules/process/command-templates.md#👨‍💻-command-for-developer)
- **Tester**: Verify against AC. [Template](file:///.agent/rules/process/command-templates.md#🧪-command-for-tester)

### Step 3 — Tracking & Freezing
- Freeze scope in `knowledge/decisions.md` after CP1.
- Monitor deadlines and blockers.

---

## 🤖 AI-CP1.5 — SCOPE FREEZE
```
🔒 SCOPE FROZEN: $ARGUMENTS
- Included: [CP1 approval result]
- Excluded: [removed features]
```

**NEXT:** `/thiet-ke-ky-thuat $ARGUMENTS`
