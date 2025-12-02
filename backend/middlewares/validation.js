/**
 * Validation Middleware
 * Input validation using express-validator
 */

const { body, param, validationResult } = require('express-validator');

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
 * Signup validation rules
 */
const validateSignup = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

/**
 * Login validation rules
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Update profile validation rules
 */
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto']).withMessage('Theme must be light, dark, or auto'),
  
  body('preferences.favorite_topics')
    .optional()
    .isArray().withMessage('Favorite topics must be an array'),
  
  body('preferences.notifications_enabled')
    .optional()
    .isBoolean().withMessage('Notifications enabled must be a boolean'),
  
  handleValidationErrors
];

/**
 * User ID validation
 */
const validateUserId = [
  param('id')
    .isMongoId().withMessage('Invalid user ID format'),
  
  handleValidationErrors
];

/**
 * Email validation for password reset
 */
const validateEmail = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  handleValidationErrors
];

/**
 * Password reset validation
 */
const validatePasswordReset = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateUpdateProfile,
  validateUserId,
  validateEmail,
  validatePasswordReset
};
