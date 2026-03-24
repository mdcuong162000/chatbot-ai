---
description: Emergency tool — Compress 128k Tokens context into 1k Tokens for a New Chat to prevent hallucinations.
---

# 🧠 WORKFLOW: CONTEXT COMPACTION (MEMORY STORAGE)

## Description
> 📍 **Infrastructure Tool**

When a conversation gets too long (over 3-4 features), the AI may become confused, forget rules, or waste tokens. Call `/luu-tri-nho` to summarize recently modified files, fixed bugs, and the current pending flow into a "Save Point".
Then, open a **New Chat**, type `/doc-lai-session`, and the full context will be restored!

**Input parameter:** NONE.

---

## EXECUTION STEPS

### Step 1 — Gather Progress Data

// turbo
```bash
cd $PWD
echo "=== RECENT GIT STATUS ==="
git status --short
echo ""
echo "=== LATEST 3 COMMITS ==="
git log -3 --oneline
```

### Step 2 — AI Self-Summarization

AI summarizes:
1. Pending Feature.
2. Files currently under development.
3. Next required step (e.g., Finished `/tho-code`, now need to run `/code-review`).

Save this summary to `.agent/knowledge/current-state.md`.

### Step 3 — Mandatory Context Jump Warning

Display the following:

```
╔════════════════════════════════════════════╗
║      💾 SAVE POINT CREATED SUCCESSFUL      ║
╠════════════════════════════════════════════╣
║ State and Context compressed.              ║
║ Your tokens have been saved!               ║
╠════════════════════════════════════════════╣
║ MANDATORY ACTION:                          ║
║ 1. Click [New Chat] / [Clear].             ║
║ 2. In the new chat, type: `/doc-lai-session`║
║ 3. Continue the pending workflow.          ║
╚════════════════════════════════════════════╝
```

**STOP HERE. DO NOT PERFORM ANY FURTHER ACTIONS.** All subsequent work must happen in a New Chat.
