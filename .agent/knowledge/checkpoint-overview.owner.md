---
DÀNH CHO: Product Owner (bạn) đọc tham khảo
AI KHÔNG ĐỌC file này khi làm việc
---

# Tổng quan checkpoint hệ thống

## Checkpoint bạn duyệt (3 checkpoint)

Bạn cần làm gì và khi nào:

| Checkpoint | Khi nào | Bạn làm gì | File |
|---|---|---|---|
| **CP1** — Duyệt spec + UI | Sau khi BA + Designer xong | Đọc spec ngắn → `yes` / `no + lý do` | `phan-tich.md` |
| **CP2** — TP + BA review kỹ thuật | Sau khi Architect xong | AI tự làm, không cần bạn | `thiet-ke-ky-thuat.md` |
| **CP3** — Xem thử kết quả thực tế | Sau khi Tester PASS | Chạy thử → `ok` / `cần sửa` | `giam-sat-va-bao-cao.md` |

## Checkpoint AI tự làm (7 checkpoint)

Bạn không cần làm gì, AI tự xử lý:

| AI-CP | Vai trò tự kiểm | File |
|---|---|---|
| **AI-CP1** | BA tự kiểm tra spec (5 ô) | `phan-tich.md` |
| **AI-CP1.5** | TP đóng băng scope sau CP1 | `giao-viec.md` |
| **AI-CP2** | Architect tự kiểm tra kỹ thuật (8 ô) | `thiet-ke-ky-thuat.md` |
| **AI-CP3** | Developer tự review code (10 ô) | `tho-code.md` |
| **AI-CP4** | Tester tự kiểm tra đủ chưa (10 ô) | `kiem-tra.md` |
| **AI-CP-RESTART** | TP xác định điểm làm lại sau sự cố | `xu-ly-su-co.md` |
| **AI-CP-WEBHOOK** | Giám sát xác nhận đã cập nhật knowledge (5 ô) | `hoan-thanh-va-up-git.md` |

## Nguyên tắc

- **Bạn chỉ cần làm CP1 và CP3** — đọc kết quả và trả lời yes/no
- CP2 AI tự làm dù tên gọi có "TP + BA" — không cần bạn phê duyệt
- 7 AI-CP còn lại AI tự xử lý hoàn toàn trước khi chuyển bước
- Nếu muốn xem checkpoint nào đang chạy → hỏi Trưởng Phòng báo cáo trạng thái
