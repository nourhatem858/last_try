/**
 * Optional Authentication Middleware
 * Attach user info if token is present, but don't require it
 */

const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Optional authentication - attach user if token is valid
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, continue without user
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Invalid token, but continue without user
      console.log('Invalid token in optional auth:', error.message);
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { optionalAuth };
