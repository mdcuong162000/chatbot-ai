---
description: Incident Resolution — Handling critical system bugs (Level 3 Critical)
---

# 🆘 WORKFLOW: INCIDENT RESOLUTION

## Description
> 📍 **Activated when**: `/kiem-tra` detects a Level 3 (Critical) Bug **or** Product Owner completely rejects at Checkpoint 3.

This workflow handles **all critical incidents**. Triggered from:
- `/kiem-tra` → Level 3 Bug (app crash / multiple feature failures)
- `/giam-sat-va-bao-cao` → CHECKPOINT 3 → PO chooses "redo completely"

**Input parameter:** `$ARGUMENTS` — Specific incident description

> ⛔ **PRINCIPLE #1**: STOP IMMEDIATELY — Do not do anything else before notifying.

---

## EXECUTION STEPS

### Step 1 — STOP and Notify

Immediately display the following notification:

```
╔══════════════════════════════════════╗
║       🔴 CRITICAL INCIDENT          ║
╠══════════════════════════════════════╣
║ Type    : [Complete FAIL /          ║
║            Critical Bug]            ║
║ Description: [details]              ║
║ Impact  :                           ║
║  - Feature: [list]                  ║
║  - Platform: [Meta/TikTok/Google]   ║
║  - Data: [corrupt / lost / crash]   ║
╠══════════════════════════════════════╣
║ Status: ⏸️ STOPPED COMPLETELY     ║
║ Waiting for Manager instructions    ║
╚══════════════════════════════════════╝
```

**Notify immediately:**
- 👤 **Manager** — decide rollback or fix-forward
- 👤 **Product Owner** — notify status, ETA

### Step 2 — Impact Assessment and Rollback Question

Follow [Incident Rules](file:///.agent/rules/system/incident-rules.md) for assessment.

// turbo
```bash
git log --oneline -5
git status --short
```

Display full analysis and ask:
- → "rollback [hash]" : rollback to specific commit → /rollback
- → "keep"             : analyze and fix on current code

⏸️ **STOP — Wait for Manager/PO feedback.**

### Step 3 — Root Cause Analysis (5-Why)

Architect + BA perform deep analysis using the [5-Why Framework](file:///.agent/rules/system/incident-rules.md).

### Step 4 — Correction Plan

Architect decides on the approach:
- Scope, Logic changes, Estimated time, New tests, Branch name `fix/su-co-[id]`, Risks.

**Wait for PO confirmation before execution.**

### Step 5 — Fix on Dedicated Branch

1. Create branch `fix/su-co-[id]`.
2. Follow Architect's plan strictly.
3. Run `/kiem-tra` on the WHOLE system.

### Step 6 — Record Lessons & Improve Process

1. Add entry to `knowledge/lessons-learned.md`.
2. Update [Review Checklist](file:///.agent/rules/process/checklist.md) if needed.
3. Call `/tao-task-eval $ARGUMENTS` for new regression case.

### Step 6b — Save Transcript for Learning

Save root cause and steps leading to failure in `.agent/knowledge/failed-transcripts/`.

### Step 7 — Completion Report

```
✅ INCIDENT RESOLVED: $ARGUMENTS

Root cause : [summary]
Solution   : [summary]
Branch merge: fix/su-co-[name]
Lessons    : ✅ logged to lessons-learned
Transcript : ✅ saved to failed-transcripts/

→ /hoan-thanh-va-up-git $ARGUMENTS
```

---

## MANDATORY RULES

| Rule | Details |
|---|---|
| ⛔ No self-fixing | Must wait for Architect analysis + PO confirmation |
| ⛔ No fix on main | Always create a separate `fix/` branch |
| ⛔ No merge without 100% PASS | Run full lint + type + test + build |
| ✅ Prioritize Rollback | If stability is at risk, rollback first |
| ✅ Kaizen | Always update lessons-learned and checklists |

---

## 🤖 AI-CP-RESTART — MANAGER DEFINES RESTART POINT

> ⛔ **MANDATORY** after every incident resolution. Determine where to restart the pipeline (BA, Architect, or Developer) as per [Incident Rules](file:///.agent/rules/system/incident-rules.md).

- **Logic Error**: Restart from Developer (`/tho-code`).
- **Design Error**: Restart from Architect (`/thiet-ke-ky-thuat`).
- **Requirement Error**: Restart from BA (`/phan-tich`).

---

## USAGE EXAMPLES

```
/xu-ly-su-co App crashes when filtering date range across all platforms
/xu-ly-su-co ROAS calculation is wrong for all Meta Ads campaigns
/xu-ly-su-co PO completely rejected the CPM dashboard feature
```
