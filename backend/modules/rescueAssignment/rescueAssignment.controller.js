const rescueService = require('./rescueAssignment.service');
const conversationService = require('../conversation/conversation.service');
const rescuePostService = require('../rescuePost/rescuePost.service');
const notificationService = require('../notification/notification.service');

const acceptRescue = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;
        const victimId = await rescuePostService.getVictimByPostId(postId);

        const assignment = await rescueService.acceptRescue(postId, userId);

        const conversation = await conversationService.createConversation({
            requestId: postId,
            victimId,
            rescuerId: userId
        });

        try {
            await notificationService.notifyUser(
                victimId,
                'Yeu cau da duoc tiep nhan',
                'Mot nhan vien cuu ho da nhan yeu cau cua ban. Ban co the trao doi trong khung chat.',
                'request_assigned',
                postId
            );
        } catch (notifyError) {
            console.warn('Accept rescue notification failed:', notifyError.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Rescue request accepted successfully',
            assignment,
            conversation
        });
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

const completeRescue = async (req, res) => {
    try {
        const result = await rescueService.completeRescue(req.params.postId, req.body?.note || null);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const failRescue = async (req, res) => {
    try {
        const result = await rescueService.failRescue(req.params.postId, req.body?.reason || null);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const confirmByVictim = async (req, res) => {
    try {
        const result = await rescueService.confirmByVictim(
            req.params.postId,
            req.user.id,
            req.body?.rating || null,
            req.body?.feedback || null
        );
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

const getMyAllAssignment = async (req, res) => {
    try {
        const assignments = await rescueService.getMyAllAssignment(req.user.id);
        res.json(assignments);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

module.exports = {
    acceptRescue,
    completeRescue,
    failRescue,
    confirmByVictim,
    getMyAllAssignment
};
