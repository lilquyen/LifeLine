const repo = require('./rescueAssignment.repository');

const acceptRescue = async (postId, userId) => {
    // check da co nguoi nhan cuu chua
    const existing = await repo.findActiveAssignment(postId);

    if(existing) {
        throw new Error('This rescue request has already been accepted by another rescuer');
    }

    // tao assignment moi
    const assignment = await repo.createAssignment(postId, userId);

    // cap nhat trang thai cua post
    await repo.updatePostStatus(postId, 'assigned');

    return assignment;
}

module.exports = {
    acceptRescue
}