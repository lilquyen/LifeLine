const db = require('../../config/db');

const createUser = async (user) => {
    const query = `
        INSERT INTO users (username, password, phone, full_name, role, avatar_url, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    const Values = [
        user.username,
        user.password,
        user.phone,
        user.full_name,
        user.role,
        user.avatar_url || null,
        user.is_active || true
    ];

    const result = await db.query(query, Values);
    return result.rows[0];
};

const findByUsername = async (username) => {
    const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
    );

    return result.rows[0];
}

const findByPhone = async (phone) => {
    const result = await db.query(
        'SELECT * FROM users WHERE phone = $1',
        [phone] 
    );

    return result.rows[0];      
}

const findById = async (id) => {
    const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id] 
    );

    return result.rows[0];      
}

const updateLocation = async (userId, lat, lng) => {
    const query = `
        UPDATE users
        SET current_location = ST_SetSRID(ST_MakePoint($1, $2), 4326)
        WHERE id = $3
        RETURNING *;
    `;

    const values = [lng, lat, userId];

    const result = await db.query(query, values);
    return result.rows[0]
}

const getCurrentLocation = async (userId) => {
    const query = `
        SELECT 
            ST_Y(current_location) AS lat,
            ST_X(current_location) AS lng
        FROM users
        WHERE id = $1
    `;

    const result = await db.query(query, [userId]);
    return result.rows[0];
}

const getUserByRequestId = async (requestId) => {
    const query = `
        SELECT 
            u.id,
            u.username,
            u.full_name,
            u.phone,
            u.avatar_url
        FROM users u
        JOIN rescue_requests r ON u.id = r.user_id
        WHERE r.id = $1
    `;

    const result = await db.query(query, [requestId]);
    return result.rows[0];
}

module.exports = {
    createUser,
    findByUsername,
    findByPhone,
    findById,
    updateLocation,
    getCurrentLocation
}