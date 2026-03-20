/**
 * Token Utility Functions
 * Helpers for token management and validation
 */

import { jwtDecode } from 'jwt-decode'
import config from '@/config/environment'

/**
 * Check if token is valid and not expired
 * @param {string} token - JWT token to validate
 * @returns {boolean} - True if valid and not expired
 */
export const isTokenValid = (token) => {
  if (!token) return false

  try {
    const decoded = jwtDecode(token)
    const currentTime = Date.now() / 1000

    // Check if token is expired (add 1 minute buffer)
    return decoded.exp > currentTime + 60
  } catch (error) {
    console.error('Invalid token:', error)
    return false
  }
}

/**
 * Get expiration time of token
 * @param {string} token - JWT token
 * @returns {number} - Unix timestamp of expiration time
 */
export const getTokenExpirationTime = (token) => {
  if (!token) return null

  try {
    const decoded = jwtDecode(token)
    return decoded.exp * 1000 // Convert to milliseconds
  } catch (error) {
    console.error('Failed to get token expiration:', error)
    return null
  }
}

/**
 * Get time until token expires
 * @param {string} token - JWT token
 * @returns {number} - Milliseconds until expiration
 */
export const getTimeUntilTokenExpiry = (token) => {
  const expirationTime = getTokenExpirationTime(token)
  if (!expirationTime) return null

  return expirationTime - Date.now()
}

/**
 * Decode JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
export const decodeToken = (token) => {
  if (!token) return null

  try {
    return jwtDecode(token)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

/**
 * Extract user role from token
 * @param {string} token - JWT token
 * @returns {string} - User role (admin, teacher, student)
 */
export const getUserRoleFromToken = (token) => {
  const decoded = decodeToken(token)
  return decoded?.role || null
}

/**
 * Extract user ID from token
 * @param {string} token - JWT token
 * @returns {string} - User ID
 */
export const getUserIdFromToken = (token) => {
  const decoded = decodeToken(token)
  return decoded?.sub || decoded?.userId || null
}

/**
 * Check if token should be refreshed soon
 * Refreshes if expiring within 5 minutes
 * @param {string} token - JWT token
 * @returns {boolean} - True if token should be refreshed
 */
export const shouldRefreshToken = (token) => {
  const timeUntilExpiry = getTimeUntilTokenExpiry(token)
  if (!timeUntilExpiry) return true

  // Refresh if less than 5 minutes remaining
  return timeUntilExpiry < 5 * 60 * 1000
}

/**
 * Store authentication data
 * @param {object} authData - Contains token, refreshToken, user data
 */
export const storeAuthData = (authData) => {
  try {
    const { token, refreshToken, user } = authData

    if (token) {
      localStorage.setItem(config.auth.tokenKey, token)
    }

    if (refreshToken) {
      localStorage.setItem(config.auth.refreshTokenKey, refreshToken)
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  } catch (error) {
    console.error('Failed to store auth data:', error)
  }
}

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem(config.auth.tokenKey)
    localStorage.removeItem(config.auth.refreshTokenKey)
    localStorage.removeItem('user')
  } catch (error) {
    console.error('Failed to clear auth data:', error)
  }
}

/**
 * Get stored user data
 * @returns {object} - User data or null
 */
export const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Failed to get stored user:', error)
    return null
  }
}

/**
 * Update stored user data
 * @param {object} userData - User data to update
 */
export const updateStoredUser = (userData) => {
  try {
    const currentUser = getStoredUser() || {}
    const updatedUser = { ...currentUser, ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
  } catch (error) {
    console.error('Failed to update stored user:', error)
  }
}

export default {
  isTokenValid,
  getTokenExpirationTime,
  getTimeUntilTokenExpiry,
  decodeToken,
  getUserRoleFromToken,
  getUserIdFromToken,
  shouldRefreshToken,
  storeAuthData,
  clearAuthData,
  getStoredUser,
  updateStoredUser,
}
