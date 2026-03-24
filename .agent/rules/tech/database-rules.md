# 🗄️ DATABASE RULES

> Agent MUST read this section before proposing any database solutions.

## 0. WHICH DATABASE TO CHOOSE? (Decision Tree)

When designing complex web apps, apply this decision table:

### By Data Type

| Data Type | Suitable Database | Notes |
|---|---|---|
| User, config, complex relations | **PostgreSQL** | Gold standard for relational data |
| Session, cache, rate limit | **Redis** | In-memory, built-in TTL |
| Full-text search, semantic search | **PostgreSQL `pg_trgm`** or **Elasticsearch** | pg_trgm sufficient for < 10M records |
| AI memory, vector similarity | **ChromaDB** (local) / **Pinecone** (cloud) | Only if genuinely needed |
| File, media, binary | **S3 / object storage** | Do not store binaries in PG |
| Time-series (metrics, logs) | **TimescaleDB** (PG extension) | Or InfluxDB if large volume |
| Graph data (social network) | **Neo4j** | Only for highly complex relations |

### By Project Scale

| Stage | Recommended Database | Avoid initially |
|---|---|---|
| MVP / prototype | SQLite (Prisma + file) | Redis, Chroma, Distributed PG |
| Small Production (< 10k users) | PostgreSQL + Redis cache | Vector DB, sharding |
| Mid Production (10k-100k) | PostgreSQL + Redis + CDN | Too many complex services |
| Large Scale (> 100k users) | PG + Redis + Vector DB + Queue | Single Monolith DB |

> ⚠️ **Rule 1:** Never overcomplicate. SQLite is enough for < 1k users. PG is enough for most startups.

---

## 1. Schema Design — Complex Multi-feature Web

### 1.1 Core Principles

- **3NF (Third Normal Form)**: Each table stores 1 entity type. Don't pack multiple concepts into 1 table.
- **Soft Delete [RULE-B5]**: Mandatory for business data: `deletedAt DateTime?`. Absolutely NO HARD DELETES.
- **Multi-tenancy [RULE-D1]**: Every model MUST have `workspaceId` and a corresponding Index.
- **Audit Trail [RULE-A5]**: Every change to sensitive data (e.g. Memory) must have a history record.
- **UUID vs Auto-increment**: Use UUID for API-exposed data (prevent enumeration). Auto-increment for internal joins.

### 1.2 Patterns for multi-feature web

```sql
-- ✅ User (system core)
users (id, email, hashed_password, role, created_at, deleted_at)

-- ✅ Separate profile (Single Responsibility)
user_profiles (user_id FK, display_name, avatar_url, timezone)

-- ✅ Flexible permissions
roles (id, name, description)
permissions (id, resource, action)  -- e.g. resource='campaign', action='read'
role_permissions (role_id FK, permission_id FK)
user_roles (user_id FK, role_id FK)

-- ✅ Separate audit log
audit_logs (id, user_id, action, resource, resource_id, old_value JSON, new_value JSON, ip, created_at)
```

### 1.3 When web has API Integration (like Ads Dashboard)

```sql
-- Store API connections (token encrypted)
platform_connections (id, user_id FK, platform, encrypted_token, account_id, is_active, expires_at, updated_at)

-- Cache API data (reduce calls)
api_cache (id, platform, cache_key, data JSON, fetched_at, expires_at)
-- Index: (platform, cache_key, expires_at)

-- Normalized core data
campaign_metrics (id, connection_id FK, date, campaign_id, campaign_name, spend, impressions, clicks, conversions, revenue, created_at)
-- Partitioned by date if large volume
```

### 1.4 When web has Queue / Task Management

```sql
-- Job queue (or use BullMQ + Redis)
jobs (id, type, payload JSON, status, attempts, max_attempts, run_at, completed_at, error TEXT)
-- status: 'pending' | 'running' | 'done' | 'failed'
```

### 1.5 Separation of Human & AI Data [NEW ✨]

To ensure performance and scalability, adhere to this separation rule:

