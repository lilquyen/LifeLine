const express = require('express');
const router = express.Router();

const controller = require('./user.controller');
const auth = require('../../common/middleware/auth.middleware');
const role = require('../../common/middleware/role.middleware');
const upload = require('../../common/middleware/upload.middleware');
const rateLimit = require('express-rate-limit');

const avatarLimiter = rateLimit({
    windowMs: 60000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false
});

router.post('/register', controller.register);
router.post('/login', controller.login);

router.get('/me', auth, controller.getMe);
router.put('/me', auth, controller.updateProfile);
router.post(
    '/me/avatar',
    auth,
    avatarLimiter,
    upload.single('image'),
    controller.uploadAvatar
);

router.put('/update-location', auth, controller.updateLocation)

router.get('/admin/users', auth, role(['admin']), controller.listUsers);
router.patch('/admin/users/:id/active', auth, role(['admin']), controller.setActive);

module.exports = router;
