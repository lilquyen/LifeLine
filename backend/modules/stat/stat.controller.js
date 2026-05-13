const statService = require('./stat.service');

const getWeeklyStats = async (req, res) => {
  try {
    const dbData = await statService.getWeeklyStats();
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; 
      
      const dayData = dbData.find(row => row.date === dateStr);
      
      stats.push({
          date: dateStr,
          count: dayData ? dayData.count : 0
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

const getStatusStats = async (req, res) => {
  try {
    const stats = await statService.getStatusStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

const getTopRescuers = async (req, res) => {
  try {
    const stats = await statService.getTopRescuers();

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

module.exports = {
  getWeeklyStats,
  getStatusStats,
  getTopRescuers
}
