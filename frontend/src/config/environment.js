/**
 * Environment Configuration
 * Centralized configuration for environment variables
 */

const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 5000,
  },

  // Authentication
  auth: {
    tokenKey: import.meta.env.VITE_JWT_TOKEN_KEY || 'auth_token',
    refreshTokenKey: import.meta.env.VITE_JWT_REFRESH_TOKEN_KEY || 'refresh_token',
  },

  // Payment Gateway
  payment: {
    razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID,
  },

  // Application
  app: {
    name: import.meta.env.VITE_APP_NAME || 'College Administration Management System',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_ENVIRONMENT || 'development',
    isDevelopment: import.meta.env.MODE === 'development',
    isProduction: import.meta.env.MODE === 'production',
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    videoStreaming: import.meta.env.VITE_ENABLE_VIDEO_STREAMING === 'true',
    payments: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
  },

  // Logging
  logging: {
    enabled: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
    level: import.meta.env.VITE_LOG_LEVEL || 'debug',
  },

  // Session
  session: {
    timeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 30,
    storageKey: import.meta.env.VITE_SESSION_STORAGE_KEY || 'session_data',
  },

  // Video Configuration
  video: {
    maxUploadSize: parseInt(import.meta.env.VITE_MAX_VIDEO_UPLOAD_SIZE) || 500,
    supportedFormats: (import.meta.env.VITE_SUPPORTED_VIDEO_FORMATS || 'mp4,webm,mov').split(','),
    qualityOptions: (import.meta.env.VITE_VIDEO_QUALITY_OPTIONS || '360p,480p,720p,1080p').split(','),
  },
}

export default config
