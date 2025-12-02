/**
 * Bookmark Routes (Alternative RESTful structure)
 * Dedicated routes for bookmark management
 */

const express = require('express');
const router = express.Router();
const {
  bookmarkCard,
  unbookmarkCard,
  getBookmarkedCards,
  deleteBookmarkById
} = require('../controllers/interactionController');
const { protect } = require('../middlewares/auth');
const { validateCardId } = require('../middlewares/cardValidation');
const { validateInteractionId } = require('../middlewares/interactionValidation');

/**
 * @route   POST /api/bookmarks
 * @desc    Create a new bookmark
 * @access  Protected
 * @body    { card_id: ObjectId }
 */
router.post('/', protect, async (req, res, next) => {
  try {
    const { card_id } = req.body;

    if (!card_id) {
      return res.status(400).json({
        success: false,
        message: 'card_id is required',
        code: 'MISSING_CARD_ID'
      });
    }

    // Set card_id as param for reusing existing controller
    req.params.id = card_id;
    bookmarkCard(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/bookmarks
 * @desc    Get all bookmarks for logged-in user
 * @access  Protected
 */
router.get('/', protect, getBookmarkedCards);

/**
 * @route   DELETE /api/bookmarks/:id
 * @desc    Delete a bookmark by ID
 * @access  Protected
 */
router.delete('/:id', protect, validateInteractionId, deleteBookmarkById);

module.exports = router;
