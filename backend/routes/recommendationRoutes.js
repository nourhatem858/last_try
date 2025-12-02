/**
 * Recommendation Routes
 * AI-powered recommendations
 */

const express = require('express');
const router = express.Router();
const {
  getPersonalized,
  getTrending,
  getSuggestions
} = require('../controllers/recommendationController');
const { protect } = require('../middlewares/auth');

// Public routes
router.get('/trending', getTrending);

// Protected routes
router.get('/personalized', protect, getPersonalized);
router.post('/suggest', protect, getSuggestions);

module.exports = router;
