const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', inventoryController.getAll);
router.get('/:id', inventoryController.getOne);
router.post('/', inventoryController.create);
router.put('/:id', inventoryController.update);
router.delete('/:id', inventoryController.delete);

module.exports = router; 