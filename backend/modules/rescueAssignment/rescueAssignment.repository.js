const db = require('../../config/db');

const createAssignment = async (postId, rescuerId) => {
    const query = `
        INSERT INTO rescue_assignments (request_id, rescuer_id, assigned_at)
        VALUES ($1, $2, NOW())
        RETURNING *;
    `;

    const result = await db.query(query, [postId, rescuerId]);
    return result.rows[0];
}

// check da co nguoi dang nhan cuu chua
const findActiveAssignment = async (postId) => {
    const result = await db.query(`
        SELECT * FROM rescue_assignments
        WHERE request_id = $1 AND status = 'accepted'
    `, [postId]);

    return result.rows[0];
}

const updatePostStatus = async (postId, status) => {
    const query = `
        UPDATE rescue_requests
        SET status = $1
        WHERE id = $2
        RETURNING *;
    `;

    const result = await db.query(query, [status, postId]);
    return result.rows[0];
}

// Đánh dấu hoàn thành
const completeAssignment = async (postId) => {
    await db.query(`
        UPDATE rescue_assignments 
        SET status = 'completed', finished_at = NOW() 
        WHERE request_id = $1 AND status = 'accepted'
    `, [postId]);
};

// Hủy phân công (Khi thất bại/muốn nhường người khác)
const cancelAssignment = async (postId) => {
    const query = `
        UPDATE rescue_assignments 
        SET status = 'cancelled' 
        WHERE request_id = $1 AND status = 'accepted'
        RETURNING *;
    `;
    const result = await db.query(query, [postId]);
    return result.rows[0];
};


module.exports = {
    createAssignment,
    findActiveAssignment,
    updatePostStatus,
    completeAssignment, // Thêm mới
    cancelAssignment // Thêm mới
}