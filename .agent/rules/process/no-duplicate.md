# 🔍 RULE: NO CODE DUPLICATION

## Principle

Before creating any new component, function, hook, or utility — **ALWAYS** search in the codebase to see if it already exists.

## Pre-creation checking process

```bash
# Find component by name
find src/components -name "*[ComponentName]*" 2>/dev/null

# Find function/hook by name
grep -rn "export function [functionName]\|export const [functionName]" src/ \
  --include="*.ts" --include="*.tsx"

# Find by functionality (keyword)
grep -rn "[related keyword]" src/ --include="*.ts" --include="*.tsx" | head -10
```

## Decision after searching

| Result | Action |
|---|---|
| ✅ Exists, usable | **Reuse** — import and use directly |
| ⚠️ Exists but slightly different | **Extend** — add props/params, don't create copy |
| ❌ Doesn't exist | **Create new** — place in correct location per project structure |

## Specific rules

### Components
- Place at `src/components/ui/` if shared
- Place at `src/components/meta/`, `/tiktok/`, `/google/` if domain-specific
- **Do not** create inline component in page file if used > 1 time

### Hooks
- Place at `src/hooks/`
- Naming: `use[FeatureName].ts` (example: `useMetaCampaigns.ts`)
- **Do not** write fetch logic directly inside component

### Utilities & Helpers
- Place at `src/lib/utils/`
- Place at `src/lib/api/` for API calls
- **Do not** copy-paste KPI calculation logic into multiple files

### Shared Assets
- Colors, fonts, spacing → use Tailwind config
- Icons → use from `lucide-react` or chosen library
- **Do not** create inline SVGs when an icon library is available

## Right / Wrong Examples

```typescript
// ❌ WRONG — recreate existing logic
function calculateCTR(clicks: number, impressions: number) {
  return impressions > 0 ? (clicks / impressions) * 100 : 0
}

// ✅ CORRECT — import from shared utils
import { calculateCTR } from '@/lib/utils/metrics'
```

```tsx
// ❌ WRONG — create new inline loading spinner
const MyComponent = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
)

// ✅ CORRECT — use Skeleton component provided by shadcn/ui
import { Skeleton } from '@/components/ui/skeleton'
```

> ❌ **Do not**: Create new when one already exists
> ✅ **Must do**: Search first → reuse or extend

---

## When integrating multiple APIs of the same type

> 📌 **Lesson from reality**: Multiple APIs with the same function but different output formats will make components messy and hard to test.

**MANDATORY RULE:**
- **ALWAYS** create a `transform` / `normalize` layer in the service layer
- Component **MUST NOT** handle different formats from APIs
- It is the responsibility of the **service layer**, not the component

### Standard Example:

```typescript
// ❌ WRONG — Component itself handles multiple formats
const ImageDisplay = ({ result }) => {
  const src = result.url          // DALL-E returns URL
    ?? `data:image/png;base64,${result.b64_json}` // SD returns base64
  return <img src={src} />
}

// ✅ CORRECT — Normalize in service layer
// src/lib/api/imageService.ts
interface NormalizedImageOutput {
  imageUrl: string   // always URL, regardless of what API returns
  provider: 'dalle' | 'stable-diffusion'
}

function normalizeOutput(raw: DalleResponse | SDResponse): NormalizedImageOutput {
  if ('url' in raw) return { imageUrl: raw.url, provider: 'dalle' }
  return { imageUrl: toDataUrl(raw.b64_json), provider: 'stable-diffusion' }
}

// Component only receives normalized format
const ImageDisplay = ({ imageUrl }: NormalizedImageOutput) => (
  <img src={imageUrl} />
)
```

### Application in Current Project System:

```typescript
// src/lib/api/normalize.ts
// Normalize spend from platforms to USD
function normalizeSpend(raw: number, platform: Platform): number {
  if (platform === 'meta') return raw / 100        // cent → USD
  if (platform === 'google') return raw / 1_000_000 // micros → USD
  return raw                                        // tiktok already USD
}
```
