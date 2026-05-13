const notificationRepo = require('./notification.repository');
const socketLib = require('../../common/socket');

const notifyUser = async (userId, title, content, type = 'system', refId = null) => {
    const newNoti = await notificationRepo.create(userId, title, content, { type, refId });

    try {
        const io = socketLib.getIo();
        io.to(`user_${userId}`).emit('new_notification', {
            id: newNoti.id,
            user_id: newNoti.user_id,
            title: newNoti.title,
            content: newNoti.content,
            type: newNoti.type,
            ref_id: newNoti.ref_id,
            is_read: newNoti.is_read,
            created_at: newNoti.created_at
        });
    } catch (error) {
        console.warn('Socket notification skipped:', error.message);
    }

    return newNoti;
};

const notifyUsers = async (userIds, title, content, type = 'system', refId = null) => {
    const uniqueIds = [...new Set(userIds.filter(Boolean))];
    return Promise.all(uniqueIds.map(userId => notifyUser(userId, title, content, type, refId)));
};

const getMyNotifications = async (userId) => {
    const [items, unreadCount] = await Promise.all([
        notificationRepo.findByUserId(userId),
        notificationRepo.countUnreadByUserId(userId)
    ]);

    return { items, unreadCount };
};

const markAsRead = async (userId, notificationId) => {
    return notificationRepo.markAsRead(userId, notificationId);
};

const markAllAsRead = async (userId) => {
    await notificationRepo.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
};

module.exports = {
    notifyUser,
    notifyUsers,
    getMyNotifications,
    markAsRead,
    markAllAsRead
};
