const express = require('express');
const router = express.Router();

router.use('/auth', require('../modules/user/user.routes'));
router.use('/rescue-posts', require('../modules/rescuePost/rescuePost.routes'));
router.use('/assignments', require('../modules/rescueAssignment/rescueAssignment.routes'));
router.use('/locations', require('../modules/locationHistory/locationHistory.routes'));
router.use('/chat', require('../modules/chat/message.routes'));
router.use('/conversations', require('../modules/conversation/conversation.routes'));

module.exports = router;