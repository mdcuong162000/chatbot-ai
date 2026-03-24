# 🎨 WORKFLOW: UI DESIGN

## Description
> 📍 **Step 3/8** in the pipeline: `/phan-tich` → **`/thiet-ke-ui`** (parallel) → [CP1] → `/thiet-ke-ky-thuat`

UI Design workflow for **$PROJECT_NAME** before the Developer starts coding.

**Input parameter:** `$ARGUMENTS` — Feature or screen name to design UI for

---

## ❌ DO NOT (Designer)
- Define data structures or TypeScript interfaces
- Check/select API endpoints (Architect's job)
- Write implementation code (Developer's job)
- Design before the BA has Acceptance Criteria ready

---

## EXECUTION STEPS

### Step 1 — Identify the screen to design

From the `$ARGUMENTS` request, determine:
- Is this a new page or a component in an existing page?
- Who is the main user? (Marketer / Manager / C-level)
- Priority device: Desktop (1280px+) or Mobile inclusive?

### Step 2 — Draft the layout

Describe the screen layout using a text wireframe:

```
┌─────────────────────────────────────────────┐
│  HEADER: Page Name + Date range filter       │
├──────────┬──────────┬───────────────────────┤
│ Widget 1 │ Widget 2 │ Widget 3               │
│ (KPI)    │ (KPI)    │ (KPI)                  │
├──────────┴──────────┴───────────────────────┤
│                                              │
│  MAIN CHART (trend over time)               │
│                                              │
├─────────────────────────────────────────────┤
│  TABLE: Campaign details                     │
└─────────────────────────────────────────────┘
```

### Step 3 — Define Design Tokens

Apply the correct colors and typography according to the project:

```
Platform Colors:
- Meta Ads   : #1877F2 (Facebook blue)
- TikTok Ads : #010101 / #FE2C55 (TikTok black/red)
- Google Ads : #4285F4 (Google blue)

Status Colors:
- Good / Increase : #22c55e (green-500)
- Bad / Decrease  : #ef4444 (red-500)
- Neutral         : #94a3b8 (slate-400)

Font: Inter (from Google Fonts)
Border radius: rounded-lg (8px)
Shadow: shadow-sm for cards
```

### Step 4 — Identify Required Components

List the `shadcn/ui` and `Recharts` components to be used:

```
shadcn/ui:
- Card, CardHeader, CardContent, CardTitle
- Skeleton (loading state)
- Badge (campaign status)
- Select (platform filter)
- DatePickerWithRange (date range)
- Table, TableHeader, TableRow, TableCell

Recharts:
- LineChart / AreaChart (trends over time)
- BarChart (platform comparison)
- PieChart / DonutChart (budget allocation)
- ResponsiveContainer (responsive)
- Tooltip, Legend, XAxis, YAxis
```

### Step 5 — Define States to handle

```
Every component MUST have all 4 states:

1. Loading State  → <Skeleton />
2. Error State    → <ErrorAlert message="..." />
3. Empty State    → <EmptyState message="No data available" />
4. Data State     → Render actual content
```

### Step 6 — Hand off design to Developer

```
🎨 UI DESIGN COMPLETE: $ARGUMENTS

Layout    : [layout description]
Components: [list of components]
Colors    : [colors used]
States    : Loading / Error / Empty / Data ✅
```

```
DONE: thiet-ke-ui [PASS]
RESULT: [number of components designed] components | Full states
NOTE: [special notes for Developer / "-"]
```

**NEXT:** `/thiet-ke-ky-thuat $ARGUMENTS`

---

## USAGE EXAMPLES

```
/thiet-ke-ui Top-level dashboard for 3 platforms

/thiet-ke-ui KPI Widget for Meta Ads campaigns

/thiet-ke-ui Weekly ROAS comparison table
```
