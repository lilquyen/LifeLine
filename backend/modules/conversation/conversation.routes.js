const express = require('express');
const router = express.Router();

const authMiddleware = require('../../common/middleware/auth.middleware');
const conversationController = require('./conversation.controller');

router.post(
  '/create',
  conversationController.createConversation
);

router.get(
  '/request/:requestId',
  conversationController.getConversationByRequestId
)

router.get(
  '/my',
  authMiddleware,
  conversationController.getMyConversations
);

module.exports = router;