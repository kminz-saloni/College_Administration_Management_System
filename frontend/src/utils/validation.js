/**
 * Form Validation Utilities
 * Provides validation functions for common form fields
 */

/**
 * Email validation using RFC 5322 standard regex
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const validateEmail = (email) => {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password strength validation
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, feedback: string }
 */
export const validatePassword = (password) => {
  const feedback = []

  if (!password) {
    return {
      isValid: false,
      feedback: 'Password is required',
      strength: 'none',
    }
  }

  if (password.length < 8) {
    feedback.push('At least 8 characters')
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('At least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('At least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    feedback.push('At least one number')
  }

  if (!/[!@#$%^&*()]/.test(password)) {
    feedback.push('At least one special character (!@#$%^&*())')
  }

  const strength =
    feedback.length === 0 ? 'strong' : feedback.length <= 2 ? 'medium' : 'weak'

  return {
    isValid: feedback.length === 0,
    feedback: feedback.length > 0 ? feedback : ['Password is strong'],
    strength,
  }
}

/**
 * Username validation
 * Requirements:
 * - 3-20 characters
 * - Alphanumeric and underscores only
 * - Cannot start with a number
 * @param {string} username - Username to validate
 * @returns {object} - { isValid: boolean, feedback: string }
 */
export const validateUsername = (username) => {
  const feedback = []

  if (!username) {
    return {
      isValid: false,
      feedback: 'Username is required',
    }
  }

  if (username.length < 3) {
    feedback.push('At least 3 characters')
  }

  if (username.length > 20) {
    feedback.push('Maximum 20 characters')
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(username)) {
    feedback.push('Alphanumeric and underscores only, cannot start with number')
  }

  return {
    isValid: feedback.length === 0,
    feedback: feedback.length > 0 ? feedback : ['Username is valid'],
  }
}

/**
 * Full name validation
 * @param {string} fullName - Full name to validate
 * @returns {object} - { isValid: boolean, feedback: string }
 */
export const validateFullName = (fullName) => {
  if (!fullName) {
    return {
      isValid: false,
      feedback: 'Full name is required',
    }
  }

  if (fullName.trim().length < 2) {
    return {
      isValid: false,
      feedback: 'Full name must be at least 2 characters',
    }
  }

  if (fullName.trim().length > 100) {
    return {
      isValid: false,
      feedback: 'Full name must not exceed 100 characters',
    }
  }

  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(fullName)) {
    return {
      isValid: false,
      feedback: 'Full name can only contain letters, spaces, hyphens, and apostrophes',
    }
  }

  return {
    isValid: true,
    feedback: 'Full name is valid',
  }
}

/**
 * Phone number validation
 * Accepts formats: +1-123-456-7890, 123-456-7890, 1234567890, etc.
 * @param {string} phone - Phone number to validate
 * @returns {object} - { isValid: boolean, feedback: string }
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) {
    return {
      isValid: false,
      feedback: 'Phone number is required',
    }
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')

  if (digitsOnly.length < 10) {
    return {
      isValid: false,
      feedback: 'Phone number must be at least 10 digits',
    }
  }

  if (digitsOnly.length > 15) {
    return {
      isValid: false,
      feedback: 'Phone number is too long',
    }
  }

  return {
    isValid: true,
    feedback: 'Phone number is valid',
  }
}

/**
 * URL validation
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export const validateUrl = (url) => {
  if (!url) return false

  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Date validation
 * @param {string} dateString - Date string to validate (YYYY-MM-DD format)
 * @returns {object} - { isValid: boolean, feedback: string }
 */
export const validateDate = (dateString) => {
  if (!dateString) {
    return {
      isValid: false,
      feedback: 'Date is required',
    }
  }

  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      feedback: 'Invalid date format',
    }
  }

  return {
    isValid: true,
    feedback: 'Date is valid',
  }
}

/**
 * Age validation (minimum age check)
 * @param {string} birthDate - Birth date (YYYY-MM-DD format)
 * @param {number} minimumAge - Minimum required age (default: 18)
 * @returns {object} - { isValid: boolean, feedback: string, age: number }
 */
export const validateAge = (birthDate, minimumAge = 18) => {
  if (!birthDate) {
    return {
      isValid: false,
      feedback: 'Birth date is required',
      age: 0,
    }
  }

  const birth = new Date(birthDate)

  if (isNaN(birth.getTime())) {
    return {
      isValid: false,
      feedback: 'Invalid date format',
      age: 0,
    }
  }

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  if (age < minimumAge) {
    return {
      isValid: false,
      feedback: `Must be at least ${minimumAge} years old`,
      age,
    }
  }

  return {
    isValid: true,
    feedback: `Age is valid (${age} years old)`,
    age,
  }
}

/**
 * Form field validation (general)
 * @param {string} value - Value to validate
 * @param {string} type - Type of validation (email, password, username, etc.)
 * @param {object} options - Additional options
 * @returns {object} - { isValid: boolean, feedback: string }
 */
export const validateField = (value, type = 'text', options = {}) => {
  switch (type) {
    case 'email':
      return {
        isValid: validateEmail(value),
        feedback: validateEmail(value) ? 'Valid email' : 'Invalid email format',
      }
    case 'password':
      return validatePassword(value)
    case 'username':
      return validateUsername(value)
    case 'fullName':
    case 'name':
      return validateFullName(value)
    case 'phone':
      return validatePhoneNumber(value)
    case 'url':
      return {
        isValid: validateUrl(value),
        feedback: validateUrl(value) ? 'Valid URL' : 'Invalid URL',
      }
    case 'date':
      return validateDate(value)
    case 'age':
      return validateAge(value, options.minimumAge || 18)
    case 'required':
      return {
        isValid: Boolean(value && value.trim()),
        feedback: value && value.trim() ? 'Valid' : 'This field is required',
      }
    default:
      return {
        isValid: Boolean(value),
        feedback: value ? 'Valid' : 'Value is required',
      }
  }
}

/**
 * Validate entire form object
 * @param {object} formData - Form data object
 * @param {object} rules - Validation rules { fieldName: 'type' }
 * @returns {object} - { isValid: boolean, errors: { fieldName: string } }
 */
export const validateForm = (formData, rules) => {
  const errors = {}
  let isValid = true

  Object.keys(rules).forEach((fieldName) => {
    const value = formData[fieldName]
    const rule = rules[fieldName]

    if (typeof rule === 'string') {
      const result = validateField(value, rule)
      if (!result.isValid) {
        errors[fieldName] = Array.isArray(result.feedback)
          ? result.feedback.join(', ')
          : result.feedback
        isValid = false
      }
    } else if (typeof rule === 'function') {
      const result = rule(value)
      if (result !== true) {
        errors[fieldName] = result
        isValid = false
      }
    }
  })

  return {
    isValid,
    errors,
  }
}

export default {
  validateEmail,
  validatePassword,
  validateUsername,
  validateFullName,
  validatePhoneNumber,
  validateUrl,
  validateDate,
  validateAge,
  validateField,
  validateForm,
}
