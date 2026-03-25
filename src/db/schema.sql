-- Sản phẩm (Knowledge Base)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  variants TEXT,        -- JSON: ["S","M","L"]
  fits_who TEXT,
  occasion TEXT,
  selling_points TEXT,  -- JSON array
  objections TEXT,      -- JSON: {"đắt quá": "..."}
  style_tip TEXT,
  handover_rules TEXT,  -- JSON per-product: {"price_threshold":500000,"max_bot_turns":10,"keywords":["lỗi","hoàn tiền"]}
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Khách hàng
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  phone TEXT,
  name TEXT,
  channel_ids TEXT,    -- JSON: {"fb": "xxx", "zalo": "yyy"}
  preferences TEXT,    -- JSON: sở thích đã biết
  stage TEXT DEFAULT 'nhan_thuc', -- Sales Funnel: nhan_thuc|quan_tam|danh_gia|dam_phan|da_mua|mua_lai
  stage_updated_at DATETIME,
  status TEXT DEFAULT 'new_lead',
  priority_level TEXT DEFAULT 'normal',
  last_purchase_date DATETIME,
  last_notification_at DATETIME,
  total_orders INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Khiếu nại (Enterprise)
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  type TEXT, -- san_pham, giao_hang, thanh_toan, thai_do
  content TEXT,
  status TEXT DEFAULT 'open', -- open, resolved
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(conversation_id) REFERENCES conversations(id)
);

-- Cuộc hội thoại
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  channel TEXT NOT NULL,  -- 'web'|'facebook'|'zalo'|'instagram'
  status TEXT DEFAULT 'open', -- 'open'|'closed'|'human_takeover'
  assigned_to TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(customer_id) REFERENCES customers(id)
);

-- Tin nhắn
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,  -- 'user'|'assistant'|'system'
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id)
);

-- Kết quả (Trái tim tự học)
CREATE TABLE IF NOT EXISTS outcomes (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_segment TEXT, -- 'female_25_35_hcm'
  customer_stage TEXT,   -- Tầng funnel tại thời điểm outcome (chống chồng chéo stage)
  style_used TEXT,       -- 'fomo'|'social_proof'|'direct'
  result TEXT NOT NULL,  -- 'bought'|'no_buy'|'pending'
  reason_no_buy TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(conversation_id) REFERENCES conversations(id),
  FOREIGN KEY(product_id) REFERENCES products(id),
  FOREIGN KEY(customer_id) REFERENCES customers(id)
);
