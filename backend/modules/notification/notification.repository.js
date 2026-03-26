const db = require('../../config/db');

const create = async (userId, title, content, type) => {
    const query = 'INSERT INTO notifications (user_id, title, content, type) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [userId, title, content, type];
    const { rows } = await db.query(query, values);
    return rows[0];
};

module.exports = { create };