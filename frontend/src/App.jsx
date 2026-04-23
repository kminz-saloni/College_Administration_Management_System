import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { setupInterceptors, refreshAccessToken } from '@/middleware/setupInterceptors'
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux'
import store from '@/store/store'
import { clearAuth } from '@/store/slices/authSlice'

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
import EventsListPage from '@/pages/EventsListPage'
import EventCalendarPage from '@/pages/EventCalendarPage'
import EventAnalyticsPage from '@/pages/EventAnalyticsPage'

// Utils
import { isTokenValid, shouldRefreshToken, clearAuthData } from '@/utils/tokenUtils'

function App() {
  const dispatch = useAppDispatch()
  const { token, refreshToken, isAuthenticated } = useAppSelector((state) => state.auth)

  useEffect(() => {
    setupInterceptors(store)

    const restoreSession = async () => {
      const authState = store.getState().auth
      const hasAccessToken = Boolean(authState.token)
      const hasRefreshToken = Boolean(authState.refreshToken)

      if (hasAccessToken && isTokenValid(authState.token)) {
        return
      }

      if (hasRefreshToken) {
        try {
          await refreshAccessToken()
          return
        } catch (error) {
          console.error('Session restore failed:', error)
        }
      }

      if (hasAccessToken || hasRefreshToken) {
        dispatch(clearAuth())
        clearAuthData()
      }
    }

    restoreSession()
  }, [dispatch])

  useEffect(() => {
    if (!isAuthenticated || !token || !refreshToken) {
      return undefined
    }

    const intervalId = window.setInterval(async () => {
      if (!token) {
        return
      }

      if (!shouldRefreshToken(token)) {
        return
      }

      try {
        await refreshAccessToken()
      } catch (error) {
        console.error('Automatic token refresh failed:', error)
        dispatch(clearAuth())
        clearAuthData()
      }
    }, 30 * 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [dispatch, isAuthenticated, refreshToken, token])

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
          <Route
            path="/admin/videos/library"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <VideoLibraryPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/videos/upload"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <VideoUploadPage />
              </RoleProtectedRoute>
            }
          />

          {/* Admin Event Routes */}
          <Route
            path="/admin/events/list"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <EventsListPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/events/calendar"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <EventCalendarPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/events/analytics"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <EventAnalyticsPage />
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

          {/* Teacher Event Routes */}
          <Route
            path="/teacher/events"
            element={
              <RoleProtectedRoute requiredRole="teacher">
                <EventsListPage />
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

          {/* Student Event Routes */}
          <Route
            path="/student/events"
            element={
              <RoleProtectedRoute requiredRole="student">
                <EventsListPage />
              </RoleProtectedRoute>
            }
          />
        </Route>

        {/* Unauthorized Access Page */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen bg-app px-4 py-8">
              <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
                <div className="card w-full text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-danger">Access denied</p>
                  <h1 className="mt-3 text-4xl font-semibold text-text-primary">403</h1>
                  <p className="mt-2 text-sm text-text-muted">
                    You do not have permission to access this resource.
                  </p>
                  <a href="/login" className="btn-primary mt-6 inline-flex">
                    Go to Login
                  </a>
                </div>
              </div>
            </div>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App

