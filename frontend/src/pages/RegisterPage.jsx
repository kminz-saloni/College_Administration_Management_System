/**
 * Invitation Activation Page
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppDispatch } from '@/hooks/useRedux'
import { authService } from '@/services'
import { setAuth } from '@/store/slices/authSlice'
import { validate } from '@/utils/validation'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, Eye, EyeOff, BookOpen, CheckCircle2 } from 'lucide-react'

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activationData, setActivationData] = useState(null)
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateActivationForm = () => {
    const newErrors = {}
    const emailValidation = validate.email(formData.email)
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.feedback
    }

    const passwordValidation = validate.password(formData.password)
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.feedback
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects((prev) => (
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    ))
  }

  const handleActivationSubmit = async (e) => {
    e.preventDefault()
    if (!validateActivationForm()) {
      toast.error('Please fix the errors above')
      return
    }

    setIsLoading(true)
    try {
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })

      const activation = response?.data || response
      if (activation?.token || activation?.accessToken) {
        const token = activation.token || activation.accessToken
        const refreshToken = activation.refreshToken || null
        const user = activation.user || {
          id: activation.userId,
          email: activation.email,
          name: activation.name,
          role: activation.role,
          subjects: activation.subjects || [],
        }

        dispatch(setAuth({ user, token, refreshToken }))

        if (activation.needsSubjectSelection && Array.isArray(activation.eligibleSubjects)) {
          setActivationData(activation)
          setSelectedSubjects([])
          toast.success('Account activated. Select your enrolled subjects.')
          return
        }

        toast.success('Account activated successfully')
        navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
        return
      }

      throw new Error('Activation response missing token')
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Activation failed. Please try again.'
      setErrors({ submit: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentEnrollmentSubmit = async (e) => {
    e.preventDefault()

    if (selectedSubjects.length === 0) {
      toast.error('Select at least one subject')
      return
    }

    setIsLoading(true)
    try {
      await authService.saveStudentEnrollments(selectedSubjects)
      toast.success('Subjects saved successfully')
      navigate('/student/dashboard')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save subjects'
      setErrors({ submit: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary font-heading">
          {activationData ? 'Select your subjects' : 'Activate your account'}
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          {activationData
            ? 'Choose the subjects you were enrolled into by the administration.'
            : 'Use the official email shared by your administration team.'}
        </p>
      </div>

      {errors.submit && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-input">
          <p className="text-sm font-medium text-danger">{errors.submit}</p>
        </div>
      )}

      {!activationData ? (
        <form onSubmit={handleActivationSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="input-label">Official Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`${errors.email ? 'input-error' : 'input'} pl-10`}
                placeholder="you@college.edu"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            {errors.email && <p className="input-error-text">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="input-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className={`${errors.password ? 'input-error' : 'input'} pl-10 pr-10`}
                placeholder="Create a password"
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

          <div>
            <label htmlFor="confirmPassword" className="input-label">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`${errors.confirmPassword ? 'input-error' : 'input'} pl-10`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
            {errors.confirmPassword && <p className="input-error-text">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-2">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Activating...</>
            ) : (
              'Activate account'
            )}
          </button>

          <p className="text-center text-sm text-text-muted">
            Already activated?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleStudentEnrollmentSubmit} className="space-y-5">
          <div className="rounded-input border border-border-app bg-surface-2/60 p-4 text-sm text-text-muted flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span>Your account is active. Finish onboarding by selecting the subjects assigned to you.</span>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-text-primary">Available Subjects</h3>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto rounded-input border border-border-app p-4">
              {activationData.eligibleSubjects.map((subject) => (
                <label key={subject._id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject._id)}
                    onChange={() => handleSubjectToggle(subject._id)}
                    className="mt-1 h-4 w-4 rounded border-border-app accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{subject.name}</p>
                    <p className="text-xs text-text-muted">{subject.code}{subject.department ? ` • ${subject.department}` : ''}</p>
                  </div>
                </label>
              ))}
              {activationData.eligibleSubjects.length === 0 && (
                <p className="text-sm text-text-muted">No subjects are available for this account.</p>
              )}
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving subjects...</>
            ) : (
              'Save subjects and continue'
            )}
          </button>
        </form>
      )}
    </div>
  )
}

export default RegisterPage
