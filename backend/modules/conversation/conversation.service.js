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

    const existingConversationId = await conversationRepository.isConversationExistsByRequestIdRescuerId(
      data.requestId,
      data.rescuerId
    );

    if (existingConversationId) {
      await conversationRepository.activeConversation(existingConversationId);
      return await conversationRepository.getConversationById(existingConversationId);
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
    
    const newConversation = await conversationRepository.createConversation(data);

    console.log('New conversation created:', newConversation);

    return newConversation;

  } catch (error) {
    console.error('Create conversation error:', error);
    throw error;
  }
};

const getConversationByRequestId = async (userId, requestId) => {
  try {
    const conversation =
      await conversationRepository.getConversationByRequestId(
        userId,
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

const getConversationById = async (conversationId) => {
  return await conversationRepository.getConversationById(conversationId);
}

const isConversationExistsByRequestIdRescuerId = async (requestId, rescuerId) => {
  return await conversationRepository.isConversationExistsByRequestIdRescuerId(requestId, rescuerId);
}

module.exports = {
  createConversation,
  getConversationByRequestId,
  getMyConversations,
  getConversationById,
  isConversationExistsByRequestIdRescuerId
};