const express = require('express');
const router = express.Router();

const controller = require('./user.controller');
const auth = require('../../common/middleware/auth.middleware');

router.post('/register', controller.register);
router.post('/login', controller.login);

router.get('/me', auth, controller.getMe);
// router.put('/me', auth, controller.updateProfile);

router.put('/update-location', auth, controller.updateLocation)

module.exports = router;