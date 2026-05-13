const db = require('../../config/db');

const createAssignment = async (postId, rescuerId) => {
    const query = `
        INSERT INTO rescue_assignments (
            request_id,
            rescuer_id,
            assigned_at,
            response_seconds
        )
        VALUES (
            $1,
            $2,
            NOW(),
            EXTRACT(EPOCH FROM (
                NOW() - (
                    SELECT created_at 
                    FROM rescue_requests 
                    WHERE id = $1
                )
            ))::int
        )
        RETURNING *;
    `;

    const result = await db.query(query, [postId, rescuerId]);
    return result.rows[0];
}

const findActiveAssignment = async (postId) => {
    const result = await db.query(`
        SELECT * FROM rescue_assignments
        WHERE request_id = $1 AND status IN ('accepted', 'in_progress')
    `, [postId]);

    return result.rows[0];
}

const updatePostStatus = async (postId, status) => {
    const query = `
        UPDATE rescue_requests
        SET status = $1
        WHERE id = $2
        RETURNING *;
    `;

    const result = await db.query(query, [status, postId]);
    return result.rows[0];
}

// Đánh dấu hoàn thành
const completeAssignment = async (postId, note = null) => {
    const result = await db.query(`
        UPDATE rescue_assignments 
        SET status = 'completed',
            finished_at = NOW(),
            completion_note = $2,
            resolution_seconds = EXTRACT(EPOCH FROM (NOW() - assigned_at))::int
        WHERE request_id = $1 AND status IN ('accepted', 'in_progress')
        RETURNING *;
    `, [postId, note]);

    return result.rows[0];
};

// Hủy phân công (Khi thất bại/muốn nhường người khác)
const cancelAssignment = async (postId, reason = null) => {
    const query = `
        UPDATE rescue_assignments 
        SET status = 'cancelled',
            finished_at = NOW(),
            failure_reason = $2,
            resolution_seconds = EXTRACT(EPOCH FROM (NOW() - assigned_at))::int
        WHERE request_id = $1 AND status IN ('accepted', 'in_progress')
        RETURNING *;
    `;
    const result = await db.query(query, [postId, reason]);
    return result.rows[0];
};

const confirmByVictim = async (postId, victimId, rating = null, feedback = null) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const assignmentResult = await client.query(`
            UPDATE rescue_assignments ra
            SET victim_confirmed_at = NOW()
            FROM rescue_requests rr
            WHERE ra.request_id = rr.id
              AND rr.id = $1
              AND rr.user_id = $2
              AND ra.status = 'completed'
            RETURNING ra.*;
        `, [postId, victimId]);

        if (!assignmentResult.rows[0]) {
            throw new Error('Assignment not found or not completed');
        }

        await client.query(`
            UPDATE rescue_requests
            SET victim_rating = $3,
                victim_feedback = $4,
                updated_at = NOW()
            WHERE id = $1 AND user_id = $2
        `, [postId, victimId, rating, feedback]);

        await client.query('COMMIT');
        return assignmentResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const getMyAllAssignment = async (rescuerId) => {
    const result = await db.query(`
        SELECT 
            ra.id AS assignment_id,
            ra.request_id,
            rr.title AS request_title,
            rr.description AS request_description,
            rr.urgency_level,
            ST_Y(rr.location::geometry) AS lat,
            ST_X(rr.location::geometry) AS lng,
            rr.address,
            rr.status AS request_status,
            ra.status AS assignment_status,
            ra.assigned_at,
            ra.finished_at,
            ra.completion_note,
            ra.failure_reason,
            ra.victim_confirmed_at,
            ra.response_seconds,
            ra.resolution_seconds

        FROM rescue_assignments ra

        JOIN rescue_requests rr
            ON rr.id = ra.request_id

        WHERE ra.rescuer_id = $1
        ORDER BY ra.assigned_at DESC
    `, [rescuerId]);

    return result.rows;
}

const getByRequestId = async (requestId) => {
    const result = await db.query(`
        SELECT
            ra.*,
            u.id AS rescuer_user_id,
            u.full_name AS rescuer_name,
            u.phone AS rescuer_phone,
            u.avatar_url AS rescuer_avatar_url,
            u.vehicle_info,
            u.rescuer_skills,
            ST_Y(u.current_location) AS rescuer_lat,
            ST_X(u.current_location) AS rescuer_lng
        FROM rescue_assignments ra
        JOIN users u ON u.id = ra.rescuer_id
        WHERE ra.request_id = $1
        ORDER BY ra.assigned_at DESC
        LIMIT 1
    `, [requestId]);

    return result.rows[0];
};


module.exports = {
    createAssignment,
    findActiveAssignment,
    updatePostStatus,
    completeAssignment, 
    cancelAssignment,
    confirmByVictim,
    getMyAllAssignment,
    getByRequestId
}
