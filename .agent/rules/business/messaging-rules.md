# 📱 BUSINESS RULES: MESSAGING HUB (Node 7)

These rules define the authority and logic limits for the Messaging Hub Agents (FAQ, Order, Complaint, Purchase).

## 1. AUTHORITY LIMITS (Bất biến)
- **Refunds**: AI can only auto-refund up to **500,000 VND**.
- **Cancellations**: Orders can only be cancelled within **120 minutes** of creation.
- **Follow-ups**: Reminder for payment/completion should trigger after **30 minutes**.
- **Human Escalation**: Must escalate if:
  - Refund > 500,000 VND.
  - Legal/Threatening language detected.
  - Same issue contacted ≥ 3 times.
  - User explicitly asks for a human ("Cho gặp người thật").

## 2. INTENT PRIORITY (Thứ tự ưu tiên)
If multiple intents are detected, follow this sequence:
`COMPLAINT` > `PURCHASE` > `ORDER` > `FAQ`

## 3. RESPONSE QUALITY (Self-QA Gate)
- **Score ≥ 80**: Send immediately.
- **Score 60-79**: Rewrite once then send.
- **Score < 60**: Escalate to Human review.

## 4. NORMALIZATION RULES (Tiếng Việt)
- **Abbreviations**: "k" → "không", "đc" → "được", "vs" → "với".
- **Typos**: "zậy" → "vậy", "wa" → "qua", "hx" → "hôm nay".

---

*Rule source: MESSAGING_HUB.md Part 2 (Cấu hình sản phẩm & Cấu hình luồng)*
