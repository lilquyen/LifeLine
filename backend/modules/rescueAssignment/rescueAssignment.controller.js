const rescueService = require('./rescueAssignment.service');
const conversationService = require('../conversation/conversation.service');
const rescuePostService = require('../rescuePost/rescuePost.service');

const acceptRescue = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;
        const victimId = await rescuePostService.getVictimByPostId(postId);

        console.log('Accepting rescue request:', { postId, userId, victimId });

        // accept rescue
        const assignment = await rescueService.acceptRescue(
            postId,
            userId
        );

        // tạo conversation
        const conversation =
            await conversationService.createConversation({
                requestId: postId,
                victimId: victimId,
                rescuerId: userId
            });

        return res.status(200).json({
            success: true,
            message: 'Rescue request accepted successfully',
            assignment,
            conversation
        });

    } catch (err) {
        console.log('assignment error:', err);

        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
    acceptRescue
};

const completeRescue = async (req, res) => {
    try {
        const result = await service.completeRescue(req.params.postId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

const failRescue = async (req, res) => {
    try {
        const result = await service.failRescue(req.params.postId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

module.exports = {
    acceptRescue,
    completeRescue,
    failRescue
}