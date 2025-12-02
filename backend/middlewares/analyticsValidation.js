/**
 * Analytics Validation Middleware
 */

const { body, query, validationResult } = require('express-validator');

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
 * Validate create log request
 */
const validateCreateLog = [
  body('action_type')
    .notEmpty().withMessage('Action type is required')
    .isIn(['view', 'like', 'bookmark', 'search', 'create', 'update', 'delete', 'share', 'login', 'signup'])
    .withMessage('Invalid action type'),
  
  body('card_id')
    .optional()
    .isMongoId().withMessage('Invalid card ID format'),
  
  body('metadata')
    .optional()
    .isObject().withMessage('Metadata must be an object'),
  
  handleValidationErrors
];

/**
 * Validate query parameters
 */
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('action_type')
    .optional()
    .isIn(['view', 'like', 'bookmark', 'search', 'create', 'update', 'delete', 'share', 'login', 'signup'])
    .withMessage('Invalid action type'),
  
  query('start_date')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  
  query('end_date')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
  
  handleValidationErrors
];

module.exports = {
  validateCreateLog,
  validateQueryParams
};
