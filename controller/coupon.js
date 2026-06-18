const couponService = require('../service/coupon.js');

const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.userId;
        const result = await couponService.validateCoupon(code, userId);
        res.status(200).json({ success: true, discountPercent: result.discountPercent });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const createCoupon = async (req, res) => {
    try {
        const result = await couponService.createCoupon(req.body);
        res.status(201).json({ success: true, data: result, message: 'Coupon created successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const expireCoupon = async (req, res) => {
    try {
        const updated = await couponService.expireCoupon(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Coupon expired successfully',
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await couponService.getAllCoupons();
        res.status(200).json({ success: true, data: coupons });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getLatestCoupon = async (req, res) => {
    try {
        const result = await couponService.getLatestCoupon();
        if (result) {
            res.status(200).json({ success: true, data: result });
        } else {
            res.status(404).json({ success: false, message: 'No active coupon found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    validateCoupon,
    createCoupon,
    expireCoupon,
    getAllCoupons,
    getLatestCoupon
};