const express = require('express');
const router = express.Router();
// const multer = require('multer');
const auth = require('../../common/middleware/auth.middleware');
const messageController = require('./message.controller');
const upload = require('../../common/middleware/upload.middleware');

router.get('/:conversationId/messages', auth, messageController.getMessage);
router.post('/:conversationId/messages/text', auth, messageController.sentTextMessage);
router.post('/:conversationId/messages/image', auth, upload.array('images'), messageController.sentImageMessage);
router.patch('/:conversationId/messages/read', auth, messageController.markRead);
router.post('/messages/cancel/:requestId', auth, messageController.sendNotiMessage)

module.exports = router;