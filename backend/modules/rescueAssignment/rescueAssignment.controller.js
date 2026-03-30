const service = require('./rescueAssignment.service');

const acceptRescue = async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;

        const assignment = await service.acceptRescue(postId, userId);

        res.json({
            message: 'Rescue request accepted successfully',
            assignment
        });
    } catch (err) {
        console.log("assignment error: ", err);

        res.status(400).json({
            message: err.message
        });
    }
}

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