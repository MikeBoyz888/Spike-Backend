const express = require('express');
const router = express.Router();
const userController = require('../controller/user');
const { verifyToken, isAdmin } = require('../middleware/auth');
const { uploadAvatar } = require('../config/cloudinaryConfig'); //middleware upload ảnh lên cloudinary

router.post('/register', userController.registerUser); //đăng ký người dùng mới
router.post('/login', userController.loginUser); //đăng nhập người dùng
router.get('/profile', verifyToken, userController.getUserProfile); //xem profile user
router.post('/google-login', userController.googleLogin); //đăng nhập bằng Google
router.put('/profile', verifyToken, uploadAvatar.single('avatar'), userController.updateProfile); //chỉ up 1 ảnh
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-otp', userController.verifyOtp);
router.post('/reset-password', userController.resetPassword);
router.post('/wishlist/toggle', verifyToken, userController.toggleWishlist);
router.get('/my-reviews', verifyToken, userController.getMyReviews);

router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);
router.put('/role/:id', verifyToken, isAdmin, userController.updateRole);

module.exports = router;