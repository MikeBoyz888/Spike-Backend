const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendContactEmail = async (contactData) => {
    const { name, email, subject, message } = contactData;

    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USERNAME,
        replyTo: email, //gửi lại reply đến mail khách
        subject: `[Website Contact] ${subject}`,
        html: `
            <h2>You have a new message from your website!</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr/>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
        `
    };

    await transporter.sendMail(mailOptions);
    return true;
};

module.exports = { sendContactEmail };