import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEventAnalytics, fetchPopularEvents } from '@/store/slices/eventAnalyticsSlice'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUpIcon } from '@heroicons/react/24/solid'

/**
 * EventAnalyticsDashboard - Event metrics and analytics visualization
 * Phase 5: Advanced event management analytics
 */
const EventAnalyticsDashboard = () => {
  const dispatch = useDispatch()
  const { eventAnalytics, popularEvents, analyticsLoading, error } = useSelector(
    (state) => state.eventAnalytics
  )

  useEffect(() => {
    dispatch(fetchEventAnalytics({}))
    dispatch(fetchPopularEvents(5))
  }, [dispatch])

  // Calculate metrics
  const totalEvents = eventAnalytics?.length || 0
  const totalAttendees = eventAnalytics?.reduce((sum, event) => sum + (event.attendees || 0), 0) || 0
  const averageAttendanceRate =
    eventAnalytics?.length > 0
      ? (
          eventAnalytics.reduce((sum, event) => sum + (event.attendanceRate || 0), 0) /
          eventAnalytics.length
        ).toFixed(2)
      : 0
  const noShowRate =
    eventAnalytics?.length > 0
      ? (
          100 -
          eventAnalytics.reduce((sum, event) => sum + (event.attendanceRate || 0), 0) /
            eventAnalytics.length
        ).toFixed(2)
      : 0

  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  if (error) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="h-4 w-4 rounded-full bg-red-500"></div>
          <div>
            <p className="font-semibold text-red-800">Error Loading Analytics</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center gap-3">
          <TrendingUpIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Event Analytics</h1>
            <p className="text-gray-600">Monitor event performance and engagement metrics</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Events Card */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-sm text-gray-600">Total Events</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{totalEvents}</p>
          <div className="mt-4 h-2 w-full rounded-full bg-blue-100">
            <div className="h-full w-1/3 rounded-full bg-blue-600"></div>
          </div>
        </div>

        {/* Total Attendees Card */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-sm text-gray-600">Total Attendees</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{totalAttendees}</p>
          <div className="mt-4 h-2 w-full rounded-full bg-green-100">
            <div className="h-full w-2/3 rounded-full bg-green-600"></div>
          </div>
        </div>

        {/* Average Attendance Rate Card */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-sm text-gray-600">Avg Attendance Rate</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{averageAttendanceRate}%</p>
          <div className="mt-4 h-2 w-full rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-amber-600"
              style={{ width: `${averageAttendanceRate}%` }}
            ></div>
          </div>
        </div>

        {/* No-Show Rate Card */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-sm text-gray-600">No-Show Rate</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{noShowRate}%</p>
          <div className="mt-4 h-2 w-full rounded-full bg-red-100">
            <div
              className="h-full rounded-full bg-red-600"
              style={{ width: `${noShowRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attendance Bar Chart */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Attendance vs No-Shows (Top 10 Events)
          </h3>
          {eventAnalytics && eventAnalytics.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={eventAnalytics.slice(0, 10).map((event) => ({
                  name: event.name?.substring(0, 10) || 'Event',
                  Attended: Math.round((event.attendees * (event.attendanceRate || 50)) / 100),
                  'No-Show': Math.round(event.attendees * (1 - (event.attendanceRate || 50) / 100)),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Attended" fill="#10b981" />
                <Bar dataKey="No-Show" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-gray-500">No data available</p>
          )}
        </div>

        {/* Popular Events Pie Chart */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Popular Events</h3>
          {popularEvents && popularEvents.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={popularEvents.map((event) => ({
                    name: event.name?.substring(0, 12) || 'Event',
                    attendees: event.attendees || 0,
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="attendees"
                >
                  {popularEvents.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-gray-500">No data available</p>
          )}
        </div>
      </div>

      {/* Attendance Details Table */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Event Details</h3>
        {eventAnalytics && eventAnalytics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-2 border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Event Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Attendees</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">
                    Attendance Rate
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">No-Shows</th>
                </tr>
              </thead>
              <tbody>
                {eventAnalytics.map((event) => (
                  <tr key={event._id || event.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{event.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                        {event.type || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{event.attendees || 0}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-green-600"
                            style={{ width: `${event.attendanceRate || 0}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-gray-700">
                          {event.attendanceRate || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {Math.round(((event.attendees || 0) * (100 - (event.attendanceRate || 0))) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-gray-500">No events data available</p>
        )}
      </div>

      {/* Loading State */}
      {analyticsLoading && (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600"></div>
        </div>
      )}
    </div>
  )
}

export default EventAnalyticsDashboard
