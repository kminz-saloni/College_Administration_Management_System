import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { api } from '@/services'
import { CheckCircleIcon, XCircleIcon, ClockIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const AttendanceSummary = () => {
  const { user } = useSelector((state) => state.auth || {})
  const [attendanceStats, setAttendanceStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        setLoading(true)
        // Fetch attendance summary for all teacher's classes
        const response = await api.get('/attendance/summary')
        
        if (response.data?.data) {
          const data = response.data.data
          setAttendanceStats({
            totalStudents: data.totalStudents || 0,
            presentToday: data.presentToday || 0,
            absentToday: data.absentToday || 0,
            lateToday: data.lateToday || 0,
            attendanceRate: data.attendanceRate || 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch attendance summary:', error)
        toast.error('Failed to load attendance data')
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'teacher') {
      fetchAttendanceSummary()
    }
  }, [user])

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
      value: `${Math.round(attendanceStats.attendanceRate)}%`,
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance Summary</h2>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading attendance data...</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}

export default AttendanceSummary