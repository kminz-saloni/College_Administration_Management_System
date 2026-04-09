import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudentDashboard } from '../store/slices/dashboardSlice'
import StudentScheduleTimetable from '../components/Dashboard/StudentScheduleTimetable'
import StudentFeePaymentStatus from '../components/Dashboard/StudentFeePaymentStatus'
import StudentAvailableVideosList from '../components/Dashboard/StudentAvailableVideosList'
import StudentAttendanceRecord from '../components/Dashboard/StudentAttendanceRecord'
import StudentProfileInformation from '../components/Dashboard/StudentProfileInformation'

const StudentDashboard = () => {
  const dispatch = useDispatch()
  const { statsLoading, classesLoading, statsError, classesError } = useSelector((state) => state.dashboard)
  const isLoading = statsLoading || classesLoading
  const error = statsError || classesError

  useEffect(() => {
    // Fetch student-specific dashboard data using student endpoint
    dispatch(fetchStudentDashboard())
  }, [dispatch])

  if (isLoading) {
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <StudentProfileInformation />
          </div>
          <div className="lg:col-span-2">
            <StudentFeePaymentStatus />
          </div>
        </div>

        <div className="mb-6">
          <StudentScheduleTimetable />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentAvailableVideosList />
          <StudentAttendanceRecord />
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
