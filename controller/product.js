const productService = require('../service/product');

const createProduct = async (req, res) => {
    try {
        const productData = req.body;
        if (req.files && req.files.length > 0) {
            // lưu link ảnh và gom thành 1 mảng, boolean để bỏ undefined/null/rỗng
            productData.images = req.files.map(file => file.path || file.secure_url).filter(Boolean);
        }

        if (typeof productData.variants === 'string') { //chuyển dữ liệu variants (gốc là text) sang JSON cho mongodb đọc
            productData.variants = JSON.parse(productData.variants);
        }

        const savedProduct = await productService.createProduct(productData);

        res.status(201).json({
            success: true,
            message: 'Product created successfully!',
            data: savedProduct
        });
    } catch (error) {
        console.log('Error creating product:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await productService.getProductById(id);
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.log('Error fetching product by ID:', error);
        res.status(404).json({ success: false, message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const productData = req.body;
        if (typeof productData.variants === 'string') {
            productData.variants = JSON.parse(productData.variants);
        }

        let finalImages = [];

        // lấy danh sách ảnh cũ muốn giữ lại
        if (productData.existingImages) {
            finalImages = typeof productData.existingImages === 'string'
                ? JSON.parse(productData.existingImages)
                : productData.existingImages;
        }

        // nếu có ảnh mới upload lên, lấy path và nối thêm vào mảng finalImages
        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map(file => file.path);
            finalImages = [...finalImages, ...newImagePaths];
        }
        productData.images = finalImages;

        const updatedProduct = await productService.updateProduct(productId, productData);

        res.status(200).json({
            success: true,
            message: 'Product updated successfully!',
            data: updatedProduct
        });
    } catch (error) {
        console.log('Error updating product:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        await productService.deleteProduct(productId);
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully!'
        });
    } catch (error) {
        console.log('Error deleting product:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getProductBySlug = async (req, res) => {
    try {
        const slug = req.params.slug; //lấy slug từ api/product/:slug
        const product = await productService.getProductBySlug(slug);
        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        console.log('Error: cannot fetching product by slug:', error);
        res.status(404).json({
            success: false, message: error.message
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const result = await productService.getAllProducts(req.query); //truyền query từ url vào service để lọc, sắp xếp, phân trang
        res.status(200).json({
            success: true,
            data: result.products,
            pagination: result.pagination
        });
    } catch (error) {
        console.log('Error: can not fetching all products:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const createReview = async (req, res) => {
    try {
        const productId = req.params.id;
        const userId = req.user.userId;
        const images = req.files ? req.files.map(file => file.path) : [];

        await productService.createReview(productId, userId, req.body, images);
        res.status(201).json({
            success: true,
            message: 'Thanh kou for rating our product!'
        });
    } catch (error) {
        console.log('Error: Cannot review product', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

const getFilterOptions = async (req, res) => {
    try {
        const options = await productService.getFilterOptions();
        res.status(200).json({
            success: true,
            data: options
        });
    } catch (error) {
        console.log('Error fetching filter options:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

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