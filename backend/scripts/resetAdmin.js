const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function resetAdmin() {
  try {
    // Delete existing admin user
    await pool.query('DELETE FROM users WHERE username = ?', ['admin']);

    // Create new password hash
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new admin user with proper SQL syntax
    const [result] = await pool.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', hashedPassword, 'superadmin']
    );

    console.log('Admin user reset successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting admin:', err);
    process.exit(1);
  }
}

resetAdmin(); 