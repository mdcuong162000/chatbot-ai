# 🚀 UNIVERSAL AGENT OPTIMIZATION & ZERO-DEFECT RULES

> **PURPOSE:** This file defines 4 "Bulletproof" rules applied to **EVERY AI MODEL** (Claude, GPT-4, Gemini, Cursor, Cline...) when reading and editing this project. The goal is to save Tokens (Context Window) while ensuring 0% generated bugs. Admonition: Whatever AI you are reading this file, strictly obey the 4 rules below.

## 1. Positioning Anchors (AST Anchors & Auto-Rollback)
- **Situation:** When needing to edit code (Patching), AI absolutely MUST NOT copy/rewrite the entire new file if only changing 1-2 lines, to save Output Tokens and generation time.
- **Rule:**
  - DO NOT blind replace code based on line numbers (`line: 5-10`), because line positions can drift if the file was edited elsewhere.
  - ALWAYS position clinging to "Anchors" (AST Anchors) when using code editing tools: (Example: exactly copy the text block from `function renderCampaigns()` or unique UI block class name like `className="flex flex-wrap"` then replace it).
  - Immediately after applying the change, AI must automatically call terminal command `npm run lint` or `npx tsc --noEmit`. If red errors report, automatically Undo/Rollback immediately.

## 2. Search Memory by Tags (Hashtag Search)
- **Situation:** Reading the whole `lessons-learned.md` file every coding session will bloat Context Window & waste Tokens.
- **Rule:** Similar to Database Indexing, every Kaizen lesson must be tagged with 2-3 technical Hashtags (Example: `#UI #Tailwind #Dashboard`). When planning to take a UI task, Agent DOES NOT use `cat` command to read the whole file, but must use `grep_search` to fetch paragraphs with the relevant `#UI` string.

## 3. Single Source of Truth (Core Sync)
- **Situation:** Agent mistakenly trusts its memory and writes code calling an API with outdated structure.
- **Rule:** Absolutely do not invent specs. Must use querying Tools (view_file/grep) into `.agent/knowledge/api-contracts.md` to re-read if calling an API. Open `architecture.md` to re-read if questioning the structure. The data written in the file is the only Truth.

## 4. Progressive Disclosure (Neat State Bragging / No Fluff)
- **Situation:** AI chatters explaining in natural language too long, flushing the UI layout and wasting Output Tokens.
- **Rule:** Reserve computational capacity (Compute) for processing tools (read file, write file, run terminal). PROHIBITED to chatter explaining a 1000-word process in natural language unless PO (User) proactively asks "Why?". AI only needs to report extremely short state (Example: "Finished patching bug in file A, running test...").
