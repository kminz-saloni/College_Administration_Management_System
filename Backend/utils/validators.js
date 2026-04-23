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
      .custom((value, helpers) => {
        const { role } = helpers.state.ancestors[0] || {};

        if (role === 'teacher' && !value.endsWith('@fot.college.edu')) {
          return helpers.error('any.invalid');
        }

        return value;
      })
      .required()
      .messages({
        'string.email': 'Invalid email format',
        'any.invalid': 'Teacher email must be a @fot.college.edu address',
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
      .valid('teacher', 'student')
      .required()
      .messages({
        'any.only': 'Role must be teacher or student',
        'any.required': 'Role is required',
      }),
    phone: Joi.string()
      .regex(PHONE_REGEX)
      .optional()
      .messages({
        'string.pattern.base': 'Phone must be 10 digits',
      }),
    subjects: Joi.when('role', {
      is: 'teacher',
      then: Joi.array()
        .items(Joi.string().required())
        .min(1)
        .required()
        .messages({
          'array.min': 'Teachers must select at least one subject',
          'any.required': 'Subjects are required for teachers',
        }),
      otherwise: Joi.forbidden(),
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
// EVENTS AND NOTIFICATIONS VALIDATORS
// ============================================

const validateEvent = (data) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(150).required(),
    description: Joi.string().trim().min(10).max(1200).required(),
    eventType: Joi.string().trim().max(50).optional(),
    location: Joi.string().trim().min(2).max(200).required(),
    startAt: Joi.date().greater('now').required(),
    endAt: Joi.date().greater(Joi.ref('startAt')).required(),
    coverImageUrl: Joi.string().uri().optional().allow(null, ''),
  });

  return schema.validate(data, { abortEarly: false });
};

const validateEventUpdate = (data) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(150).optional(),
    description: Joi.string().trim().min(10).max(1200).optional(),
    eventType: Joi.string().trim().max(50).optional(),
    location: Joi.string().trim().min(2).max(200).optional(),
    startAt: Joi.date().greater('now').optional(),
    endAt: Joi.date().greater(Joi.ref('startAt')).optional(),
    coverImageUrl: Joi.string().uri().optional().allow(null, ''),
  });

  return schema.validate(data, { abortEarly: false });
};

const validateEventRSVP = (data) => {
  const schema = Joi.object({
    status: Joi.string()
      .valid('yes', 'no', 'maybe')
      .required(),
    notes: Joi.string().trim().max(300).optional().allow(null, ''),
  });

  return schema.validate(data, { abortEarly: false });
};

// ============================================
// CLASS VALIDATORS
// ============================================

const validateClass = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    subject: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().max(500).optional().allow(null, ''),
    schedule: Joi.object().optional(),
    academicYear: Joi.string().trim().optional().allow(null, ''),
    semester: Joi.number().optional().allow(null, ''),
    capacity: Joi.number().optional().default(50),
    teacherId: Joi.string().optional(), // For admin to assign
  });

  return schema.validate(data, { abortEarly: false });
};

const validateClassUpdate = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).optional(),
    subject: Joi.string().trim().min(2).max(100).optional(),
    description: Joi.string().trim().max(500).optional().allow(null, ''),
    schedule: Joi.object().optional(),
    academicYear: Joi.string().trim().optional().allow(null, ''),
    semester: Joi.number().optional().allow(null, ''),
    capacity: Joi.number().optional(),
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
// ATTENDANCE VALIDATORS
// ============================================

/**
 * Validate attendance marking input
 * @param {Object} data - Attendance marking data
 * @returns {Object} - Joi validation result
 */
const validateAttendanceMark = (data) => {
  const schema = Joi.object({
    classId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid class ID format',
        'any.required': 'Class ID is required',
      }),

    date: Joi.date()
      .iso()
      .required()
      .messages({
        'date.format': 'Date must be in ISO format (YYYY-MM-DD)',
        'any.required': 'Date is required',
      }),

    attendance: Joi.array()
      .items(
        Joi.object({
          studentId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
              'string.pattern.base': 'Invalid student ID format',
              'any.required': 'Student ID is required',
            }),

          status: Joi.string()
            .valid('present', 'absent', 'late')
            .required()
            .messages({
              'any.only': 'Status must be present, absent, or late',
              'any.required': 'Status is required',
            }),

          notes: Joi.string()
            .max(200)
            .optional()
            .messages({
              'string.max': 'Notes cannot exceed 200 characters',
            }),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one attendance record is required',
        'any.required': 'Attendance records are required',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate attendance update input
 * @param {Object} data - Attendance update data
 * @returns {Object} - Joi validation result
 */
const validateAttendanceUpdate = (data) => {
  const schema = Joi.object({
    attendance: Joi.array()
      .items(
        Joi.object({
          studentId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
              'string.pattern.base': 'Invalid student ID format',
              'any.required': 'Student ID is required',
            }),

          status: Joi.string()
            .valid('present', 'absent', 'late')
            .required()
            .messages({
              'any.only': 'Status must be present, absent, or late',
              'any.required': 'Status is required',
            }),

          notes: Joi.string()
            .max(200)
            .optional()
            .messages({
              'string.max': 'Notes cannot exceed 200 characters',
            }),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one attendance record is required',
        'any.required': 'Attendance records are required',
      }),
  });

  return schema.validate(data, { abortEarly: false });
};


/**
 * Validate video upload input
 * @param {Object} data - Video upload metadata
 * @returns {Object} - Joi validation result
 */
const validateVideoUpload = (data) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().max(1000).optional().allow(''),
    subject: Joi.string().trim().required(),
    classId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'Invalid class ID format',
        'any.required': 'Class ID is required',
      }),
    duration: Joi.number().min(0).optional().allow(null),
    status: Joi.string().valid('draft', 'published').optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate video update input
 * @param {Object} data - Video update metadata
 * @returns {Object} - Joi validation result
 */
const validateVideoUpdate = (data) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(3).max(100).optional(),
    description: Joi.string().trim().max(1000).optional().allow(''),
    subject: Joi.string().trim().optional(),
    duration: Joi.number().min(0).optional().allow(null),
    isPublished: Joi.boolean().optional(),
  });

  return schema.validate(data, { abortEarly: false });
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
  validateAttendanceMark,
  validateAttendanceUpdate,
  validateEvent,
  validateEventUpdate,
  validateEventRSVP,
  validateClass,
  validateClassUpdate,
  validateVideoUpload,
  validateVideoUpdate,

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
