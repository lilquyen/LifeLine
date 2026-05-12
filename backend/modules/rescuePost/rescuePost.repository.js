const db = require('../../config/db');

const createPost = async (client, data) => {
    const query = `
        INSERT INTO rescue_requests 
        (user_id, title, description, urgency_level, location, address, status, created_at)
        VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, NOW()) 
        RETURNING *;
    `;
    
    const values = [
        data.user_id,
        data.title,
        data.description,
        data.urgency_level,
        data.lng, // longitude
        data.lat, // latitude
        data.address,
        data.status
    ];

    const result = await client.query(query, values);

    return result.rows[0];
};

const getAllPosts = async () => {
    const result = await db.query(`
        SELECT 
            id,
            user_id,
            title,
            description,
            urgency_level,
            ST_Y(location::geometry) AS lat,
            ST_X(location::geometry) AS lng,
            address,
            status,
            created_at
        FROM rescue_requests 
        ORDER BY created_at DESC`
    );
    
    return result.rows;
}

const getPostById = async (id) => {
    const result = await db.query(`
        SELECT 
            rr.id,
            rr.user_id,
            rr.title,
            rr.description,
            rr.urgency_level,
            ST_Y(rr.location) AS lat,
            ST_X(rr.location) AS lng,
            rr.address,
            rr.status,
            rr.created_at,

            COALESCE(
                ARRAY_AGG(ri.image_url)
                FILTER (WHERE ri.image_url IS NOT NULL),
                '{}'
            ) AS image_urls

        FROM rescue_requests rr

        LEFT JOIN request_images ri
            ON ri.request_id = rr.id

        WHERE rr.id = $1

        GROUP BY rr.id
    `, [id]);
    
    return result.rows[0];
}

const getAllPostByUserId = async (userId) => {

    const result = await db.query(
        `
        SELECT 
            id,
            user_id,
            title,
            description,
            urgency_level,
            ST_Y(location) AS lat,
            ST_X(location) AS lng,
            address,
            status,
            created_at
        FROM rescue_requests
        WHERE user_id = $1
        ORDER BY created_at DESC
        `,
        [userId]
    );

    return result.rows;
}

const getUserIdByRequestId = async (requestId) => {
    const result = await db.query(
        `
        SELECT user_id FROM rescue_requests
        WHERE id = $1
        `,
        [requestId]
    );

    return result.rows[0]?.user_id;
}

const getAllPendingPosts = async () => {
    const result = await db.query(`
        SELECT 
            id,
            user_id,
            title,
            description,
            urgency_level,
            ST_Y(location) AS lat,
            ST_X(location) AS lng,
            address,
            status,
            created_at
        FROM rescue_requests 
        WHERE status = 'pending'
        ORDER BY created_at DESC`
    );
    
    return result.rows;
}

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    getAllPostByUserId,
    getUserIdByRequestId,
    getAllPendingPosts
}
