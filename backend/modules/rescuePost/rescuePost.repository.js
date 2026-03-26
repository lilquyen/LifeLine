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
            ST_Y(location) AS lat,
            ST_X(location) AS lng,
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
        WHERE id = $1`, [id]
    );
    
    return result.rows[0];
}

module.exports = {
    createPost,
    getAllPosts,
    getPostById
}
