# 📋 RULES: COMMAND TEMPLATES

Standardized commands to be used when assigning tasks between roles.

## 🏗️ COMMAND FOR ARCHITECT
1. Review current architecture in `/src` and assess impact.
2. Design data flow: Source API → Transform → Store → UI.
3. Propose new components/modules to create or modify.
4. Define interface/type for related data.
5. If new API is needed: define endpoint, response schema.
6. Log architecture decisions in `docs/architecture.md`.
7. Estimate complexity (Low / Medium / High).
8. 🛡️ **KAIZEN: PRE-MORTEM (CRITIQUE):** List "What is the biggest weakness of this architecture?" and "Fallback Plan".

## 👨‍💻 COMMAND FOR DEVELOPER
Implement feature according to Architect's design:
1. **[Backend]** If new API is needed: Create route/handler, connect data source, handle auth/rate limit/errors.
2. **[Frontend]** Create component in `src/components` or `src/pages`, use Architect's types, integrate Recharts/shadcn.
3. **[State/Data]** Update store/hooks, handle loading/error/empty states.
4. Ensure responsiveness (Desktop/Tablet).
5. Use Feature Flags (`NEXT_PUBLIC_FF_`).
6. No hardcoding. Comment complex logic in Vietnamese.

## 🧪 COMMAND FOR TESTER
Test feature: `$ARGUMENTS`
1. Check data correctness for each platform (Meta/TikTok/Google).
2. Test date range filtering logic.
3. Test Empty/Error/Loading states.
4. Verify metric calculations (CTR, CPC, CPM, ROAS).
5. Cross-browser check (Chrome/Safari).
6. Report bugs by severity (Level 1/2/3).
