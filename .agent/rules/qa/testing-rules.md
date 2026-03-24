# 🧪 RULES: TESTING & VERIFICATION

## AA Pattern (Arrange-Act-Assert)

Every Unit Test MUST strictly follow the AAA pattern and be **absolutely independent** (using Mocks/Stubs to cut dependencies to DB/Network).

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
// import component/function to test

describe('[component/function name]', () => {

  // ✅ HAPPY PATH - Apply AAA (Arrange-Act-Assert)
  it('renders with normal data', () => {
    // Arrange: Initialize mock data (Stubs/Spies) independent from external services
    const mockData = { id: 1, impressions: 5000 }
    
    // Act: Execute function/component
    const result = calcCTR(mockData.impressions, mockData.spend)
    
    // Assert: Confirm results
    expect(result).toBeGreaterThan(0)
  })

  // 🔢 EDGE CASES — MANDATORY
  it('handles bad string & extreme values', () => {
    // Empty string '', negative numbers, max safe integer → no crash
  })

  it('handles zero values (impressions=0, spend=0)', () => {
    // KPI = 0 → no crash, display 0
  })

  it('handles null / undefined data', () => {
    // API returns null → empty state, no crash
  })

  it('handles empty array []', () => {
    // No campaigns → empty state
  })

  // 🔴 ERROR CASES
  it('handles API error 401', () => {
    // Token expired → error state, no crash
  })

  it('handles API timeout', () => {
    // Over 30s → timeout error state
  })

  it('handles API returning wrong format', () => {
    // Data missing fields → graceful fallback
  })
})
```

---

## TDD Lifecycle v2.0 (Ground Truth First) [RULE-9]

1. **Ground Truth**: Define at least 3 objective scenarios (inputs/expected outputs) in a dedicated cases file.
2. **Red**: Create `[name].test.ts`. Run `npm test` → fail.
3. **Green**: Write minimum code to pass Ground Truth cases.
4. **Refactor**: Improve code while keeping Ground Truth tests passing.
5. **Final Check**: Pass all **Quality Gates** (v4.2 Protocol).

---

## Coverage Standards

- **Threshold**: Overall coverage MUST be **≥ 80%** before reporting Done.
- **Mandatory coverage**: Business logic, KPI calculations, and data normalization MUST have 100% coverage.
- **UI Testing**: Focus on state changes (Loading → Error → Data) and conditional rendering.

---

## Security in Testing


---

## 🐛 Bug Classification by Severity

| Severity | Description | Action |
|---|---|---|
| 🟡 **Level 1** (Minor) | UI/UX alignment, typo, color offset, minor responsive issues | Developer fixes directly → Re-test |
| 🟠 **Level 2** (Major) | Business logic error, KPI calculation wrong, data mismatch | Architect re-designs → Developer fixes → Re-test |
| 🔴 **Level 3** (Critical) | App crash, security leak, data loss, multiple features broken | **STOP IMMEDIATELY** → Call `/xu-ly-su-co` |

---

## 🏆 AI-CP4 Scoring System

| Score | Meaning | Status |
|---|---|---|
| **5/5** | No bugs, meets all AC, perfect code quality | ✅ PASS |
| **4/5** | 1-2 Level 1 bugs, AC met | ⚠️ RETRY (fixes needed) |
| **≤ 3/5** | Any Level 2 or Level 3 bugs | ❌ FAIL (Architecture review) |
