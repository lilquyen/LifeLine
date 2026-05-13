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
        const posts = await service.getAllPosts(req.query);

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
        const posts = await service.getAllPendingPosts(req.query);

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

const getVictimDashboard = async (req, res) => {
    try {
        const dashboard = await service.getVictimDashboard(req.user.id);
        return res.status(200).json({ success: true, data: dashboard });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

const getNearestRescuers = async (req, res) => {
    try {
        const rescuers = await service.getNearestRescuers(req.params.id);
        return res.status(200).json({ success: true, data: rescuers });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
}

const getAdminStats = async (req, res) => {
    try {
        const stats = await service.getAdminStats();
        return res.status(200).json({ success: true, data: stats });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}



module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    getAllPostByUserId,
    getAllPendingPosts,
    getVictimDashboard,
    getNearestRescuers,
    getAdminStats
}
