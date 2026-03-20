/**
 * App Component
 * Main application component with routing configuration
 * Sets up route hierarchy:
 * - Public routes: /login, /register, /forgot-password, /reset-password/:token
 * - Protected routes: /admin/*, /teacher/*, /student/*
 * - MainLayout wraps all authenticated pages
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
import MainLayout from '@/layouts/MainLayout'

// Dashboard Pages
import AdminDashboard from '@/pages/AdminDashboard'
import TeacherDashboard from '@/pages/TeacherDashboard'
import StudentDashboard from '@/pages/StudentDashboard'

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

        {/* Protected Routes with MainLayout */}
        <Route element={<MainLayout />}>
          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />

          {/* Teacher Dashboard */}
          <Route
            path="/teacher/dashboard"
            element={
              <RoleProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
              </RoleProtectedRoute>
            }
          />

          {/* Student Dashboard */}
          <Route
            path="/student/dashboard"
            element={
              <RoleProtectedRoute requiredRole="student">
                <StudentDashboard />
              </RoleProtectedRoute>
            }
          />

          {/* Additional authenticated routes can be added here */}
          {/* Example: Users, Classes, Videos, Attendance, Payments, etc. */}
        </Route>

        {/* Unauthorized Access Page */}
        <Route
          path="/unauthorized"
          element={
            <AuthLayout>
              <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900">403</h1>
                  <p className="mt-2 text-lg text-gray-600">
                    You don't have permission to access this resource
                  </p>
                  <a
                    href="/login"
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Go to Login
                  </a>
                </div>
              </div>
            </AuthLayout>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App

