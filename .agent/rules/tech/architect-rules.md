# 🏗️ RULES: ARCHITECTURAL DESIGN

## Impact Analysis Template

For every task, the Architect must analyze the scope of changes:

- **CREATE**: New components, hooks, api-services, types.
- **MODIFY**: Existing infrastructure, shared components, constants.
- **UNAFFECTED**: Modules that are safely decoupled.

## 🏛️ Architecture Design Principles
- **DRY (Don't Repeat Yourself)**: Reuse components and utility functions.
- **KISS (Keep It Simple, Stupid)**: Avoid over-engineering. Use standard solutions first.
- **SoC (Separation of Concerns)**: Keep UI separate from business logic (hooks) and API logic.
- **Consistency**: Follow existing folder structure and naming conventions.

## 🛠️ Technology Selection Rules
- **Framework**: Next.js 14 (App Router).
- **State Management**: Zustand (Global), React Query (Server state).
- **Styling**: Tailwind CSS + shadcn/ui.
- **Testing**: Vitest for Logic, Playwright for E2E (if needed).

## AI Checkpoint 2 (Architect Self-Check)

Architect must verify all points before requesting review:

- [ ] TypeScript Interfaces fully defined (field name, type, optionality).
- [ ] Multiple API normalization/transformation present if needed.
- [ ] Division-by-zero edge cases handled in KPI formulas.
- [ ] **Dependency Injection**: Classes cannot `new` objects directly.
- [ ] **Composition over Inheritance**: Favor composite services/hooks.
- [ ] Checked codebase to avoid duplicate files/functions.
- [ ] Technical decisions logged in `knowledge/decisions.md` (ADR format).
- [ ] Adherence to SOLID, KISS, YAGNI.
- [ ] Interfaces + error cases logged in `knowledge/api-contracts.md`.

## Normalized API Contracts

- **Normalized output**: Components must only receive 1 standard format.
- **Service per API**: Separate files for Meta, TikTok, Google.
- **Currency/Metrics**: Always convert cents/micros to USD and calculate KPIs in the service layer.
