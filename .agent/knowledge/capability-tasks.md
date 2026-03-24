# Capability Tasks — Eval Suite

## Mục đích
Đo lường những gì agent có thể làm.
Pass rate bắt đầu thấp, cải thiện theo thời gian.
Khi pass rate > 90% → xem xét chuyển sang regression suite.

## Format mỗi task

```yaml
task_id: cap-XXX
mo_ta: [mô tả ngắn ≤ 10 từ]
do_kho: [1-5]  # 1=dễ, 5=rất khó
input: [yêu cầu trigger]
expected: [kết quả mong đợi]
diem_pass: [ngưỡng 0-100]
trang_thai: [OPEN / PASS / GRADUATED]
  # OPEN: chưa pass ổn định
  # PASS: pass ≥ 90% các lần chạy
  # GRADUATED: đã chuyển sang regression suite
```

---

## Tasks hiện tại

### CAP-001: Tích hợp API mới cùng format
```yaml
task_id: cap-001
mo_ta: Tích hợp API mới normalize về format chuẩn
do_kho: 3
input: |
  Tích hợp TikTok Ads API, đảm bảo output
  cùng format với Meta Ads đã có
expected:
  - Tạo normalizer/transform layer cho TikTok
  - Output format khớp với MetaInsight interface
  - Test với clicks=0 không crash
  - Không dùng data format TikTok trực tiếp trong component
diem_pass: 80
trang_thai: OPEN
```

### CAP-002: Xử lý concurrent requests không crash
```yaml
task_id: cap-002
mo_ta: Shared state an toàn với 5 request đồng thời
do_kho: 4
input: |
  Tính năng có shared state,
  test với 5 request gửi đồng thời
expected:
  - Có loading lock (isLoading guard)
  - State khởi tạo với [] không undefined
  - 5 request đồng thời không crash
  - Không có race condition
diem_pass: 80
trang_thai: OPEN
```

### CAP-003: Từ chối scope creep đúng cách
```yaml
task_id: cap-003
mo_ta: TP từ chối thêm tính năng ngoài scope
do_kho: 2
input: |
  Đang làm task X (đã đóng băng scope),
  yêu cầu thêm tính năng Y không liên quan
expected:
  - TP từ chối thêm Y vào task hiện tại
  - Đề xuất tạo task mới riêng cho Y
  - Không tự thêm Y vào task X
  - Ghi vào decisions.md: "Y bị loại khỏi task X"
diem_pass: 90
trang_thai: OPEN
```

### CAP-005: Rollback từng file cụ thể
```yaml
task_id: cap-005
mo_ta: Rollback chỉ file lỗi, giữ file ok
do_kho: 3
input: |
  Tính năng A bị lỗi nhưng tính năng B
  trong cùng commit vẫn hoạt động ok
expected:
  - Hỏi rollback toàn bộ hay từng file trước
  - Hiển thị danh sách file commit + rủi ro
  - Chỉ revert file liên quan đến A
  - Giữ nguyên file của B
  - Không tự rollback không hỏi
diem_pass: 75
trang_thai: OPEN
```
