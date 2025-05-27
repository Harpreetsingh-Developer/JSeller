const pool = require('../config/database');

const reportController = {
  getSalesReport: async (req, res) => {
    try {
      const { range } = req.query;
      let dateFilter;
      
      switch (range) {
        case 'week':
          dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
          break;
        case 'year':
          dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
        default: // month
          dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      }

      // Get total sales and invoice counts
      const [totals] = await pool.query(`
        SELECT 
          COUNT(*) as totalInvoices,
          SUM(total_amount) as totalSales,
          SUM(CASE WHEN status != 'paid' THEN total_amount - paid_amount ELSE 0 END) as pendingPayments
        FROM invoices
        WHERE 1=1 ${dateFilter}
      `);

      // Get daily sales
      const [dailySales] = await pool.query(`
        SELECT 
          DATE(created_at) as date,
          SUM(total_amount) as amount
        FROM invoices
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE(created_at)
        ORDER BY date
      `);

      res.json({
        totalSales: totals[0].totalSales || 0,
        totalInvoices: totals[0].totalInvoices || 0,
        averageInvoiceValue: (totals[0].totalSales / totals[0].totalInvoices) || 0,
        pendingPayments: totals[0].pendingPayments || 0,
        dailySales
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getInventoryReport: async (req, res) => {
    try {
      // Get total inventory value and count
      const [totals] = await pool.query(`
        SELECT 
          COUNT(*) as totalItems,
          SUM(quantity * price_per_unit) as totalValue
        FROM inventory
        WHERE quantity > 0
      `);

      // Get category breakdown
      const [categoryBreakdown] = await pool.query(`
        SELECT 
          COALESCE(category, 'Uncategorized') as category,
          SUM(quantity * price_per_unit) as value,
          COUNT(*) as itemCount
        FROM inventory
        WHERE quantity > 0
        GROUP BY category
        ORDER BY value DESC
      `);

      // Get low stock items (less than 10 units)
      const [lowStockItems] = await pool.query(`
        SELECT 
          name,
          category,
          quantity,
          weight_unit,
          price_per_unit
        FROM inventory
        WHERE quantity < 10
        ORDER BY quantity ASC
      `);

      // Format the response
      const response = {
        totalValue: totals[0].totalValue || 0,
        totalItems: totals[0].totalItems || 0,
        categoryBreakdown: categoryBreakdown.map(cat => ({
          category: cat.category,
          value: Number(cat.value || 0),
          itemCount: Number(cat.itemCount || 0)
        })),
        lowStockItems: lowStockItems.map(item => ({
          name: item.name,
          category: item.category,
          quantity: Number(item.quantity || 0),
          weight_unit: item.weight_unit,
          price_per_unit: Number(item.price_per_unit || 0)
        }))
      };

      res.json(response);
    } catch (err) {
      console.error('Error getting inventory report:', err);
      res.status(500).json({ message: err.message });
    }
  },

  getCustomerReport: async (req, res) => {
    try {
      // Get customer totals
      const [totals] = await pool.query(`
        SELECT 
          COUNT(*) as totalCustomers,
          SUM(current_balance) as totalDueAmount
        FROM contacts
      `);

      // Get payment status distribution
      const [paymentStats] = await pool.query(`
        SELECT 
          status,
          COUNT(*) as count
        FROM invoices
        GROUP BY status
      `);

      // Get top customers by purchase value
      const [topCustomers] = await pool.query(`
        SELECT 
          c.id,
          c.name,
          SUM(i.total_amount) as totalPurchases,
          c.current_balance as dueAmount
        FROM contacts c
        LEFT JOIN invoices i ON c.id = i.contact_id
        GROUP BY c.id
        ORDER BY totalPurchases DESC
        LIMIT 5
      `);

      const stats = paymentStats.reduce((acc, stat) => {
        acc[stat.status] = stat.count;
        return acc;
      }, { paid: 0, partial: 0, pending: 0 });

      res.json({
        totalCustomers: totals[0].totalCustomers || 0,
        totalDueAmount: totals[0].totalDueAmount || 0,
        paymentStats: stats,
        topCustomers
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = reportController; 