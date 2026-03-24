# ⚙️ RULES: CODING RULES

## 🔍 Observability [AI-ERA]

Logs are not just for humans but also signals for AI. Must dual-log OR strictly structure according to standards:
1. **Standard Format:** Either use **JSON Standard**, or **[SCOPE] TEXT** in `key=value` format for easy regex parsing.
2. **Key Application Events:** Mandatory logging at sensitive points: `App Init`, `Auth Failures`, `Validation Error`, `Data Exports`, `Integrations/API Calls`.
3. **Correlation (Trace ID):** Mandatory maintenance of `X-Correlation-ID` across HTTP Requests and System Events to string together real-time execution flow.

---

## 🛡️ DevSecOps & Security [AI-ERA]

1. **Security Wrappers:** Absolutely never pass raw strings into database/URL. Use Safe Type Wrappers (e.g. `SafeURL`, `SanitizedString`).
2. **Offensive vs Defensive Programming:**
   - *Defensive:* Use `try/catch` + `if-else` at boundaries (external API, user input) assuming everything can fail to recover.
   - *Offensive:* Use `assert/Fail-fast` in internal logic, algorithms - If internal state is wrong, STOP immediately.
3. **Least Privilege & Zero Trust:** Validate and auth all requests at every layer, grant the absolute minimum privilege possible.

---

## 🍃 Performance Optimization & Green Coding [AI-ERA]

1. **Data-Oriented Design (DOD):** When processing heavy data (Bulk Data / Simulation / Reports), prioritize grouping data into Arrays (optimize CPU Cache Locality) instead of creating thousands of Class Objects (OOP).
2. **Memory Management:** Limit deep cloning of massive objects (distinguish Shallow Size vs Retained Size). Use `Generators` for extremely large data arrays.
3. **Big O Awareness:** Strictly forbid $O(n^2)$ nested loops on large arrays, optimize down to $O(n \log n)$ or Cache/Map $O(1)$.

---

## 🔄 Retry Logic (MANDATORY for all API calls)

```typescript
async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  const delays = [0, 1000, 3000] // ms: immediately, 1s, 3s

  for (let i = 0; i < maxRetries; i++) {
    try {
      if (delays[i] > 0) await new Promise(r => setTimeout(r, delays[i]))
      return await fn()
    } catch (err) {
      if (i === maxRetries - 1) {
        throw new Error(
          `API failed after ${maxRetries} attempts: ${(err as Error).message}`
        )
      }
      console.warn(`Attempt ${i + 1} failed, retrying in ${delays[i+1]}ms`)
    }
  }
  throw new Error('Unreachable')
}
```

**Rules:**
- 1st try: immediately
- 2nd try: wait 1 second
- 3rd try: wait 3 seconds
- After 3 tries: throw error with clear message (do not swallow errors)

---

## Timeout (MANDATORY for all async functions)

```typescript
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 30000,
  operationName = 'Operation'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`${operationName} timeout after ${timeoutMs / 1000}s`)),
      timeoutMs
    )
  )
  return Promise.race([promise, timeout])
}

// Usage:
const data = await withTimeout(
  fetchMetaAdsData(params),
  30000,
  'Meta Ads API'
)
```

**Rules:**
- Default timeout: **30 seconds**
- If over 30 seconds: cancel and throw clear error
- Error message must include operation name and time

---

## 🧪 Ground Truth (TDD v2.0) [RULE-9]

Bắt buộc viết **Ground Truth Cases** trước khi viết bất kỳ dòng code logic AI/Decision nào:
1. **Scenario cụ thể**: Input thực bằng số, không dùng mô tả định tính.
2. **Expected vs Wrong**: Phải liệt kê ít nhất 2 output sai để tránh AI bị "hallucination".
3. **Anchor Development**: Code cho đến khi pass 100% Ground Truth cases thủ công mới được viết Jest.

---

## 🛡️ Backend Standards (Supreme Law) [RULE-B1..B8]

1. **Workspace Guard (B1)**: Mọi route/query bắt buộc có `where: { workspaceId }`.
2. **Ownership Check (B2)**: Verify record thuộc workspace trước khi Update/Delete.
3. **Structured Errors (B3)**: Return format: `{ code: 'ERROR_ID', message: 'User message' }`.
4. **Validation (B4)**: Validate input đầu vào (Zod) cho mọi POST/PATCH.
5. **No Globals (B8)**: Tuyệt đối không dùng biến global mutable để lưu dữ liệu request/workspace.

---

## Additional Rules

```typescript
// ✅ Error with meaningful message
throw new Error(`Meta Ads API error ${status}: ${data.error?.message}`)

// ❌ Generic error
throw new Error('Something went wrong')

// ✅ Clear loading state
if (isLoading) return <LoadingSkeleton />
if (error) return <ErrorAlert message={error} />
if (!data?.length) return <EmptyState />
return <Chart data={data} />

// ❌ Missing state
return data ? <Chart data={data} /> : null
```

---

## 📏 The 10KB Modularization Rule [AGENT SYSTEM ONLY]

To maintain system efficiency and token optimization, any **Agent System file** (Workflow/Rule/Skill) exceeding **10KB** must be- **Feature Flag Requirement**: Prefix with `NEXT_PUBLIC_FF_` (e.g., `NEXT_PUBLIC_FF_NEW_DASHBOARD=true`).
- **10KB Rule (Agent System ONLY)**: Any Workflow or Rule file over 10KB must be modularized into "Linked Departments" (Rules/Skills).
- NEVER push raw code to the UI without Loading/Error states.

*Note: This rule applies strictly to the AI Agent documentation and instructions, not to the application source code.*
