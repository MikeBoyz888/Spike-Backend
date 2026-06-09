const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({ //gửi mail
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = { //define nội dung mail
        from: `"Spike Garment" <${process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        html: options.message, //nội dung mail
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;