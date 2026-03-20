/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

import api from './api'

const dashboardService = {
  /**
   * Fetch dashboard statistics
   */
  fetchStats: async () => {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard stats' }
    }
  },

  /**
   * Fetch users with optional filters
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
   * Fetch classes
   */
  fetchClasses: async () => {
    try {
      const response = await api.get('/dashboard/classes')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch classes' }
    }
  },

  /**
   * Fetch reports with optional filters
   * @param {Object} params - Query parameters (type, dateRange, etc.)
   */
  fetchReports: async (params = {}) => {
    try {
      const response = await api.get('/dashboard/reports', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch reports' }
    }
  },

  /**
   * Fetch notifications
   */
  fetchNotifications: async () => {
    try {
      const response = await api.get('/notifications')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch notifications' }
    }
  },

  /**
   * Mark notification as read
   * @param {string} notificationId - ID of notification to mark as read
   */
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await api.post('/notifications/mark-read', { notificationId })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark notification as read' }
    }
  },

  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user profile' }
    }
  },

  /**
   * Update user profile
   * @param {Object} data - Profile data to update
   */
  updateProfile: async (data) => {
    try {
      const response = await api.put('/users/profile', data)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' }
    }
  },
}

export default dashboardService
