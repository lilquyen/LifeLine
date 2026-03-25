const express = require('express');
const router = express.Router();
const notificationRoutes = require('../modules/notification/notification.routes');

router.use('/notifications', notificationRoutes);

router.use('/auth', require('../modules/user/user.routes'));

router.use('/rescue-posts', require('../modules/rescuePost/rescuePost.routes'));

router.use('/assignments', require('../modules/rescueAssignment/rescueAssignment.routes'));

module.exports = router;