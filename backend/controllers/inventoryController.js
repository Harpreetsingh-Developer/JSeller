const pool = require('../config/database');

const inventoryController = {
  getAll: async (req, res) => {
    try {
      const [items] = await pool.query(
        'SELECT * FROM inventory ORDER BY name'
      );
      res.json(items);
    } catch (err) {
      console.error('Error getting inventory:', err);
      res.status(500).json({ message: err.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const [items] = await pool.query(
        'SELECT * FROM inventory WHERE id = ?',
        [req.params.id]
      );
      
      if (items.length === 0) {
        return res.status(404).json({ message: 'Item not found' });
      }
      
      res.json(items[0]);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const { name, category, quantity, weight_unit, price_per_unit } = req.body;
      
      const [result] = await pool.query(
        'INSERT INTO inventory (name, category, quantity, weight_unit, price_per_unit) VALUES (?, ?, ?, ?, ?)',
        [name, category, quantity, weight_unit, price_per_unit]
      );
      
      res.status(201).json({
        id: result.insertId,
        name,
        category,
        quantity,
        weight_unit,
        price_per_unit
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const { name, category, quantity, weight_unit, price_per_unit } = req.body;
      
      await pool.query(
        'UPDATE inventory SET name = ?, category = ?, quantity = ?, weight_unit = ?, price_per_unit = ? WHERE id = ?',
        [name, category, quantity, weight_unit, price_per_unit, req.params.id]
      );
      
      res.json({ message: 'Item updated successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await pool.query('DELETE FROM inventory WHERE id = ?', [req.params.id]);
      res.json({ message: 'Item deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = inventoryController; 