const express = require('express');
const router = express.Router();

const controller = require('./rescuePost.controller');
const auth = require('../../common/middleware/auth.middleware');

router.post('/post', auth, controller.createPost);

router.get('/', controller.getAllPosts);
router.get('/:id', controller.getPostById);

module.exports = router;