const rescuePostRepo = require('./rescuePost.repository');
const imageRepo = require('../../common/repository/requestImages.repository')
const db = require('../../config/db');
const { get } = require('http');

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

        return post;

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

const getAllPosts = async () => {
    return rescuePostRepo.getAllPosts();
}

const getPostById = async (id) => {
    const post = await rescuePostRepo.getPostById(id);
    
    if(!post) {
        throw new Error('Post not found');
    }

    return post;
}

const getAllPendingPosts = async () => {
    return rescuePostRepo.getAllPendingPosts();
}

const getAllPostByUserId = async (userId) => {
    return rescuePostRepo.getAllPostByUserId(userId);
}

const getVictimByPostId = async (postId) => {
    return rescuePostRepo.getUserIdByRequestId(postId);
}

const cancelRescueRequest = async (userId, requestId) => {
    return rescuePostRepo.cancelRescueRequest(userId, requestId);
}

const updateRescueRequest = async (requestId, data) => {
    return rescuePostRepo.updateRescueRequest(requestId, data);
}

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    getAllPostByUserId,
    getVictimByPostId,
    getAllPendingPosts,
    cancelRescueRequest,
    updateRescueRequest
}