/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const {
  validateSignup,
  validateLogin,
  validateEmail,
  validatePasswordReset
} = require('../middlewares/validation');
const { authLimiter } = require('../middlewares/rateLimiter');

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/login', authLimiter, validateLogin, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', validateEmail, forgotPassword);
router.post('/reset-password/:token', validatePasswordReset, resetPassword);

module.exports = router;
