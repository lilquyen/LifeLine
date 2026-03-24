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

module.exports = {
    acceptRescue
}