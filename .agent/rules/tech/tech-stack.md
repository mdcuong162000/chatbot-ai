# ⚙️ RULES: FIXED TECH STACK

## Allowed Stack

| Category | Library / Technology | Version |
|---|---|---|
| **Framework** | Next.js | 14 (App Router) |
| **Language** | TypeScript | Strict mode |
| **Styling** | Tailwind CSS | Latest |
| **UI Components** | shadcn/ui | Latest |
| **Charts** | Recharts | Latest |
| **State Management** | Zustand | Latest |
| **HTTP Client** | Axios | Latest |
| **Form** | React Hook Form | Latest |
| **Validation** | **Zod** (Mandatory for API) | Latest [RULE-B4] |
| **Date** | date-fns | Latest |

## Usage Rules

### ❌ DO NOT use libraries outside the list

```
❌ Axios → SWR is not in the list
❌ Recharts → Chart.js is not in the list  
❌ shadcn/ui → Ant Design/MUI is not in the list
❌ Tailwind → CSS-in-JS (styled-components, emotion) do not use
```

### ✅ TypeScript Strict Rules

```typescript
// ❌ WRONG — do not use any
const data: any = await fetchData()

// ✅ CORRECT — strictly define type
interface CampaignData {
  id: string
  name: string
  spend: number
  impressions: number
  clicks: number
}
const data: CampaignData = await fetchData()
```

### ✅ Axios Rules (do not use fetch directly for API calls)

```typescript
// ❌ WRONG
const res = await fetch('/api/meta/campaigns')

// ✅ CORRECT
import axios from 'axios'
const { data } = await axios.get<CampaignData[]>('/api/meta/campaigns')
```

### ✅ Zustand Rules (state management)

```typescript
// Only use Zustand for global state
// Local UI state → useState is enough
// Server state → React Query (if added to stack)
```

### ✅ shadcn/ui Rules

```typescript
// Prioritize using component from shadcn/ui before creating your own
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
```

## When needing to add a new library

1. **Propose** to Manager: library name + reason needed
2. **Manager confirms** → update this file
3. **After approval** then `npm install` is allowed

> ❌ **Do not**: Add libraries on your own not in the list
> ✅ **Must do**: Propose → wait for approval → then use

---

## Git Branch Rules (MANDATORY)

> 📌 **Details at:** `.agent/rules/quick-ref.md` (Short version).
> Summary: Create branch `feat/` or `fix/` → Code pass 100% `npm test` → Then merge `main`.

## 👮 Ownership Management (CODEOWNERS) [NEW]
The system uses `.github/CODEOWNERS` file for PR review:
- Any PR impacting a file requires Approval from that person/group.
- **Architect** rules the `/.agent/` and `/src/lib/` tiers.
- **FrontendTeam** rules `/src/components/` and `/src/app/`.

---

## Shared State Rules (MANDATORY)

> 📌 **Lesson from reality**: Race condition from shared state causes app crash when there are concurrent requests.

| Rule | Details |
|---|---|
| ✅ Init with default value | Use `[]` instead of `undefined`, `{}` instead of `null` |
| ✅ Add loading lock | `if (isLoading) return` — block new requests while processing |
| ✅ No concurrent requests | Disable UI while processing, re-enable after done |
| ❌ No direct mutate state | Always use setter from useState / Zustand |

### Correct Example:

```typescript
// ❌ WRONG — undefined causes crash when calling .map()
const [results, setResults] = useState<Result[]>()

// ✅ CORRECT — init with default value
const [results, setResults] = useState<Result[]>([])
const [isLoading, setIsLoading] = useState(false)

async function fetchData() {
  if (isLoading) return // loading lock — block concurrent request
  setIsLoading(true)
  try {
    const data = await api.fetch()
    setResults(data)
  } catch (err) {
    setError(err)
  } finally {
    setIsLoading(false) // always unlock whether success or fail
  }
}
```
