# 🏛️ PROJECT STRUCTURE RULES

> **PURPOSE:** Dictate the directory structure that EVERY LLM MODEL / AI AGENT is strictly required to follow when designing or coding in this project. 
> Goal to reach "Enterprise Scale Project" standard > 40,000 lines of code.

## Architecture: Feature-Sliced Design (FSD)

It is absolutely forbidden to bundle everything into the 4 traditional folders (`/components`, `/hooks`, `/types`, `/api`). When a feature grows, it must be gathered into an Independent Module.

Project is divided into 3 main Layers:

### 1. Application Layer (`app` layer)
Contains only Routing and general Layout (Next.js App Router).
- `src/app/page.tsx`: Frame to attach features. Absolutely DO NOT code logical UI attached to this.

### 2. Feature Layer (`features/` layer)
When designing a major Component (Example: Dashboard, Auth, Cart, Checkout...), CREATE a separate folder for it within `src/features/`.
Each Feature Folder will have an autonomous structure exactly like a mini App:
```
src/features/dashboard/
├── ui/              # Static UI Components (forbidden to fetch API here)
├── model/           # State Management (Zustand) and Custom Hooks
├── api/             # Call Fetch to get JSON
└── types.ts         # Own type interfaces of this feature.
```

### 3. Shared Layer (`shared/` layer)
Things used over and over across ALL features:
- `src/shared/ui/`: Buttons, Tables, Alerts.
- `src/shared/lib/`: Money formatting functions (currency.ts), Time formatting, DB config.

## PROHIBITED RULES (ZERO-DEFECT BOUNDARIES)
- ❌ **Prohibit Cross-import Feature:** Feature `Cart` absolutely MUST NOT REACH OUT TO IMPORT FUNCTIONS FROM Feature `Auth`. Only importing from `shared/` is allowed.
- ❌ **Prohibit God Component:** No single UI `.tsx` file is allowed to exceed 200 lines. If it exceeds, it must be split into sub-components located in the `ui/` folder of that feature.
- ❌ **Prohibit Logic in UI:** Complex `useEffect`, `useState` are forbidden to be placed in UI views. Stuff them into Custom `useHook.ts` inside the `model/` folder.
