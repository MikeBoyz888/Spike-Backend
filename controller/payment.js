const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');
const { sortObject } = require('../utils/vnpayHelper');
const Order = require('../models/order');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/user'); // gọi User để lấy email của khách

const createPaymentUrl = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Can\'t find the order! Please try again.'
            });
        }

        process.env.TZ = 'Asia/Ho_Chi_Minh';
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');

        let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || '127.0.0.1';

        let tmnCode = process.env.VNP_TMN_CODE;
        let secretKey = process.env.VNP_HASH_SECRET;
        let vnpApiUrl = process.env.VNP_API_URL;
        let returnUrl = process.env.VNP_RETURN_URL;

        let amount = order.totalAmount;
        let bankCode = '';

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId; // Dùng ID đơn hàng làm mã giao dịch luôn
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang cho Spike Garment';
        vnp_Params['vnp_OrderType'] = '200000';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPay yêu cầu nhân 100
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = expireDate;
        if (bankCode !== null && bankCode !== '') {
            vnp_Params['vnp_BankCode'] = bankCode;
        }
        vnp_Params = sortObject(vnp_Params);
        let signData = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);

        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

        vnp_Params['vnp_SecureHash'] = signed;
        vnpApiUrl += '?' + qs.stringify(vnp_Params, { encode: false });

        res.status(200).json({
            success: true,
            message: 'VNPay link created successfully',
            paymentUrl: vnpApiUrl
        });

    } catch (error) {
        console.log('VNPay error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
        vnp_Params = sortObject(vnp_Params);

        let secretKey = process.env.VNP_HASH_SECRET;
        let signeDate = qs.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signeDate, 'utf-8')).digest("hex");

        if (secureHash === signed) {
            let orderId = vnp_Params['vnp_TxnRef'];
            let rspCode = vnp_Params['vnp_ResponseCode'];

            if (rspCode === '00') {
                const updatedOrder = await Order.findByIdAndUpdate(orderId, { //thanh toán thành công -> update đơn ->xóa cart
                    status: 'Processing',
                    paymentMethod: 'VNPay - Paid'
                }, { new: true });

                const user = await User.findById(updatedOrder.user);
                user.cart = [];
                await user.save();

                try {
                    const message = `... nội dung mail ...`;  // Gửi mail báo thanh toán thành công
                    await sendEmail({ email: user.email, subject: 'Transaction Confirmed', message });
                } catch (emailError) {
                    console.log('Error sending email:', emailError);
                }

                res.redirect(`${process.env.FRONTEND_URL}/profile?status=success`);
            } else {
                res.redirect(`${process.env.FRONTEND_URL}/checkout?status=failed`);
            }
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid signature!'
            });
        }
    } catch (error) {
        console.log('VNPay return error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createPaymentUrl,
    vnpayReturn
};