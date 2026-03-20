import React from 'react'
import { useSelector } from 'react-redux'
import { ChartBarIcon, TrendingUpIcon, UsersIcon, BookOpenIcon } from '@heroicons/react/24/outline'

const ReportsAnalyticsView = () => {
  const { reports } = useSelector((state) => state.dashboard)

  // Mock analytics data - in real app, this would come from reports API
  const analytics = {
    attendanceRate: 85,
    videoViews: 1247,
    activeUsers: 342,
    totalClasses: 28
  }

  const reportItems = [
    {
      title: 'Attendance Rate',
      value: `${analytics.attendanceRate}%`,
      icon: TrendingUpIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Video Views',
      value: analytics.videoViews.toLocaleString(),
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Users',
      value: analytics.activeUsers,
      icon: UsersIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Classes',
      value: analytics.totalClasses,
      icon: BookOpenIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Reports & Analytics</h2>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportItems.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${item.bgColor} mr-4`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Chart Placeholder */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
            <p>Chart visualization would be displayed here</p>
            <p className="text-sm">Consider adding a charting library like Chart.js or Recharts</p>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {reports.length > 0 ? (
            reports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{report.title}</p>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
                <span className="text-sm text-gray-500">{report.date}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No reports available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsAnalyticsView