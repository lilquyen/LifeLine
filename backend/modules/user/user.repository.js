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
        SET current_location = ST_SetSRID(ST_MakePoint($1, $2), 4326),
            last_seen_at = NOW()
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

const updateProfile = async (userId, data) => {
    const result = await db.query(`
        UPDATE users
        SET full_name = COALESCE($2, full_name),
            phone = COALESCE($3, phone),
            avatar_url = COALESCE($4, avatar_url),
            is_active = COALESCE($5, is_active),
            rescuer_skills = COALESCE($6, rescuer_skills),
            vehicle_info = COALESCE($7, vehicle_info),
            last_seen_at = NOW()
        WHERE id = $1
        RETURNING id, username, phone, full_name, role, avatar_url, is_active,
                  rescuer_skills, vehicle_info, last_seen_at, created_at
    `, [
        userId,
        data.full_name || null,
        data.phone || null,
        data.avatar_url || null,
        typeof data.is_active === 'boolean' ? data.is_active : null,
        Array.isArray(data.rescuer_skills) ? data.rescuer_skills : null,
        data.vehicle_info || null
    ]);

    return result.rows[0];
}

const listUsers = async (filters = {}) => {
    const values = [];
    const where = [];
    if (filters.role) {
        values.push(filters.role);
        where.push(`role = $${values.length}`);
    }
    if (filters.q) {
        values.push(`%${filters.q}%`);
        where.push(`(username ILIKE $${values.length} OR full_name ILIKE $${values.length} OR phone ILIKE $${values.length})`);
    }

    const result = await db.query(`
        SELECT id, username, phone, full_name, role, avatar_url, is_active,
               rescuer_skills, vehicle_info, last_seen_at, created_at
        FROM users
        ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
        ORDER BY created_at DESC
        LIMIT 200
    `, values);

    return result.rows;
}

const setActive = async (userId, isActive) => {
    const result = await db.query(`
        UPDATE users
        SET is_active = $2,
            last_seen_at = NOW()
        WHERE id = $1
        RETURNING id, username, phone, full_name, role, avatar_url, is_active,
                  rescuer_skills, vehicle_info, last_seen_at, created_at
    `, [userId, isActive]);

    return result.rows[0];
}

const getActiveRescuerIds = async () => {
    const result = await db.query(`
        SELECT id
        FROM users
        WHERE role = 'rescuer' AND is_active = TRUE
    `);

    return result.rows.map(row => row.id);
}

module.exports = {
    createUser,
    findByUsername,
    findByPhone,
    findById,
    updateLocation,
    getCurrentLocation,
    getUserByRequestId,
    getActiveRescuerIds,
    updateProfile,
    listUsers,
    setActive
}
