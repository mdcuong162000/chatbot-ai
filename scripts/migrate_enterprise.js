const db = require('./src/db');

console.log('--- MIGRATING DATABASE FOR ENTERPRISE PHASE ---');

try {
  // 1. Thêm cột vào bảng customers
  db.prepare("ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'new_lead'").run();
  db.prepare("ALTER TABLE customers ADD COLUMN priority_level TEXT DEFAULT 'normal'").run();
  db.prepare("ALTER TABLE customers ADD COLUMN last_purchase_date DATETIME").run();
  console.log('✅ Updated customers table (status, priority_level, last_purchase_date)');
} catch (e) {
  console.log('⚠️ Metadata columns might already exist in customers table.');
}

try {
  // 2. Tạo bảng complaints
  db.prepare(`
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
    )
  `).run();
  console.log('✅ Created complaints table');
} catch (e) {
  console.error('❌ Error creating complaints table:', e.message);
}

console.log('--- MIGRATION COMPLETE ---');
process.exit(0);
