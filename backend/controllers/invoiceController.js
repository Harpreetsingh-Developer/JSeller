const pool = require('../config/database');

const invoiceController = {
  getAll: async (req, res) => {
    try {
      const [invoices] = await pool.query(`
        SELECT i.*, c.name as contact_name 
        FROM invoices i 
        LEFT JOIN contacts c ON i.contact_id = c.id 
        ORDER BY i.created_at DESC
      `);
      res.json(invoices);
    } catch (err) {
      console.error('Error getting invoices:', err);
      res.status(500).json({ message: err.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const [invoices] = await pool.query(`
        SELECT i.*, c.name as contact_name 
        FROM invoices i 
        LEFT JOIN contacts c ON i.contact_id = c.id 
        WHERE i.id = ?
      `, [req.params.id]);

      if (invoices.length === 0) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      // Get invoice items
      const [items] = await pool.query(`
        SELECT ii.*, inv.name as item_name 
        FROM invoice_items ii 
        LEFT JOIN inventory inv ON ii.inventory_id = inv.id 
        WHERE ii.invoice_id = ?
      `, [req.params.id]);

      const invoice = invoices[0];
      invoice.items = items;

      res.json(invoice);
    } catch (err) {
      console.error('Error getting invoice:', err);
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { paid_amount, status } = req.body;
      const invoiceId = req.params.id;

      // Get the current invoice data
      const [invoices] = await connection.query(
        'SELECT contact_id, total_amount, paid_amount FROM invoices WHERE id = ?',
        [invoiceId]
      );

      if (invoices.length === 0) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      const invoice = invoices[0];
      const paidDifference = paid_amount - invoice.paid_amount;

      // Update invoice
      await connection.query(
        'UPDATE invoices SET paid_amount = ?, status = ? WHERE id = ?',
        [paid_amount, status, invoiceId]
      );

      // Update contact's balance
      await connection.query(
        'UPDATE contacts SET current_balance = current_balance - ? WHERE id = ?',
        [paidDifference, invoice.contact_id]
      );

      await connection.commit();
      res.json({ message: 'Invoice updated successfully' });
    } catch (err) {
      await connection.rollback();
      console.error('Error updating invoice:', err);
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  },

  create: async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { contact_id, items } = req.body;
      
      // Calculate total amount
      const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);

      // Create invoice
      const [result] = await connection.query(
        'INSERT INTO invoices (contact_id, total_amount, paid_amount, status) VALUES (?, ?, ?, ?)',
        [contact_id, total_amount, 0, 'pending']
      );

      const invoice_id = result.insertId;

      // Create invoice items
      for (const item of items) {
        await connection.query(
          'INSERT INTO invoice_items (invoice_id, inventory_id, quantity, price_per_unit, total_price) VALUES (?, ?, ?, ?, ?)',
          [invoice_id, item.inventory_id, item.quantity, item.price_per_unit, item.quantity * item.price_per_unit]
        );

        // Update inventory quantity
        await connection.query(
          'UPDATE inventory SET quantity = quantity - ? WHERE id = ?',
          [item.quantity, item.inventory_id]
        );
      }

      // Update contact's balance (add the total amount to their balance)
      await connection.query(
        'UPDATE contacts SET current_balance = current_balance + ? WHERE id = ?',
        [total_amount, contact_id]
      );

      await connection.commit();
      res.status(201).json({ id: invoice_id, message: 'Invoice created successfully' });
    } catch (err) {
      await connection.rollback();
      console.error('Error creating invoice:', err);
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  }
};

module.exports = invoiceController; 