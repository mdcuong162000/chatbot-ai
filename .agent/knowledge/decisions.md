# 🧠 QUYẾT ĐỊNH KỸ THUẬT — $PROJECT_NAME

> File này ghi lại các quyết định kiến trúc và kỹ thuật quan trọng của dự án.
> Mỗi quyết định cần ghi rõ: **Ngày, Vấn đề, Lựa chọn, Lý do, Người quyết định**.

---

## [ADR-001] AI Operates Natively via Natural Language & Kaizen
**Ngày:** 2026-03-22
**Trạng thái:** Đã quyết định

### Bối cảnh
PO muốn nâng cấp Agent: Không cần gõ câu lệnh `/giao-viec` cứng nhắc nữa, mà AI phải tự động hiểu và vận hành quy luân chuyển Master Orchestrator từ các lệnh bình thường như khi trò chuyện. Đồng thời, app dụng 3 triết lý Tối ưu AI: Reality Pack (Data thật), Pre-mortem (Tự phản biện), và Kaizen Review (Rút kinh nghiệm cuối task).

### Quyết định
1. AI Agent mặc định sẽ kích hoạt workflow `/giao-viec` **ngầm định** ngay khi PO nhắn nội dung công việc bằng ngôn ngữ tự nhiên. PO không cần gõ slash command nữa.
2. AI Agent áp dụng 3 triết lý bảo vệ chất lượng vào gen mạc định:
   - **"Reality Pack"**: Nếu làm UI/Data, AI sẽ hỏi Socrates ép PO cung cấp data mẫu (nếu chưa có).
   - **"Pre-mortem"**: Khi thiết kế kiến trúc, Architect bắt buộc tự chỉ ra điểm yếu và Backup Plan.
   - **"Kaizen Review"**: Cuối mỗi task, AI tự lưu file `lessons-learned.md` để "nhớ đời" và khắc phục ở phiên làm việc sau.
**Người quyết định:** PO & AI Agent

---

## [ADR-002] Tối ưu hóa AI Agent Đa Nền Tảng (Universal Zero-Defect)
**Ngày:** 2026-03-22
**Trạng thái:** Đã quyết định

### Bối cảnh
PO yêu cầu thiết lập cơ bản "Bọc thép" giúp **bất kỳ AI nào** (Claude 3, GPT-4, Gemini...) khi plug-in vào source code này đều thao tác tiết kiệm Context Token mà vẫn tránh 100% các lỗi nghiêm trọng như: Mất trí nhớ cục bộ, Xung đột giữa các AI, Chém gió giải thích dài dòng, và Replace code sai dòng.

### Quyết định
Áp dụng vĩnh viễn hệ triết lý 4 bước được ghi tại `.agent/rules/agent-optimization.md` cho MỌI MÔ HÌNH LLM. Mọi Agent khi khởi động đều bị ép phải đọc file luật này.
1. **Mỏ neo (AST Anchors):** Sửa code phải bám vào tên Function.
2. **Hashtag:** Học kinh nghiệm quá khứ qua \#Tag (dùng grep) để đỡ tốn bộ nhớ.
3. **Core Sync:** Bắt buộc mở file kiến trúc/api đọc lại trước khi gõ code.
4. **Telemetry:** Chỉ đăng Status trạng thái, tắt chế độ thuyết trình.

**Người quyết định:** PO & AI Agent

---

## [ADR-003] Giữ nguyên Pipeline C0–C5, Không thêm C1.5
**Ngày:** 2026-03-24
**Trạng thái:** Đã quyết định — Giữ nguyên

### Bối cảnh
PO và AI đã review toàn bộ cấu trúc 6 tầng của Huy (C0→C5) và cân nhắc nâng cấp:
- Thêm tầng **C1.5 (Test Plan)** bắt buộc cho Core Modules (Database, Security, Money, Decision Logic)
- Cho phép "nhảy cóc" C1→C2 với UI/UX modules
- Tách C4 thành C4a (Self-review) và C4b (Git)
- Thêm escalation path vào C0 khi requirement bị blocked

### Phân tích rủi ro đã thực hiện
Sau khi phản biện, các đề xuất nâng cấp đều có vấn đề thực tế:
- **C1.5** tạo ra test cases dựa trên spec chưa stable → phải rewrite sau khi code → tốn công 2 lần
- **Tiêu chí phân loại Core/UI** sẽ bị tranh cãi ở boundary cases (ví dụ: UI component đọc financial data)
- **Tách C4** tăng overhead cho những thứ vốn được review song song
- **Escalation C0** cần cơ chế resume context mà `save-point.md` hiện tại chưa được thiết kế cho

### Quyết định
**Giữ nguyên pipeline C0–C5 hiện tại.** Không thêm C1.5, không tách C4, không thêm escalation path vào C0.

Lý do cốt lõi: Hệ thống đang chạy tốt. Chưa có bug production thực tế nào chứng minh các vấn đề trên đang gây hại. Nâng cấp lúc này là fix thứ chưa bị hỏng và có nguy cơ phá vỡ thứ đang hoạt động.

### Trigger để re-open quyết định này
Xem xét lại ADR-003 nếu xảy ra MỘT trong các trường hợp sau:
- Huy merge Core module gây bug production mà Ground Truth Battery không catch được
- Demo feature bị stuck ở "chờ test" sau khi PO đã approve quá 1 sprint
- Huy tự phân loại sai module type nhiều hơn 2 lần trong 1 sprint

**Người quyết định:** PO & AI Agent