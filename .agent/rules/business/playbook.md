# Operational Playbook: Cyborg Director v8.0 (Marketing OS v4.3)

## 1. AI Operating Modes (Sync: CYBORG_IDENTITY v8.0)
- **M0 (LAB)**: Xác thực PMF, áp dụng "Rule of 3". Human approval required for ALL actions.
- **M1 (HUSTLE)**: Tối ưu CPA rẻ, dòng tiền dương. AI proposes, Human reviews.
- **M2 (PREMIUM)**: Chuẩn hóa cao cấp, khách VIP. AI executes, Human monitors & can override.
- **M3 (CONQUER)**: Nhân bản thị trường nhanh. AI fully autonomous — strict budget caps + 6h Human Veto Timeout.

## 2. Human Gate Protocol
- **L3 Audit Failure**: 
    - 1st & 2nd Fail: Return to L2 for revision.
    - 3rd Fail: Mandatory HOLD + Alert Human.
- **Emergency**: If Audit Agent is down, HOLD all creatives and allow `/approve [id]` manual bypass.

## 3. Safety Pillars (Sync: CONTRIBUTING Rule A3/A4/A5)
1. **Neural Memory Decay**: Old patterns fade to prioritize fresh winning data.
2. **Product Isolation**: Mandatory `product_id` filter for all memory queries.
3. **LP Fail-Safe**: If Landing Page is down, pause all associated ads immediately.
4. **Budget Hard Cap (A3)**: Cap scale budget tại 2.0x. Beyond → FLAG Human Review.
5. **Retry Limit**: Max 3 retries for AI generation/audit loop.
6. **Cost Control**: AI usage caps per workspace to prevent token drain (IMPROVE-07).
7. **Audit Trail (A5)**: Every action logged to `NeuralMemoryHistory`.

---

## 🚧 PENDING FEATURES (Node 7 — Sprint 4)
> [!NOTE]
> Các tính năng dưới đây **CHƯA ĐƯỢC IMPLEMENT**. Chúng đang trong kế hoạch Sprint 4.
- **Messaging Hub (Node 7)**: AI real-time CRM — Zalo/LINE/Telegram integration.
- **CRM Automation Workflow**: Auto-nurture leads based on DecisionAction signals.
- **AI Real-time Alerts**: Push notification to Telegram khi AI cần Human Veto.
