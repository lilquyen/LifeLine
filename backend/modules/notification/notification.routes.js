const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');

router.post('/send', notificationController.sendEmergency);

module.exports = router;