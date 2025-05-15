// src/middlewares/auth.middleware.js

const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authMiddleware = {
  authenticate(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication token is required' });
      }
      
      jwt.verify(token, config.jwt.secret, (err, decoded) => {
        if (err) {
          return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }
        
        req.user = decoded;
        next();
      });
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ success: false, message: 'Authentication failed' });
    }
  },
  
  authorize(roles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'User not authorized' });
      }
      
      next();
    };
  }
};

module.exports = authMiddleware;