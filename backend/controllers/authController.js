const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authController = {
  register: async (req, res) => {
    try {
      const { username, password, role } = req.body;
      
      // Check if user exists
      const [existingUser] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const [result] = await pool.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );

      res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
      }

      // Get user from database
      const [users] = await pool.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = users[0];

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from user object
      delete user.password;

      res.json({
        token,
        user
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  getMe: async (req, res) => {
    try {
      const [users] = await pool.query(
        'SELECT id, username, role, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(users[0]);
    } catch (err) {
      console.error('Get me error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  },

  getUsers: async (req, res) => {
    try {
      const [users] = await pool.query(
        'SELECT id, username, role, created_at FROM users'
      );
      res.json(users);
    } catch (err) {
      console.error('Get users error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
};

module.exports = authController; 