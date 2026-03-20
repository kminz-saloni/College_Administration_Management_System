/**
 * Logger Utility
 * Centralized logging with environment-based control
 */

import config from '@/config/environment'

const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
}

class Logger {
  constructor() {
    this.enabled = config.logging.enabled
    this.level = config.logging.level
  }

  #getTimestamp() {
    return new Date().toISOString()
  }

  #formatLog(level, message, data) {
    return {
      timestamp: this.#getTimestamp(),
      level,
      message,
      data,
    }
  }

  debug(message, data) {
    if (this.enabled && (this.level === LOG_LEVELS.DEBUG)) {
      const log = this.#formatLog(LOG_LEVELS.DEBUG, message, data)
      console.log('%c[DEBUG]', 'color: #0ea5e9', log.message, data || '')
    }
  }

  info(message, data) {
    if (this.enabled) {
      const log = this.#formatLog(LOG_LEVELS.INFO, message, data)
      console.log('%c[INFO]', 'color: #10b981', log.message, data || '')
    }
  }

  warn(message, data) {
    if (this.enabled) {
      const log = this.#formatLog(LOG_LEVELS.WARN, message, data)
      console.warn('%c[WARN]', 'color: #f59e0b', log.message, data || '')
    }
  }

  error(message, error) {
    const log = this.#formatLog(LOG_LEVELS.ERROR, message, error)
    console.error('%c[ERROR]', 'color: #ef4444', log.message, error || '')
  }
}

export default new Logger()
