const contactService = require('../service/contact');

const submitContactForm = async (req, res) => {
    try {
        await contactService.sendContactEmail(req.body);

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully!'
        });
    } catch (error) {
        console.log('Error sending contact email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
};

module.exports = { submitContactForm };