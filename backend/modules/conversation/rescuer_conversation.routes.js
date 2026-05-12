const express = require('express');
const router = express.Router();

const authMiddleware = require('../../common/middleware/auth.middleware');
const conversationController = require('./conversation.controller');

router.get(
  '/:conversationId',
  authMiddleware,
  conversationController.getConversationById
);

module.exports = router;