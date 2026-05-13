const db = require('../../config/db');

const getWeeklyStats = async () => {
  const query = `
    SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') AS date, 
        COUNT(id)::int AS count
    FROM 
        rescue_requests
    WHERE 
        created_at > CURRENT_DATE - INTERVAL '6 days'
    GROUP BY 
        date
    ORDER BY 
        date ASC;
        `;
  const result = await db.query(query);
  return result.rows;
}

const getStatusStats = async () => {

  const defaultStats = {
    pending: 0,
    assigned: 0,
    completed: 0,
    cancelled: 0
  };
  const query = `
            SELECT 
                status, 
                COUNT(*)::int AS count
            FROM 
                rescue_requests
            GROUP BY 
                status;
        `;
  const result = await db.query(query);

  // Chuyển đổi mảng từ DB thành Object key-value
  const dbStats = result.rows.reduce((acc, row) => {
    // Chỉ ghi đè nếu status nằm trong danh sách mong muốn
    if (acc.hasOwnProperty(row.status)) {
        acc[row.status] = row.count;
    }
    return acc;
}, defaultStats);
  return dbStats;
}

const getTopRescuers = async () => {
  const query = `
    SELECT 
        u.id, 
        u.full_name, 
        COUNT(ra.id)::int AS completed_count
    FROM 
        rescue_assignments ra
    JOIN 
        users u ON ra.rescuer_id = u.id
    WHERE 
        ra.status = 'completed'
    GROUP BY 
        u.id, u.full_name
    ORDER BY 
        completed_count DESC
    LIMIT 3;
    `;
  const res = await db.query(query);
  return res.rows;
}

module.exports = {
    getWeeklyStats,
    getStatusStats,
    getTopRescuers
}
  