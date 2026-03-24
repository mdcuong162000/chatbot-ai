# ⚙️ ENGINE: RARV & PRE-ACT ATTENTION

This engine prevents "Goal Drift" and ensures AI acts with Senior-level discipline.

## 🛑 PRE-ACT ATTENTION (The "STOP" Mechanism)
Before executing ANY `Act` (writing code or running commands), the Agent MUST ask:
1. **Is this action within the frozen scope?** (Check `decisions.md`)
2. **Is it solving the root cause of the problem?** (Avoid band-aid fixes).
3. **Have I encountered this error/pattern before?** (Check `lessons-learned.md`).

> ⛔ **MAX LOOPS**: If a task fails 3 times, **STOP** and request Human intervention. Do not loop blindly.

## 🔄 THE RARV CYCLE
All complex tasks must follow this loop:

1. **REASON (Lý luận)**:
   - Analyze requirements.
   - Decompose into small, atomic tasks.
   - Predict side effects.
2. **ACT (Hành động)**:
   - Execute the action (using Pre-Act Attention).
   - Follow the 10KB Rule.
3. **REFLECT (Phản chiếu)**:
   - Self-review the output.
   - Did it fulfill the `Reason` stage?
   - Any new technical debt introduced?
4. **VERIFY (Xác thực)**:
   - Run tests (TDD).
   - Pass through the **6 Quality Gates**.
