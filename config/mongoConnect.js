const mongoose = require('mongoose');

const DataBaseConnect = async () => {
    if (mongoose.connection.readyState >= 1) {
        console.log('Database is already connected!');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000, //báo lỗi sau 5s 
        });
        console.log('DATABASE CONNECTED SUCCESSFULLY');
    } catch (error) {
        console.error('DATABASE CONNECTION ERROR: ', error.message);
    }
};

module.exports = DataBaseConnect;