/**
 * Knowledge Card Routes
 */

const express = require('express');
const router = express.Router();
const {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  getMyCards,
  getRelatedCards
} = require('../controllers/cardController');
const { protect, authorize } = require('../middlewares/auth');
const { optionalAuth } = require('../middlewares/optionalAuth');
const {
  validateCreateCard,
  validateUpdateCard,
  validateCardId,
  validateQueryParams
} = require('../middlewares/cardValidation');

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, validateQueryParams, getAllCards);
router.get('/:id', optionalAuth, validateCardId, getCardById);
router.get('/:id/related', validateCardId, getRelatedCards);

// Protected routes
router.post('/', protect, validateCreateCard, createCard);
router.get('/user/my-cards', protect, getMyCards);
router.patch('/:id', protect, validateCardId, validateUpdateCard, updateCard);
router.delete('/:id', protect, validateCardId, deleteCard);

module.exports = router;
