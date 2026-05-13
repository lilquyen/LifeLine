const rescuePostRepo = require('./rescuePost.repository');
const imageRepo = require('../../common/repository/requestImages.repository')
const db = require('../../config/db');
const notificationService = require('../notification/notification.service');
const userRepo = require('../user/user.repository');

const createPost = async (data, userId) => {
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const post = await rescuePostRepo.createPost(client, {
            user_id: userId,
            title: data.title,
            description: data.description || null,
            urgency_level: Number(data.urgency_level),
            lat: Number(data.lat),
            lng: Number(data.lng),
            address: data.address || null,
            status: 'pending'
        });

        if (data.images && data.images.length > 0) {
            for (const url of data.images) {
                await imageRepo.insertImageFromRescueRequest(client, post.id, url);
            }
        }

        await client.query('COMMIT');

        try {
            if (post.urgency_level < 4) return post;
            const rescuerIds = await userRepo.getActiveRescuerIds();
            await notificationService.notifyUsers(
                rescuerIds,
                'Co yeu cau cuu ho moi',
                `${post.title} - muc do ${post.urgency_level}`,
                'new_rescue_request',
                post.id
            );
        } catch (notifyError) {
            console.warn('Create rescue notification failed:', notifyError.message);
        }

        return post;

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const getAllPosts = async (filters = {}) => {
    return rescuePostRepo.getAllPosts(filters);
}

const getPostById = async (id) => {
    const post = await rescuePostRepo.getPostById(id);
    
    if(!post) {
        throw new Error('Post not found');
    }

    return post;
}

const getAllPendingPosts = async (filters = {}) => {
    return rescuePostRepo.getAllPendingPosts(filters);
}

const getAllPostByUserId = async (userId) => {
    return rescuePostRepo.getAllPostByUserId(userId);
}

const getVictimByPostId = async (postId) => {
    return rescuePostRepo.getUserIdByRequestId(postId);
}

const getVictimDashboard = async (userId) => {
    return rescuePostRepo.getVictimDashboard(userId);
}

const getNearestRescuers = async (requestId) => {
    return rescuePostRepo.getNearestRescuers(requestId);
}

const getAdminStats = async () => {
    return rescuePostRepo.getAdminStats();
}

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    getAllPostByUserId,
    getVictimByPostId,
    getAllPendingPosts,
    getVictimDashboard,
    getNearestRescuers,
    getAdminStats
}
