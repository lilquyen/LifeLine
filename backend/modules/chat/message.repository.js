const db = require('../../config/db');

const insertMessage = async (data) => {
    const query = `
        INSERT INTO messages (conversation_id, sender_id, content, sent_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *
    `;
    const values = [data.conversationId, data.senderId, data.content];

    const result = await db.query(query, values);
    return result.rows[0];
}

const findMessagesByConversationId = async (conversationId) => {
    const query = `
    SELECT m.*, mi.image_url, u.full_name AS sender_name
    FROM messages m
    LEFT JOIN message_images mi ON mi.message_id = m.id
    LEFT JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = $1
    ORDER BY m.sent_at ASC`

    const values = [conversationId];
    const result = await db.query(query, values);

    return result.rows;
}

const markRead = async (conversationId, userId) => {
    const query = `
        UPDATE messages
        SET is_read = TRUE
        WHERE conversation_id = $1 
        AND sender_id != $2 
        AND is_read = FALSE
    `
    const values = [conversationId, userId];

    const result = await db.query(query, values);
    return result.rowCount;
}

module.exports = {
    insertMessage,
    markRead
}
