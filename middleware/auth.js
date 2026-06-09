const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization; //quét token bắt đầu từ header

    if (!authHeader || !authHeader.startsWith('Bearer ')) { //nếu ko có token hoặc ko đúng định dạng Bearer <token>
        return res.status(401).json({
            success: false, 
            message: 'Unauthorized Token! Please login.' 
        });
    }

    const token = authHeader.split(' ')[1]; //bỏ chữ Bearer để lấy token thực sự

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //kiểm tra token có hợp lệ và chưa hết hạn không
        req.user = decoded; // xuất thông tin user nếu token hợp lệ
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or Expired Token! Please login again.'
        });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') { //kiểm tra xem user có role admin không
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Forbidden! Admins only.'
        });
    }
};

module.exports = {
    verifyToken,
    isAdmin
};
