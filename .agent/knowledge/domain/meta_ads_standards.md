# Tiêu chuẩn Hệ thống: Xử lý Dữ liệu Meta Ads (Trích xuất từ skill-man)

Bản thân AI Agent Antigravity đã nạp bộ tiêu chuẩn khắt khe từ `meta-ads-analyzer-manus`. Từ nay, toàn bộ việc lập trình giao diện (UI), thiết kế Database và phân tích logic cho dự án **Marketing Dashboard** sẽ phải tuân thủ nghiêm ngặt 5 quy tắc "bất di bất dịch" sau:

## 1. Chuẩn hóa Ngôn từ (Naming Convention)
*   **Về người dùng (Reach/Audience):** BẮT BUỘC dùng cụm `"Accounts Center accounts"` (Tài khoản Trung tâm). TUYỆT ĐỐI KHÔNG dùng chữ "Users", "People", hay "Persons" (Quy định pháp lý từ Meta).
*   **Về lượt nhấn (Clicks):** BẮT BUỘC phân biệt rõ `"Clicks (all)"` và `"Link clicks"`. Không vơ đũa cả nắm gọi chung là "clicks".
*   **Tiền tố (Prefixes):** BẮT BUỘC dùng đúng tên Metric gốc (VD: `Impressions`, `Amount spent`). TUYỆT ĐỐI KHÔNG tự ý chế thêm tiền tố (như `Total Impressions` hay `Overall views`).

## 2. Tính Tường minh Dữ liệu (Data Integrity)
*   **Tiền tệ (Currency):** API trả về con số và đơn vị tiền tệ riêng lẻ (`150.50` và `USD`). Khi render giao diện (React.js), phải móc nối trọn vẹn thành `$150.50`. Không ép kiểu mặc định.
*   **Ngày Tương đối (Partial Dates):** Nếu Dashboard có bộ lọc ngày bao gồm "Hôm nay", phải hiện dòng chữ cảnh báo (Warning Label) cho người dùng: *"Dữ liệu có thể chưa cập nhật đầy đủ (Partial data)"*.
*   **Cấm bịa số (No Fabricated Data):** Nếu API trả về `null` cho một Metric, trên UI phải hiển thị `"N/A"` hoặc `"Data not available"`. Tuyệt đối không tự ý hiển thị số `0` vì sẽ làm sai lệch quyết định kinh doanh.

## 3. Quy tắc Cộng gộp (Cross-objective Aggregation)
*   Không bao giờ được tính tổng/trung bình các chỉ số như `"Cost per result"` (Chi phí trên mỗi kết quả) từ nhiều chiến dịch mang mục tiêu khác nhau (VD: Chiến dịch Bán hàng cộng gộp với Chiến dịch Lead). Khi đó Dashboard phải hiển thị là `"N/A"`.

## 4. Tránh bẫy "Breakdown Effect" (Hiệu ứng Phân rã)
*   Khi đánh giá Dashboard ở cấp độ Chiến dịch (CBO) hoặc Nhóm quảng cáo, hệ thống sẽ ưu tiên phân tích **Chi phí cận biên (Marginal Cost)** (Chi phí để ra kết quả *tiếp theo*) thay vì **Chi phí trung bình (Average Cost)**.
*   Không bao giờ code logic tự động khuyên người dùng tắt Ads chỉ dựa trên CPA/CPM trung bình cao. Mọi cảnh báo phải dựa trên dữ liệu hệ thống học hỏi (Learning Phase) và độ chẩn đoán quảng cáo (Ad relevance diagnostics).

---
> **⚡ Lời hứa của AI:** Bộ quy tắc này đã trở thành "Kinh thánh" lập trình nội bộ của hệ thống. Tôi sẽ áp dụng nó vào mọi màn hình Báo cáo, mọi dòng SQL query và mọi Component React liên quan đến Facebook Ads trong dự án Marketing OS này.
