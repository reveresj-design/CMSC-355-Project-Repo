// FileName: auth.js
// Description: Middleware to verify JWT.

//Imports
const config = require('../config');
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
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded; 
    next(); 
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};