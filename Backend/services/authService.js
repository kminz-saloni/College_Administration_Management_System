/**
 * Authentication Service
 * JWT token generation, verification, and password hashing
 * Per SRS 4.1: Secure, stateless authentication using JSON Web Tokens (JWT)
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/environment');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Hash password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hashed password
   */
  static async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      logger.error(`Password hashing error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Compare password with hashed password
   * @param {string} password - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} - True if passwords match
   */
  static async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error(`Password comparison error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate password strength
   * Per SRS 5.3: Password strength requirements
   * Requirements: Min 8 chars, 1 uppercase, 1 number, 1 special char
   * @param {string} password - Password to validate
   * @returns {object} - { isValid: boolean, errors: [] }
   */
  static validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate Access Token
   * @param {object} user - User object with _id, email, role
   * @returns {string} - JWT access token
   */
  static generateAccessToken(user) {
    try {
      const payload = {
        userId: user._id || user.id,
        email: user.email,
        role: user.role,
        type: 'access',
      };

      const token = jwt.sign(payload, config.jwt.accessTokenSecret, {
        expiresIn: config.jwt.accessTokenExpiry,
        issuer: 'college-admin-backend',
        subject: user._id || user.id,
      });

      return token;
    } catch (error) {
      logger.error(`Access token generation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate Refresh Token
   * @param {object} user - User object with _id, email, role
   * @returns {string} - JWT refresh token
   */
  static generateRefreshToken(user) {
    try {
      const payload = {
        userId: user._id || user.id,
        email: user.email,
        type: 'refresh',
      };

      const token = jwt.sign(payload, config.jwt.refreshTokenSecret, {
        expiresIn: config.jwt.refreshTokenExpiry,
        issuer: 'college-admin-backend',
        subject: user._id || user.id,
      });

      return token;
    } catch (error) {
      logger.error(`Refresh token generation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate both tokens
   * @param {object} user - User object
   * @returns {object} - { accessToken, refreshToken }
   */
  static generateTokens(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  /**
   * Verify Access Token
   * @param {string} token - JWT token
   * @returns {object} - Decoded payload
   */
  static verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.accessTokenSecret);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn(`Access token expired at ${error.expiredAt}`);
        throw new Error('Access token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        logger.warn('Invalid access token');
        throw new Error('Invalid access token');
      }
      logger.error(`Access token verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify Refresh Token
   * @param {string} token - JWT token
   * @returns {object} - Decoded payload
   */
  static verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshTokenSecret);
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        logger.warn(`Refresh token expired at ${error.expiredAt}`);
        throw new Error('Refresh token expired');
      }
      if (error.name === 'JsonWebTokenError') {
        logger.warn('Invalid refresh token');
        throw new Error('Invalid refresh token');
      }
      logger.error(`Refresh token verification error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - JWT token
   * @returns {object} - Decoded payload
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error(`Token decode error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate password reset token (temporary, short-lived)
   * @param {string} userId - User ID
   * @returns {object} - { resetToken, expiresAt }
   */
  static generatePasswordResetToken(userId) {
    try {
      const resetToken = jwt.sign({ userId, type: 'password-reset' }, config.jwt.accessTokenSecret, {
        expiresIn: '1h', // Reset link valid for 1 hour
        subject: userId,
      });

      const decoded = jwt.decode(resetToken);
      return {
        resetToken,
        expiresAt: new Date(decoded.exp * 1000),
      };
    } catch (error) {
      logger.error(`Password reset token generation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Verify password reset token
   * @param {string} resetToken - Reset token
   * @returns {object} - { userId }
   */
  static verifyPasswordResetToken(resetToken) {
    try {
      const decoded = jwt.verify(resetToken, config.jwt.accessTokenSecret);

      if (decoded.type !== 'password-reset') {
        throw new Error('Invalid token type');
      }

      return { userId: decoded.userId };
    } catch (error) {
      logger.error(`Password reset token verification error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = AuthService;
