const service = require('./user.service');
const uploadImages = require('../../common/services/uploadImage.service').uploadImages; 
const db = require('../../config/db');

const register = async (req, res) => {
    try {
        const user = await service.register(req.body);

        res.status(201).json({
            message: 'User registered successfully',
            user
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
}

const login = async (req, res) => {
    try {
        const result = await service.login(req.body);

        res.json({
            message: 'Login successful',
            ...result
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
}

const getMe = async (req, res) => {
    try {
      const user = await service.getMe(req.user.id);
  
      res.json(user);
    } catch (err) {

        res.status(500).json({
        message: err.message
      });
    }
};

const updateAvatar = async (req, res) => {
    try {
        console.log('Received file:', req.file); // Debug log to check the uploaded file
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided' });
      }
      const urls = await uploadImages([req.file]);
      const avatarUrl = urls[0];
      
      const userId = req.user.id;
      await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, userId]);
      
      res.json({ success: true, url: avatarUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Upload failed' });
    }
  };

const updateLocation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { latitude, longitude } = req.body;

        const updatedUser = await service.updateLocation(userId, latitude, longitude);

        res.json({
            message: 'Location updated successfully',
            user: updatedUser
        });
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
}

const updateProfile = async (req, res) => {
    try {
        const user = await service.updateProfile(req.user.id, req.body);
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

const listUsers = async (req, res) => {
    try {
        const users = await service.listUsers(req.query);
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

const setActive = async (req, res) => {
    try {
        const user = await service.setActive(req.params.id, Boolean(req.body?.is_active));
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

module.exports = {
    register,
    login,
    getMe,
    updateLocation,
    updateProfile,
    listUsers,
    setActive,
    updateAvatar
}
