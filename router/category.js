const express = require('express');
const router = express.Router();
const categoryController = require('../controller/category');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/create', verifyToken, isAdmin, categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.delete('/:id', verifyToken, isAdmin, categoryController.deleteCategory);
router.put('/:id', verifyToken, isAdmin, categoryController.updateCategory);

module.exports = router;