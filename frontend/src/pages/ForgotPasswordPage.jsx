/**
 * Forgot Password Page
 * Request password reset to email
 */

import { useState } from 'react'
import { authService } from '@/services'
import { validate } from '@/utils/validation'
import toast from 'react-hot-toast'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate email
    const emailValidation = validate.email(email)
    if (!emailValidation.isValid) {
      setError(emailValidation.feedback)
      toast.error(emailValidation.feedback)
      return
    }

    setIsLoading(true)
    try {
      await authService.forgotPassword(email)
      setSubmitted(true)
      toast.success('Reset link sent to your email!')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset link. Please try again.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-4 text-sm text-gray-600">
              If you don't see the email, check your spam folder or{' '}
              <button
                onClick={() => {
                  setSubmitted(false)
                  setEmail('')
                }}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                try again
              </button>
            </p>
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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                error ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
              }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
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

export default ForgotPasswordPage
