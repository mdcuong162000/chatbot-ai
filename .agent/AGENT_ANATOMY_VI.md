# 🗺️ BẢN ĐỒ GIẢI PHẪU: HUY — CODING AGENT (v5.0)
*(Tài liệu Tiếng Việt dành riêng cho PO để hiểu và quản lý Huy)*

> **Vai trò của Huy:** Lập trình viên AI — viết code, vận hành dự án, review, deploy, debug.
> Huy KHÔNG chạy ads, KHÔNG tạo nội dung marketing, KHÔNG ra quyết định Pivot/Scale/Kill.
> Đó là việc của **Cyborg Director** — xem `MARKETING_OS_ANATOMY.md`.

---

## 1. ĐỊNH DANH & NGUYÊN TẮC CỐT LÕI

- **Tên**: Huy. Phản hồi ngay khi được gọi tên: *"Huy nghe đây sếp 🫡"*
- **Ngôn ngữ giao tiếp**: 100% Tiếng Việt với PO
- **Ngôn ngữ nội bộ**: English (rules, workflows, code)
- **Triết lý**: RARV — Reason → Act → Reflect → Verify. Không đoán mò, không làm tắt.
- **Luật tối thượng**: `BOOTSTRAP.md` — đọc đầu tiên mỗi session.

---

## 2. CẤU TRÚC 6 TẦNG CỦA HUY (Coding Pipeline)

| Tầng | Tên | Mô tả |
|------|-----|-------|
| **C0** | **Understand** | Đọc requirements, hỏi tối đa 3 câu nếu mơ hồ, không bao giờ đoán |
| **C1** | **Design** | Thiết kế kỹ thuật, chọn pattern, viết API contracts trước khi code |
| **C2** | **Code** | Viết code theo 6 Quality Gates, tuân thủ coding-rules.md |
| **C3** | **Test** | TDD — Ground Truth cases → Jest → pass 100% mới xong |
| **C4** | **Review & Git** | Self-review → commit chuẩn → push → PR |
| **C5** | **Deploy & Monitor** | Deploy lên môi trường → verify → báo cáo trạng thái |

> **Feedback loop**: Mọi bug phát hiện ở C4–C5 được ghi vào `lessons-learned.md` và feed ngược về C1.

---

## 3. BỘ NÃO (`.agent/`)

### Luật & Quy tắc (`.agent/rules/`)
| File | Mô tả |
|------|-------|
| `rules/tech/coding-rules.md` | Retry logic, timeout, workspace guard, 10KB rule |
| `rules/tech/tech-stack.md` | Next.js 14, TypeScript, Prisma, Redis, Zustand |
| `rules/tech/project-structure.md` | Monorepo layout, Feature-Sliced Design |
| `rules/tech/database-rules.md` | No hard delete, workspaceId bắt buộc, soft delete |
| `rules/tech/architect-rules.md` | DI, no global state, module boundaries |
| `rules/qa/quality-gates.md` | **6 Cổng Chất Lượng** — bắt buộc pass trước khi merge |
| `rules/qa/testing-rules.md` | TDD, ground truth cases, coverage ≥ 80% |
| `rules/qa/eval-rules.md` | Quy trình chạy eval tự động |
| `rules/system/rarv-engine.md` | Vòng lặp Reason → Act → Reflect → Verify |
| `rules/system/orchestrator.md` | Intent routing — Huy tự chọn đúng workflow |
| `rules/system/tailored-discipline.md` | Fast-track vs Hard-track |
| `rules/system/judge-agent.md` | Huy tự đánh giá output trước khi báo cáo sếp |
| `rules/process/git-rules.md` | Commit message format, branch naming |
| `rules/process/no-duplicate.md` | Không tạo file/function trùng lặp |
| `rules/security/security-rules.md` | AES-256, zero trust, least privilege |

### Kho tri thức (`.agent/knowledge/`)
| File | Mô tả |
|------|-------|
| `blueprint.md` | Kiến trúc hệ thống v3.1 — nguồn sự thật về cấu trúc |
| `api-contracts.md` | Spec API — đọc lại trước khi code endpoint |
| `decisions.md` | Nhật ký quyết định kỹ thuật do PO chốt |
| `lessons-learned.md` | Bug log có #Hashtag — tìm bằng `search-lessons.sh` |
| `technical/specs.md` | Chi tiết kỹ thuật từng module |
| `capability-tasks.md` | Danh sách việc Huy có thể tự làm độc lập |

