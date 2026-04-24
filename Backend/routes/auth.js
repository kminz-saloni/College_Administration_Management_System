/**
 * Authentication Routes
 * All routes related to user authentication and authorization
 */

const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * POST /auth/register
 * Activate an invited account (legacy route kept for compatibility)
 */
router.post('/register', authController.register);

/**
 * POST /auth/activate
 * Activate an invited account
 */
router.post('/activate', authController.register);

/**
 * POST /auth/login
 * Login user and get access token
 * @body {string} email - User email (required)
 * @body {string} password - User password (required)
 * @returns {Object} - {success, data: {accessToken, refreshToken, user}, message}
 */
router.post('/login', authController.login);

/**
 * POST /auth/refresh-token
 * Refresh access token using refresh token
 * @body {string} refreshToken - Refresh token (required)
 * @returns {Object} - {success, data: {accessToken}, message}
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * POST /auth/forgot-password
 * Request password reset (sends email with reset link)
 * @body {string} email - User email (required)
 * @returns {Object} - {success, data: {message}, message}
 * @security Uses time-limited reset token for security
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * POST /auth/reset-password
 * Reset password using reset token
 * @body {string} token - Password reset token (required)
 * @body {string} password - New password (required)
 * @body {string} confirmPassword - Confirm password (required, must match)
 * @returns {Object} - {success, data: {message}, message}
 */
router.post('/reset-password', authController.resetPassword);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * POST /auth/logout
 * Logout user (client-side token deletion recommended)
 * @auth Bearer token or httpOnly cookie
 * @returns {Object} - {success, data: {message}, message}
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * POST /auth/change-password
 * Change password for authenticated user
 * @auth Bearer token or httpOnly cookie (required)
 * @body {string} currentPassword - Current password (required)
 * @body {string} newPassword - New password (required)
 * @body {string} confirmPassword - Confirm password (required, must match)
 * @returns {Object} - {success, data: {message}, message}
 */
router.post('/change-password', authMiddleware, authController.changePassword);

/**
 * GET /auth/verify
 * Verify current user token and get user info
 * @auth Bearer token or httpOnly cookie (required)
 * @returns {Object} - {success, data: {user}, message}
 */
router.get('/verify', authMiddleware, authController.verifyToken);

// ============================================
// MIDDLEWARE FOR REQUEST LOGGING
// ============================================

/**
 * Log auth-related requests
 */
router.use((req, res, next) => {
  logger.debug(`Auth route: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 handler for auth routes
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Auth route not found: ${req.method} ${req.path}`,
    },
  });
});

// ============================================
// EXPORTS
// ============================================

module.exports = router;
