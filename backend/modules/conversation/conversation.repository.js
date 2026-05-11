const db = require('../../config/db');

const createConversation = async (data) => {
  const query = `
    INSERT INTO conversations (
      request_id,
      victim_id,
      rescuer_id,
      created_at,
      is_active
    )
    VALUES ($1, $2, $3, NOW(), TRUE)
    RETURNING *
  `;

  const values = [
    data.requestId,
    data.victimId,
    data.rescuerId
  ];

  const result = await db.query(query, values);

  return result.rows[0];
};

const findConversationByRequestId = async (requestId) => {
  const query = `
    SELECT *
    FROM conversations
    WHERE request_id = $1
      AND is_active = TRUE
    LIMIT 1
  `;

  const result = await db.query(query, [requestId]);

  return result.rows[0];
};

const inactiveConversation = async (conversationId) => {
  const query = `
    UPDATE conversations
    SET is_active = FALSE
    WHERE id = $1
  `;

  const result = await db.query(query, [conversationId]);

  return result.rowCount > 0;
};

module.exports = {
  createConversation,
  findConversationByRequestId,
  inactiveConversation
};