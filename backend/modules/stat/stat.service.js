const statRepo = require('./stat.repository');

const getWeeklyStats = async () => {
    try {
        const stats = await statRepo.getWeeklyStats();
        return stats;
    } catch (err) {
        console.error('Error fetching weekly stats:', err);
        throw new Error('Could not fetch weekly stats');
    }
}

const getStatusStats = async () => {
    try {
        const stats = await statRepo.getStatusStats();
        return stats;
    } catch (err) {
        console.error('Error fetching status stats:', err);
        throw new Error('Could not fetch status stats');
    }
}

const getTopRescuers = async () => {
    try {
        const stats = await statRepo.getTopRescuers();
        return stats;
    } catch (err) {
        console.error('Error fetching top rescuers stats:', err);
        throw new Error('Could not fetch top rescuers stats');
    }
}

module.exports = {
    getWeeklyStats,
    getStatusStats,
    getTopRescuers
};