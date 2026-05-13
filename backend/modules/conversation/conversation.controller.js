const conversationService = require('./conversation.service');
const rescuePostService = require('../rescuePost/rescuePost.service');
const { get } = require('http');

const createConversation = async (req, res) => {
  try {
    const rescure_id = req.user.id;
    const request_id = req.params.postId;
    const victim_id = await rescuePostService.getVictimByPostId(request_id);

    const existingConversationId = await conversationService.isConversationExistsByRequestIdRescuerId(rescure_id, request_id);
    if (existingConversationId) {
      conversation = await conversationService.getConversationById(existingConversationId);
    } else {
      conversation = await conversationService.createConversation(rescure_id, victim_id, request_id);
    }

    res.status(201).json({
      success: true,
      message: 'Conversation created successfully',
      data: conversation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

const getConversationByRequestId = async (req, res) => {
  try {
    const conversation = await conversationService.getConversationByRequestId(req.user.id, req.params.requestId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

const getMyConversations = async (req, res) => {
  try {
    const conversations = await conversationService.getMyConversations(req.user.id);

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

const getConversationById = async (req, res) => {
  try {
    const conversation = await conversationService.getConversationById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

module.exports = {
  createConversation,
  getConversationByRequestId,
  getMyConversations,
  getConversationById
};