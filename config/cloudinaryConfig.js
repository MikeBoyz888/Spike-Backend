const cloudinary = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

cloudinary.config({ //config từ file .env
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const productStorage = new CloudinaryStorage({ // setting thư mục ảnh
    cloudinary: cloudinary,
    params: {
        folder: 'Spike_Products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    }
});

const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Avatar',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' }, // Giới hạn 400x400, AI tự động tìm khuôn mặt để đưa vào trung tâm
            { quality: 'auto', fetch_format: 'auto' } // Tự động nén dung lượng xuống thấp nhất mà không mờ
        ]
    }
});

const uploadProduct = multer({ storage: productStorage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = {
    uploadProduct,
    uploadAvatar
};