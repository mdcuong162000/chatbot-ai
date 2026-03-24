# 🔄 WORKFLOW: SPRINT RETROSPECTIVE

> **Trigger**: Tự động chạy cuối mỗi Sprint (hoặc PO gõ `/retro`)
> **Thời gian**: ~15 phút
> **Output**: Lessons learned mới + Sprint metrics + Sprint context reset

---

## 1. THU THẬP DỮ LIỆU (Huy tự làm — không cần PO)

### 1a. Review sprint.md và save-point.md
Huy đọc và tổng hợp:
```
- Sprint X (từ [date] đến [date])
- Tasks hoàn thành: [x/y]
- Tasks chưa xong (carry-forward): [list]
- Incidents xảy ra trong sprint: [list từ lessons-learned.md]
- AI decisions made: [từ reasoningPath logs]
```

### 1b. Query lessons-learned.md cho sprint này
```bash
bash .agent/scripts/search-lessons.sh --sprint [SPRINT_NUMBER]
# Xem các LL nào được thêm vào trong sprint vừa rồi
grep "$(date -d 'last month' +%Y-%m)" .agent/knowledge/lessons-learned.md
```

### 1c. Tự hỏi 3 câu Retro
Huy tự trả lời trước khi trình bày với PO:

1. **AI-CP nào miss nhiều nhất?** (Checkpoint nào hay bị bỏ qua)
   → Scan lại ground-truth.cases.js và Quality Gate reports
   
2. **Workflow nào tốn nhiều turns nhất?** (Kém hiệu quả)
   → Xem transcript session, đếm số message/workflow
   
3. **Bug nào lặp lại?** (Đã có LL nhưng vẫn tái phạm)
   → `grep -c` các tag trong lessons-learned

---

## 2. BÁO CÁO CHO PO (Huy trình bày)

### Template Retro Report

```markdown
## 📊 SPRINT [X] RETROSPECTIVE — [DATE]

### ✅ What Went Well
- [item 1]
- [item 2]

### ⚠️ What Needs Improvement
- [item 1 — với action item cụ thể]
- [item 2]

### 🐛 Bug Pattern Analysis
| Bug | Lần này | Lần trước | Root cause lặp lại? |
|-----|---------|-----------|---------------------|
| LL-002 Race condition | [Y/N] | Sprint [X-1] | [Y/N] |

### 📈 Metrics
- Eval pass rate: [X]% (target ≥ 95%)
- Quality Gate fails: [X] (breakdown by gate)
- Hotfixes triggered: [X]
- Tasks velocity: [X completed / Y planned]

### 🎯 Sprint [X+1] Recommendations
1. Priority 1: [Task — reasoning]
2. Priority 2: [Task — reasoning]
3. Carry-forward: [list]

### 📚 Lessons Added This Sprint
[List LL-XXX items added in this sprint]
```

---

## 3. HUMAN GATE — PO Review (bắt buộc)

> ⛔ Huy KHÔNG tự reset sprint context mà không có PO confirm.

PO cần quyết định:
- [ ] Approve recommendations cho Sprint X+1?
- [ ] Carry-forward tasks nào?
- [ ] Có cần thêm rule mới vào `.agent/rules/` không?

---

## 4. ACTIONS SAU KHI PO APPROVE

### 4a. Cập nhật lessons-learned.md (nếu có pattern mới)
```bash
# Thêm LL mới nếu phát hiện pattern chưa được ghi nhận
```

### 4b. Reset sprint.md cho Sprint mới
```markdown
# Xóa tasks đã done, giữ lại carry-forward
# Update sprint number và dates
# Ghi rõ "Bắt đầu từ Retro Sprint [X-1]"
```

### 4c. Update AGENT_ANATOMY_VI.md nếu có workflow/rule mới

### 4d. Archive sprint context cũ
```bash
cp .agent/context/sprint.md .agent/context/archive/sprint-[X]-$(date +%Y%m%d).md
```

---

## 5. ANTI-PATTERNS — KHÔNG được làm trong Retro

- ❌ Chỉ list bug mà không có action item
- ❌ Blame developer/AI mà không phân tích root cause
- ❌ Skip retro vì "sprint suôn sẻ" — vẫn cần document wins
- ❌ Retro dài hơn 20 phút — focus vào top 3 insights

---

*Workflow này giúp hệ thống học theo chu kỳ, không chỉ học từ sự cố.*
*Lần đầu setup: v4.6 | Trigger: `/retro` hoặc end of sprint*
