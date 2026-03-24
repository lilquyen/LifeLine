const express = require('express');
const router = express.Router();

const controller = require('./rescueAssignment.controller');
const auth = require('../../common/middleware/auth.middleware');
const role = require('../../common/middleware/role.middleware');

router.post('/assign/:postId', 
    auth, 
    role(['rescuer']),
    controller.acceptRescue
);

module.exports = router;