const jwt = require('jsonwebtoken');

const authMiddleware = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // { id: user._id }
  } catch (err) {
    return null;
  }
};

module.exports = authMiddleware;
