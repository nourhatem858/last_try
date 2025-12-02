/**
 * Interaction Routes
 * Routes for likes, bookmarks, and ratings
 */

const express = require('express');
const router = express.Router();
const {
  likeCard,
  unlikeCard,
  bookmarkCard,
  unbookmarkCard,
  getBookmarkedCards,
  getLikedCards,
  getCardStats,
  deleteBookmarkById,
  deleteLikeById
} = require('../controllers/interactionController');
const { protect } = require('../middlewares/auth');
const { optionalAuth } = require('../middlewares/optionalAuth');
const { validateCardId } = require('../middlewares/cardValidation');
const { validateInteractionId } = require('../middlewares/interactionValidation');

// Card interaction routes (protected)
router.post('/:id/like', protect, validateCardId, likeCard);
router.delete('/:id/like', protect, validateCardId, unlikeCard);
router.post('/:id/bookmark', protect, validateCardId, bookmarkCard);
router.delete('/:id/bookmark', protect, validateCardId, unbookmarkCard);

// Get user's interactions (protected)
router.get('/bookmarks', protect, getBookmarkedCards);
router.get('/likes', protect, getLikedCards);

// Delete by interaction ID (protected)
router.delete('/bookmarks/:id', protect, validateInteractionId, deleteBookmarkById);
router.delete('/likes/:id', protect, validateInteractionId, deleteLikeById);

// Get card stats (public with optional auth)
router.get('/stats/:id', optionalAuth, validateCardId, getCardStats);

module.exports = router;
