const cartService = require('../service/cart');

const addToCart = async (req, res) => {
    try {
        const userId = req.user.userId; //lấy userId từ token đã xác thực (Auth middleware)

        const updateCart = await cartService.addToCart(userId, req.body); //thêm sp vào cart
        res.status(200).json({
            success: true,
            message: 'Product added to cart successfully!',
            data: updateCart
        });
    } catch (error) {
        console.log('Error adding to cart:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const checkCart = async (req, res) => {
    try {
        const cart = await cartService.checkCart(req.user.userId);
        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.log('Error checking cart:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updatedCart = await cartService.removeFromCart(userId, req.body);
        res.status(200).json({
            success: true,
            message: 'Product removed from cart successfully!',
            data: updatedCart
        });
    } catch (error) {
        console.log('Error removing from cart:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateCart = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updatedCart = await cartService.updateCartQuantity(userId, req.body);

        res.status(200).json({
            success: true,
            message: 'Cart quantity updated successfully!',
            data: updatedCart
        });
    } catch (error) {
        console.log('Error updating cart quantity:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addToCart,
    checkCart,
    removeFromCart,
    updateCart
};
