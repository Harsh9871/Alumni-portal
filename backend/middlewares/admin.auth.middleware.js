// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

module.exports = function (req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided',
        success: false,
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'No token provided',
        success: false,
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the decoded email matches admin email
    if (decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        message: 'Access denied - Admin privileges required',
        success: false,
      });
    }

    // Attach user info to request object
    req.user = decoded;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token',
        success: false,
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        success: false,
      });
    } else {
      return res.status(500).json({
        message: 'Authentication failed',
        success: false,
      });
    }
  }
};