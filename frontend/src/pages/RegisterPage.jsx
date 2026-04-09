/**
 * Register Page
 * User registration page with form validation
 * Integrates with Redux auth store and API service
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useRedux'
import { authService } from '@/services'
import { setAuth } from '@/store/slices/authSlice'
import { validate } from '@/utils/validation'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, strength: '' })
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

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

    // Validate name
    const nameValidation = validate.fullName(formData.name)
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.feedback
    }

    // Validate email
    const emailValidation = validate.email(formData.email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.feedback
    }

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
      await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      })

      toast.success('Registration successful! Redirecting to login...')
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.'
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

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
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
