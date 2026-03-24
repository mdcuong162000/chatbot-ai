# 📋 RULES: ANALYSIS & BUSINESS LOGIC

## 🎯 User Story Standards
Format: "As a [role], I want [feature] so that [business goal]."
- Must be specific and measurable.
- Must avoid technical jargon.

## 📊 KPI Formulas
- **CTR**: `(Clicks / Impressions) * 100` (Handle division by 0)
- **CPC**: `Spend / Clicks`
- **CPM**: `(Spend / Impressions) * 1000`
- **ROAS**: `Revenue / Spend`
- **CPA**: `Spend / Conversions`

## ✅ Acceptance Criteria (BDD)
Use **Given-When-Then** format for all scenarios.
- Include at least one Level 2/3 error handling scenario.
- Define "Happy Path" and "Edge Case" clearly.
