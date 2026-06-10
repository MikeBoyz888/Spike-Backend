require('dotenv').config(); //đọc file .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const DataBaseConnect = require('./config/mongoConnect'); // Kết nối đến MongoDB

const app = express();

DataBaseConnect();

app.use(cors());
app.use(express.json());

const userRouter = require('./router/user'); //router user
app.use('/api/user', userRouter); //đường dẫn đến user

const categoryRouter = require('./router/category'); //router category
app.use('/api/category', categoryRouter); //đường dẫn đến category

const productRouter = require('./router/product'); //router product
app.use('/api/product', productRouter); //đường dẫn đến product

const cartRouter = require('./router/cart');
app.use('/api/cart', cartRouter); //đường dẫn đến cart

const orderRouter = require('./router/order');
app.use('/api/order', orderRouter); //đường dẫn đến order

const paymentRouter = require('./router/payment');
app.use('/api/payment', paymentRouter);

const couponRouter = require('./router/coupon');
app.use('/api/coupon', couponRouter);

const contactRouter = require('./router/contact');
app.use('/api/contact', contactRouter);

app.get('/', (req, res) => {
    res.send("The Server is running!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

module.exports = app;

