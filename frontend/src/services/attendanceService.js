/**
 * Attendance Service
 * Handles all attendance-related API calls
 */

import api from './api'

const attendanceService = {
  /**
   * Mark attendance for a class
   * @param {Object} data - Attendance data (classId, date, attendanceRecords)
   */
  markAttendance: async (data) => {
    try {
      const response = await api.post('/attendance/mark', data)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark attendance' }
    }
  },

  /**
   * Get attendance for a class
   * @param {string} classId - Class ID
   * @param {Object} params - Query parameters (date, startDate, endDate, studentId)
   */
  getClassAttendance: async (classId, params = {}) => {
    try {
      const response = await api.get(`/attendance/class/${classId}`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch class attendance' }
    }
  },

  /**
   * Get attendance for a student
   * @param {string} studentId - Student ID
   * @param {Object} params - Query parameters (classId, startDate, endDate)
   */
  getStudentAttendance: async (studentId, params = {}) => {
    try {
      const response = await api.get(`/attendance/student/${studentId}`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch student attendance' }
    }
  },

  /**
   * Get attendance report for a class
   * @param {string} classId - Class ID
   * @param {Object} params - Query parameters (startDate, endDate)
   */
  getClassReport: async (classId, params = {}) => {
    try {
      const response = await api.get(`/attendance/reports/class/${classId}`, { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance report' }
    }
  },

  /**
   * Get attendance summary for dashboard
   */
  getSummary: async (params = {}) => {
    try {
      const response = await api.get('/attendance/dashboard/summary', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendance summary' }
    }
  },
}

export default attendanceService
