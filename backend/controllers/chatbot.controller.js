const chatbotService = require('../models/chatbot.service');

const chat = async (req, res) => {
    try {
        const { message } = req.body;

        const reply = await chatbotService.getReply(message || '');

        res.json(reply);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            type: 'text',
            message: 'Something went wrong while processing your message.'
        });
    }
};

module.exports = {
    chat
};