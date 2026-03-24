# 📚 BÀI HỌC KINH NGHIỆM — $PROJECT_NAME

> File này ghi lại các lỗi đã gặp và bài học rút ra để tránh lặp lại.
> Mỗi bài học cần ghi rõ: **Ngày, Vấn đề, Nguyên nhân, Giải pháp, Phòng tránh**.

---

## FORMAT GHI BÀI HỌC

```
## [LL-XXX] Tiêu đề bài học
**Tags:** #Tag1 #Tag2
**Ngày:** YYYY-MM-DD
**Người gặp:** [Tên / Vai trò]
**Platform liên quan:** [Meta / TikTok / Google / Chung]

### Vấn đề gặp phải
[Mô tả lỗi hoặc tình huống xảy ra]

### Nguyên nhân gốc rễ
[Tại sao lỗi xảy ra]

### Giải pháp đã áp dụng
[Cách đã fix]

### Cách phòng tránh trong tương lai
[Rule hoặc checklist cần thêm]

**Mức độ ảnh hưởng:** 🔴 Cao / 🟡 Trung / 🟢 Thấp
```

---

<!-- Ghi các bài học kinh nghiệm bên dưới theo format trên -->

---

## [LL-001] Bug Mức 2: Output format không đồng nhất giữa các API
**Tags:** #API #Normalize #Backend
**Ngày:** 2026-03-21
**Người gặp:** Developer
**Platform liên quan:** Chung (áp dụng cho mọi tính năng tích hợp nhiều API)

### Vấn đề gặp phải
Tích hợp 2 provider cùng loại (DALL-E và Stable Diffusion) nhưng trả về format khác nhau:
- DALL-E → trả `{ url: "https://..." }`
- Stable Diffusion → trả `{ b64_json: "base64string..." }`

Component phải tự xử lý 2 format → code phức tạp, khó test, dễ lỗi.

### Nguyên nhân gốc rễ
Không có lớp normalize/transform. Component trực tiếp nhận raw output từ API.

### Giải pháp đã áp dụng
Tạo hàm `normalizeOutput()` trong service layer. Component chỉ nhận format đã chuẩn hóa.

### Cách phòng tránh trong tương lai
- Architect **bắt buộc** định nghĩa format chuẩn hóa trước khi Developer code
- Mọi API integration phải có `normalize.ts` trong service layer
- Component không được nhận raw API output trực tiếp
- Ghi format normalize vào `api-contracts.md`

**Mức độ ảnh hưởng:** 🟠 Trung (Bug Mức 2 — logic sai)

---

## [LL-002] Bug Mức 3: Race condition trong shared state khi concurrent requests
**Tags:** #State #Async #RaceCondition
**Ngày:** 2026-03-21
**Người gặp:** Developer + Tester
**Platform liên quan:** Chung (áp dụng cho mọi tính năng có async operation)

### Vấn đề gặp phải
5 user gửi request đồng thời → state bị corrupt → `map()` gọi trên `undefined` → app crash toàn bộ.

### Nguyên nhân gốc rễ
- State khởi tạo là `undefined` thay vì `[]`
- Không có loading lock → nhiều request chạy song song cùng lúc modify state

### Giải pháp đã áp dụng
- `useState<Result[]>([])` — luôn khởi tạo với giá trị mặc định
- Thêm `if (isLoading) return` — loading lock ngăn concurrent requests
- `finally { setIsLoading(false) }` — luôn unlock dù thành công hay thất bại

### Cách phòng tránh trong tương lai
- **Checklist**: Test 5 request đồng thời với mọi tính năng async
- **Rule**: State luôn khởi tạo với giá trị mặc định (`[]`, `{}`, `0`, `''`)
- **Rule**: Mọi async operation phải có loading lock
- Tester phải test concurrent scenario ngay từ đầu, không để đến cuối

**Mức độ ảnh hưởng:** 🔴 Cao (Bug Mức 3 — app crash)

---

## [LL-003] Bài học về quy trình — Code trực tiếp trên main
**Tags:** #Git #Process #Main
**Ngày:** 2026-03-21
**Người gặp:** Developer
**Platform liên quan:** Chung

### Vấn đề gặp phải
Developer code và push trực tiếp trên branch main → khi có lỗi, không thể rollback dễ dàng.

### Giải pháp đã áp dụng
Quy tắc branch bắt buộc: `feat/*` và `fix/*`, không bao giờ code trực tiếp trên `main`.

