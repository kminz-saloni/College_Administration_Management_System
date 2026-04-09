/**
 * Video Service
 * Handles all video-related API calls
 */

import api from './api'

const videoService = {
  /**
   * Fetch all videos with optional filters
   * @param {Object} params - Query parameters (subject, class, search, etc.)
   */
  fetchVideos: async (params = {}) => {
    try {
      const response = await api.get('/videos', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch videos' }
    }
  },

  /**
   * Fetch single video by ID
   * @param {string} videoId - Video ID
   */
  fetchVideoById: async (videoId) => {
    try {
      const response = await api.get(`/videos/${videoId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch video' }
    }
  },

  /**
   * Upload a new video
   * @param {FormData} formData - Form data containing video file and metadata
   * @param {Function} onProgress - Progress callback function
   */
  uploadVideo: async (formData, onProgress = null) => {
    try {
      const response = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            onProgress(percentCompleted)
          }
        },
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload video' }
    }
  },

  /**
   * Update video metadata
   * @param {string} videoId - Video ID
   * @param {Object} data - Data to update (title, description, subject, class, etc.)
   */
  updateVideo: async (videoId, data) => {
    try {
      const response = await api.put(`/videos/${videoId}`, data)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update video' }
    }
  },

  /**
   * Delete a video
   * @param {string} videoId - Video ID
   */
  deleteVideo: async (videoId) => {
    try {
      const response = await api.delete(`/videos/${videoId}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete video' }
    }
  },

  /**
   * Get video stream URL
   * @param {string} videoId - Video ID
   */
  getVideoStream: async (videoId) => {
    try {
      const response = await api.get(`/videos/${videoId}/stream`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get video stream' }
    }
  },

  /**
   * Update watch progress for a video
   * @param {string} videoId - Video ID
   * @param {number} watchedDuration - Duration watched in seconds
   */
  updateWatchProgress: async (videoId, watchedDuration) => {
    try {
      const response = await api.post(`/videos/${videoId}/progress`, {
        watchedDuration,
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update watch progress' }
    }
  },

  /**
   * Fetch videos by subject
   * @param {string} subject - Subject name
   */
  fetchVideosBySubject: async (subject) => {
    try {
      const response = await api.get('/videos', { params: { subject } })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch videos by subject' }
    }
  },

  /**
   * Fetch videos by class
   * @param {string} classId - Class ID
   */
  fetchVideosByClass: async (classId) => {
    try {
      const response = await api.get('/videos', { params: { class: classId } })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch videos by class' }
    }
  },
}

export default videoService
