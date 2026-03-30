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

const completeRescue = async (postId) => {
    await repo.completeAssignment(postId);
    await repo.updatePostStatus(postId, 'completed');
    return { message: "Ca cứu hộ đã hoàn thành!" };
}

const failRescue = async (postId) => {
    // 1. Xóa việc phân công hiện tại để người khác có thể nhận
    await repo.cancelAssignment(postId);
    
    // 2. Đưa trạng thái bài post về 'pending' (ban đầu)
    await repo.updatePostStatus(postId, 'pending');
    
    return { message: "Đã hủy tiếp nhận, ca cứu hộ đã quay lại danh sách chờ." };
}

module.exports = {
    acceptRescue,
    completeRescue, 
    failRescue      
}