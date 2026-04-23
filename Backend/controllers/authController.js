/**
 * Authentication Controller
 * Handles user registration, login, password management, and token operations
 */

const User = require('../models/User');
const AuthService = require('../services/authService');
const EmailService = require('../services/emailService');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/responses');
const { validateRegistration, validateLogin, validateForgotPassword, validateResetPassword, validateChangePassword, validateRefreshToken, extractValidationErrors } = require('../utils/validators');
const constants = require('../config/constants');

// ============================================
// REGISTRATION CONTROLLER
// ============================================

/**
 * Register a new user
 * POST /auth/register
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const register = async (req, res, next) => {
  try {
    logger.info('User registration attempt', { email: req.body.email });

    // Validate input
    const { error, value } = validateRegistration(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        details,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    const { name, email, password, role, phone } = value;

    // Public signup must never create admin accounts.
    if (role === constants.ROLES.ADMIN) {
      return sendError(
        res,
        'Admin accounts can only be created through database seeding.',
        constants.ERROR_CODES.FORBIDDEN,
        { field: 'role', message: 'Admin role is not allowed in public registration' },
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      logger.warn('Registration failed: email already exists', { email });
      return sendError(
        res,
        'Email already registered',
        constants.ERROR_CODES.EMAIL_ALREADY_EXISTS,
        { field: 'email', message: 'This email is already registered' },
        constants.HTTP_STATUS.CONFLICT
      );
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(password);

    // Create user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      isActive: true,
      emailVerified: false,
    };

    // Add subjects for teachers
    if (role === constants.ROLES.TEACHER && value.subjects) {
      userData.subjects = value.subjects;
    }

    const user = new User(userData);

    await user.save();

    logger.info('User registered successfully', { userId: user._id, email });

    // Generate JWT token for auto-login
    const token = AuthService.generateToken(user);

    // Send success response with token
    return sendSuccess(
      res,
      {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        subjects: user.subjects || [],
        token,
        message: 'Account created successfully!',
      },
      'User registered successfully',
      constants.HTTP_STATUS.CREATED
    );
  } catch (err) {
    logger.error('Registration error', { error: err.message });
    next(err);
  }
};

// ============================================
// LOGIN CONTROLLER
// ============================================

/**
 * Login user and return tokens
 * POST /auth/login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const login = async (req, res, next) => {
  try {
    logger.info('User login attempt', { email: req.body.email });

    // Validate input
    const { error, value } = validateLogin(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        details,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    const { email, password } = value;

    // Find user by email (with password field)
    const user = await User.findByEmailWithPassword(email);
    if (!user || !user.isActive) {
      logger.warn('Login failed: user not found or inactive', { email });
      return sendError(
        res,
        'Invalid email or password',
        constants.ERROR_CODES.INVALID_CREDENTIALS,
        null,
        constants.HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      logger.warn('Login failed: account locked', { userId: user._id });
      return sendError(
        res,
        'Account locked due to too many failed login attempts. Try again in 30 minutes.',
        constants.ERROR_CODES.ACCOUNT_LOCKED,
        null,
        constants.HTTP_STATUS.FORBIDDEN
      );
    }

    // Verify password
    const isPasswordValid = await AuthService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      logger.warn('Login failed: wrong password', { userId: user._id });
      return sendError(
        res,
        'Invalid email or password',
        constants.ERROR_CODES.INVALID_CREDENTIALS,
        null,
        constants.HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Reset login attempts
    await user.resetLoginAttempts();

    // Record login
    await user.recordLogin();

    // Generate tokens
    const { accessToken, refreshToken } = await AuthService.generateTokens({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    logger.info('User logged in successfully', { userId: user._id });

    // Send success response
    return sendSuccess(
      res,
      {
        accessToken,
        refreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
      'Login successful',
      constants.HTTP_STATUS.OK
    );
  } catch (err) {
    logger.error('Login error', { error: err.message });
    next(err);
  }
};

// ============================================
// LOGOUT CONTROLLER
// ============================================

/**
 * Logout user
 * POST /auth/logout
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const logout = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    logger.info('User logged out', { userId });

    // In JWT-based auth, logout is typically client-side
    // We could implement token blacklist in Redis for advanced scenarios
    // For now, we just return success

    return sendSuccess(
      res,
      { message: 'Please delete tokens from client storage' },
      'Logout successful',
      constants.HTTP_STATUS.OK
    );
  } catch (err) {
    logger.error('Logout error', { error: err.message });
    next(err);
  }
};

// ============================================
// TOKEN REFRESH CONTROLLER
// ============================================

/**
 * Refresh access token using refresh token
 * POST /auth/refresh-token
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const refreshToken = async (req, res, next) => {
  try {
    logger.info('Token refresh attempt');

    // Validate input
    const { error, value } = validateRefreshToken(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        details,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    const { refreshToken: token } = value;

    // Verify refresh token
    let decoded;
    try {
      decoded = await AuthService.verifyRefreshToken(token);
    } catch (err) {
      logger.warn('Invalid refresh token', { error: err.message });
      return sendError(
        res,
        'Invalid or expired refresh token',
        constants.ERROR_CODES.INVALID_TOKEN,
        null,
        constants.HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      logger.warn('User not found or inactive during refresh', {
        userId: decoded.userId,
      });
      return sendError(
        res,
        'User not found',
        constants.ERROR_CODES.USER_NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Generate new access token
    const newAccessToken = await AuthService.generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    logger.info('Token refreshed successfully', { userId: user._id });

    return sendSuccess(
      res,
      { accessToken: newAccessToken },
      'Token refreshed successfully',
      constants.HTTP_STATUS.OK
    );
  } catch (err) {
    logger.error('Token refresh error', { error: err.message });
    next(err);
  }
};

// ============================================
// VERIFY TOKEN CONTROLLER
// ============================================

/**
 * Verify current user token
 * GET /auth/verify
 * @param {Object} req - Express request (requires authMiddleware)
 * @param {Object} res - Express response
 */
