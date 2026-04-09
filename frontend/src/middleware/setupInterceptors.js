/**
 * API Interceptors Setup
 * Configures axios interceptors for authentication, token refresh, and error handling
 * Per SRS 4.1: JWT tokens stored in httpOnly cookies for security
 */

import api from '@/services/api'
import { setAuth, clearAuth, updateToken } from '@/store/slices/authSlice'
import { showToast } from '@/store/slices/notificationSlice'
import config from '@/config/environment'

let store = null

/**
 * Initialize interceptors with Redux store reference
 * This is called from main.jsx after store is created
 */
export const setupInterceptors = (reduxStore) => {
  store = reduxStore

  /**
   * Request Interceptor
   * Adds JWT token to outgoing requests
   */
  api.interceptors.request.use(
    (config) => {
      const token = getTokenFromStorage()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  /**
   * Response Interceptor
   * Handles token refresh on 401, error responses, etc.
   */
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // Handle 401 Unauthorized - Token might be expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          // Attempt to refresh token
          const refreshResponse = await refreshAccessToken()

          if (refreshResponse) {
            // Retry original request with new token
            const newToken = refreshResponse.token || refreshResponse.accessToken
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return api(originalRequest)
          }
        } catch (refreshError) {
          // Token refresh failed - redirect to login
          if (store) {
            store.dispatch(clearAuth())
            store.dispatch(
              showToast({
                type: 'error',
                message: 'Session expired. Please login again.',
                duration: 5000,
              })
            )
          }

          // Redirect to login
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }

      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        if (store) {
          store.dispatch(
            showToast({
              type: 'error',
              message: 'You do not have permission to perform this action.',
              duration: 5000,
            })
          )
        }
      }

      // Handle 404 Not Found
      if (error.response?.status === 404) {
        // Don't show toast for 404s as they're often expected
      }

      // Handle 500 Server Error
      if (error.response?.status >= 500) {
        if (store) {
          store.dispatch(
            showToast({
              type: 'error',
              message: 'Server error. Please try again later.',
              duration: 5000,
            })
          )
        }
      }

      return Promise.reject(error)
    }
  )
}

/**
 * Get token from storage
 * First checks httpOnly cookies (set by backend)
 * Falls back to Redux state
 */
const getTokenFromStorage = () => {
  if (store) {
    const state = store.getState()
    if (state.auth?.token) return state.auth.token
  }
  
  // Fallback to localStorage
  return getStoredToken()
}

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async () => {
  try {
    // Get stored refresh token from Redux state
    const state = store ? store.getState() : null
    const storedRefreshToken = state?.auth?.refreshToken

    if (!storedRefreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await api.post('/auth/refresh-token', {
      refreshToken: storedRefreshToken,
    })

    if (response.data?.data?.accessToken || response.data?.accessToken) {
      const newToken = response.data?.data?.accessToken || response.data?.accessToken
      const newRefreshToken = response.data?.data?.refreshToken || response.data?.refreshToken

      // Update token in Redux store
      if (store) {
        store.dispatch(updateToken(newToken))

        if (newRefreshToken) {
          const currentState = store.getState()
          store.dispatch(
            setAuth({
              user: currentState.auth.user,
              token: newToken,
              refreshToken: newRefreshToken,
            })
          )
        }
      }

      return { token: newToken, refreshToken: newRefreshToken }
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
    throw error
  }
}

/**
 * Store token in localStorage as backup
 * Note: Tokens should ideally be stored in httpOnly cookies via backend
 */
export const storeToken = (token, refreshToken = null) => {
  try {
    localStorage.setItem(config.auth.tokenKey, token)
    if (refreshToken) {
      localStorage.setItem(config.auth.refreshTokenKey, refreshToken)
    }
  } catch (error) {
    console.error('Failed to store token:', error)
  }
}

/**
 * Clear tokens from storage
 */
export const clearTokens = () => {
  try {
    localStorage.removeItem(config.auth.tokenKey)
    localStorage.removeItem(config.auth.refreshTokenKey)
  } catch (error) {
    console.error('Failed to clear tokens:', error)
  }
}

/**
 * Retrieve token from localStorage
 */
export const getStoredToken = () => {
  try {
    return localStorage.getItem(config.auth.tokenKey)
  } catch (error) {
    console.error('Failed to retrieve token:', error)
    return null
  }
}

/**
 * Retrieve refresh token from localStorage
 */
export const getStoredRefreshToken = () => {
  try {
    return localStorage.getItem(config.auth.refreshTokenKey)
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error)
    return null
  }
}

export default api
