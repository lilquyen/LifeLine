const repo = require('./rescueAssignment.repository');
const rescuePostRepo = require('../rescuePost/rescuePost.repository');
const notificationService = require('../notification/notification.service');

const acceptRescue = async (postId, userId) => {
    const existing = await repo.findActiveAssignment(postId);

    if (existing) {
        throw new Error('This rescue request has already been accepted by another rescuer');
    }

    const assignment = await repo.createAssignment(postId, userId);
    await repo.updatePostStatus(postId, 'assigned');

    return assignment;
}

const completeRescue = async (postId, note = null) => {
    const assignment = await repo.completeAssignment(postId, note);
    if (!assignment) {
        throw new Error('Active assignment not found');
    }

    await repo.updatePostStatus(postId, 'completed');

    try {
        const post = await rescuePostRepo.getPostById(postId);
        if (post?.user_id) {
            await notificationService.notifyUser(
                post.user_id,
                'Ca cuu ho da hoan tat',
                `${post.title} da duoc danh dau hoan tat.`,
                'request_completed',
                postId
            );
        }
    } catch (notifyError) {
        console.warn('Complete rescue notification failed:', notifyError.message);
    }

    return { message: 'Ca cuu ho da hoan thanh!', assignment };
}

const failRescue = async (postId, reason = null) => {
    const assignment = await repo.cancelAssignment(postId, reason);
    if (!assignment) {
        throw new Error('Active assignment not found');
    }

    await repo.updatePostStatus(postId, 'pending');

    try {
        const post = await rescuePostRepo.getPostById(postId);
        if (post?.user_id) {
            await notificationService.notifyUser(
                post.user_id,
                'Ca cuu ho da quay lai danh sach cho',
                `${post.title} chua duoc ho tro thanh cong va dang cho nguoi khac tiep nhan.`,
                'request_reopened',
                postId
            );
        }
    } catch (notifyError) {
        console.warn('Reopen rescue notification failed:', notifyError.message);
    }

    return { message: 'Da huy tiep nhan, ca cuu ho da quay lai danh sach cho.', assignment };
}

const getMyAllAssignment = async (rescuerId) => {
    return repo.getMyAllAssignment(rescuerId);
}

const confirmByVictim = async (postId, victimId, rating, feedback) => {
    const assignment = await repo.confirmByVictim(postId, victimId, rating, feedback);
    if (assignment?.rescuer_id) {
        await notificationService.notifyUser(
            assignment.rescuer_id,
            'Nan nhan da xac nhan ho tro',
            `Yeu cau #${postId} da duoc nan nhan xac nhan.`,
            'victim_confirmed',
            postId
        );
    }
    return assignment;
}

module.exports = {
    acceptRescue,
    completeRescue,
    failRescue,
    getMyAllAssignment,
    confirmByVictim
}
