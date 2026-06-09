const User = require('../models/user');

const addToCart = async (userId, cartData) => {
    const { productId, color, size, quantity } = cartData;
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found!');
    }

    const existingItemIndex = user.cart.findIndex( //kiểm tra sp cùng màu & size đã có trong cart chưa
        (item) => item.product.toString() === productId && item.color === color && item.size === size
    );

    if (existingItemIndex > -1) { //nếu có, + thêm số lượng
        user.cart[existingItemIndex].quantity += quantity;
    } else { //nếu chưa có, thêm mới vào cart
        user.cart.push({ product: productId, color, size, quantity });
    }

    await user.save();
    const updatedUser = await User.findById(userId).populate('cart.product', 'name basePrice images slug');
    return updatedUser.cart;
};

const checkCart = async (userId) => {
    const user = await User.findById(userId).populate('cart.product', 'name basePrice images slug'); //populate để chuyển id sang thông tin sp
    if (!user) {
        throw new Error('User not found!');
    }
    return user.cart;
};

const removeFromCart = async (userId, cartData) => {
    const { productId, color, size } = cartData;
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found!');
    }
    user.cart = user.cart.filter( //lọc bỏ sp có id, màu, size trùng với yêu cầu xóa
        (item) => !(item.product.toString() === productId && item.color === color && item.size === size)
    );
    await user.save();
    const updatedUser = await User.findById(userId).populate('cart.product', 'name basePrice images slug');
    return updatedUser.cart;
}

const updateCartQuantity = async (userId, cartData) => {
    const { productId, color, size, quantity } = cartData;
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found!');
    }

    const existingItemIndex = user.cart.findIndex(
        (item) => item.product.toString() === productId && item.color === color && item.size === size
    );

    if (existingItemIndex > -1) { //gán số mới thay vì cộng dồn
        user.cart[existingItemIndex].quantity = quantity;
        await user.save();
    } else {
        throw new Error('Product not found in cart!');
    }

    const updatedUser = await User.findById(userId).populate('cart.product', 'name basePrice images slug');
    return updatedUser.cart;
};

module.exports = {
    addToCart,
    checkCart,
    removeFromCart,
    updateCartQuantity
};