const db = require('../../config/db');

const insertImageFromRescueRequest = async (client, request_id, image_url) => {
    const imageQuery = `
        INSERT INTO request_images (request_id, image_url, created_at)
        VALUES ($1, $2, NOW())
        RETURNING *
    `;

    const values = [
        request_id,
        image_url
    ];

    const result = await client.query(imageQuery, values);
    
    return result.rows[0];
}

module.exports = {
    insertImageFromRescueRequest
}