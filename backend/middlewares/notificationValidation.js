/**
 * Notification Validation Middleware
 */

const { param, query, validationResult } = require('express-validator');

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
 * Validate notification ID
 */
const validateNotificationId = [
  param('id')
    .isMongoId().withMessage('Invalid notification ID format'),
  
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
  
  query('read')
    .optional()
    .isBoolean().withMessage('Read must be a boolean'),
  
  handleValidationErrors
];

module.exports = {
  validateNotificationId,
  validateQueryParams
};
