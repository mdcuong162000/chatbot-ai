# 🚀 Mika Intelligence — Omnichannel AI Sales System

Mika Intelligence là hệ thống trợ lý bán hàng AI đa kênh, được tối ưu hóa cho thị trường Thái Lan và Việt Nam. Hệ thống sử dụng kiến trúc **Neural Mesh v6.0 (Chuẩn Antigravity)** để mang lại trải nghiệm khách hàng tự nhiên, chuyên nghiệp và tỷ lệ chuyển đổi X10.

---

## ✨ Key Features
- **Omnichannel Support**: Tích hợp Messenger, Zalo, và Web Chat.
- **RAG-Lite Knowledge Base**: Hệ thống nạp kiến thức linh hoạt từ CSV/Excel vào Database.
- **24/7 Automated Sales**: Tự động tư vấn, xử lý từ chối (Objection Handling) và chốt đơn.
- **Strategic Reporting**: Báo cáo hiệu suất bán hàng tự động bằng AI (Groq Llama 3.3).
- **Huy v6.0 Inside**: Hệ thống được vận hành bởi Agent "Huy" với quy trình kiểm soát chất lượng **4 KHÔNG - 3 BẢO ĐẢM**.

---

## 🛠️ Technology Stack
- **Backend**: Node.js / Express
- **Database**: SQLite (better-sqlite3)
- **AI Engine**: Groq (Llama 3.3), OpenAI (GPT-4o)
- **Architecture**: Neural Mesh Node-based

---

## 🚀 Getting Started

### 1. Cài đặt môi trường
Tạo file `.env` và cấu hình các key:
```env
GROQ_API_KEY=your_key
OPENAI_API_KEY=your_key
FB_PAGE_TOKEN=your_token
```

### 2. Nạp kiến thức (FAQs)
Sếp chỉ cần điền vào file `uploads/faq_template.csv` và chạy:
```bash
node .agent/scripts/sync_faqs.js uploads/faq_template.csv
```

### 3. Khởi động hệ thống
```bash
npm install
npm start
```

---

## 🧠 Huy Command Center
Toàn bộ "linh hồn" và các chỉ dẫn vận hành của hệ thống nằm gọn trong thư mục:
`[./.agent/]`
- `HUY_COMMAND_CENTER.md`: Trung tâm điều hành v6.0.
- `rules/`: 8 Đạo luật Supreme Laws chống bug.
- `scripts/check_brain.js`: Hệ miễn dịch tự kiểm tra của hệ thống.

---
*Developed with ❤️ by Huy v6.0 & Sếp Cường | "Làm thật. Kết quả thật."*
