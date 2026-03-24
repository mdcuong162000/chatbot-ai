---
description: Assign specific coding tasks to Developer, execute quickly in project $PROJECT_NAME
---

# 👨‍💻 WORKFLOW: CODER

## Description
> 📍 **Step 5/8** in the pipeline: `/thiet-ke-ky-thuat` → **`/tho-code`** → `/kiem-tra`

Developer receives task, writes code using the correct stack and conventions.

**Input parameter:** `$ARGUMENTS` — Feature name to code

---

## ❌ DO NOT (Developer)
- Change TypeScript interfaces not approved by Architect.
- Use external libraries not in `tech-stack.md`.
- Report done with TS/Lint errors.
- Code directly on `main`.
- Hardcode API keys.

---

## ⚙️ PROJECT RULES & STANDARDS

Detailed guidelines are modularized for efficiency. Read these before coding:

- **Coding Rules**: [coding-rules.md](file:///.agent/rules/tech/coding-rules.md)
- **Tech Stack**: [tech-stack.md](file:///.agent/rules/tech/tech-stack.md)
- **Tailored Discipline**: [tailored-discipline.md](file:///.agent/rules/system/tailored-discipline.md)
- **RARV Engine**: [rarv-engine.md](file:///.agent/rules/system/rarv-engine.md)
- **Security**: [security-rules.md](file:///.agent/rules/security/security-rules.md)
- **Agent Optimization**: [agent-optimization.md](file:///.agent/rules/system/agent-optimization.md)
- **Review Checklist**: [checklist.md](file:///.agent/rules/process/checklist.md)
- **Git Rules**: [git-rules.md](file:///.agent/rules/process/git-rules.md)

---

## EXECUTION STEPS

### Step 1 — Scope & Memory retrieval
- Check frozen scope in `knowledge/decisions.md`.
- Read past lessons in `knowledge/lessons-learned.md`.

### Step 2 — Environment analysis
- Analyze directory structure and components.
- Reference Architect's design if available.

### Step 3 — Implementation
- Write code: Next.js, TS, Tailwind, shadcn.
- Wrap features in **Feature Flags** (`NEXT_PUBLIC_FF_`).
- Comment complex logic in Vietnamese.

### Step 4 — Self-Verification (AI-CP3)
- Run `npm run build` and `npx tsc --noEmit`.
- Verify no hardcoded keys and proper error handling.

---

## 🤖 AI-CP3 — DEVELOPER SELF-CHECK

```
□ Build & Type-check pass?
□ No hardcoded secrets?
□ Feature wrapped in FF?
□ Loading/Error states handled?
□ lessons-learned.md read?
□ Retry logic in API calls?
```

**NEXT:** `/tu-tao-test $ARGUMENTS`
