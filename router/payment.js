const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment');
const { verifyToken } = require('../middleware/auth');

router.post('/create_payment_url/:orderId', verifyToken, paymentController.createPaymentUrl);
router.get('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;