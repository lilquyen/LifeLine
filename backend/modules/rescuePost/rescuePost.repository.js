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

const buildRequestFilters = (filters = {}, forcePending = false) => {
    const where = [];
    const values = [];
    const add = (value) => {
        values.push(value);
        return `$${values.length}`;
    };

    if (forcePending) {
        where.push(`status = 'pending'`);
    } else if (filters.status) {
        where.push(`status = ${add(filters.status)}`);
    }

    if (filters.urgency_level) where.push(`urgency_level = ${add(Number(filters.urgency_level))}`);
    if (filters.min_urgency) where.push(`urgency_level >= ${add(Number(filters.min_urgency))}`);
    if (filters.address) where.push(`address ILIKE ${add(`%${filters.address}%`)}`);
    if (filters.q) where.push(`(title ILIKE ${add(`%${filters.q}%`)} OR description ILIKE ${add(`%${filters.q}%`)})`);

    const distanceSelect = filters.lat && filters.lng
        ? `, ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(${add(Number(filters.lng))}, ${add(Number(filters.lat))}), 4326)::geography) AS distance_meters`
        : `, NULL::double precision AS distance_meters`;

    const orderBy = filters.lat && filters.lng
        ? `ORDER BY urgency_level DESC, distance_meters ASC, created_at DESC`
        : `ORDER BY urgency_level DESC, created_at DESC`;

    return {
        whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
        values,
        distanceSelect,
        orderBy
    };
};

const getAllPosts = async (filters = {}) => {
    const { whereSql, values, distanceSelect, orderBy } = buildRequestFilters(filters);
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
            ${distanceSelect}
        FROM rescue_requests 
        ${whereSql}
        ${orderBy}
    `, values);
    
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

const getAllPendingPosts = async (filters = {}) => {
    const { whereSql, values, distanceSelect, orderBy } = buildRequestFilters(filters, true);
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
            ${distanceSelect}
        FROM rescue_requests 
        ${whereSql}
        ${orderBy}
    `, values);
    
    return result.rows;
}

const getVictimDashboard = async (userId) => {
    const posts = await getAllPostByUserId(userId);
    const acceptedRequests = await db.query(`
        SELECT DISTINCT ON (rr.id)
        rr.id,
        rr.title,
        rr.description,
        rr.status,
        rr.urgency_level,
        rr.address,
        rr.created_at,
        ST_Y(rr.location) AS lat,
        ST_X(rr.location) AS lng,
        ra.id AS assignment_id,
        ra.status AS assignment_status,
        ra.assigned_at,
        ra.finished_at,
        ra.completion_note,
        ra.failure_reason,
        ra.victim_confirmed_at,
        ra.response_seconds,
        ra.resolution_seconds,
        u.id AS rescuer_id,
        u.full_name AS rescuer_name,
        u.phone AS rescuer_phone,
        u.avatar_url AS rescuer_avatar_url,
        u.vehicle_info,
        u.rescuer_skills,
        ST_Y(u.current_location) AS rescuer_lat,
        ST_X(u.current_location) AS rescuer_lng
    FROM rescue_requests rr
    LEFT JOIN rescue_assignments ra ON ra.request_id = rr.id
    LEFT JOIN users u ON u.id = ra.rescuer_id
    WHERE rr.user_id = $1
    AND rr.status IN ('assigned')
    AND ra.rescuer_id IS NOT NULL
    ORDER BY rr.id, rr.created_at DESC
    `, [userId]);

    return {
        counts: {
            total: posts.length,
            pending: posts.filter(post => post.status === 'pending').length,
            active: posts.filter(post => ['assigned', 'in_progress'].includes(post.status)).length,
            completed: posts.filter(post => post.status === 'completed').length
        },
        latestStatus: acceptedRequests.rows[0] || posts[0] || null,
        acceptedRequests: acceptedRequests.rows,
        recentRequests: posts.slice(0, 5)
    };
};

const getNearestRescuers = async (requestId) => {
    const result = await db.query(`
        SELECT
            u.id,
            u.full_name,
            u.phone,
            u.avatar_url,
            u.vehicle_info,
            u.rescuer_skills,
            ST_Y(u.current_location) AS lat,
            ST_X(u.current_location) AS lng,
            ST_Distance(u.current_location::geography, rr.location::geography) AS distance_meters
        FROM rescue_requests rr
        JOIN users u ON u.role = 'rescuer'
        WHERE rr.id = $1
          AND u.is_active = TRUE
          AND u.current_location IS NOT NULL
        ORDER BY distance_meters ASC
        LIMIT 10
    `, [requestId]);

    return result.rows;
};

const getAdminStats = async () => {
    const  [totals] = await Promise.all([
        db.query(`
            SELECT
                COUNT(*)::int AS total_requests,
                AVG(ra.response_seconds)::int AS avg_response_seconds,
                AVG(ra.resolution_seconds)::int AS avg_resolution_seconds,
                ROUND(
                    100.0 * COUNT(*) FILTER (WHERE rr.status = 'completed') / NULLIF(COUNT(*), 0),
                    1
                ) AS completion_rate
            FROM rescue_requests rr
            LEFT JOIN rescue_assignments ra ON ra.request_id = rr.id
        `)
    ]);

    return {
        totals: totals.rows[0]
    };

}
const cancelRescueRequest = async (userId, requestId) => {
    const client = await db.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update rescue_requests
        const requestResult = await client.query(`
            UPDATE rescue_requests
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = $1
            AND user_id = $2
            RETURNING *
        `, [requestId, userId]);

        // Update rescue_assignments
        const assignmentResult = await client.query(`
            UPDATE rescue_assignments
            SET status = 'cancelled', finished_at = NOW()
            WHERE request_id = $1
            RETURNING *
        `, [requestId]);

        await client.query('COMMIT');

        return {
            request: requestResult.rows[0],
            assignments: assignmentResult.rows
        };
        
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const updateRescueRequest = async (requestId, data) => {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const key in data) {
        fields.push(`${key} = $${idx}`);
        values.push(data[key]);
        idx++;
    }

    values.push(requestId);

    const query = `
        UPDATE rescue_requests
        SET ${fields.join(', ')}, updated_at = NOW()
        WHERE id = $${idx}
        RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows[0];
}

const completeRescueRequest = async (userId, requestId) => {
    const client = await db.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update rescue_requests
        const requestResult = await client.query(`
            UPDATE rescue_requests
            SET status = 'completed', updated_at = NOW()
            WHERE id = $1
            AND user_id = $2
            RETURNING *
        `, [requestId, userId]);

        // Update rescue_assignments
        const assignmentResult = await client.query(`
            UPDATE rescue_assignments
            SET status = 'completed', finished_at = NOW()
            WHERE request_id = $1
            RETURNING *
        `, [requestId]);

        await client.query('COMMIT');

        return {
            request: requestResult.rows[0],
            assignments: assignmentResult.rows
        };
        
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    getAllPostByUserId,
    getUserIdByRequestId,
    getAllPendingPosts,
    getVictimDashboard,
    getNearestRescuers,
    getAdminStats,
    cancelRescueRequest,
    updateRescueRequest,
    completeRescueRequest
}
