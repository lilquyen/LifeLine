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

const completeRescueRequest = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;
        const post_userId = await service.getVictimByPostId(postId);

        if (post_userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to complete this rescue request'
            });
        }

        const result = await service.completeRescueRequest(userId, postId);

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

        // 1. Kiểm tra quyền sở hữu (Owner check)
        const post_userId = await service.getVictimByPostId(postId);
        if (post_userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền cập nhật yêu cầu cứu hộ này.'
            });
        }
        
        // 2. Danh sách các trường được phép cập nhật trực tiếp
        const allowedFields = ['title', 'description', 'urgency_level', 'address', 'status'];
        const updateData = {};

        // Lọc các trường thông thường
        for (const key of allowedFields) {
            if (req.body[key] !== undefined && req.body[key] !== '') {
                updateData[key] = req.body[key];
            }
        }

        // 3. Xử lý logic Vị trí (Latitude & Longitude)
        // Lưu ý: Trong PostGIS, định dạng POINT là (Kinh độ/Lng - Vĩ độ/Lat)
        if (req.body.lat && req.body.lng) {
            updateData.location = `POINT(${req.body.lng} ${req.body.lat})`;
        }

        // 4. Kiểm tra xem có dữ liệu nào để cập nhật không
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp ít nhất một thông tin để cập nhật.'
            });
        }

        // 5. Gọi service để thực thi
        const result = await service.updateRescueRequest(postId, updateData);

        res.json({
            success: true,
            message: 'Cập nhật yêu cầu cứu hộ thành công',
            data: result
        });
    } catch (err) {
        console.error(err);
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
    getVictimDashboard,
    getNearestRescuers,
    getAdminStats,
    cancelRescueRequest,
    updateRescueRequest,
    completeRescueRequest
}
