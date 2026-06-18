const User = require('../models/user');
const userService = require('../service/user');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const Product = require('../models/product');

const registerUser = async (req, res) => {
    try {
        const user = await userService.registerUser(req.body);

        res.status(201).json({
            success: true,
            message: 'User registered successfully!',
        });
    } catch (error) {
        console.log('Error registering user:', error);
        res.status(500).json({
            success: false, message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const result = await userService.loginUser(req.body);
        res.status(200).json({
            success: true,
            message: 'User logged in successfully!',
            data: result
        });
    } catch (error) {
        console.log('Error: logging in user:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const googleLogin = async (req, res) => {
    try {
        const { tokenId } = req.body; //gửi token cho Google
        const ticket = await client.verifyIdToken({ //google xác thưc token
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { email, name, picture } = ticket.getPayload(); //lấy thông tin user từ token của google

        let user = await User.findOne({ email: email });
        if (user) { //user đã từng đk, đăng nhập
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES }
            );
            return res.status(200).json({
                success: true,
                message: 'User logged in successfully!',
                token: token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    avatar: picture
                }
            });
        } else { //khách mới chưa tạo tk 
            const randomPassword = email + process.env.JWT_SECRET; //tạo pass ngẫu nhiên từ email + secret
            user = new User({
                name: name,
                email: email,
                password: randomPassword,
                avatar: picture
            });
            await user.save();

            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES }
            );
            return res.status(201).json({
                success: true,
                message: 'User registered and logged in successfully!',
                token: token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                    avatar: picture
                }
            });
        }
    } catch (error) {
        console.log('Error: Google login:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password').populate('wishlist'); //lấy thông tin user trừ pass
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.log('Error fetching user profile:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const updateData = { ...req.body };

        if (req.file) {
            updateData.avatar = req.file.path; //cập nhật avatar nếu có file mới
        }

        if (updateData.password) {
            delete updateData.password; //xóa password nếu có trong updateData để tránh bị lộ
        }

        const updateUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true } //trả về data mới
        ).select('-password'); //xóa pass khỏi data trả về

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully!',
            data: updateUser
        });
    } catch (error) {
        console.log('Error updating profile:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        await userService.forgotPassword(req.body.email);
        res.status(200).json({
            success: true,
            message: 'OTP sent to email'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        await userService.verifyOtp(email, otp);
        res.status(200).json({
            success: true,
            message: 'OTP verified'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        await userService.resetPassword(email, otp, newPassword);
        res.status(200).json({
            success: true,
            message: 'Password reset successfully! Please login again'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const toggleWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;

        console.log("Debug - UserId:", userId);
        console.log("Debug - ProductId:", productId);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Cannot find User ID from Token"
            });
        }

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Missing productId"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not exist in database"
            });
        }

        if (!user.wishlist) user.wishlist = [];

        const isProductInWishlist = user.wishlist.includes(productId); //kiểm tra sản phẩm có trong wishlist chưa
        if (isProductInWishlist) {
            user.wishlist = user.wishlist.filter(id => id.toString() !== productId.toString());
            await user.save();
            return res.status(200).json({
                success: true,
                added: false,
                message: "Removed"
            });
        } else {
            user.wishlist.push(productId);
            await user.save();
            return res.status(200).json({
                success: true,
                added: true,
                message: "Added"
            });
        }
    } catch (error) {
        console.error("Error Wishlist:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getWishlist = async (req, res) => {
    try {
        const wishlist = await userService.getWishlist(req.user.userId);
        res.status(200).json({ success: true, data: wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const getMyReviews = async (req, res) => {
    try {
        const userId = req.user.userId;

        const products = await Product.find({ "reviews.user": userId }) //tìm toàn bộ sp đã review theo user
            .select('name slug images reviews');

        let myReviews = [];

        products.forEach(prod => {
            const userReview = prod.reviews.find(r => r.user.toString() === userId.toString());
            if (userReview) {
                myReviews.push({
                    product: {
                        _id: prod._id,
                        name: prod.name,
                        slug: prod.slug,
                        image: prod.images[0]
                    },
                    rating: userReview.rating,
                    comment: userReview.comment,
                    images: userReview.images,
                    createdAt: userReview.createdAt
                });
            }
        });

        myReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); //review mới nhất lên đầu

        res.status(200).json({ success: true, data: myReviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json({
            success: true,
            message: 'User deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateRole = async (req, res) => {
    try {
        const { role } = req.body;
        const updated = await userService.updateUserRole(req.params.id, role);
        res.status(200).json({
            success: true,
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId; // lấy từ middleware verifyToken
        const { currentPassword, newPassword } = req.body;

        await userService.changePassword(userId, currentPassword, newPassword);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully!'
        });
    } catch (error) {
        console.log('Error changing password:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    googleLogin,
    updateProfile,
    forgotPassword,
    verifyOtp,
    resetPassword,
    toggleWishlist,
    getWishlist,
    getMyReviews,
    getAllUsers,
    deleteUser,
    updateRole,
    changePassword
};