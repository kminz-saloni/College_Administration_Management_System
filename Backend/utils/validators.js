/**
 * Input Validators
 * Centralized validation rules for the entire application
 * Works with Joi or express-validator
 */

const Joi = require('joi');

// ============================================
// GLOBAL VALIDATION PATTERNS
// ============================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// ============================================
// AUTHENTICATION VALIDATORS
// ============================================

/**
 * Validate registration input
 * @param {Object} data - Registration data
 * @returns {Object} - Joi validation result
 */
const validateRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required',
      }),
    email: Joi.string()
      .email()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .regex(PASSWORD_REGEX)
      .required()
      .messages({
        'string.pattern.base': 'Password must be at least 8 characters with uppercase, number, and special character (@$!%*?&)',
        'any.required': 'Password is required',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
    role: Joi.string()
      .valid('admin', 'teacher', 'student')
      .required()
      .messages({
        'any.only': 'Role must be admin, teacher, or student',
        'any.required': 'Role is required',
      }),
    phone: Joi.string()
      .regex(PHONE_REGEX)
      .optional()
      .messages({
        'string.pattern.base': 'Phone must be 10 digits',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate login input
 * @param {Object} data - Login data
 * @returns {Object} - Joi validation result
 */
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate forgot password input
 * @param {Object} data - Forgot password data
 * @returns {Object} - Joi validation result
 */
const validateForgotPassword = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .required()
      .messages({
        'string.email': 'Invalid email format',
        'any.required': 'Email is required',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate reset password input
 * @param {Object} data - Reset password data
 * @returns {Object} - Joi validation result
 */
const validateResetPassword = (data) => {
  const schema = Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required',
      }),
    password: Joi.string()
      .regex(PASSWORD_REGEX)
      .required()
      .messages({
        'string.pattern.base': 'Password must be at least 8 characters with uppercase, number, and special character',
        'any.required': 'Password is required',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate change password input
 * @param {Object} data - Change password data
 * @returns {Object} - Joi validation result
 */
const validateChangePassword = (data) => {
  const schema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required',
      }),
    newPassword: Joi.string()
      .regex(PASSWORD_REGEX)
      .invalid(Joi.ref('currentPassword'))
      .required()
      .messages({
        'string.pattern.base': 'Password must be at least 8 characters with uppercase, number, and special character',
        'any.invalid': 'New password cannot be same as current password',
        'any.required': 'New password is required',
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Password confirmation is required',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate refresh token input
 * @param {Object} data - Refresh token data
 * @returns {Object} - Joi validation result
 */
const validateRefreshToken = (data) => {
  const schema = Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Refresh token is required',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

// ============================================
// UTILITY VALIDATION FUNCTIONS
// ============================================

/**
 * Check if email format is valid
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  return EMAIL_REGEX.test(email);
};

/**
 * Check if password meets strength requirements
 * @param {string} password - Password to validate
 * @returns {Object} - {isValid: boolean, errors: []}
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Extract validation errors into array format
 * @param {Object} joiError - Joi validation error object
 * @returns {Array} - Array of error details
 */
const extractValidationErrors = (joiError) => {
  if (!joiError.details) {
    return [];
  }

  return joiError.details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message,
    type: detail.type,
  }));
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Joi validation functions
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateRefreshToken,

  // Utility functions
  isValidEmail,
  validatePasswordStrength,
  extractValidationErrors,

  // Regex patterns (for direct use if needed)
  EMAIL_REGEX,
  PASSWORD_REGEX,
  PHONE_REGEX,
  USERNAME_REGEX,
};
