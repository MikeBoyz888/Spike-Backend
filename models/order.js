const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: { type: String, required: true }, //tên sp lúc mua
            price: { type: Number, required: true }, //giá sp lúc mua
            color: String,
            size: String,
            quantity: Number
        }
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    paymentMethod: { type: String, default: 'COD' },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);