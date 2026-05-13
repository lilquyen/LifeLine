const db = require('../../config/db');

const updateLocation = async (userId, requestId, lat, lng) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        await client.query(`
            UPDATE users
            SET current_location = ST_SetSRID(ST_MakePoint($1, $2), 4326),
                last_seen_at = NOW()
            WHERE id = $3
        `, [lng, lat, userId]);

        const result = await client.query(`
            INSERT INTO location_history (rescuer_id, request_id, location, recorded_at)
            VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), NOW())
            RETURNING
                id,
                rescuer_id,
                request_id,
                ST_Y(location) AS lat,
                ST_X(location) AS lng,
                recorded_at
        `, [userId, requestId, lng, lat]);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

const getLocationHistory = async (requestId) => {
    const query = `
        SELECT 
            location_history.id,
            rescue_assignments.rescuer_id,
            ST_Y(location) AS lat,
            ST_X(location) AS lng,
            recorded_at
        FROM location_history
        JOIN rescue_assignments 
        ON rescue_assignments.request_id = location_history.request_id
        WHERE location_history.request_id = $1
        AND rescue_assignments.status IN ('accepted', 'in_progress')
        ORDER BY recorded_at ASC
    `;

    const result = await db.query(query, [requestId]);
    return result.rows;
}

const getLatestLocation = async (requestId) => {
    const query = `
        SELECT 
            rescue_assignments.rescuer_id,
            ST_Y(location) AS lat,
            ST_X(location) AS lng,
            recorded_at
        FROM location_history
        JOIN rescue_assignments 
        ON rescue_assignments.request_id = location_history.request_id
        WHERE location_history.request_id = $1
        AND rescue_assignments.status IN ('accepted', 'in_progress')
        ORDER BY recorded_at DESC
        LIMIT 1
    `;

    const result = await db.query(query, [requestId]);
    return result.rows[0];
}

module.exports = {
    updateLocation,
    getLocationHistory,
    getLatestLocation
}
