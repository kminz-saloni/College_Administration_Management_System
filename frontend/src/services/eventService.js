/**
 * Event Service
 * Handles all event-related API calls
 */

import api from './api'

const eventService = {
  /**
   * Fetch all events with optional filters
   * @param {Object} params - Query parameters (dateRange, eventType, search, etc.)
   */
  fetchEvents: async (params = {}) => {
    try {
      const response = await api.get('/api/events', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch events' }
    }
  },

  /**
   * Fetch single event by ID
   * @param {string} eventId - Event ID
   */
  fetchEventById: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch event' }
    }
  },

  /**
   * Create a new event
   * @param {Object} eventData - Event data (name, description, date, time, location, image, etc.)
   */
  createEvent: async (eventData) => {
    try {
      const formData = new FormData()
      Object.keys(eventData).forEach((key) => {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key])
        }
      })
      const response = await api.post('/api/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create event' }
    }
  },

  /**
   * Update an event
   * @param {string} eventId - Event ID
   * @param {Object} eventData - Event data to update
   */
  updateEvent: async (eventId, eventData) => {
    try {
      const formData = new FormData()
      Object.keys(eventData).forEach((key) => {
        if (eventData[key] !== null && eventData[key] !== undefined) {
          formData.append(key, eventData[key])
        }
      })
      const response = await api.put(`/api/events/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update event' }
    }
  },

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   */
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/api/events/${eventId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete event' }
    }
  },

  /**
   * RSVP to an event
   * @param {string} eventId - Event ID
   * @param {string} status - RSVP status (yes, no, maybe)
   */
  rsvpEvent: async (eventId, status) => {
    try {
      const response = await api.post(`/api/events/${eventId}/rsvp`, { status })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to RSVP to event' }
    }
  },

  /**
   * Fetch event attendees
   * @param {string} eventId - Event ID
   */
  fetchEventAttendees: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}/attendees`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch attendees' }
    }
  },

  /**
   * Fetch upcoming events
   * @param {number} limit - Number of events to fetch
   */
  fetchUpcomingEvents: async (limit = 10) => {
    try {
      const response = await api.get('/api/events', { params: { upcoming: true, limit } })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch upcoming events' }
    }
  },

  /**
   * Fetch events by type
   * @param {string} eventType - Event type
   */
  fetchEventsByType: async (eventType) => {
    try {
      const response = await api.get('/api/events', { params: { type: eventType } })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch events by type' }
    }
  },

  /**
   * Search events
   * @param {string} searchTerm - Search term
   */
  searchEvents: async (searchTerm) => {
    try {
      const response = await api.get('/api/events', { params: { search: searchTerm } })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search events' }
    }
  },

  // ===== PHASE 5: ANALYTICS & ADVANCED FEATURES =====

  /**
   * Fetch event analytics data
   * @param {Object} params - Query parameters (dateRange, eventType, etc.)
   */
  fetchEventAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/api/events/analytics', { params })
      return response.data
    } catch (error) {
      return { data: [] }
    }
  },

  /**
   * Fetch attendance statistics for a specific event
   * @param {string} eventId - Event ID
   */
  fetchEventAttendanceStats: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}/attendance-stats`)
      return response.data
    } catch (error) {
      return { data: { attendeeCount: 0, checkedInCount: 0, attendanceRate: 0 } }
    }
  },

  /**
   * Check in an attendee for an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   */
  checkInAttendee: async (eventId, userId) => {
    try {
      const response = await api.post(`/api/events/${eventId}/check-in`, { userId })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to check in attendee' }
    }
  },

  /**
   * Reschedule an event
   * @param {string} eventId - Event ID
   * @param {Object} eventData - New date, time, and reason
   */
  rescheduleEvent: async (eventId, eventData) => {
    try {
      const response = await api.put(`/api/events/${eventId}/reschedule`, eventData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reschedule event' }
    }
  },

  /**
   * Cancel an event
   * @param {string} eventId - Event ID
   * @param {string} reason - Cancellation reason
   */
  cancelEvent: async (eventId, reason = '') => {
    try {
      const response = await api.post(`/api/events/${eventId}/cancel`, { reason })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel event' }
    }
  },

  /**
   * Send event invitations to multiple users
   * @param {string} eventId - Event ID
   * @param {Array<string>} userIds - Array of user IDs
   */
  sendEventInvitations: async (eventId, userIds) => {
    try {
      const response = await api.post(`/api/events/${eventId}/invite`, { userIds })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send invitations' }
    }
  },

  /**
   * Fetch calendar data for events
   * @param {Object} params - Query parameters (month, year, etc.)
   */
  fetchEventCalendarData: async (params = {}) => {
    try {
      const response = await api.get('/api/events/calendar', { params })
      return response.data
    } catch (error) {
      return { data: [] }
    }
  },

  /**
   * Fetch popular events
   * @param {number} limit - Number of events to fetch
   */
  fetchPopularEvents: async (limit = 5) => {
    try {
      const response = await api.get('/api/events/popular', { params: { limit } })
      return response.data
    } catch (error) {
      return { data: [] }
    }
  },
}

export default eventService
