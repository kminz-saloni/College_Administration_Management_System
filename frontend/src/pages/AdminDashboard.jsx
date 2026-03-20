import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardStats, fetchUsers, fetchClasses, fetchReports } from '../store/slices/dashboardSlice'
import OverviewCards from '../components/Dashboard/OverviewCards'
import UsersManagementTable from '../components/Dashboard/UsersManagementTable'
import ClassesManagementInterface from '../components/Dashboard/ClassesManagementInterface'
import ReportsAnalyticsView from '../components/Dashboard/ReportsAnalyticsView'
import SystemHealthMonitor from '../components/Dashboard/SystemHealthMonitor'

const AdminDashboard = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.dashboard)

  useEffect(() => {
    // Fetch all dashboard data on mount
    dispatch(fetchDashboardStats())
    dispatch(fetchUsers())
    dispatch(fetchClasses())
    dispatch(fetchReports())
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Overview Statistics Cards */}
        <OverviewCards />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Users Management Table */}
          <UsersManagementTable />

          {/* Classes Management Interface */}
          <ClassesManagementInterface />
        </div>

        {/* Reports & Analytics View */}
        <ReportsAnalyticsView />

        {/* System Health Monitor */}
        <SystemHealthMonitor />
      </div>
    </div>
  )
}

export default AdminDashboard