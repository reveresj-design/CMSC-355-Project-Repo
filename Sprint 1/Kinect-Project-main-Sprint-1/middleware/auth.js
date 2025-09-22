const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the request header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, 'yourSecretKey');
    req.user = decoded; // Add the decoded payload (e.g., { userId: ... }) to the request object
    next(); // Move on to the next middleware or the route handler
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};