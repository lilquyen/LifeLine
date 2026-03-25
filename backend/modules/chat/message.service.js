const messageRepo = require('./message.repository');
const { getIo } = require('../../common/socket');

const sentMessage = async (data) => {
    const message = await messageRepo.insertMessage(data);

    getIo().to(`conversation_${data.conversationId}`).emit('new_message', message);

    return message;
}

const getMessage = async (conversationId) => {
    return messageRepo.findMessagesByConversationId(conversationId);
}

const markRead = async (conversationId, userId) => {
    const updatedCount = await messageRepo.markRead(conversationId, userId);

    if (updatedCount > 0) {
        getIo().to(`conversation_${conversationId}`).emit('messages_read', { conversationId, userId });
    }

    return updatedCount;
}

module.exports = {
    sentMessage,
    getMessage
}