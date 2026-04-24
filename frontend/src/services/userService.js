/**
 * User Service
 * Handles all user-related API calls for admin management
 */

import api from './api'

const userService = {
  /**
   * Create a new invited user profile (admin only)
   * @param {Object} userData - User data (name, email, role, phone, profile fields)
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/users/admin/invite', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create user' }
    }
  },

  /**
   * Update user by ID (Admin only)
   * @param {string} userId - User ID
   * @param {Object} userData - User data to update
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/admin/${userId}`, userData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update user' }
    }
  },

  /**
   * Delete user by ID (Admin only)
   * @param {string} userId - User ID
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/admin/${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete user' }
    }
  },

  /**
   * Fetch all users with pagination and filters
   * @param {Object} params - Query parameters (page, limit, role, search, etc.)
   */
  fetchUsers: async (params = {}) => {
    try {
      const response = await api.get('/dashboard/users', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch users' }
    }
  },

  /**
   * Get user by ID
   * @param {string} userId - User ID
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user' }
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' }
    }
  },

  /**
   * Update current user profile
   * @param {Object} profileData - Profile data to update
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' }
    }
  },
}

export default userService
