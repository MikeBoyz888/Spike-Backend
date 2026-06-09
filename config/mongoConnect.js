const mongoose = require('mongoose');

const DataBaseConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('DATABASE CONNECTED SUCCESSFULLY');
    } catch (error) {
        console.error('DATABASE CONNECTION ERROR: ', error);
    }
};

module.exports = DataBaseConnect;