import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats, fetchClasses } from '../store/slices/dashboardSlice'

const StudentDashboard = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.dashboard)

  useEffect(() => {
    // Fetch student-specific dashboard data
    dispatch(fetchDashboardStats())
    dispatch(fetchClasses())
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to your Student Dashboard
          </h2>
          <p className="text-gray-600">
            View your classes, attendance, videos, and payment status all in one place.
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Classes Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Enrolled Classes</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </div>

          {/* Attendance Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">92%</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>

          {/* Pending Fees Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Fees</p>
                <p className="text-2xl font-bold text-gray-900">₹5,000</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>

          {/* Videos Watched Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Videos Watched</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <div className="text-3xl">🎥</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">🎥</div>
              <p className="font-medium text-gray-900">Watch Videos</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">💳</div>
              <p className="font-medium text-gray-900">Pay Fees</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="text-2xl mb-2">📋</div>
              <p className="font-medium text-gray-900">View Attendance</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
