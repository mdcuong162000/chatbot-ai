# 🛡️ THE 6 QUALITY GATES (Unified Standard)

No code is "Production Ready" or allowed to merge until it passes all 6 gates. Use this as both a definition and a 5-minute practical checklist.

---

## 🔵 Gate 1: SYNTAX & STANDARDS (Cú pháp & Quy chuẩn)
*   [ ] **Linter & Types**: `npm run lint` & `npx tsc --noEmit` report 0 errors/warnings.
*   [ ] **Code Clarity**: Can a human understand this function within 5 seconds?
*   [ ] **Clean Code**: No magic numbers/strings, SRP (Single Responsibility) followed, no nesting > 3 levels.
*   [ ] **Modularization**: Functions < 30 lines, < 3 parameters.

## 🔵 Gate 2: TEST & RELIABILITY (Kiểm thử & Tin cậy)
*   [ ] **TDD Mandatory**: Tests written alongside code. Coverage ≥ 80% for logic modules.
*   [ ] **Edge Cases**: Happy Path + Error Cases + Timeouts + Broken JSON handled.
*   [ ] **Observability**: All async tasks maintain `X-Correlation-ID` for tracing.
*   [ ] **Dual Logging**: Logs follow JSON or `[SCOPE] key=val` format.

## 🔵 Gate 3: ARCHITECTURE & DOD (Kiến trúc & Green Coding)
*   [ ] **Dependency Injection**: No direct `new` or internal Singleton calls. Use DI.
*   [ ] **Green Coding (DOD)**: Heavy data processed in Arrays, not messy OOP Objects.
*   [ ] **Core Sync**: Re-read `.agent/knowledge/api-contracts.md` to ensure spec compliance.
*   [ ] **Boy Scout Rule**: Cleaned up the surrounding code/format in the edited area.
*   [ ] **Doc-Code Sync (ENFORCED)**: If this PR touches `blueprint.md`, `api-contracts.md`, or `AGENT_ANATOMY_VI.md` — the corresponding code files MUST be updated in the SAME commit. No doc-only or code-only splits allowed. CI will fail if a doc is touched without a matching code change or vice versa. See `.github/workflows/doc-sync-check.yml`.

## 🔵 Gate 4: SECURITY & ANTI-SYCOPHANCY (Bảo mật & Phản biện)
*   [ ] **Secret Guard**: 0% hardcoded secrets. No placeholder secrets (e.g., `sk_xxx`).
*   [ ] **Sanitization**: External inputs defensively wrapped in `try/catch` or Safe Type Wrappers.
*   [ ] **Least Privilege**: Component asks for minimum necessary permissions/tokens.
*   [ ] **Honest Feedback**: Agent challenged the User if the request violated architecture/security.

## 🔵 Gate 5: PERFORMANCE & LOGIC (Hiệu năng)
*   [ ] **No N+1 Queries**: Database calls are optimized as per `database-rules.md`.
*   [ ] **UI Optimization**: Memoization (`useMemo`, `useCallback`) used for expensive renders.
*   [ ] **WCAG Accessibility**: Semantic HTML used. All icons have `aria-label`.

## 🔵 Gate 6: i18n & REPO INTEGRITY (Quốc tế hóa)
*   [ ] **No Hardcoding**: 0% hardcoded Vietnamese/English strings in UI.
*   [ ] **Identity Guard**: Verified `git config user.email` matches project standards.

## 🚫 ANTI-PATTERNS (Blockers)
- `findMany()` without `workspaceId`.
- `delete()` (Hard Delete).
- `reasoningPath: null` for AI actions.
- `dataSource` missing for seed data.
- Documentation claiming non-existent code.

---

### 📋 QUALITY GATE REPORT TEMPLATE (v4.2 Protocol)
```text
✅ HUY QUALITY GATE REPORT — [MODULE_NAME]
1. Syntax & Standards (Linter/Clean)            : [✅ Pass / ❌ Fail]
2. Test & Reliability (GT Cases/TDD)            : [✅ Pass / ❌ Fail]
3. Architecture (Workspace Guard/Soft Delete)   : [✅ Pass / ❌ Fail]
4. Security (AES-256/Ownership)                 : [✅ Pass / ❌ Fail]
5. Learning Integrity (ReasoningPath/Audit)     : [✅ Pass / ❌ Fail]
6. i18n & Integrity (Currency/Hardcode)         : [✅ Pass / ❌ Fail]

CONCLUSION: Ready to Merge 🟢 / Reject 🔴
```
