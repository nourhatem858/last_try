/**
 * Knowledge Card Validation Middleware
 * Input validation for card operations
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      })),
      code: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

/**
 * Create card validation rules
 */
const validateCreateCard = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 10, max: 10000 }).withMessage('Content must be between 10 and 10000 characters'),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('Each tag must be between 2 and 30 characters'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'shared']).withMessage('Visibility must be public, private, or shared'),
  
  handleValidationErrors
];

/**
 * Update card validation rules
 */
const validateUpdateCard = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 10000 }).withMessage('Content must be between 10 and 10000 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('Each tag must be between 2 and 30 characters'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private', 'shared']).withMessage('Visibility must be public, private, or shared'),
  
  handleValidationErrors
];

/**
 * Card ID validation
 */
const validateCardId = [
  param('id')
    .isMongoId().withMessage('Invalid card ID format'),
  
  handleValidationErrors
];

/**
 * Query parameters validation for filtering
 */
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Category must be between 2 and 50 characters'),
  
  query('tag')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage('Tag must be between 2 and 30 characters'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Search query must be between 2 and 100 characters'),
  
  query('author_id')
    .optional()
    .isMongoId().withMessage('Invalid author ID format'),
  
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'popular', 'trending']).withMessage('Invalid sort option'),
  
  handleValidationErrors
];

/**
 * Rating validation
 */
const validateRating = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateCard,
  validateUpdateCard,
  validateCardId,
  validateQueryParams,
  validateRating
};
