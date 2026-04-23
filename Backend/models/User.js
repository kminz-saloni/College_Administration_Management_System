/**
 * User Model
 * MongoDB schema for user management
 * Supports three roles: admin, teacher, student
 */

const mongoose = require('mongoose');
const constants = require('../config/constants');

// ============================================
// USER SCHEMA DEFINITION
// ============================================

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },

    phone: {
      type: String,
      optional: true,
      trim: true,
    },

    // Authentication Fields
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't return password by default
    },

    role: {
      type: String,
      enum: [constants.ROLES.ADMIN, constants.ROLES.TEACHER, constants.ROLES.STUDENT],
      required: true,
      default: constants.ROLES.STUDENT,
      index: true,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpiry: {
      type: Date,
      select: false,
    },

    // Password Reset Fields
    passwordResetToken: {
      type: String,
      select: false,
      sparse: true,
    },

    passwordResetExpiry: {
      type: Date,
      select: false,
    },

    // Profile Information
    profilePicture: {
      type: String,
      optional: true,
    },

    department: {
      type: String,
      optional: true,
    },

    designation: {
      type: String,
      optional: true,
    },

    // Teacher-specific fields
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],

    // Login Tracking
    lastLogin: {
      type: Date,
      default: null,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    // Metadata
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    deletedAt: {
      type: Date,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// ============================================
// INDEXES
// ============================================

// Compound index for email + role lookups
userSchema.index({ email: 1, role: 1 });

// Index for active user queries
userSchema.index({ isActive: 1, createdAt: -1 });

// Index for password reset token lookups
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

// Index for email verification lookups
userSchema.index({ emailVerificationToken: 1 }, { sparse: true });

// Index for teachers by subject
userSchema.index({ role: 1, subjects: 1 }, { sparse: true });

// ============================================
// INSTANCE METHODS
// ============================================

/**
 * Check if user account is locked (failed login attempts)
 * @returns {boolean}
 */
userSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

/**
 * Increment login attempts
 * Lock account after 5 failed attempts for 30 minutes
 */
userSchema.methods.incLoginAttempts = async function () {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1, lockUntil: null },
    });
  }

  // Increment attempts and set lock if needed
  const updates = {
    $inc: { loginAttempts: 1 },
  };

  const maxAttempts = 5;
  const lockTimeMinutes = 30;

  if (this.loginAttempts + 1 >= maxAttempts) {
    updates.$set = {
      lockUntil: new Date(Date.now() + lockTimeMinutes * 60 * 1000),
    };
  }

  return this.updateOne(updates);
};

/**
 * Reset login attempts after successful login
 */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lockUntil: null },
  });
};

/**
 * Update last login timestamp
 */
userSchema.methods.recordLogin = async function () {
  return this.updateOne({
    $set: { lastLogin: new Date() },
  });
};

/**
 * Set password reset token and expiry
 * @param {string} token - Reset token
 */
userSchema.methods.setPasswordResetToken = async function (token) {
  this.passwordResetToken = token;
  this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return this.save();
};

/**
 * Clear password reset token
 */
userSchema.methods.clearPasswordResetToken = async function () {
  return this.updateOne({
    $unset: { passwordResetToken: 1, passwordResetExpiry: 1 },
  });
};

/**
 * Check if password reset token is valid and not expired
 * @param {string} token - Token to verify
 * @returns {boolean}
 */
userSchema.methods.isValidPasswordResetToken = function (token) {
  return (
    this.passwordResetToken === token &&
    this.passwordResetExpiry &&
    this.passwordResetExpiry > Date.now()
  );
};

/**
 * Get user info for response (without sensitive fields)
 * @returns {Object}
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.passwordResetToken;
  delete user.passwordResetExpiry;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpiry;
  delete user.__v;
  return user;
};

// ============================================
// STATIC METHODS
// ============================================

/**
 * Find user by email and include password field
 * @param {string} email - User email
 * @returns {Promise<User>}
 */
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email: email.toLowerCase() }, { password: 1, name: 1, email: 1, role: 1, phone: 1, isActive: 1, loginAttempts: 1, lockUntil: 1 });
};

/**
 * Find active user by email
 * @param {string} email - User email
 * @returns {Promise<User>}
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    isActive: true,
  });
};

/**
 * Check email uniqueness
 * @param {string} email - Email to check
 * @param {string} excludeUserId - Optional: user ID to exclude from check
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailUnique = async function (email, excludeUserId = null) {
  const query = { email: email.toLowerCase() };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const user = await this.findOne(query);
  return !user; // Return true if email is unique (not found)
};

/**
 * Find by password reset token
 * @param {string} token - Reset token
 * @returns {Promise<User>}
 */
userSchema.statics.findByPasswordResetToken = function (token) {
  return this.findOne({
    passwordResetToken: token,
    passwordResetExpiry: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpiry');
};

/**
 * Get users by role with pagination
 * @param {string} role - User role
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<{users: Array, total: number}>}
 */
userSchema.statics.findByRoleWithPagination = async function (
  role,
  page = 1,
  limit = 10
) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    this.find({ role, isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    this.countDocuments({ role, isActive: true }),
  ]);

  return { users, total };
};

// ============================================
// MIDDLEWARE (HOOKS)
// ============================================

/**
 * Update updatedAt timestamp before save
 */
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Prevent password from being returned in queries by default
 */
userSchema.pre(/^find/, function (next) {
  // Don't exclude fields if they are explicitly selected in the projection
  const projection = this._fields;
  if (!projection || (!projection.password && !projection['+password'])) {
    if (!this.options._recursed) {
      this.select('-password -passwordResetToken -passwordResetExpiry');
    }
  }
  next();
});

// ============================================
// CREATE AND EXPORT MODEL
// ============================================

const User = mongoose.model('User', userSchema);

module.exports = User;
