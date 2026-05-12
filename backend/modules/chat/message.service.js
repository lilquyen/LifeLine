const messageRepo = require('./message.repository');
const { getIo } = require('../../common/socket');

const sentMessage = async (data) => {
    const message = await messageRepo.insertMessage(data);

    getIo().to(`conversation_${data.conversationId}`).emit('new_message', message);

    return {
        ...message,
        image_urls: []
    };
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

const sendImageMessage = async (data) => {
    const message = await messageRepo.insertImageMessage(data);

    await messageRepo.insertMessageImages(message.id, data.content);

    getIo().to(`conversation_${data.conversationId}`).emit('new_message', message);

    return {
        ...message,
        image_urls: data.content
    }
}

module.exports = {
    sentMessage,
    getMessage, 
    markRead,
    sendImageMessage
}