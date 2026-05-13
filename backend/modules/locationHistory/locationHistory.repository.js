const db = require('../../config/db');

const updateLocation = async (userId, requestId, lat, lng) => {
    const query = `
        INSERT INTO location_history (rescuer_id, request_id, location, recorded_at)
        VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), NOW())
        `;
    
    const values = [userId, requestId, lng, lat];

    const result = await db.query(query, values);

    return result.rows;
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
        AND rescue_assignments.status = 'accepted'
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
        AND rescue_assignments.status = 'accepted'
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