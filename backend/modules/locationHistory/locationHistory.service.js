const locationHisRepo = require('./locationHistory.repository');
const userRepo = require('../user/user.repository');

const updateLocation = async (userId, data) => {
    const { requestId, lat, lng } = data;
    return await locationHisRepo.updateLocation(userId, requestId, lat, lng);
}

const getLocationHistory = async (requestId) => {
    return await locationHisRepo.getLocationHistory(requestId);
}

const getLatestLocation = async (requestId) => {
    return await locationHisRepo.getLatestLocation(requestId);
}

const getDistanceToRescue = async (requestId) => {
    const victim = await userRepo.getUserByRequestId(requestId);
    const victimLocation = await userRepo.getCurrentLocation(victim.id);
    const rescuerLocation = await locationHisRepo.getLatestLocation(requestId);

    const distance = getDistance(victimLocation.lat, victimLocation.lng, rescuerLocation.lat, rescuerLocation.lng);

    return {
        distance,
        victimLocation,
        rescuerLocation
    }
}

module.exports = {
    updateLocation,
    getLocationHistory,
    getLatestLocation,
    getDistanceToRescue
}