const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new Error('Password must contain at least 1 uppercase letter, 1 number, 1 special character and be at least 8 characters long.');
    }
};


const registerUser = async (userData) => {
    const { name, email, password } = userData;

    validatePassword(password);

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
        throw new Error('This email already in use! Please choose another one.');
    }

    const salt = await bcrypt.genSalt(10); //tạo chuỗi ngẫu nhiên
    const hashedPassword = await bcrypt.hash(password, salt); //trộn pass với chuỗi salt random

    const newUser = new User({
        name: name,
        email: email,
        password: hashedPassword
    });

    await newUser.save();
    return newUser;
};

const loginUser = async (data) => {
    const { email, password } = data;

    const user = await User.findOne({ email: email });
    if (!user) {
        throw new Error('This email have not been registered! Please check again.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Incorrect password! Please check again.');
    }

    const payload = {
        userId: user._id,
        role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
    );

    return {
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            avatar: user.avatar
        },
        token: token
    };
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Email not found!');

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); //tạo otp random

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = { //gửi mail
        from: `"Spike Garment" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset OTP - Spike Garment',
        text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
    };
    await transporter.sendMail(mailOptions);

    return true;
};

const verifyOtp = async (email, otp) => {
    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordOtpExpires: { $gt: Date.now() } // kiểm tra OTP còn hạn không
    });

    if (!user) throw new Error('Invalid or expired OTP!');
    return true;
};

const resetPassword = async (email, otp, newPassword) => {
    validatePassword(password);

    const user = await User.findOne({
        email,
        resetPasswordOtp: otp,
        resetPasswordOtpExpires: { $gt: Date.now() }
    });

    if (!user) throw new Error('Invalid or expired OTP!');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt); //mã hóa pass mới

    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined; //xóa otp vừa dùng

    await user.save();
    return true;
};

const toggleWishlist = async (userId, productId) => {
    const user = await User.findById(userId);
    const isProductInWishlist = user.wishlist.includes(productId);
    if (isProductInWishlist) {
        user.wishlist.pull(productId); //sp đã có trong wishlist thì xóa
    } else {
        user.wishlist.push(productId); //sp chưa có trong wishlist thì thêm
    }
    await user.save();
    return { added: !isProductInWishlist };
};

const getWishlist = async (userId) => {
    const user = await User.findById(userId).populate('wishlist');
    return user.wishlist;
};

const getAllUsers = async () => {
    return await User.find().select('-password').sort({ createdAt: -1 });
};

const deleteUser = async (id) => {
    return await User.findByIdAndDelete(id);
};

const updateUserRole = async (id, role) => {
    return await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
    toggleWishlist,
    getWishlist,
    getAllUsers,
    deleteUser,
    updateUserRole
};