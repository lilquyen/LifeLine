const express = require('express');
const router = express.Router();

const controller = require('./rescuePost.controller');
const auth = require('../../common/middleware/auth.middleware');
const role = require('../../common/middleware/role.middleware');
const upload = require('../../common/middleware/upload.middleware')

router.post('/post', 
    auth, 
    role(['victim']),
    upload.array('images'),
    controller.createPost
);
router.get('/pending', controller.getAllPendingPosts);
router.put('/cancel/:id', auth, role(['victim']) , controller.cancelRescueRequest);
router.put('/complete/:id', auth, role(['victim']), controller.completeRescueRequest);
router.put('/update/:id', auth, role(['victim']), controller.updateRescueRequest);
router.get('/', controller.getAllPosts);
router.get('/my-posts', auth, controller.getAllPostByUserId);
router.get('/:id', controller.getPostById);
module.exports = router;