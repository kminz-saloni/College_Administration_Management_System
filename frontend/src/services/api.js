/**
 * Base API Service
 * Configures axios with base URL, timeout, and headers
 * This is the foundation for all API calls
 */

import axios from 'axios'
import config from '@/config/environment'

/**
 * Create a base axios instance
 * All requests will use this instance with base configuration
 */
const api = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Send cookies with requests (for httpOnly cookies)
})

export default api