### Bộ nhớ session (`.agent/context/`)
| File | Mô tả |
|------|-------|
| `save-point.md` | **Save Point duy nhất** — đọc khi reload, ghi khi `/luu-tri-nho` |
| `sprint.md` | Sprint đang chạy, tasks đang làm dở, decisions chờ PO |

---

## 4. KỸ NĂNG & QUY TRÌNH (`.agent/workflows/`)

### Core
| Workflow | Khi nào dùng |
|----------|--------------|
| `core/phan-tich.md` | Requirement mới → phân tích trước khi code |
| `core/thiet-ke-ky-thuat.md` | Thiết kế database, API, module |
| `core/thiet-ke-ui.md` | Thiết kế component, layout |
| `core/tho-code.md` | Viết code theo spec đã duyệt |
| `core/kiem-tra.md` | Verify feature sau khi code xong |
| `core/giao-viec.md` | Phân rã task lớn thành sub-tasks |

### Git
| Workflow | Khi nào dùng |
|----------|--------------|
| `git/pushgit.md` | Commit + push lên repo |
| `git/hoan-thanh-va-up-git.md` | Hoàn thiện feature + up git |
| `git/chuan-bi-merge.md` | Chuẩn bị PR, check conflicts |
| `git/xu-ly-git-loi.md` | Fix lỗi git |
| `git/rollback.md` | Rollback khi bug nghiêm trọng |

### QA
| Workflow | Khi nào dùng |
|----------|--------------|
| `qa/verification.md` | Full check trước khi báo Done |
| `qa/code-review.md` | Review code theo 6 Quality Gates |
| `qa/tao-task-eval.md` | Tạo eval case mới |
| `qa/chay-eval.md` | Chạy Ground Truth Battery |

### Ops
| Workflow | Khi nào dùng |
|----------|--------------|
| `ops/deploy.md` | Deploy lên staging/production |
| `ops/hotfix-prod.md` ⭐ | Bug production: Assess → Branch → Patch → Verify → Deploy |
| `ops/giam-sat-va-bao-cao.md` | Kiểm tra trạng thái hệ thống |
| `ops/retrospective.md` ⭐ | Sprint retro — trigger: `/retro` |

### Support
| Workflow | Khi nào dùng |
|----------|--------------|
| `support/doc-lai-session.md` | Đầu session mới → reload context |
| `support/luu-tri-nho.md` | Sắp đổi chat → lưu state trước |
| `support/tu-debug.md` | Huy tự debug trước khi hỏi sếp |
| `support/xu-ly-su-co.md` | Xử lý incident ngoài giờ |
| `support/review-kien-thuc.md` | Ôn lại lessons-learned định kỳ |

---

## 5. HỆ THỐNG EVAL & CI

| File | Mục đích |
|------|----------|
| `evals/ground-truth.cases.js` | 12 test cases — block merge nếu pass rate < 95% |
| `.github/workflows/eval.yml` | Chạy Ground Truth Battery tự động trên mọi PR |
| `.github/workflows/doc-sync-check.yml` | Doc thay đổi → code phải thay đổi cùng PR |
| `tests/concurrent-state.test.ts` | 5 concurrent requests không corrupt state |

---

## 6. SCRIPTS TIỆN ÍCH

```bash
bash .agent/scripts/search-lessons.sh "#RaceCondition"   # tìm theo tag
bash .agent/scripts/search-lessons.sh "workspace"        # tìm theo keyword
bash .agent/scripts/search-lessons.sh --severity high    # lọc severity
bash .agent/scripts/search-lessons.sh --list             # liệt kê tất cả
```

---

## 7. CÁCH NÂNG CẤP

| Muốn thay đổi | Sửa ở đâu |
|---------------|-----------|
| Code chuẩn hơn | `rules/tech/coding-rules.md` |
| Thái độ / giọng Huy | `BOOTSTRAP.md` |
| Thêm workflow | `.agent/workflows/` → cập nhật file này |
| Chuyển dự án | Copy `.agent/` + sửa `config.json` |
| Tìm bug cũ | `bash .agent/scripts/search-lessons.sh [tag]` |
| Bug production | `/hotfix` → chạy `ops/hotfix-prod.md` |
| Cuối sprint | `/retro` → Huy tự tổng hợp |

---

> ⚠️ **Huy ≠ Cyborg Director.**
> Marketing Automation (L0–L5, Ads, Decision Engine) → xem `MARKETING_OS_ANATOMY.md`.

---
*v5.0 — 2026-03-24 | Tách biệt hoàn toàn khỏi Marketing OS*
