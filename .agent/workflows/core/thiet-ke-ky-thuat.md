# 🏗️ WORKFLOW: TECHNICAL DESIGN

## Description
> 📍 **Step 4/8**: [CP1] → **`/thiet-ke-ky-thuat`** → [CP2]

**Input:** `$ARGUMENTS` + BA Spec

---

## EXECUTION STEPS

### 1. Impact Analysis
Check existing `/src` structure and identify affected modules.

### 2. Tech Design
Define Data Flow, Interfaces, and API Schema.
- Refer to **[Architect Rules](file:///.agent/rules/tech/architect-rules.md)** and **[Database Rules](file:///.agent/rules/tech/database-rules.md)**.

### 3. Documentation
Update `docs/architecture.md` with decisions and complexity.

### 4. Review (CP2)
Manager + BA review the tech design.
- **PASS**: `OK` → `/tho-code $ARGUMENTS`
- **FAIL**: `Error` → Architect fixes.

---

## 🤖 AI-CP2 — ARCHITECT SELF-CHECK
```
□ Architecture log updated?
□ Interfaces defined?
□ Data flow identified?
□ No N+1 queries? (database-rules.md)
```

**NEXT:** `/tho-code $ARGUMENTS`
