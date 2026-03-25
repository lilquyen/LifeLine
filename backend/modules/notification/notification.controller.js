// controllers/notification.controller.js
const notificationService = require('./notification.service');

const sendEmergency = async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;
        const finalType = type || 'emergency';
        const result = await notificationService.notifyUser(userId, title, message, finalType);
        
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { sendEmergency };