#### 1.5.1 Human Data
- **Entities**: `User`, `Account`, `Campaign`, `Metrics`, `PlatformConnection`.
- **Database**: Primary SQL (PostgreSQL/SQLite).
- **Requirement**: ACID, strict relations (FK).

#### 1.5.2 AI Data
- **Entities**: `ChatHistory`, `PromptTemplates`, `AgentMemory`, `BulkGeneratedContent`.
- **Storage**:
  - **Large data/Logs**: MongoDB or separate table with prefix `ai_` (easy vacuum/truncate).
  - **Semantic data (RAG)**: Must use **Vector Database** (ChromaDB/Pinecone).
- **Reason**: Prevent business DB bloat, easy to reset training data or swap LLMs.

#### 1.5.3 Data Integrity [RULE-D2/D3]
- **No Derived Metrics assignment**: Only assign base metrics. Derived metrics must be calculated.
- **Synthetic Tagging**: Seed data MUST have `dataSource: 'synthetic'` to prevent AI learning from fake data.

---

## 2. Architecture & Patterns

- **Repository Pattern**: Completely separate DB logic from Controller/Service. All queries go through Repositories.
- **Dependency Inversion**: Use interfaces for Repositories (`IUserRepository`) to ease unit test mocking.
- **Entity vs DTO**: Never return raw Entities via APIs. Always map to DTO first.

---

## 3. Redis — Proper Usage

| Use case | Suggested TTL | Key pattern |
|---|---|---|
| API response cache | 1-24h | `cache:{platform}:{account}:{date_range}` |
| User session | 7-30 days | `session:{token}` |
| Rate limit | 1 minute | `ratelimit:{user_id}:{endpoint}` |
| OTP / verify code | 5-15 mins | `otp:{email}` |
| Lock / mutex | < 30 secs | `lock:{resource_id}` |

```typescript
// ✅ Standard pattern with Redis
async function getCachedInsights(key: string, fetchFn: () => Promise<Data>) {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const data = await fetchFn()
  await redis.set(key, JSON.stringify(data), 'EX', 3600)
  return data
}
```

---

## 4. Indexing — Do Not Index Blindly

```sql
-- ✅ Index when: frequently query by field
CREATE INDEX idx_campaigns_platform ON campaign_metrics(platform);
CREATE INDEX idx_campaigns_date ON campaign_metrics(date DESC);

-- ✅ Composite index when querying multiple conditions simultaneously
CREATE INDEX idx_cache_lookup ON api_cache(platform, cache_key) WHERE expires_at > NOW();

-- ✅ Partial index for soft delete
CREATE INDEX idx_users_active ON users(email) WHERE deleted_at IS NULL;

-- ❌ Do not index every column — slows down INSERT/UPDATE
```

---

## 5. Schema Management (Migration)

- Naming: `YYYYMMDD_NNN_clear_description.sql`
- Every migration must have `up()` and `down()` (rollback)
- Rename columns: 3 steps (add new → deploy → delete old), never rename directly

---

## 6. Performance & Concurrency

- **Avoid N+1**: No queries inside loops. Use JOIN or batch.
- **Transactions**: Wrap related ops, mandatory `ROLLBACK` in `catch`, `release` in `finally`.
- **Row Lock**: Use `SELECT ... FOR UPDATE` when overwriting concurrently.
- **Connection Pool**: Configure `min`, `max`, `idle timeout` for pool.

---

## 7. Anti-patterns ⚠️ Absolutely Avoid

| Anti-pattern | Proper Solution |
|---|---|
| **God Table** | Split tables, normalize to 3NF |
| Storing calculated values (`total = qty × price`) | Calculate at runtime or use views |
| Hard delete | Soft delete with `deleted_at` |
| Long transactions | Keep locks as short as possible |
| Swallowing errors `catch (e) {}` | Log + throw properly |
| Magic numbers (`status = 1`) | Clear Enum string (`status = 'active'`) |
| Store binary files in DB | Use S3, store URL in DB |
| Encrypt all data | Only encrypt sensitive fields (token, password hash) |
