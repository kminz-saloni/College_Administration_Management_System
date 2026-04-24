/**
 * Login Page — Premium Dark Theme
 * Features:
 * - Clean form with proper labels
 * - Strong focus rings
 * - Validation states
 * - Loading state
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useRedux'
import { authService } from '@/services'
import { setAuth } from '@/store/slices/authSlice'
import { validate } from '@/utils/validation'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const emailValidation = validate.email(formData.email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.feedback
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
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
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      })

      const { token, refreshToken, user } = response.data
      dispatch(setAuth({ user, token, refreshToken }))

      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }

      toast.success('Login successful!')

      const dashboardRoute = {
        admin: '/admin/dashboard',
        teacher: '/teacher/dashboard',
        student: '/student/dashboard',
      }[user?.role] || '/student/dashboard'

      navigate(dashboardRoute)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.'
      setErrors({ submit: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary font-heading">Welcome back</h2>
        <p className="mt-2 text-sm text-text-muted">
          Sign in to your account to continue
        </p>
      </div>

      {errors.submit && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-input">
          <p className="text-sm font-medium text-danger">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="input-label">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`${errors.email ? 'input-error' : 'input'} pl-10`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          {errors.email && <p className="input-error-text">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="input-label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className={`${errors.password ? 'input-error' : 'input'} pl-10 pr-10`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="input-error-text">{errors.password}</p>}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              id="remember-me"
              name="rememberMe"
              type="checkbox"
              className="w-4 h-4 rounded border-border-app bg-surface-2 text-primary focus:ring-primary/40 focus:ring-2 checked:bg-primary"
              checked={formData.rememberMe}
              onChange={handleInputChange}
            />
            <span className="text-sm text-text-muted">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-hover transition-colors">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

        {/* Register Link */}
        <p className="text-center text-sm text-text-muted">
          Have an invitation?{' '}
          <Link to="/activate" className="font-medium text-primary hover:text-primary-hover transition-colors">
            Activate account
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
