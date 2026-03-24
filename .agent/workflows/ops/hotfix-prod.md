# 🚨 WORKFLOW: HOTFIX PRODUCTION

> **Dùng khi**: Bug xuất hiện trên production ĐANG LIVE. Không thể rollback toàn bộ. Cần patch nhanh.
> **Không dùng cho**: Bug dev/staging thông thường → dùng workflow `xu-ly-su-co.md`.

---

## ⚡ TÓM TẮT 5 BƯỚC (dán lên Slack ngay khi incident xảy ra)

```
🚨 HOTFIX ACTIVATED
1. ASSESS  → Xác định severity & scope (2 min)
2. BRANCH  → git checkout -b hotfix/[issue-id] from main
3. PATCH   → Fix nhỏ nhất có thể, không refactor
4. VERIFY  → Chạy eval + smoke test
5. DEPLOY  → Cherry-pick + merge + notify users
```

---

## 1. ASSESS — Đánh giá mức độ (Max 2 phút)

**Hỏi 3 câu ngay lập tức:**
- [ ] Bug này ảnh hưởng bao nhiêu % users? (`< 10%` → Low / `10-50%` → Med / `> 50%` → Critical)
- [ ] Có thể workaround tạm không? (Feature flag off, disable endpoint?)
- [ ] Data bị corrupt hay chỉ UI/Logic sai?

**Severity Matrix:**
| Level | Mô tả | SLA fix |
|---|---|---|
| 🔴 P0 | App crash / data corrupt / payment broken | 30 phút |
| 🟠 P1 | Feature chính không dùng được | 2 giờ |
| 🟡 P2 | Feature phụ sai, có workaround | Next sprint |

> Nếu P2 → **không dùng hotfix workflow này**, tạo ticket bình thường.

---

## 2. BRANCH — Tạo hotfix branch đúng cách

```bash
# LUÔN branch từ main (production), KHÔNG phải từ develop
git checkout main
git pull origin main
git checkout -b hotfix/[ISSUE-ID]-[short-description]
# Ví dụ: hotfix/INC-042-workspace-guard-bypass
```

> ⚠️ **Rule**: Branch name PHẢI có issue ID. Không được đặt `hotfix/fix-bug`.

---

## 3. PATCH — Nguyên tắc vá tối thiểu

**DO:**
- Fix đúng 1 vấn đề, không hơn
- Thêm 1 test case cover scenario vừa xảy ra
- Log rõ ràng: `[HOTFIX][INC-042] Applied workspace guard for /automation/logs`

**DON'T:**
- Refactor code xung quanh
- Thêm feature mới
- Sửa style/format

```bash
# Sau khi fix, commit với format:
git commit -m "hotfix(INC-042): add workspaceId guard to automation logs endpoint

- Root cause: missing workspaceId filter allowed cross-tenant data leak
- Fix: add WHERE workspaceId = req.user.workspaceId
- Test: added concurrent-workspace.test.ts case HF-042
- Refs: LL-005 #MultiTenancy"
```

---

## 4. VERIFY — Kiểm tra trước khi push

```bash
# Bắt buộc chạy 3 lệnh này, không skip:
npm run lint          # Gate 1
npm run test:unit     # Gate 2
node .agent/evals/ground-truth.cases.js  # Ground Truth Battery (≥95%)
```

**Smoke test manual (60 giây):**
- [ ] Test scenario gây bug → đã fix chưa?
- [ ] Test 2 happy path liên quan không bị break
- [ ] Test multi-tenant: ws_A không đọc được ws_B

---

## 5. DEPLOY — Cherry-pick & merge

```bash
# Step 1: Merge vào main (production)
git checkout main
git merge --no-ff hotfix/[ISSUE-ID]-[desc]
git tag -a "hotfix-[ISSUE-ID]-$(date +%Y%m%d)" -m "Hotfix: [short desc]"
git push origin main --tags

# Step 2: Cherry-pick vào develop (để không bị revert khi next sprint merge)
git checkout develop
git cherry-pick [hotfix-commit-hash]
git push origin develop

# Step 3: Delete hotfix branch
git push origin --delete hotfix/[ISSUE-ID]-[desc]
git branch -d hotfix/[ISSUE-ID]-[desc]
```

---

## 6. THÔNG BÁO USER (Template)

```
📢 [System Update — ISSUE-ID]
Chúng tôi đã phát hiện và khắc phục sự cố [mô tả ngắn].
Thời gian xảy ra: HH:MM — HH:MM (UTC+7)
Tình trạng hiện tại: ✅ Đã xử lý
Người dùng bị ảnh hưởng: [scope]
Hành động cần thiết: [Không cần làm gì / Cần đăng nhập lại / ...]
Nếu vẫn gặp vấn đề, liên hệ support@...
```

---

## 7. POST-MORTEM (Trong vòng 24h)

Sau mỗi P0/P1, Huy PHẢI ghi vào `knowledge/lessons-learned.md`:

```
## [LL-XXX] Hotfix: [ISSUE-ID] — [Tiêu đề]
Tags: #Hotfix #[Platform] #[Category]
...
```

Và update `context/sprint.md` với mục "Incident log" để PO nắm rõ.

---

*File này là SOP — Standard Operating Procedure cho production incidents.*
*Lần sửa đổi cuối: v4.6 — thêm cherry-pick step và post-mortem requirement.*
