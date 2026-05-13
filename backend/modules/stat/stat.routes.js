const express = require('express');
const router = express.Router();

const controller = require('./stat.controller');
const auth = require('../../common/middleware/auth.middleware');
const role = require('../../common/middleware/role.middleware');

router.get('/weekly', auth, role(['admin']), controller.getWeeklyStats);
router.get('/status', auth, role(['admin']), controller.getStatusStats);
router.get('/top-rescuers', auth, role(['admin']), controller.getTopRescuers);

module.exports = router;