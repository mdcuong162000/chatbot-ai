const db = require('../db');

class KnowledgeService {
  /**
   * Truy xuất toàn bộ sản phẩm đang active (theo thị trường)
   */
  getAllActiveProducts(marketCode = 'TH') {
    const stmt = db.prepare('SELECT * FROM products WHERE is_active = 1 AND market_code = ?');
    return stmt.all(marketCode).map(this._parseProductJSON);
  }

  /**
   * Truy xuất toàn bộ FAQ đang active (theo thị trường)
   */
  getAllActiveFaqs(marketCode = 'TH', industry = 'general') {
    const stmt = db.prepare('SELECT * FROM faqs WHERE is_active = 1 AND market_code = ? AND industry = ?');
    return stmt.all(marketCode, industry);
  }

  /**
   * Lấy chi tiết 1 sản phẩm
   */
  getProductById(id) {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const product = stmt.get(id);
    return product ? this._parseProductJSON(product) : null;
  }

  /**
   * Thêm sản phẩm mới (Thẻ kiến thức)
   */
  createProduct(data) {
    const id = data.id || `prod_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO products (id, name, price, variants, fits_who, occasion, selling_points, objections, style_tip, handover_rules, market_code, industry, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      data.name,
      data.price,
      data.variants ? JSON.stringify(data.variants) : null,
      data.fits_who,
      data.occasion,
      data.selling_points ? JSON.stringify(data.selling_points) : null,
      data.objections ? JSON.stringify(data.objections) : null,
      data.style_tip,
      data.handover_rules ? JSON.stringify(data.handover_rules) : null,
      data.market_code || 'TH',
      data.industry || 'general',
      data.is_active !== undefined ? data.is_active : 1
    );

    return this.getProductById(id);
  }

  /**
   * FAQ Management [NEW Phase 7]
   */
  createFaq(data) {
    const id = `faq_${Date.now()}`;
    const stmt = db.prepare(`
      INSERT INTO faqs (id, question, answer, market_code, industry, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, data.question, data.answer, data.market_code || 'TH', data.industry || 'general', 1);
    return { id, ...data };
  }

  getFaqById(id) {
    return db.prepare('SELECT * FROM faqs WHERE id = ?').get(id);
  }

  /**
   * Tag Management [NEW Phase 7]
   */
  getAllTagDefinitions() {
    const tags = db.prepare('SELECT * FROM tag_definitions WHERE is_active = 1').all();
    return tags.map(t => ({ ...t, fields: t.fields_json ? JSON.parse(t.fields_json) : [] }));
  }

  createTagDefinition(data) {
    const id = `tag_${Date.now()}`;
    const stmt = db.prepare('INSERT INTO tag_definitions (id, name, color, fields_json) VALUES (?, ?, ?, ?)');
    stmt.run(id, data.name, data.color, JSON.stringify(data.fields || []));
    return { id, ...data };
  }

  /**
   * Cập nhật sản phẩm
   */
  updateProduct(id, data) {
    // Chuyển object fields thành câu lệnh UPDATE động
    const updates = [];
    const values = [];
    
    const jsonFields = ['variants', 'selling_points', 'objections', 'handover_rules'];
    
    for (const [key, value] of Object.entries(data)) {
      if (['id', 'created_at'].includes(key)) continue; // Không cho sửa id / ngày tạo
      
      updates.push(`${key} = ?`);
      values.push(jsonFields.includes(key) && value ? JSON.stringify(value) : value);
    }

    if (updates.length === 0) return this.getProductById(id);

    const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);
    
    db.prepare(sql).run(...values);
    
    return this.getProductById(id);
  }

  /**
   * Xóa / Ẩn sản phẩm
   */
  deleteProduct(id) {
    // Soft delete
    db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(id);
    return { success: true, message: 'Đã ẩn sản phầm' };
  }

  /**
   * Tìm kiếm sản phẩm theo keyword (phục vụ Routing)
   */
  searchProducts(query) {
    const stmt = db.prepare('SELECT * FROM products WHERE name LIKE ? AND is_active = 1');
    const products = stmt.all(`%${query}%`);
    return products.map(this._parseProductJSON);
  }

  /**
   * Lấy danh sách gợi ý sản phẩm (Upsell/Cross-sell) [NEW Phase 13]
   */
  getRecommendations(productId) {
    const recommendationsMap = {
      'juni_cleanser': ['sun_juni', 'lunys_serum'],      // Rửa mặt -> Chống nắng / Serum
      'lunys_serum': ['lunys_cream'],                  // Serum -> Kem dưỡng (Full bộ LUNYS)
      'sun_juni': ['juni_cleanser'],                   // Chống nắng -> Rửa mặt (Tẩy trang)
      'lunys_cream': ['lunys_serum'],                  // Kem dưỡng -> Serum
      'th_p1': ['lunys_cream'],                        // Serum Thái -> Kem dưỡng
      'th_p2': ['sun_juni']                            // Rửa mặt Thái -> Chống nắng
    };

    const relatedIds = recommendationsMap[productId] || [];
    return relatedIds.map(id => this.getProductById(id)).filter(p => p && p.is_active);
  }

  // Parse lại JSON fields khi xuất ra
  _parseProductJSON(product) {
    try {
      if (product.variants) product.variants = JSON.parse(product.variants);
      if (product.selling_points) product.selling_points = JSON.parse(product.selling_points);
      if (product.objections) product.objections = JSON.parse(product.objections);
      if (product.handover_rules) product.handover_rules = JSON.parse(product.handover_rules);
    } catch (e) {
      console.warn('Lỗi parse JSON cho product', product.id);
    }
    return product;
  }
}

module.exports = new KnowledgeService();
