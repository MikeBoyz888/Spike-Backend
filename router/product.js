const express = require('express');
const router = express.Router();
const productController = require('../controller/product');
const { uploadProduct } = require('../config/cloudinaryConfig');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/id/:id', productController.getProductById);
router.post('/create', verifyToken, isAdmin, uploadProduct.array('images', 5), productController.createProduct); //tạo product mới, upload tối đa 5 ảnh
router.put('/:id', verifyToken, isAdmin, uploadProduct.array('images', 5), productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);
router.get('/', productController.getAllProducts); //lấy all product, sắp xếp theo ngày tạo mới nhất
router.get('/filters', productController.getFilterOptions)
router.get('/:slug', productController.getProductBySlug); //lấy data product theo slug trong api/products/:slug
router.post('/:id/review', verifyToken, uploadProduct.array('images', 2), productController.createReview);

module.exports = router;