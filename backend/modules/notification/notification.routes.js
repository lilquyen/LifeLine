// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');

// Khi có người nhấn nút cứu hộ, Frontend sẽ POST vào đây
router.post('/send', notificationController.sendEmergency);

module.exports = router;