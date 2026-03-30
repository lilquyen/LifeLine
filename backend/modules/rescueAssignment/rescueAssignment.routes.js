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

router.post('/complete/:postId', 
    auth, 
    role(['rescuer']),
    controller.completeRescue // Hàm này bạn vừa thêm vào controller ở bước trước
);

router.post('/fail/:postId', 
    auth, 
    role(['rescuer']),
    controller.failRescue // Hàm này bạn vừa thêm vào controller ở bước trước
);

module.exports = router;