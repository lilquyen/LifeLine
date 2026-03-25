const messageService = require('./message.service');

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
    console.log('da bam');
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

const markRead = async (req, res) => {
    try {
        const updatedCount = await messageService.markRead(req.params.conversationId, req.user.id);
        res.json({ updatedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getMessage,
    sentTextMessage,
    markRead
}