const verifyToken = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(
        res,
        'User not found',
        constants.ERROR_CODES.USER_NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    logger.info('Token verified', { userId });

    return sendSuccess(
      res,
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
      'Token is valid',
      constants.HTTP_STATUS.OK
    );
  } catch (err) {
    logger.error('Token verification error', { error: err.message });
    next(err);
  }
};

// ============================================
// PASSWORD MANAGEMENT CONTROLLERS
// ============================================

/**
 * Request password reset via email
 * POST /auth/forgot-password
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const forgotPassword = async (req, res, next) => {
  try {
    logger.info('Forgot password request', { email: req.body.email });

    // Validate input
    const { error, value } = validateForgotPassword(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        details,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    const { email } = value;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists (security best practice)
      logger.warn('Forgot password: user not found', { email });
      return sendSuccess(
        res,
        { message: 'If email exists, password reset link has been sent' },
        'Check your email for password reset link',
        constants.HTTP_STATUS.OK
      );
    }

    // Generate reset token
    const { resetToken } = await AuthService.generatePasswordResetToken(user._id);

    // Save token to user
    await user.setPasswordResetToken(resetToken);

    // Send email
    try {
      await EmailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetToken
      );
      logger.info('Password reset email sent', { userId: user._id });
    } catch (emailErr) {
      logger.error('Failed to send password reset email', {
        userId: user._id,
        error: emailErr.message,
      });
      // Continue anyway - user can try again
    }

    return sendSuccess(
      res,
      { message: 'If email exists, password reset link has been sent' },
      'Check your email for password reset link',
      constants.HTTP_STATUS.OK
    );
  } catch (err) {
    logger.error('Forgot password error', { error: err.message });
    next(err);
  }
};

/**
 * Reset password using reset token
 * POST /auth/reset-password
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const resetPassword = async (req, res, next) => {
  try {
    logger.info('Password reset attempt');

    // Validate input
    const { error, value } = validateResetPassword(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        details,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    const { token, password } = value;

    // Find user by reset token
    const user = await User.findByPasswordResetToken(token);
    if (!user) {
      logger.warn('Password reset: invalid or expired token');
      return sendError(
        res,
        'Invalid or expired reset link',
        constants.ERROR_CODES.INVALID_TOKEN,
        null,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Hash new password
    const hashedPassword = await AuthService.hashPassword(password);

    // Atomically update password and clear reset token in one DB call
    await user.updateOne({
      $set: { password: hashedPassword },
      $unset: { passwordResetToken: 1, passwordResetExpiry: 1 },
    });

    logger.info('Password reset successful', { userId: user._id });

    return sendSuccess(
      res,
      { message: 'Password reset successful. Please log in with new password.' },
      'Password updated successfully',
      constants.HTTP_STATUS.OK
    );
  } catch (err) {
    logger.error('Password reset error', { error: err.message });
    next(err);
  }
};

/**
 * Change password for authenticated user
 * POST /auth/change-password
 * @param {Object} req - Express request (requires authMiddleware)
 * @param {Object} res - Express response
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    logger.info('Change password attempt', { userId });

    // Validate input
    const { error, value } = validateChangePassword(req.body);
    if (error) {
      const details = extractValidationErrors(error);
      return sendError(
        res,
        'Validation failed',
        constants.ERROR_CODES.VALIDATION_ERROR,
        details,
        constants.HTTP_STATUS.BAD_REQUEST
      );
    }

    const { currentPassword, newPassword } = value;

    // Find user with password
    const user = await User.findByEmailWithPassword(
      req.user?.email
    );
    if (!user) {
      return sendError(
        res,
        'User not found',
        constants.ERROR_CODES.USER_NOT_FOUND,
        null,
        constants.HTTP_STATUS.NOT_FOUND
      );
    }

    // Verify current password
    const isValid = await AuthService.comparePassword(
      currentPassword,
      user.password
    );
    if (!isValid) {
      logger.warn('Change password: incorrect current password', { userId });
      return sendError(
        res,
        'Current password is incorrect',
        constants.ERROR_CODES.INVALID_CREDENTIALS,
        { field: 'currentPassword', message: 'Current password is incorrect' },
        constants.HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Hash new password
    const hashedPassword = await AuthService.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    logger.info('Password changed successfully', { userId });

    return sendSuccess(
      res,
      { message: 'Password changed successfully' },
      'Password updated',
      constants.HTTP_STATUS.OK
    );
  } catch (err) {
    logger.error('Change password error', { error: err.message });
    next(err);
  }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyToken,
  forgotPassword,
  resetPassword,
  changePassword,
};
