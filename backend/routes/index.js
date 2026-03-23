const express = require('express');
const router = express.Router();

router.use('/auth', require('../modules/user/user.routes'));

router.use('/rescue-posts', require('../modules/rescuePost/rescuePost.routes'));

module.exports = router;