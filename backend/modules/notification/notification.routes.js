const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const auth = require('../../common/middleware/auth.middleware');

router.get('/my', auth, notificationController.getMyNotifications);
router.patch('/:id/read', auth, notificationController.markAsRead);
router.patch('/read-all', auth, notificationController.markAllAsRead);
router.post('/send', auth, notificationController.sendEmergency);

module.exports = router;
