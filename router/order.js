const express = require('express');
const router = express.Router();
const orderController = require('../controller/order');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/create', verifyToken, orderController.createOrder);
router.get('/history', verifyToken, orderController.getOrderHistory);

router.get('/', verifyToken, isAdmin, orderController.checkAllOrderAdmin);
router.put('/:id', verifyToken, isAdmin, orderController.updateOrderStatus);
router.get('/stats', verifyToken, isAdmin, orderController.checkDashboardStats);

module.exports = router;