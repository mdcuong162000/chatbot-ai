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
  market_code TEXT DEFAULT 'TH', -- 'TH', 'VN', etc.
  industry TEXT DEFAULT 'general',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FAQ (Knowledge Base chung) [NEW Phase 7]
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  market_code TEXT DEFAULT 'TH',
  industry TEXT DEFAULT 'general',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Định nghĩa Tag linh hoạt (Dynamic Tags) [NEW Phase 7]
CREATE TABLE IF NOT EXISTS tag_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  fields_json TEXT, -- JSON định nghĩa các trường: [{"name":"sdt","type":"number","required":true}]
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dữ liệu động theo Tag của khách [NEW Phase 7]
CREATE TABLE IF NOT EXISTS customer_tag_data (
  customer_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  values_json TEXT, -- JSON chứa giá trị sếp điền: {"sdt":"0389...","ngay_sinh":"1995-10-10"}
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id, tag_id),
  FOREIGN KEY(customer_id) REFERENCES customers(id),
  FOREIGN KEY(tag_id) REFERENCES tag_definitions(id)
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
  birthday TEXT,       -- Format: 'YYYY-MM-DD'
  last_notification_at DATETIME,
  total_orders INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cài đặt hệ thống (Enterprise Control)
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bơm cài đặt mặc định
INSERT OR IGNORE INTO system_settings (key, value) VALUES ('ai_persona', 'Huy - Trợ lý bán hàng nhiệt tình');
INSERT OR IGNORE INTO system_settings (key, value) VALUES ('ai_temperature', '0.7');
INSERT OR IGNORE INTO system_settings (key, value) VALUES ('escalate_threshold', '5000000');
INSERT OR IGNORE INTO system_settings (key, value) VALUES ('enable_auto_notifications', '1');
INSERT OR IGNORE INTO system_settings (key, value) VALUES ('market_code', 'TH');

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

-- Mapping Fanpage -> Market [NEW Phase 8]
CREATE TABLE IF NOT EXISTS market_page_mapping (
  page_id TEXT PRIMARY KEY,
  market_code TEXT NOT NULL,
  access_token TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
