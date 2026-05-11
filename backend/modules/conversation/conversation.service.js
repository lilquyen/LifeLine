const conversationRepository = require('./conversation.repository');

const createConversation = async (data) => {
  try {
    if (
      !data.requestId ||
      !data.victimId ||
      !data.rescuerId
    ) {
      throw new Error('Missing required fields');
    }

    const existingConversation =
      await conversationRepository.findConversationByRequestId(
        data.requestId
      );

    // Nếu đã có conversation active
    // thì inactive conversation cũ
    if (existingConversation) {
      await conversationRepository.inactiveConversation(
        existingConversation.id
      );
    }

    // Tạo conversation mới
    const newConversation =
      await conversationRepository.createConversation(data);

    console.log('New conversation created:', newConversation);

    return newConversation;

  } catch (error) {
    console.error('Create conversation error:', error);
    throw error;
  }
};

const getConversationByRequestId = async (requestId) => {
  try {
    const conversation =
      await conversationRepository.findConversationByRequestId(
        requestId
      );

    return conversation;

  } catch (error) {
    console.error('Get conversation error:', error);
    throw error;
  }
};

const getMyConversations = async (userId) => {
  return await conversationRepository.getMyConversations(userId);
}

module.exports = {
  createConversation,
  getConversationByRequestId,
  getMyConversations
};