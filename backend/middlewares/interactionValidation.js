/**
 * Interaction Validation Middleware
 * Validate bookmark and like operations
 */

const { param, validationResult } = require('express-validator');

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
 * Validate interaction ID (bookmark or like ID)
 */
const validateInteractionId = [
  param('id')
    .isMongoId().withMessage('Invalid interaction ID format'),
  
  handleValidationErrors
];

module.exports = {
  validateInteractionId
};
