const messageService = require('./message.service');
const conversationService = require('../conversation/conversation.service');
const imageService = require('../../common/services/uploadImage.service');

const getMessage = async (req, res) => {
    try {
        const messages = await messageService.getMessage(req.params.conversationId);
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const sentTextMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const message = await messageService.sentMessage({
            conversationId: req.params.conversationId,
            senderId: req.user.id,
            content
        });
        res.status(201).json(message);
        console.log('Message sent:', message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const sentImageMessage = async (req, res) => {
    try {
        const imageUrls = await imageService.uploadImages(req.files);
        const message = await messageService.sendImageMessage({
            conversationId: req.params.conversationId,
            senderId: req.user.id,
            content: imageUrls
        });
        res.status(201).json(message);
        console.log('Image message sent:', message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const markRead = async (req, res) => {
    try {
        const updatedCount = await messageService.markRead(req.params.conversationId, req.user.id);
        res.json({ updatedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

const sendNotiMessage = async (req, res) => {
    try {
        const conversationId = await conversationService.getConversationByRequestId(req.user.id, req.params.requestId);

        if (!conversationId) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const message = await messageService.sentMessage({
            conversationId: conversationId.id,
            senderId: req.user.id,
            content: req.body.content
        });

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getMessage,
    sentTextMessage,
    markRead,
    sentImageMessage,
    sendNotiMessage
}