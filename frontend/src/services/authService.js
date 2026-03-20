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
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' }
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
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' }
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
      const response = await api.post(`/auth/reset-password/${token}`, data)
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
}

export default authService
