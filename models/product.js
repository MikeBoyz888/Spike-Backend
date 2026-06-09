const mongoose = require('mongoose');
const category = require('./category');

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true, max: 5, min: 1 },
        comment: { type: String, required: true },
        images: [{ type: String }]
    },
    {
        timestamps: true,
    }
);

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, lowercase: true, unique: true },
        description: { type: String },
        basePrice: { type: Number, required: true }, //giá gốc
        brand: { type: String, required: true },
        category: { //link với bảng category
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },

        variants: [
            {
                color: { type: String, required: true },
                size: { type: String, required: true },
                stock: { type: Number, required: true, min: 0 },
            }
        ],
        images: [{ type: String }], //tạm lưu ảnh dạng string

        reviews: [reviewSchema],
        rating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema); //trích product để dùng ở nơi khác
