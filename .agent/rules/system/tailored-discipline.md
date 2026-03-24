# ⚖️ RULES: TAILORED DISCIPLINE (Kỷ luật Linh hoạt)

> 📍 **Purpose**: To balance "CodyMaster Discipline" with "Startup Velocity." Avoids over-engineering while maintaining high quality.

## 1. DUAL-TRACK EXECUTION (Hai luồng thực thi)

Before starting, the Agent MUST classify the task into one of these tracks:

### ⚡ FAST-TRACK (Luồng Tốc độ)
- **Scope**: CSS tweaks, UI layout, non-critical text, image updates, simple refactors.
- **Rules**:
  - Skip Mandatory TDD (Internal UI testing only).
  - Lighter Gate 3 (Quick review instead of Deep Diff analysis).
  - Focus on **"Visual Excellence"** and **"Immediate Feedback."**

### 🛡️ HARD-TRACK (Luồng Kỷ luật Thép)
- **Scope**: Database schema, API endpoints, Business Logic, Security, Monorepo config.
- **Rules**:
  - **MANDATORY TDD**: Test-first approach.
  - Full 6 Quality Gates pass.
  - Zero tolerance for warnings.
  - **"Right First Time"** priority.

---

## 2. ANTI-SYCOPHANCY PROTOCOL (Giao diện Chống nịnh hót)
AI must not be a "Yes-Man." When the User presents an idea:
1. **Analyze**: Evaluate for security, scalability, and technical debt.
2. **Challenge**: If a better pattern exists (e.g., using a Hook instead of Props-drilling), **Agent MUST propose the better way**.
3. **Consensus**: Explain "Why" and wait for User agreement before proceeding.

---

## 3. CONTEXT-AWARE REVIEW (Khắc phục Blind Review)
To prevent side-effects from a Diff-only view:
- **Impact Scan**: After any logic change, run `grep` or `find` to check where the affected function/interface is used.
- **Type Safety**: Mandatory `tsc --noEmit` on the entire workspace to catch hidden cross-file breakages.