Xem `.agent/rules/tech-stack.md` phần "Quy tắc Git Branch".

**Mức độ ảnh hưởng:** 🟡 Trung (rủi ro rollback khó)

---

## [LL-004] Lỗi Layout UI & Lỗi Push Github (Kaizen Demo)
**Tags:** #UI #Tailwind #Git #Flexwrap
**Ngày:** 2026-03-22
**Người gặp:** Developer & AI Agent
**Platform liên quan:** Màn hình Dashboard ngang

### Vấn đề gặp phải
1. Khi bo hẹp màn hình hoặc có quá nhiều selector, các filter bị rớt dòng lộn xộn, giãn cách không đều.
2. Lúc Agent cố gắng override force push code lên repo Github, bị báo lỗi 403 (Permission denied) do credential bị chặn.

### Nguyên nhân gốc rễ
1. Sử dụng `flex` chung trên một hàng nhưng không có thuộc tính ngắt dòng chủ động `flex-wrap` hoặcchia flex con hợp lý trong Tailwind.
2. AI tự ý gọi lệnh force push mà quên check quyền truy cập hệ thống của User Auth Token.

### Giải pháp đã áp dụng
1. Thêm `flex-wrap` và gộp nhóm trái/phải rõ ràng.
2. Chuyển sang nhắc nhở User tự push thay vì AI chạy lệnh push thẳng.

### Cách phòng tránh trong tương lai
- Code giao diện Responsive: Luôn thêm `flex-wrap` vào thanh điều hướng chứa Element động.
- Git operation: TUYỆT ĐỐI không gọi lệnh push tự động trừ khi có script verify credentials trước hoặc PO ra lệnh cấp quyền `/hoan-thanh-va-up-git`.

**Mức độ ảnh hưởng:** 🟡 Trung

---

## [LL-005] Bài học từ PM Report — Khoảng cách giữa Tài liệu và Code (Marketing OS v4.1)
**Tags:** #MultiTenancy #SoftDelete #GroundTruth #Documentation #Architecture
**Ngày:** 2026-03-24
**Người gặp:** Huy (AI Agent) + PM Review
**Platform liên quan:** Toàn hệ thống Marketing OS

### Vấn đề gặp phải
PM Report phát hiện 18 lỗi nghiêm trọng (Blockers & Bugs) trong khi tài liệu mô tả hệ thống như "Production-Ready":
1. **BUG-01**: `prisma.aPISettings` không tồn tại → crash toàn bộ creative.js.
2. **BUG-02**: `MOCK_CREATIVES` là biến global mutable → rò rỉ dữ liệu giữa users.
3. **BUG-03**: `/automation/logs` fetch toàn bộ DB, không có `workspaceId` filter.
4. **BUG-04**: `CreativeAsset` thiếu `workspaceId` → vi phạm multi-tenancy cốt lõi.
5. **DESIGN-06**: `types.ts AIModel` chỉ có Gemini → frontend crash khi nhận GPT/Claude.

### Nguyên nhân gốc rễ
- Tài liệu được viết trước khi code, rồi không được cập nhật khi code thay đổi.
- Không có Ground Truth Test Battery → lỗi logic lẫn schema không bị phát hiện sớm.
- Tư duy "Marketing-first, Engineering-second" → bề ngoài hoàn hảo, bên trong mong manh.

### Giải pháp đã áp dụng
- Nạp `CONTRIBUTING.md` vào bộ não (v4.2 Protocol-Driven).
- Refactor `creative.js`, `automation.js` theo Workspace Guard.
- Chuẩn hóa mã lỗi `{code, message}` toàn hệ thống (Rule B3).
- Thêm `workspaceId`, `currency`, `deletedAt` vào Prisma Schema.
- Tạo Ground Truth Battery cho Decision Engine.

### Cách phòng tránh trong tương lai
- **Rule bất biến**: Không có Ground Truth Cases → không được viết code AI Logic.
- **ANTI-PATTERN**: `findMany()` không có `workspaceId` là lỗi Level 3 (Critical).
- **Quy trình**: Mọi tính năng mới phải chạy qua 6 Quality Gates (v4.2 Protocol) trước khi merge.
- **Docs-as-Code**: Tài liệu phải được update song song với code, không phải sau khi xong.

**Mức độ ảnh hưởng:** 🔴 Cao (18 lỗi, hệ thống không thể lên Production)
