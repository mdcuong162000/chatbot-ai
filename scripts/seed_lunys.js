const db = require('./src/db');

console.log('--- SEEDING NEW PRODUCT: LUNYS BLACK GINSENG SERUM ---');

const product = {
  id: 'lunys_serum_juni',
  name: 'LUNYS Black Ginseng Serum JUNI',
  price: 399, // Base price for 1+1 bundle
  variants: JSON.stringify([
    "Mua 1 Tặng 1: 399B",
    "Mua 2 Tặng 2: 599B (Săn deal hời)",
    "Mua 5 Tặng 5: 1,299B (Giá sỉ tốt nhất)"
  ]),
  fits_who: 'Mọi loại da, kể cả da nhạy cảm, da bị sạm nám, tàn nhang hoặc có nếp nhăn.',
  occasion: 'Dùng hàng ngày (Sáng và Tối) để dưỡng trắng và trẻ hóa da.',
  selling_points: JSON.stringify([
    "Sức mạnh kép: Nhân sâm đen tinh khiết + Bakuchiol (Retinol thực vật) không gây bong tróc",
    "Thành phần vàng: Tranexamic Acid & Alpha Arbutin giúp xử lý tận gốc sạm nám, thâm mụn",
    "Hiệu quả rõ rệt sau 7 ngày sử dụng",
    "Kết cấu mỏng nhẹ, thấm cực nhanh, không gây bít tắc lỗ chân lông",
    "Dermatologically Tested (Đã kiểm nghiệm da liễu), an toàn 100%"
  ]),
  style_tip: 'Nên kết hợp với Kem chống nắng vào ban ngày để bảo vệ thành quả dưỡng trắng tốt nhất.',
  is_active: 1
};

try {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO products (id, name, price, variants, fits_who, occasion, selling_points, style_tip, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    product.id,
    product.name,
    product.price,
    product.variants,
    product.fits_who,
    product.occasion,
    product.selling_points,
    product.style_tip,
    product.is_active
  );
  
  console.log('✅ Seeded Lunys Black Ginseng Serum JUNI successfully!');
} catch (err) {
  console.error('❌ Error seeding product:', err.message);
}

process.exit(0);
