import React from 'react'
// import { useSelector } from 'react-redux'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline'

const AttendanceSummary = () => {
  // const { classes } = useSelector((state) => state.dashboard)

  // Mock attendance data - in real app, this would come from attendance API
  const attendanceStats = {
    totalStudents: 150,
    presentToday: 128,
    absentToday: 15,
    lateToday: 7,
    attendanceRate: 85.3
  }

  const stats = [
    {
      label: 'Present Today',
      value: attendanceStats.presentToday,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Absent Today',
      value: attendanceStats.absentToday,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Late Today',
      value: attendanceStats.lateToday,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      label: 'Attendance Rate',
      value: `${attendanceStats.attendanceRate}%`,
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Summary</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-full ${stat.bgColor} mr-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
          Mark Today's Attendance
        </button>
        <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors">
          View Attendance Reports
        </button>
      </div>
    </div>
  )
}

export default AttendanceSummary