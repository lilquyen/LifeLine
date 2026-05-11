const express = require('express');
const router = express.Router();

const conversationController = require('./conversation.controller');

router.post(
  '/create',
  conversationController.createConversation
);

router.get(
  '/request/:requestId',
  conversationController.getConversationByRequestId
)

module.exports = router;