import React from 'react'
import { useSelector } from 'react-redux'
import { ServerIcon, CpuChipIcon, WifiIcon, DatabaseIcon } from '@heroicons/react/24/outline'

const SystemHealthMonitor = () => {
  const { stats } = useSelector((state) => state.dashboard)

  // Mock system health data
  const systemMetrics = [
    {
      name: 'Server Status',
      status: 'Online',
      icon: ServerIcon,
      color: 'text-green-600',
      details: 'All systems operational'
    },
    {
      name: 'CPU Usage',
      status: '45%',
      icon: CpuChipIcon,
      color: 'text-blue-600',
      details: 'Normal load'
    },
    {
      name: 'Network',
      status: 'Stable',
      icon: WifiIcon,
      color: 'text-green-600',
      details: 'Low latency'
    },
    {
      name: 'Database',
      status: 'Healthy',
      icon: DatabaseIcon,
      color: 'text-green-600',
      details: 'All connections active'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">System Health Monitor</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <metric.icon className={`h-6 w-6 ${metric.color} mr-2`} />
              <h3 className="text-sm font-medium text-gray-900">{metric.name}</h3>
            </div>
            <p className={`text-lg font-semibold ${metric.color} mb-1`}>{metric.status}</p>
            <p className="text-xs text-gray-600">{metric.details}</p>
          </div>
        ))}
      </div>

      {/* Overall System Status */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <ServerIcon className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-sm font-medium text-green-800">
            Overall System Health: {stats.systemHealth || 'Good'}
          </span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          All critical systems are functioning normally. Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}

export default SystemHealthMonitor