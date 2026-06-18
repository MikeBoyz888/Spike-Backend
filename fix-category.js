// fix-category.js
require('dotenv').config(); // Load biến môi trường
const mongoose = require('mongoose');
const Product = require('./models/product'); // Đường dẫn đến model của bạn
const Category = require('./models/category'); // Đường dẫn đến model của bạn

async function fixBrokenCategories() {
    try {
        // 1. Kết nối DB
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Kết nối DB thành công!");

        // 2. Lấy danh sách tất cả Category hiện có để biết đâu là ID hợp lệ
        const allCategories = await Category.find({});
        const validCategoryIds = allCategories.map(c => c._id.toString());
        console.log(`Tìm thấy ${validCategoryIds.length} category hợp lệ.`);

        // 3. Tìm tất cả sản phẩm
        const allProducts = await Product.find({});

        let fixedCount = 0;
        const newCategoryName = "Accessory"; // Tên category bạn vừa tạo lại
        const newCategory = await Category.findOne({ name: newCategoryName });

        if (!newCategory) {
            console.error("Không tìm thấy category 'Accessory' mới. Hãy tạo nó trước!");
            process.exit(1);
        }

        console.log(`Đang quét ${allProducts.length} sản phẩm...`);

        // 4. Kiểm tra từng sản phẩm
        for (let product of allProducts) {
            // Nếu category của sản phẩm không nằm trong danh sách valid ID (hoặc bị null/undefined)
            if (!product.category || !validCategoryIds.includes(product.category.toString())) {
                console.log(`Sản phẩm bị lỗi: ${product.name} (ID cũ: ${product.category})`);

                // Cập nhật về ID mới
                product.category = newCategory._id;
                await product.save();
                fixedCount++;
            }
        }

        console.log(`--- Xong! Đã sửa ${fixedCount} sản phẩm. ---`);
        process.exit(0);

    } catch (error) {
        console.error("Lỗi:", error);
        process.exit(1);
    }
}

fixBrokenCategories();