// services/notification.service.js
const notificationRepo = require('./notification.repository');
const socketLib = require('../../common/socket');
const { NOTI_TYPES } = require('../../common/constants');

const notifyUser = async (userId, title, content, type) => {
    // 1. Lưu vào DB trước
    const newNoti = await notificationRepo.create(userId, title, content, type);

    // 2. Lấy bộ điều khiển Socket
    const io = socketLib.getIo();

    // 3. Bắn tin Realtime đến đúng phòng của User
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