const db = require('../db');

class PatternService {
  /**
   * Phân tích tổng quan phễu chốt đơn (Win/Loss Ratio)
   */
  getConversionRates() {
    const stmt = db.prepare(`
      SELECT result, COUNT(*) as total 
      FROM outcomes 
      GROUP BY result
    `);
    const results = stmt.all();
    
    let bought = 0, noBuy = 0;
    results.forEach(r => {
      if (r.result === 'bought') bought = r.total;
      if (r.result === 'no_buy') noBuy = r.total;
    });

    const total = bought + noBuy;
    const winRate = total > 0 ? ((bought / total) * 100).toFixed(2) : 0;

    return { total, bought, no_buy: noBuy, win_rate_percent: parseFloat(winRate) };
  }

  /**
   * Tìm chiến thuật tư vấn (Style) hiệu quả nhất cho từng tầng phễu (Stage)
   * Vd: Tầng "dam_phan" thì chiến thuật FOMO sẽ có tỷ lệ chốt cao hơn?
   */
  getBestStrategyByStage(stage) {
    // Tìm style có số lượng 'bought' nhiều nhất trong một stage cụ thể
    const stmt = db.prepare(`
      SELECT style_used, COUNT(*) as success_count
      FROM outcomes
      WHERE customer_stage = ? AND result = 'bought'
      GROUP BY style_used
      ORDER BY success_count DESC
      LIMIT 1
    `);
    
    const bestRule = stmt.get(stage);
    
    if (bestRule) {
      return { stage, best_style: bestRule.style_used, successes: bestRule.success_count };
    }
    return null;
  }
}

module.exports = new PatternService();
