import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats, fetchClasses } from '../store/slices/dashboardSlice'
import ClassInformationCards from '../components/Dashboard/ClassInformationCards'
import AttendanceSummary from '../components/Dashboard/AttendanceSummary'
import QuickActions from '../components/Dashboard/QuickActions'
import AvailableVideoContentWidget from '../components/Dashboard/AvailableVideoContentWidget'
import StudentListWithStatus from '../components/Dashboard/StudentListWithStatus'

const TeacherDashboard = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.dashboard)

  useEffect(() => {
    // Fetch teacher-specific dashboard data
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Teacher Dashboard</h1>

        {/* Class Information Cards */}
        <ClassInformationCards />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Attendance Summary */}
          <AttendanceSummary />

          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Available Video Content Widget */}
        <AvailableVideoContentWidget />

        {/* Student List with Status */}
        <StudentListWithStatus />
      </div>
    </div>
  )
}

export default TeacherDashboard