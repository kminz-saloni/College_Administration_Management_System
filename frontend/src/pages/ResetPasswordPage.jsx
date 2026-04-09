/**
 * Reset Password Page
 * Reset password with token from email
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { authService } from '@/services'
import { validate } from '@/utils/validation'
import toast from 'react-hot-toast'

const ResetPasswordPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, strength: '' })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }

    // Check password strength as user types
    if (name === 'password' && value) {
      const passwordValidation = validate.password(value)
      setPasswordStrength({
        isValid: passwordValidation.isValid,
        strength: passwordValidation.strength,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validate password
    const passwordValidation = validate.password(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.feedback
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors above')
      return
    }

    setIsLoading(true)
    try {
      await authService.resetPassword(token, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })

      setSubmitted(true)
      toast.success('Password reset successful!')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed. Please try again.'
      setErrors({ submit: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength.strength) {
      case 'weak':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'strong':
        return 'bg-green-500'
      default:
        return 'bg-gray-300'
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Password reset successful</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your password has been successfully reset.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>
            <div className="mt-4">
              <a
                href="/login"
                className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new password
          </h2>
        </div>

        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{errors.submit}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">Password strength:</p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        passwordStrength.strength === 'weak'
                          ? 'text-red-700 bg-red-100'
                          : passwordStrength.strength === 'medium'
                            ? 'text-yellow-700 bg-yellow-100'
                            : 'text-green-700 bg-green-100'
                      }`}
                    >
                      {passwordStrength.strength || 'weak'}
                    </span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getPasswordStrengthColor()} transition-all`}
                      style={{
                        width:
                          passwordStrength.strength === 'weak'
                            ? '33%'
                            : passwordStrength.strength === 'medium'
                              ? '66%'
                              : '100%',
                      }}
                    ></div>
                  </div>
                </div>
              )}
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting password...' : 'Reset password'}
            </button>
          </div>

          <div className="text-center">
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Back to sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordPage
