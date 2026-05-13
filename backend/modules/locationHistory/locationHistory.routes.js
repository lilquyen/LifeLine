const express = require('express');
const router = express.Router();

const controller = require('./locationHistory.controller');
const auth = require('../../common/middleware/auth.middleware');
const role = require('../../common/middleware/role.middleware');

router.post('/add', 
    auth, 
    role(['rescuer']),
    controller.updateLocation);
router.get('/history/:requestId', auth, controller.getLocationHistory);
router.get('/latest/:requestId', auth, controller.getLatestLocation);

module.exports = router;