const service = require('./locationHistory.service');

const updateLocation = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = req.body;

        const location = await service.updateLocation(userId, data)

        res.json({
            message: 'Location updated successfully',
            location
        })
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
}

const getLocationHistory = async (req, res) => {
    try {
        const requestId = req.params.requestId;

        const history = await service.getLocationHistory(requestId);

        res.json(history);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
}

const getLatestLocation = async (req, res) => {
    try {
        const requestId = req.params.requestId;

        const location = await service.getLatestLocation(requestId);

        res.json(location);
    } catch (err) {
        res.status(400).json({
            message: err.message
        });
    }
}

module.exports = {
    updateLocation,
    getLocationHistory,
    getLatestLocation
}