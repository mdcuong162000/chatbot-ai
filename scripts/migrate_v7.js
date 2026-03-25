const Database = require('better-sqlite3');
const path = require('path');

// Determine DB path (Railway or Local)
const dbPath = process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production' 
    ? '/tmp/chatbot.db' 
    : path.resolve(__dirname, '../src/db/chatbot.db');

console.log('Connecting to database at:', dbPath);
const db = new Database(dbPath);

try {
    console.log('Starting Phase 7 migration...');

    // 1. Update products table (Check if columns exist first)
    const columns = db.prepare("PRAGMA table_info(products)").all();
    const columnNames = columns.map(c => c.name);

    if (!columnNames.includes('market_code')) {
        console.log('Adding market_code to products...');
        db.prepare("ALTER TABLE products ADD COLUMN market_code TEXT DEFAULT 'TH'").run();
    }
    if (!columnNames.includes('industry')) {
        console.log('Adding industry to products...');
        db.prepare("ALTER TABLE products ADD COLUMN industry TEXT DEFAULT 'general'").run();
    }

    // 2. Create FAQs table
    console.log('Creating faqs table...');
    db.prepare(`
        CREATE TABLE IF NOT EXISTS faqs (
            id TEXT PRIMARY KEY,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            market_code TEXT DEFAULT 'TH',
            industry TEXT DEFAULT 'general',
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // 3. Create Tag Definitions table
    console.log('Creating tag_definitions table...');
    db.prepare(`
        CREATE TABLE IF NOT EXISTS tag_definitions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT,
            fields_json TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    // 4. Create Customer Tag Data table
    console.log('Creating customer_tag_data table...');
    db.prepare(`
        CREATE TABLE IF NOT EXISTS customer_tag_data (
            customer_id TEXT NOT NULL,
            tag_id TEXT NOT NULL,
            values_json TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (customer_id, tag_id),
            FOREIGN KEY(customer_id) REFERENCES customers(id),
            FOREIGN KEY(tag_id) REFERENCES tag_definitions(id)
        )
    `).run();

    console.log('Phase 7 migration completed successfully!');
} catch (err) {
    console.error('Migration failed:', err.message);
} finally {
    db.close();
}
