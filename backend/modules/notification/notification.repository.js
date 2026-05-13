const db = require('../../config/db');

const create = async (userId, title, content, type) => {
    const query = 'INSERT INTO notifications (user_id, title, content, type, ref_id) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const values = [userId, title, content, type.type || type, type.refId || null];
    const { rows } = await db.query(query, values);
    return rows[0];
};

const findByUserId = async (userId) => {
    const { rows } = await db.query(`
        SELECT id, user_id, type, title, content, ref_id, is_read, created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
    `, [userId]);

    return rows;
};

const countUnreadByUserId = async (userId) => {
    const { rows } = await db.query(`
        SELECT COUNT(1)::int AS unread_count
        FROM notifications
        WHERE user_id = $1 AND is_read = FALSE
    `, [userId]);

    return rows[0].unread_count;
};

const markAsRead = async (userId, notificationId) => {
    const { rows } = await db.query(`
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1 AND user_id = $2
        RETURNING *
    `, [notificationId, userId]);

    return rows[0];
};

const markAllAsRead = async (userId) => {
    await db.query(`
        UPDATE notifications
        SET is_read = TRUE
        WHERE user_id = $1 AND is_read = FALSE
    `, [userId]);
};

module.exports = {
    create,
    findByUserId,
    countUnreadByUserId,
    markAsRead,
    markAllAsRead
};
