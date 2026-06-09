const Coupon = require('../models/coupon');

const validateCoupon = async (code) => {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
        throw new Error('Coupon not found!');
    }
    if (new Date() > coupon.expiryDate) {
        throw new Error('Coupon has expired!');
    }

    return { discountPercent: coupon.discountPercent };
};

const createCoupon = async (data) => {
    const { code, discountPercent, expiryDate } = data;
    const newCoupon = new Coupon({
        code: code.toUpperCase(),
        discountPercent,
        expiryDate
    });
    return await newCoupon.save();
};

const expireCoupon = async (id) => {
    return await Coupon.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

const getAllCoupons = async () => {
    return await Coupon.find().sort({ createdAt: -1 });
};

const getLatestCoupon = async () => { //lấy coupon mới nhất
    const coupon = await Coupon.findOne({
        isActive: true,
        expiryDate: { $gt: new Date() } // Chỉ lấy mã còn hạn
    }).sort({ createdAt: -1 });

    return coupon;
};

module.exports = {
    validateCoupon,
    createCoupon,
    expireCoupon,
    getAllCoupons,
    getLatestCoupon
};