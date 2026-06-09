const express = require('express');
const router = express.Router();
const couponController = require('../controller/coupon');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.post('/validate', couponController.validateCoupon);
router.get('/latest', couponController.getLatestCoupon);

router.get('/all', verifyToken, isAdmin, couponController.getAllCoupons);
router.post('/create', verifyToken, isAdmin, couponController.createCoupon);
router.put('/expire/:id', verifyToken, isAdmin, couponController.expireCoupon);

module.exports = router;