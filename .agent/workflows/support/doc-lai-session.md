---
description: Restore project context from the latest Save Point after a New Chat.
---

# 📥 WORKFLOW: LOAD SESSION (RELOAD CONTEXT)

## Description
> 📍 **Infrastructure Tool**

This workflow is **CALLED FIRST** in a New Chat session, triggered either by the command `/doc-lai-session` or the natural language phrase **"Tiếp tục công việc"**. It helps the AI immediately remember the project, the current task status, and the established rules.

**Input parameter:** NONE.

---

## EXECUTION STEPS

### Step 1 — Load Config and Bootstrap

AI proactively uses `view_file` to read system configurations:
1. `.agent/config.json` to get `$PROJECT_NAME`.
2. `.agent/BOOTSTRAP.md` to remember the core V7 operating principles.

### Step 2 — Load Save Point (Short-term memory)

AI uses `view_file` to read the progress summary:
- `.agent/knowledge/current-state.md`

### Step 3 — Report to PO and Wait for Instructions

Display the following notification:

```
╔════════════════════════════════════════════╗
║     ♻️ CONTEXT RESTORED ($PROJECT_NAME)     ║
╠════════════════════════════════════════════╣
║ ✅ Config and Bootstrap V7 Rules loaded.    ║
║ ✅ `current-state.md` loaded successfully.  ║
╠════════════════════════════════════════════╣
║ Waiting for instructions...                 ║
╚════════════════════════════════════════════╝

The system has restarted with 100% cognitive capacity and optimized token usage.
Based on the saved progress, what is our next move, PO?
```
