const service = require('./rescuePost.service');
const imageService = require('../../common/services/uploadImage.service');
const { get } = require('http');

const createPost = async (req, res) => {

    console.log("req.body: \n", req.body);   // text
    console.log("req.files: \n",req.files);  // file

    try {
        const imageUrls = await imageService.uploadImages(req.files);

        const post = await service.createPost(
            {
                ...req.body,
                images: imageUrls,
            }, 
            req.user.id
        );
        
        res.status(201).json({
            message: 'Rescue post created successfully',
            post
        });
    } catch (err) {
        console.log(err);

        res.status(400).json({
            message: err.message
        });
    }
}

const getAllPosts = async (req, res) => {
    try {
        const posts = await service.getAllPosts();

        res.json(posts);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Server error'
        });
    }
}

const getAllPendingPosts = async (req, res) => {
    try {
        const posts = await service.getAllPendingPosts();

        res.json(posts);
    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: 'Server error'
        });
    }
}

const getPostById = async (req, res) => {
    try {
        const post = await service.getPostById(req.params.id);

        res.json(post);
    } catch (err) {
        console.log(err);

        res.status(404).json({
            message: err.message
        });
    }
}

const getAllPostByUserId = async (req, res) => {
    try {
        const userId = req.user.id;

        const posts = await service.getAllPostByUserId(userId);

        return res.status(200).json({
            success: true,
            data: posts
        });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

const cancelRescueRequest = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const post_userId = await service.getVictimByPostId(postId);

        if (post_userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to cancel this rescue request'
            });
        }

        const result = await service.cancelRescueRequest(userId, postId);

        res.json({
            success: true,
            message: 'Rescue request cancelled successfully',
            data: result
        });
    } catch (err) {
        console.log(err);

        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

const updateRescueRequest = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const post_userId = await service.getVictimByPostId(postId);

        if (post_userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this rescue request'
            });
        }
        
        const allowedUpdates = [
            'title', 'description', 'urgency_level', 
            'address', 'status', 'location'
        ];
        
        const updateData = {};
        for (const key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No data provided for update'
            });
        }

        const result = await service.updateRescueRequest(postId, updateData);

        res.json({
            success: true,
            message: 'Rescue request updated successfully',
            data: result
        });
    } catch (err) {
        console.log(err);

        res.status(400).json({
            success: false,
            message: err.message
        });
    }
}

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    getAllPostByUserId,
    getAllPendingPosts,
    cancelRescueRequest,
    updateRescueRequest
}