/**
 * App Component
 * Main application component with routing configuration
 * Sets up route hierarchy:
 * - Public routes: /login, /register, /forgot-password, /reset-password/:token
 * - Protected routes: /admin/*, /teacher/*, /student/*
 */

import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { setupInterceptors } from '@/middleware/setupInterceptors'
import { useAppDispatch } from '@/hooks/useRedux'
import store from '@/store/store'

// Auth Pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'

// Layout
import AuthLayout from '@/layouts/AuthLayout'

// TODO: Import dashboard pages when created
// import AdminDashboard from '@/pages/AdminDashboard'
// import TeacherDashboard from '@/pages/TeacherDashboard'
// import StudentDashboard from '@/pages/StudentDashboard'

/**
 * Protected Route Component
 * Requires authentication to access
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * Role-Based Protected Route
 * Requires authentication and specific role
 */
const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

function App() {
  const dispatch = useAppDispatch()

  /**
   * Initialize interceptors on component mount
   * This sets up axios interceptors for JWT token handling
   */
  useEffect(() => {
    setupInterceptors(store)
  }, [])

  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin/*" element={<RoleProtectedRoute requiredRole="admin">{/* TODO */}</RoleProtectedRoute>} />

        {/* Protected Teacher Routes */}
        <Route path="/teacher/*" element={<RoleProtectedRoute requiredRole="teacher">{/* TODO */}</RoleProtectedRoute>} />

        {/* Protected Student Routes */}
        <Route path="/student/*" element={<RoleProtectedRoute requiredRole="student">{/* TODO */}</RoleProtectedRoute>} />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App

