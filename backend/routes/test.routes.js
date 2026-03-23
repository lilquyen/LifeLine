const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({
      message: 'DB connected!',
      time: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      message: 'DB connection failed',
      error: err.message
    });
  }
});

module.exports = router;