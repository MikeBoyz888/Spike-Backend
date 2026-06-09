const Order = require('../models/order');
const User = require('../models/user');
const Coupon = require('../models/coupon');
const Product = require('../models/product');

const createOrder = async (userId, orderData) => {
    const { shippingAddress, paymentMethod, shippingFee = 0, couponCode } = orderData;

    const user = await User.findById(userId).populate('cart.product', 'name basePrice');

    if (!user || user.cart.length === 0) {
        throw new Error('Cart is empty, cannot create order!');
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of user.cart) {
        if (!item.product) {
            throw new Error('Product in cart have sold out or don\'t exist!');
        }
        subtotal += item.product.basePrice * item.quantity;

        orderItems.push({
            productId: item.product._id,
            name: item.product.name,
            price: item.product.basePrice,
            color: item.color,
            size: item.size,
            quantity: item.quantity
        });
    }

    let discountAmount = 0;
    let appliedCoupon = null; // lưu code để lưu vào DB

    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });

        if (coupon.usedBy.includes(userId)) {
            throw new Error('You have already used this coupon!');
        }

        if (coupon && new Date() < coupon.expiryDate) {
            discountAmount = (subtotal * coupon.discountPercent) / 100;
            appliedCoupon = coupon.code; // Lưu mã hợp lệ
        } else {
            throw new Error('Coupon code is invalid or expired!');
        }

        coupon.usedBy.push(userId);
        await coupon.save();
    }

    const finalTotalAmount = (subtotal - discountAmount) + Number(shippingFee);

    const newOrder = new Order({
        user: userId,
        products: orderItems,
        subtotal: subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon,
        shippingFee: Number(shippingFee),
        totalAmount: finalTotalAmount,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod || 'COD'
    });
    await newOrder.save();
    return newOrder;
};

const finalizeOrder = async (userId, orderId) => {// Chỉ xóa cart khi thanh toán thành công
    const user = await User.findById(userId);
    user.cart = [];
    await user.save();

    await Order.findByIdAndUpdate(orderId, { status: 'Paid' });
};

const getOrderHistory = async (userId) => {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    return orders;
};

const checkAllOrderAdmin = async () => { //check hóa đơn của user theo tên và email
    const orders = await Order.find().populate('user', 'username email').sort({ createdAt: -1 });
    return orders;
};

const updateOrderStatus = async (orderId, status) => {
    const updateOrder = await Order.findByIdAndUpdate( //tìm order theo id và cập nhật status
        orderId,
        { status: status },
        { new: true }
    );
    if (!updateOrder) {
        throw new Error('Order not found!');
    }
    return updateOrder;
};

const checkDashboardStats = async () => {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const revenueResult = await Order.aggregate([
        { $match: { status: 'Delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    const recentOrders = await Order.find()
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

    return {
        totalOrders,
        totalRevenue,
        totalUsers,
        totalProducts,
        recentOrders
    };
};

module.exports = {
    createOrder,
    getOrderHistory,
    checkAllOrderAdmin,
    updateOrderStatus,
    checkDashboardStats
};