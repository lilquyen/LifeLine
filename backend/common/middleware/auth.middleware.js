const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. check có token không
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // 2. lấy token
  const token = authHeader.split(' ')[1];

  try {
    // 3. verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. gắn user vào request
    req.user = decoded;

    next(); // cho đi tiếp
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;