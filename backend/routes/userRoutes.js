/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getCurrentUser
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const {
  validateUserId,
  validateUpdateProfile
} = require('../middlewares/validation');

// Protected routes
router.get('/me', protect, getCurrentUser);
router.get('/profile/:id', protect, validateUserId, getUserProfile);
router.patch('/profile/:id', protect, validateUserId, validateUpdateProfile, updateUserProfile);

module.exports = router;
