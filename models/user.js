const mongoose = require('mongoose');
const { removeListener } = require('./category');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true }, //unique để tránh trùng email
    password: { type: String, required: true },
    role: { type: String, default: 'customer', enum: ['customer', 'admin'] }, //default tài khoản là customer
    phone: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/dtjlyyvjv/image/upload/v1780682421/defaultAvatar_mtocdv.png',
    },
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            color: { type: String, required: true },
            size: { type: String, required: true },
            quantity: { type: Number, default: 1 }
        }
    ],
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpires: { type: Date },
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
}, { timestamps: true }); //tự động thêm createdAt và updatedAt

module.exports = mongoose.models.User || mongoose.model('User', userSchema);