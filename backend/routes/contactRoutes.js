const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', contactController.getAll);
router.get('/:id', contactController.getOne);
router.post('/', contactController.create);
router.put('/:id', contactController.update);
router.delete('/:id', contactController.delete);

module.exports = router; 