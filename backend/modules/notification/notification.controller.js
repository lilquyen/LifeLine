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

const getMyNotifications = async (req, res) => {
    try {
        const data = await notificationService.getMyNotifications(req.user.id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const data = await notificationService.markAsRead(req.user.id, req.params.id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const data = await notificationService.markAllAsRead(req.user.id);
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    sendEmergency,
    getMyNotifications,
    markAsRead,
    markAllAsRead
};
