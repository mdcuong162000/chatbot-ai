---
description: Read old failed task transcripts to learn and propose improvements — used after incident resolution.
---

# 🔍 WORKFLOW: VIEW TRANSCRIPT

## Description
> Read and analyze old failed task transcripts to learn and improve.
> **Separate from `/xu-ly-su-co`**: xu-ly-su-co is for emergencies; view-transcript is for post-incident learning.

**INPUT:** Task ID or task description to analyze

---

## ❌ DO NOT
- Use during an active critical incident (use `/xu-ly-su-co` instead).
- Self-modify workflows without PO approval.

---

## EXECUTION STEPS

### Step 1 — Find Transcript

// turbo
```bash
cd $PWD
echo "=== TRANSCRIPT LIST ==="
ls -lt .agent/knowledge/failed-transcripts/ 2>/dev/null
echo ""
echo "=== SEARCH BY KEYWORD ==="
grep -rl "$ARGUMENTS" .agent/knowledge/failed-transcripts/ 2>/dev/null
```

### Step 2 — Analyze Transcript

```bash
cat .agent/knowledge/failed-transcripts/[file-name].md
```

Analysis sequence:
1. Which step first showed signs of failure?
2. Which decision led to the failure?
3. Which AI Checkpoint (AI-CP) caught the error?
4. Which AI Checkpoint missed the error and why?
5. Does this match old patterns in `lessons-learned.md`?

### Step 3 — Analysis Report

```
--- TRANSCRIPT ANALYSIS ---
Task   : [task name]
Result : [FAIL / score X/100]
Root Cause: [Specific description]

Failed Step: [workflow] → [decision] → [error]

AI-CP Caught: [name / "None"]
AI-CP Missed: [name + reason / "None"]

Pattern:
□ Known pattern — similar to [ID]
□ New pattern — needs to be logged
```

### Step 4 — Proposed Improvements (1-3 actions)

Proposal examples:
- Update workflow X, step Y: add/remove Z.
- Add AI-CP check for Z.
- Create new regression task: `/tao-task-eval`.

> ⛔ Only propose improvements. Wait for PO approval before applying.

---

## 🔒 AI-CP FINAL

```
DONE: xem-transcript [task_id]
RESULT: Identified [X] improvement points | [X] proposals
```

**NEXT:** `/tao-task-eval` if a new regression case is needed.
