const express = require('express');
const router = express.Router();

router.use('/auth', require('../modules/user/user.routes'));

module.exports = router;