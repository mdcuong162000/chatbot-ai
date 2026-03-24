# 🏗️ BLUEPRINT: MARKETING OS ARCHITECTURE (V4.3)

Bản vẽ kiến trúc này được tối ưu cho các hệ thống Marketing Automation có tích hợp AI, hỗ trợ đa nền tảng (Facebook, Instagram, LINE, Zalo).

## 1. Cấu trúc Monorepo (Turborepo)
Sử dụng **npm workspaces** để chia nhỏ các component, đảm bảo tính đóng gói (encapsulation).

```
/ (Root)
├── apps/
│   ├── web/           # Next.js 14 App Router (Frontend + Client-side logic)
│   └── api/           # Node.js/Express (Webhook Gateway + AI Workers)
├── packages/
│   ├── database/      # Prisma ORM + Client singleton (PostgreSQL)
│   ├── ui/            # UI Component Library (shadcn/ui + Tailwind)
│   ├── shared/        # Types, Helpers, Constants dùng chung
│   └── ai/            # Cyborg Director v8.0 DNA Blueprint

## 1. System Architecture (6 Layers)
- **L0: Infrastructure**: PostgreSQL, Redis, Monorepo.
- **L1: Intelligence**: Strategy Brain (Gemini 1.5 Pro) + Neural Memory (Pinecone).
- **L2: Production**: Lego Hub Multi-Agent (Hook, Body, Visual).
- **L3: Defense**: Brand Lock Audit Agent (GPT-4o-mini).
- **L4: Conversion**: Ads Manager API + LP Auditor + Chameleon Chatbot.
- **L5: Decision**: Decision Engine (Pivot/Scale/Kill).

## 2. Data Flow & Security
- **Neural Memory Isolation**: Every query MUST include a `product_id` metadata filter. No cross-product data contamination.
- **Brand Lock Protocol**: Mandatory checkpoint at L3. Failures trigger revision or HOLD.
- **LP Sensing**: Real-time Playwright auditor for landing page health.

## 3. Feedback Loops
- **Winning Patterns**: Successful conversions are vectorized and stored in L1.
- **Decay Mechanism**: CRON job lowers the `certaintyScore` of old patterns to keep the brain "fresh".
├── turbo.json         # Pipeline điều phối build/test/lint
└── package.json       # Định nghĩa workspaces
```

## 2. Frontend Architecture: Feature-Sliced Design (FSD)
Chia code theo **Features** thay vì chỉ theo loại file. Mỗi Feature là một module độc lập.

```
/apps/web/src/
├── app/               # Next.js Route Handlers & Layouts
├── features/          # Core logic (e.g., campaigns, dashboard, settings)
│   └── settings/      # Mỗi feature chứa: ui/, api/, model/
├── entities/          # Business logic (e.g., campaign-card, user-profile)
├── shared/            # Common UI (button, input), api hooks, utils
└── providers/         # React context, QueryClient, Theme
```

## 3. Database & Migration Strategy (Prisma + Postgres)
- **Tool:** `Prisma Migrate`.
- **Primary DB:** PostgreSQL (Khuyến nghị Supabase để có sẵn Auth & Vector DB).
- **Core Models:**
    - `PlatformConnection`: Lưu trữ Token API đa nền tảng (Unique: platform + accountId).
    - `BrandVoice`: Lưu trữ giọng điệu thương hiệu cho AI.
    - `AutomationRule`: Các quy tắc If-Then để AI tự động thực thi.
    - `AIUsage`: Theo dõi ngân sách Token AI (Budget Cap).

## 4. AI & Automation Flow (Bọc thép)
- **Webhook Gateway:** Nhận signal real-time thay vì chỉ quét (polling).
- **Safety Nets:** 
    - Chỉ cho phép AI `PAUSE` (không `DELETE`).
    - Gửi alert qua Telegram/Slack trước khi thực thi lệnh tự động quan trọng.
- **Cache strategy:** Sử dụng Redis cho các dữ liệu KPI (TTL 15-30m) để giảm tải cho DB & Meta API.

## 5. Deployment Recommendation
- **Frontend & API:** Vercel hoặc Docker (Coolify).
- **Database:** Supabase (PostgreSQL).
- **Cache:** Upstash (Serverless Redis).
- **Automation Pipeline:** GitHub Actions để chạy `prisma migrate deploy` khi merge vào `main`.

---
**Đây là bộ khung "vàng" giúp PO có thể clone và khởi tạo các dự án Marketing Dashboard mới cực kỳ nhanh chóng.**
