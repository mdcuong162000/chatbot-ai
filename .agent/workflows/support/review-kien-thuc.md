---
description: Clean up knowledge base — summarize lessons after every 10 tasks or when lessons-learned > 50 lines.
---

# 📚 WORKFLOW: KNOWLEDGE REVIEW

## Description
> **Activated when**: Every 10 completed tasks, or when `lessons-learned.md` > 50 lines.

This workflow keeps the knowledge base clean and high-quality by consolidating fragmented lessons into core principles.

**Role:** Supervisor/Monitor

---

## EXECUTION STEPS

### Step 1 — Check status

// turbo
```bash
cd $PWD
echo "=== LESSONS-LEARNED LINE COUNT ==="
wc -l .agent/knowledge/lessons-learned.md
echo ""
echo "=== NUMBER OF LESSONS (LL-xxx entries) ==="
grep -c "^## \[LL-" .agent/knowledge/lessons-learned.md || echo "0"
```

### Step 2 — Read and Group Lessons

Read `knowledge/lessons-learned.md` and group by topic:
- API & Integration
- State Management
- Git & Branching
- Process & Workflow
- Testing

### Step 3 — Summarize into Core Principles

For each group, write 1 principle (max 3 lines):

```
PRINCIPLE [Group]:
[Short description of the principle — max 3 lines]
Application: [all tasks / tasks with X / only when Y]
```

### Step 4 — Update File (Consolidate)

Backup the old file before overwriting:

// turbo
```bash
cp .agent/knowledge/lessons-learned.md .agent/knowledge/lessons-learned.backup-$(date +%Y%m%d).md
```

Write the summarized version to `lessons-learned.md`, removing detailed old lessons that are now covered by principles.

### Step 5 — Verify Results

// turbo
```bash
wc -l .agent/knowledge/lessons-learned.md
# Goal: < 50 lines
```

### Step 6 — Cleanup Backups

Keep only the last 7 days of backups.

// turbo
```bash
find .agent/knowledge/ -name "lessons-learned.backup-*.md" -mtime +7 -exec rm {} \;
```

### Step 7 — Final Report

```
📚 KNOWLEDGE REVIEW COMPLETE

Before: [X] lessons — [Y] lines
After : [A] principles — [B] lines
Reduction: [Z]%
Backups cleaned: [count]

→ Knowledge base is now lean and optimized ✅
```

---

## RULES
- **No deletion without summarization**: Only delete details once they are captured in a principle.
- **Do not lose critical info**: If a lesson cannot be summarized, keep it as is.
- **Always backup** before overwriting.
- **Notify User** upon completion.
