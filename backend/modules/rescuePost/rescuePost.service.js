const repo = require('./rescuePost.repository');

const createPost = async (data, userId) => {
    if(!data.title) {
        throw new Error('Title is required');
    }

    if(!data.lat && !data.lng) {
        throw new Error('Location is required');
    }

    if(!data.urgency_level) {
        throw new Error('Urgency level is required');
    }

    return repo.createPost({
        user_id: userId,
        title: data.title,
        description: data.description || null,
        urgency_level: data.urgency_level,
        lat: data.lat,
        lng: data.lng,
        address: data.address || null,
        status: 'pending'
    })
}

const getAllPosts = async () => {
    return repo.getAllPosts();
}

const getPostById = async (id) => {
    const post = await repo.getPostById(id);
    
    if(!post) {
        throw new Error('Post not found');
    }

    return post;
}

module.exports = {
    createPost,
    getAllPosts,
    getPostById
}