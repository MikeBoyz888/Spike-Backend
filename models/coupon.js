const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercent: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date, required: true },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] //coupon đã dùng theo list user
});

module.exports = mongoose.model('Coupon', couponSchema);