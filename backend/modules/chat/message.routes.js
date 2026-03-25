const express = require('express');
const router = express.Router();
// const multer = require('multer');
const auth = require('../../common/middleware/auth.middleware');
const messageController = require('./message.controller');



router.get('/:conversationId/messages', auth, messageController.getMessage);
router.post('/:conversationId/messages/text', auth, messageController.sentTextMessage);
router.patch('/:conversationId/messages/read', auth, messageController.markRead);

module.exports = router;