# 🔄 WORKFLOW: ROLLBACK & RECOVERY

## Description
Triggered when a critical bug (Level 3) is found or the system becomes unstable.

---

## 🛠️ EXECUTION STEPS
1. **Identify Commit**: Find the last stable commit version.
2. **Revert**: `git reset --hard [COMMIT_ID]`.
3. **Cleanup**: Delete temporary files and logs.
4. **Notify**: Inform PO about the rollback and the root cause.

# 🧪 WORKFLOW: TESTING & VERIFICATION

## Description
> 📍 **Step 6/8**: `/tho-code` → **`/kiem-tra`** → `/giam-sat`

**Input:** `$ARGUMENTS` — Completed code

---

## EXECUTION STEPS

### 1. Build Verification
Run `npm run build` and `npx tsc --noEmit`.

### 2. Unit Testing
Execute `npm test`. Coverage must be **≥ 80%**.
- Follow **[Testing Rules](file:///.agent/rules/qa/testing-rules.md)**.

### 3. Quality Gate Review (Gate 1-6)
Verify against **[6 Quality Gates](file:///.agent/rules/qa/quality-gates.md)**.
- If fails, classify bugs (Level 1/2/3) and score (1-5).
- Follow **[Tailored Discipline](file:///.agent/rules/system/tailored-discipline.md)** for track-specific standards.

## 🤖 AI-CP4 — TESTER VERIFICATION
- Use **[Judge Agent](file:///.agent/rules/system/judge-agent.md)** to detect if stuck in a bug loop.
- **Auto-Rollback**: If Level 3 bug found, trigger `/rollback` immediately.

**Scoring:** 5/5 = PASS | 4/5 = RETRY | ≤ 3/5 = FAIL

**NEXT:** `/giam-sat-va-bao-cao $ARGUMENTS` (if PASS) | `/tho-code` (if FAIL)
