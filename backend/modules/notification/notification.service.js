const notificationRepo = require('./notification.repository');
const socketLib = require('../../common/socket');
const { NOTI_TYPES } = require('../../common/constants');

const notifyUser = async (userId, title, content, type) => {

    const newNoti = await notificationRepo.create(userId, title, content, type);


    const io = socketLib.getIo();

    io.to(`user_${userId}`).emit('new_notification', {
        id: newNoti.id,
        title: title,
        content: content,
        type: type,
        createdAt: newNoti.created_at
    });

    return newNoti;
};

module.exports = { notifyUser };