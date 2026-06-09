const { create } = require('../models/category');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const Category = require('../models/category');

const createProduct = async (productData) => {

    if (!productData.slug && productData.name) {
        productData.slug = productData.name.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    const product = new Product(productData);
    return await product.save();
};

const getProductBySlug = async (slug) => {
    const product = await Product.findOne({ slug: slug });
    if (!product) {
        throw new Error('Product not found!');
    }
    return product;
};

const getProductById = async (id) => {
    const product = await Product.findById(id).populate('category');
    if (!product) throw new Error("Product not found!");
    return product;
};

const updateProduct = async (id, updateData) => {
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedProduct) throw new Error("Product not found!");
    return updatedProduct;
};

const deleteProduct = async (id) => {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) throw new Error("Product not found!");
    return deletedProduct;
};

const getAllProducts = async (query) => {
    const page = parseInt(query.page) || 1; //mặc định  khách ở trang 1
    const limit = parseInt(query.limit) || 9; //1 trang hiện 9 sp
    const skip = (page - 1) * limit; //bỏ qua sp cũ khi qua trang mới

    let filter = {};
    if (query.keyword) {
        filter.name = { $regex: query.keyword, $options: 'i' }; //tìm sp theo keyword, $regex để tìm kiếm từ gần đúng, $options: 'i' để không phân biệt hoa thường
    }
    if (query.category) {
        filter.category = query.category; //lọc sp theo category nếu có
    }
    if (query.brand) {
        // ^ và $ để đảm bảo tìm khớp chính xác chữ
        filter.brand = { $regex: new RegExp('^' + query.brand + '$', 'i') };
    }
    if (query.color) {
        filter['variants.color'] = { $regex: new RegExp('^' + query.color + '$', 'i') };
    }

    let sortOption = { createdAt: -1 }; //mặc định sp mới lên đầu
    if (query.sort === 'oldest') {
        sortOption = { createdAt: 1 }; // cũ nhất lên đầu
    }
    if (query.sort === 'price_asc') {
        sortOption = { basePrice: 1 }; //giá tăng dần
    }
    if (query.sort === 'price_desc') {
        sortOption = { basePrice: -1 }; //giá giảm dần
    }

    const products = await Product.find(filter).sort(sortOption).skip(skip).limit(limit);

    const totalProducts = await Product.countDocuments(filter); //đếm tổng số sp sau khi lọc để tính tổng trang
    const totalPages = Math.ceil(totalProducts / limit); //tính tổng trang

    return {
        products: products,
        pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalProducts: totalProducts,
            limit: limit
        }
    };
};

const createReview = async (productId, userId, reviewData, images) => {
    const { rating, comment } = reviewData;

    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found!');
    }

    const alreadyReviewed = product.reviews.find((review) => review.user.toString() === userId.toString());
    if (alreadyReviewed) {
        throw new Error('You have reviewed this product already');
    }

    const hasBought = await Order.findOne({
        user: userId,
        status: 'Delivered',
        'products.productId': productId
    });
    if (!hasBought) {
        throw new Error('Cannot review because you haven\'t bought this product');
    }

    const user = await User.findById(userId);
    const review = {
        user: userId,
        name: user.name,
        rating: Number(rating),
        comment: comment,
        images: images
    };

    product.reviews.push(review);
    product.totalReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    return product;
};

const getFilterOptions = async () => { //distinct giúp lấy các giá trị không trùng trong database
    const categories = await Category.find({}, '_id name');

    const rawBrands = await Product.distinct('brand');
    const uniqueBrands = [...new Set(rawBrands.map(b => b.trim().toUpperCase()))]; //ép các chữ về chữ in hoa

    const rawColors = await Product.distinct('variants.color');
    const uniqueColors = [...new Set(rawColors.map(c => c.trim().toUpperCase()))];

    return {
        categories,
        brands: uniqueBrands,
        colors: uniqueColors
    };
}

module.exports = {
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductBySlug,
    getAllProducts,
    createReview,
    getFilterOptions
};