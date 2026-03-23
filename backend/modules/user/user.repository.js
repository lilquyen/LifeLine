const db = require('../../config/db');

const createUser = async (user) => {
    const query = `
        INSERT INTO users (username, password, phone,. full_name, role, avatar_url, is_active)
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

    const results = await db.query(query, Values);
    return results.rows[0];
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

const updatLocation = async (userId, lat, lng) => {
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

module.exports = {
    createUser,
    findByUsername,
    findByPhone,
    findById,
    updatLocation
}