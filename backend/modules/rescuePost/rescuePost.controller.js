const service = require('./rescuePost.service');
const imageService = require('../../common/services/uploadImage.service')

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

module.exports = {
    createPost,
    getAllPosts,
    getPostById
}