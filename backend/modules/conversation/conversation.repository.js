const { get } = require('http');
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

const getConversationByRequestId = async (userId, requestId) => {
  const result = await db.query(
    `
    SELECT
      c.id,
      c.request_id,
      r.title AS request_title,

      u.id AS other_user_id,
      u.phone AS other_user_phone,
      u.full_name AS other_user_name,
      u.avatar_url AS other_user_avatar,

      lm.content AS last_message,
      lm.sent_at AS last_message_time,

      COUNT(
        CASE 
          WHEN mu.sender_id != $1 AND mu.is_read = FALSE 
          THEN 1 
        END
      ) AS unread_count

    FROM conversations c

    LEFT JOIN users u
      ON u.id =
        CASE
          WHEN c.victim_id = $2
          THEN c.rescuer_id
          ELSE c.victim_id
        END

    LEFT JOIN messages lm
      ON lm.id = (
        SELECT id
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY sent_at DESC
        LIMIT 1
      )

    LEFT JOIN messages mu
      ON mu.conversation_id = c.id

    LEFT JOIN rescue_requests r
      ON r.id = c.request_id  

    WHERE c.request_id = $3
      AND c.is_active = TRUE
      AND (c.victim_id = $4 OR c.rescuer_id = $5)

    GROUP BY
      c.id,
      c.request_id,
      u.id,
      u.full_name,
      lm.content,
      lm.sent_at,
      r.title,
      u.phone,
      u.avatar_url

    ORDER BY lm.sent_at DESC
    LIMIT 1
    `,
    [userId, userId, requestId, userId, userId]  
  );

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

const getMyConversations = async (userId) => {

  const result = await db.query(
    `
    SELECT
      c.id,
      c.request_id,
      r.title AS request_title,

      u.id AS other_user_id,
      u.phone AS other_user_phone,
      u.full_name AS other_user_name,
      u.avatar_url AS other_user_avatar,

      lm.content AS last_message,
      lm.sent_at AS last_message_time,

      COUNT(
        CASE 
          WHEN mu.sender_id != $1 AND mu.is_read = FALSE 
          THEN 1 
        END
      ) AS unread_count

    FROM conversations c

    LEFT JOIN users u
      ON u.id =
        CASE
          WHEN c.victim_id = $2
          THEN c.rescuer_id
          ELSE c.victim_id
        END

    LEFT JOIN messages lm
      ON lm.id = (
        SELECT id
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY sent_at DESC
        LIMIT 1
      )

    LEFT JOIN messages mu
      ON mu.conversation_id = c.id

    LEFT JOIN rescue_requests r
      ON r.id = c.request_id  

    WHERE c.victim_id = $3
       OR c.rescuer_id = $4

    GROUP BY
      c.id,
      c.request_id,
      u.id,
      u.full_name,
      lm.content,
      lm.sent_at,
	    r.title,
      u.phone,
      u.avatar_url

    ORDER BY lm.sent_at DESC
    `,
    [userId, userId, userId, userId]  
  );

  return result.rows;
};

const getConversationById = async (conversationId) => {
  const result = await db.query(
    `
    SELECT
      c.id,
      c.request_id,
      r.title AS request_title,

      u.id AS other_user_id,
      u.phone AS other_user_phone,
      u.full_name AS other_user_name,
      u.avatar_url AS other_user_avatar

    FROM conversations c

    LEFT JOIN users u
      ON u.id =
        CASE
          WHEN c.victim_id = $2
          THEN c.rescuer_id
          ELSE c.victim_id
        END

    LEFT JOIN rescue_requests r
      ON r.id = c.request_id  

    WHERE c.id = $1
      AND c.is_active = TRUE
    `,
    [conversationId, conversationId]  
  );

  return result.rows[0];
};


module.exports = {
  createConversation,
  getConversationByRequestId,
  inactiveConversation,
  getMyConversations,
  getConversationById
};