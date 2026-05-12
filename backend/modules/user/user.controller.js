const service = require('./user.service');

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

module.exports = {
    register,
    login,
    getMe,
    updateLocation
}