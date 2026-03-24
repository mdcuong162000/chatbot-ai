# 🔌 API CONTRACTS — $PROJECT_NAME

> File này ghi lại cấu trúc API đã được thống nhất giữa các thành viên trong team.
> Mỗi contract cần ghi rõ: **Platform, Endpoint, Request, Response, Notes**.

---

## FORMAT GHI API CONTRACT

```
## [API-XXX] Tên endpoint
**Platform:** Meta Ads / TikTok Ads / Google Ads / Internal
**Ngày thống nhất:** YYYY-MM-DD
**Người định nghĩa:** [Tên Architect]
**Trạng thái:** Đã dùng / Draft / Deprecated

### Endpoint
METHOD /path/to/endpoint

### Request
Headers:
  Authorization: Bearer ${process.env.PLATFORM_ACCESS_TOKEN}
  Content-Type: application/json

Query Params / Body:
{
  "field": "type" // mô tả
}

### Response thành công (200)
{
  "data": [...],
  "meta": { "total": 0 }
}

### Response lỗi
{
  "error": { "code": 0, "message": "string" }
}

### Notes
- [Lưu ý đặc biệt, rate limit, quirks của API này]
```

---

## THÔNG TIN CHUNG CÁC PLATFORM

### Meta Ads API
- Base URL: `https://graph.facebook.com/v19.0`
- Auth: OAuth 2.0 Access Token
- Rate limit: 200 calls/hour per ad account
- Currency: Trả về đơn vị **cent** (USD) → chia 100 để ra USD

### TikTok Ads API
- Base URL: `https://business-api.tiktok.com/open_api/v1.3`
- Auth: Access Token trong header `Access-Token`
- Rate limit: 1000 records/request → cần pagination
- Date format: `YYYY-MM-DD`

### Google Ads API
- Base URL: `https://googleads.googleapis.com`
- Auth: OAuth 2.0 + Developer Token
- Query language: GAQL (Google Ads Query Language)
- Currency: Micros (1,000,000 micros = 1 USD)

---

<!-- Ghi các API contract cụ thể bên dưới theo format trên -->

---

## Template khi thêm API mới (BẮT BUỘC)

> 📌 Mọi API tích hợp mới **phải** điền template này trước khi Developer bắt đầu code.
> Architect chịu trách nhiệm điền và xác nhận tại CHECKPOINT 2.

```
## [API-XXX] Tên API / Provider
**Platform:** [Meta Ads / TikTok Ads / Google Ads / Third-party]
**Ngày định nghĩa:** YYYY-MM-DD
**Architect:** [Tên người định nghĩa]
**Môi trường:** process.env.[TÊN_BIẾN]

### Endpoint
METHOD https://api.example.com/endpoint

### Request
Headers:
  Authorization: Bearer ${process.env.API_TOKEN}
  Content-Type: application/json

Params:
  start_date: YYYY-MM-DD
  end_date:   YYYY-MM-DD

### Response gốc từ API (raw)
{
  "data": [{ "field": "raw value từ provider" }]
}

### Response sau normalize (format chuẩn — component dùng cái này)
{
  id: string
  spend: number       // luôn là USD, đã convert
  impressions: number
  clicks: number
  ctr: number         // đã tính sẵn
  cpm: number         // đã tính sẵn
  platform: 'meta' | 'tiktok' | 'google'
}

### Hàm normalize
src/lib/api/normalize.ts → normalizeXxx(raw: RawType): NormalizedType

### Error cases phải xử lý
| HTTP Code | Ý nghĩa | Xử lý |
|---|---|---|
| 401 | Token hết hạn | Thông báo user "Phiên đăng nhập hết hạn" |
| 429 | Rate limit | Retry tự động sau 60 giây, hiển thị countdown |
| 500 | Server lỗi | Thông báo user + log lỗi vào console |
| Timeout > 30s | Quá thời gian | Hủy request + thông báo "Vui lòng thử lại" |
| Data sai format | Normalize fail | Trả về empty state, log warning |
```
