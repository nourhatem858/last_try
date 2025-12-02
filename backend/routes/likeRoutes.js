/**
 * Like Routes (Alternative RESTful structure)
 * Dedicated routes for like management
 */

const express = require('express');
const router = express.Router();
const {
  likeCard,
  unlikeCard,
  getLikedCards,
  deleteLikeById
} = require('../controllers/interactionController');
const { protect } = require('../middlewares/auth');
const { validateCardId } = require('../middlewares/cardValidation');
const { validateInteractionId } = require('../middlewares/interactionValidation');

/**
 * @route   POST /api/likes
 * @desc    Create a new like
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
    likeCard(req, res, next);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/likes
 * @desc    Get all likes for logged-in user
 * @access  Protected
 */
router.get('/', protect, getLikedCards);

/**
 * @route   DELETE /api/likes/:id
 * @desc    Delete a like by ID
 * @access  Protected
 */
router.delete('/:id', protect, validateInteractionId, deleteLikeById);

module.exports = router;
