const db = require('../../config/db');

const insertMessage = async (data) => {
    const query = `
        INSERT INTO messages (conversation_id, sender_id, content, sent_at, istext)
        VALUES ($1, $2, $3, NOW(), TRUE)
        RETURNING *
    `;
    const values = [data.conversationId, data.senderId, data.content];

    const result = await db.query(query, values);
    return result.rows[0];
}

const findMessagesByConversationId = async (conversationId) => {
    const query = `
    SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.content,
        m.is_read,
        m.sent_at,
        m.istext,
        u.full_name AS sender_name,

        COALESCE(
            ARRAY_AGG(mi.image_url)
            FILTER (WHERE mi.image_url IS NOT NULL),
            '{}'
        ) AS image_urls

    FROM messages m

    LEFT JOIN message_images mi 
        ON mi.message_id = m.id

    LEFT JOIN users u 
        ON u.id = m.sender_id

    WHERE m.conversation_id = $1

    GROUP BY 
        m.id,
        u.full_name

    ORDER BY m.sent_at ASC
    `;

    const values = [conversationId];
    const result = await db.query(query, values);

    return result.rows;
};

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

const insertImageMessage = async (data) => {
    const query = `
        INSERT INTO messages (conversation_id, sender_id, content, sent_at, istext)
        VALUES ($1, $2, '', NOW(), FALSE)
        RETURNING *
    `;
    const values = [data.conversationId, data.senderId];

    const result = await db.query(query, values);
    const message = result.rows[0];
    return message;
}

const insertMessageImages = async (
    messageId,
    imageUrls
) => {
    for (const imageUrl of imageUrls) {

        await db.query(
            `
            INSERT INTO message_images (
                message_id,
                image_url,
                created_at
            )
            VALUES ($1, $2, NOW())
            `,
            [messageId, imageUrl]
        );
    }
};

module.exports = {
    insertMessage,
    markRead,
    findMessagesByConversationId,
    insertImageMessage,
    insertMessageImages
}
