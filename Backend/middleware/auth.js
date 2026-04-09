/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 * Per SRS 4.1: The system's RBAC middleware shall check the JWT payload to enforce permissions
 */

const AuthService = require('../services/authService');
const { sendError } = require('../utils/responses');
const logger = require('../utils/logger');

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header or cookies
 * Extracts user info and attaches to req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer scheme)
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    // Fallback to httpOnly cookie if no header
    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    // Token not found
    if (!token) {
      logger.warn('Missing authentication token');
      return sendError(
        res,
        'Authentication token required',
        'MISSING_TOKEN',
        [],
        401
      );
    }

    // Verify token
    const decoded = AuthService.verifyAccessToken(token);

    // Attach user info to request (normalize userId to _id for backwards compatibility)
    req.user = {
      _id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    logger.debug(`User authenticated: ${decoded.userId} (${decoded.role})`);

    next();
  } catch (error) {
    logger.warn(`Authentication error: ${error.message}`);

    // Check if token is expired
    if (error.message === 'Access token expired') {
      return sendError(
        res,
        'Access token expired. Please refresh your token.',
        'TOKEN_EXPIRED',
        [],
        401
      );
    }

    return sendError(
      res,
      'Invalid or malformed token',
      'INVALID_TOKEN',
      [],
      401
    );
  }
};

/**
 * Optional Authentication Middleware
 * Does not fail if token is missing, but verifies if present
 * Useful for public endpoints with optional user context
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }

    if (!token && req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = AuthService.verifyAccessToken(token);
      req.user = decoded;
      logger.debug(`User authenticated (optional): ${decoded.userId}`);
    }

    next();
  } catch (error) {
    // Log but don't fail - just continue without user context
    logger.debug(`Optional auth error (continuing): ${error.message}`);
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
};
