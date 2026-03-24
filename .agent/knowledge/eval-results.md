# Eval Results — Lịch sử đánh giá

## Mục đích
Theo dõi chất lượng agent theo thời gian.
So sánh pass rate giữa các lần chạy eval.
Phát hiện regression và bão hòa sớm.

## Ngưỡng cảnh báo
- Regression tasks < 95%: 🔴 **NGUY HIỂM — fix ngay**
- Capability tasks < 50%: 🟠 Cần cải thiện workflow
- Capability tasks > 90%: 💡 Eval bão hòa — thêm task khó hơn

## Format mỗi lần chạy

```
=== EVAL RUN [YYYY-MM-DD HH:MM] ===
Trigger: [định kỳ / trước update / sau bug]

CAPABILITY TASKS:
  Pass@1: [X/Y] ([%]) [↑/↓/→ so lần trước]
  Pass^3: [X/Y] ([%])
  Fail list: [task_id nào fail]

REGRESSION TASKS:
  Pass@1: [X/Y] ([%]) — phải ≥ 95%
  Pass^3: [X/Y] ([%])
  Fail list: [task_id nào fail — ⚠️ CẢNH BÁO]

METRICS TRUNG BÌNH:
  Số bước/task: [X]
  Điểm trung bình: [X/100]

THAY ĐỔI SO LẦN TRƯỚC:
  Cải thiện: [danh sách task]
  Regression: [danh sách task — 🔴 NGUY HIỂM nếu có]
  Bão hòa: [có/không]
=================================
```

---

## Lịch sử

=== EVAL RUN 2026-03-21 22:45 ===
Trigger: Định kỳ sau cập nhật Git Push, Rollback, Database Rules

CAPABILITY TASKS (4 tasks):
  Pass@1: 4/4 (100%) [Mới chạy lần đầu]
  Pass^3: 3/4 (75%)
  Fail list: CAP-005 (Rollback từng file cụ thể - 1 lần bị timeout)

REGRESSION TASKS (6 tasks):
  Pass@1: 6/6 (100%) [Mới chạy lần đầu] — ĐẠT
  Pass^3: 6/6 (100%)
  Fail list: Không có lỗi hồi quy

METRICS TRUNG BÌNH:
  Số bước/task: 4.5
  Điểm trung bình: 96/100

THAY ĐỔI SO LẦN TRƯỚC:
  Cải thiện: REG-001 (AI chỉ hiển thị lệnh git push), REG-005 (AI-CP3 developer), REG-006 (Hiển thị BÁO CÁO TRƯỚC destructive act)
  Regression: KHÔNG CÓ
  Bão hòa: Có! Capability đạt Pass@1 tuyệt đối. Đề nghị bổ sung task khó hơn.
=================================

=== EVAL RUN 2026-03-21 23:29 ===
Trigger: Định kỳ

CAPABILITY TASKS (4 tasks):
  Pass@1: 4/4 (100%) [→]
  Pass^3: 4/4 (100%) [↑ 25%]
  Fail list: Không có lỗi

REGRESSION TASKS (6 tasks):
  Pass@1: 6/6 (100%) [→]
  Pass^3: 6/6 (100%) [→]
  Fail list: Không có lỗi hồi quy

METRICS TRUNG BÌNH:
  Số bước/task: 3.5
  Điểm trung bình: 100/100

THAY ĐỔI SO LẦN TRƯỚC:
  Cải thiện: CAP-005 không còn bị timeout.
  Regression: KHÔNG CÓ
  Bão hòa: CÓ. Capability đạt Pass^3 tuyệt đối (100%). Đề nghị bổ sung task khó hơn.
=================================
