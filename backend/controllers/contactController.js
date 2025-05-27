const pool = require('../config/database');

const contactController = {
  getAll: async (req, res) => {
    try {
      const [contacts] = await pool.query(
        'SELECT * FROM contacts ORDER BY name'
      );
      res.json(contacts);
    } catch (err) {
      console.error('Error getting contacts:', err);
      res.status(500).json({ message: err.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const [contacts] = await pool.query(
        'SELECT * FROM contacts WHERE id = ?',
        [req.params.id]
      );
      
      if (contacts.length === 0) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      res.json(contacts[0]);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  create: async (req, res) => {
    try {
      const { name, phone, email } = req.body;
      
      const [result] = await pool.query(
        'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
        [name, phone, email]
      );
      
      res.status(201).json({
        id: result.insertId,
        name,
        phone,
        email,
        current_balance: 0
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const { name, phone, email, current_balance } = req.body;
      
      await pool.query(
        'UPDATE contacts SET name = ?, phone = ?, email = ?, current_balance = ? WHERE id = ?',
        [name, phone, email, current_balance, req.params.id]
      );
      
      res.json({ message: 'Contact updated successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      await pool.query('DELETE FROM contacts WHERE id = ?', [req.params.id]);
      res.json({ message: 'Contact deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = contactController; 