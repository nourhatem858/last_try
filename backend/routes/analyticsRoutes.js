/**
 * Analytics Routes
 */

const express = require('express');
const router = express.Router();
const {
  createLog,
  getUserLogs,
  getUserSummary,
  getGlobalAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/auth');
const { validateCreateLog } = require('../middlewares/analyticsValidation');

// Protected routes
router.post('/logs', protect, validateCreateLog, createLog);
router.get('/logs', protect, getUserLogs);
router.get('/summary', protect, getUserSummary);

// Admin only routes
router.get('/global', protect, authorize('admin'), getGlobalAnalytics);

module.exports = router;
