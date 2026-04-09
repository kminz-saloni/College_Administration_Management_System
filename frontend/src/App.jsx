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
import { setupInterceptors } from '@/middleware/setupInterceptors'
import { useAppDispatch } from '@/hooks/useRedux'
import store from '@/store/store'
import { setAuth } from '@/store/slices/authSlice'
import config from '@/config/environment'

// Auth Pages
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'

// Layout
import AuthLayout from '@/layouts/AuthLayout'
import MainLayout from '@/layouts/MainLayout'

// Protected Route Components
import ProtectedRoute from '@/components/Common/ProtectedRoute'
import RoleProtectedRoute from '@/components/Common/RoleProtectedRoute'

// Dashboard Pages
import AdminDashboard from '@/pages/AdminDashboard'
import TeacherDashboard from '@/pages/TeacherDashboard'
import StudentDashboard from '@/pages/StudentDashboard'
import AnalyticsDashboardPage from '@/pages/AnalyticsDashboardPage'
import StudentPaymentsPage from '@/pages/StudentPaymentsPage'
import UsersManagementPage from '@/pages/UsersManagementPage'
import ClassesManagementPage from '@/pages/ClassesManagementPage'
import AttendancePage from '@/pages/AttendancePage'
import VideoLibraryPage from '@/pages/VideoLibraryPage'
import VideoUploadPage from '@/pages/VideoUploadPage'
import SettingsPage from '@/pages/SettingsPage'

// Utils
import { getStoredUser, isTokenValid } from '@/utils/tokenUtils'

function App() {
  const dispatch = useAppDispatch()

  /**
   * Initialize authentication on app mount
   * 1. Set up axios interceptors for JWT token handling
   * 2. Check for stored auth data and restore session
   */
  useEffect(() => {
    // Set up request/response interceptors
    setupInterceptors(store)

    // Verify token validity on load
    const token = store.getState().auth.token
    if (token && !isTokenValid(token)) {
      dispatch(logout())
    }
  }, [dispatch])

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
          {/* Dashboard Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <RoleProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/student/dashboard"
            element={
              <RoleProtectedRoute requiredRole="student">
                <StudentDashboard />
              </RoleProtectedRoute>
            }
          />

          {/* Admin Specific Routes */}
          <Route
            path="/admin/users"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <UsersManagementPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/classes"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <ClassesManagementPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <AnalyticsDashboardPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics/reports"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <AnalyticsDashboardPage view="reports" />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <SettingsPage />
              </RoleProtectedRoute>
            }
          />

          {/* Teacher Specific Routes */}
          <Route
            path="/teacher/classes"
            element={
              <RoleProtectedRoute requiredRole="teacher">
                <ClassesManagementPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/teacher/attendance"
            element={
              <RoleProtectedRoute requiredRole="teacher">
                <AttendancePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/teacher/videos/library"
            element={
              <RoleProtectedRoute requiredRole="teacher">
                <VideoLibraryPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/teacher/videos/upload"
            element={
              <RoleProtectedRoute requiredRole="teacher">
                <VideoUploadPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/teacher/analytics"
            element={
              <RoleProtectedRoute requiredRole="teacher">
                <AnalyticsDashboardPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/teacher/settings"
            element={
              <RoleProtectedRoute requiredRole="teacher">
                <SettingsPage />
              </RoleProtectedRoute>
            }
          />

          {/* Student Specific Routes */}
          <Route
            path="/student/classes"
            element={
              <RoleProtectedRoute requiredRole="student">
                <ClassesManagementPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/student/attendance"
            element={
              <RoleProtectedRoute requiredRole="student">
                <AttendancePage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/student/videos"
            element={
              <RoleProtectedRoute requiredRole="student">
                <VideoLibraryPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/student/payments"
            element={
              <RoleProtectedRoute requiredRole="student">
                <StudentPaymentsPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/student/settings"
            element={
              <RoleProtectedRoute requiredRole="student">
                <SettingsPage />
              </RoleProtectedRoute>
            }
          />
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

