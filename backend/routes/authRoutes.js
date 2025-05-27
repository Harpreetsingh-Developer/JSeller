const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);
router.post('/register', auth, checkRole(['superadmin']), authController.register);
router.get('/users', auth, checkRole(['superadmin']), authController.getUsers);

module.exports = router; 