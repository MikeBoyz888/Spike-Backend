const express = require('express');
const router = express.Router();
const cartController = require('../controller/cart');
const { verifyToken } = require('../middleware/auth');

router.post('/add', verifyToken, cartController.addToCart); //khách phải có token để thêm sản phẩm vào giỏ hàng
router.get('/', verifyToken, cartController.checkCart); //khách phải có token để xem giỏ hàng
router.post('/remove', verifyToken, cartController.removeFromCart); //khách phải có token để xóa sản phẩm khỏi giỏ hàng
router.get('/check', verifyToken, cartController.checkCart);
router.put('/update', verifyToken, cartController.updateCart);

module.exports = router;