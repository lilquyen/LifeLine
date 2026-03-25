const db = require('../../config/db');

const createConversation = async (data) => {
    const query = `
        INSERT INTO conversations (request_id, victim_id, rescurer_id, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
    `;

    const values = [data.requestId, data.victimId, data.rescurerId];

    const result = await db.query(query, values);
    return result.rows[0];
}

module.exports = {
    createConversation
}