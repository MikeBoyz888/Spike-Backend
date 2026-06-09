const orderService = require('../service/order')

const createOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const order = await orderService.createOrder(userId, req.body);
        res.status(201).json({
            success: true,
            message: 'Order created successfully!',
            data: order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await orderService.getOrderHistory(userId);
        res.status(200).json({
            success: true,
            count: orders.length, //đếm xem khách đã đặt bao nhiêu đơn
            data: orders
        });
    } catch (error) {
        console.log('Error retrieving order history:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const checkAllOrderAdmin = async (req, res) => {
    try {
        const orders = await orderService.checkAllOrderAdmin();
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.log('Error retrieving all orders:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id; //lây id đơn hàng từ url
        const { status } = req.body; //lấy status mới từ body
        const updatedOrder = await orderService.updateOrderStatus(orderId, status);
        res.status(200).json({
            success: true,
            message: 'Order status updated successfully!',
            data: updatedOrder
        });
    } catch (error) {
        console.log('Error updating order status:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const checkDashboardStats = async (req, res) => {
    try {
        const stats = await orderService.checkDashboardStats();
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.log('Error retrieving dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createOrder,
    getOrderHistory,
    checkAllOrderAdmin,
    updateOrderStatus,
    checkDashboardStats
};