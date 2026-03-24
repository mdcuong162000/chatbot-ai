# 🌿 RULES: GIT CONVENTIONS (SEMANTIC COMMITS)

> Professionalism is reflected in the Git history. We apply the Conventional Commits standard for all push/commit messages without exception.

## Mandatory Syntax
`<type>[optional scope]: <description>`

*(Example: `feat(dashboard): add revenue chart by platform`)*

## Types of Commits

| Keyword | Purpose | Context |
|---|---|---|
| `feat:` | A **new feature** for the user. | New tasks (`/phan-tich` → `/tho-code`) |
| `fix:` | Sửa một lỗi / **bug** found by Tester or PO. | Error handling (`/tu-debug`, `/xu-ly-su-co`) |
| `docs:` | Documentation updates only (`.md`, `.txt`). | Knowledge base updates |
| `style:` | Formatting, linting, missing semicolons (no logic change). | Boy Scout cleanup |
| `refactor:` | Code restructuring, architecture changes (no feature change). | Refactoring (Code Review) |
| `perf:` | Performance-related changes (N+1, memoization). | API/Web optimization |
| `test:` | Adding or fixing unit tests only. | Running `/tu-tao-test` |
| `chore:` | Maintenance: updating dependencies, build config. | Next.js upgrades |

## Description Rules
1. **Consistency**: Use English or Vietnamese consistently (as per internal project rules).
2. **Imperative Mood**: Use "add feature" instead of "added feature" or "adding feature".
3. **No Caps**: Do not capitalize the first letter after the colon.
4. **No Punctuation**: Do not end the message with a period.

## Examples
- ❌ Bad: `Updated dashboard UI and it looks much better now`
- ✅ Good: `refactor(ui): optimize dashboard component layout`
- ❌ Bad: `Sửa lỗi crash nãy sếp báo gắp API`
- ✅ Good: `fix(api): handle timeout exception for external service call`
