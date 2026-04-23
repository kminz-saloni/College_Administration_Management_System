/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Required endpoints per SRS: register, login, logout, refresh-token, forgot-password, reset-password, verify
 */

import api from './api'

const authService = {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User full name
   * @param {string} role - User role (admin, teacher, student)
   */
  register: async (data) => {
    try {
      const response = await api.post('/auth/register', data)
      // Response structure: { success, message, data: {...} }
      return {
        data: response.data.data,
      }
    } catch (error) {
      // Re-throw axios error properly so components can access error.response.data
      throw error
    }
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      // Response structure: { success, message, data: { accessToken, refreshToken, user } }
      const { accessToken, refreshToken, user } = response.data.data
      return {
        data: {
          token: accessToken, // Map accessToken to token
          refreshToken,
          user: {
            id: user._id, // Map MongoDB _id to id
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
          },
        },
      }
    } catch (error) {
      // Re-throw axios error properly so components can access error.response.data
      throw error
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const response = await api.post('/auth/logout')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Logout failed' }
    }
  },

  /**
   * Refresh JWT token
   * Called when access token expires
   */
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh-token')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Token refresh failed' }
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Forgot password request failed' }
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token from email
   * @param {string} password - New password
   * @param {string} confirmPassword - Password confirmation
   */
  resetPassword: async (token, data) => {
    try {
      const response = await api.post('/auth/reset-password', { token, ...data })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed' }
    }
  },

  /**
   * Verify email or get current user
   */
  verify: async () => {
    try {
      const response = await api.get('/auth/verify')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Verification failed' }
    }
  },

  /**
   * Verify email with token (for email confirmation)
   * @param {string} token - Email verification token
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.post(`/auth/verify-email/${token}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Email verification failed' }
    }
  },

  /**
   * Resend verification email
   * @param {string} email - User email
   */
  resendVerificationEmail: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Resend verification email failed' }
    }
  },

  /**
   * Change password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  changePassword: async (data) => {
    try {
      const response = await api.post('/auth/change-password', data)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Change password failed' }
    }
  },

  /**
   * Get all subjects for teacher signup
   */
  getSubjects: async () => {
    try {
      const response = await api.get('/subjects')
      return {
        data: response.data.data,
      }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch subjects' }
    }
  },
}

export default authService
