import React from 'react'
import { CheckCircleIcon, VideoCameraIcon, UserGroupIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

const QuickActions = () => {
  const actions = [
    {
      title: 'Mark Attendance',
      description: 'Record attendance for today\'s classes',
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      action: () => {
        // TODO: Implement mark attendance functionality
      }
    },
    {
      title: 'Upload Video',
      description: 'Add new video content to your classes',
      icon: VideoCameraIcon,
      color: 'bg-blue-500',
      action: () => {
        // TODO: Implement upload video functionality
      }
    },
    {
      title: 'View Students',
      description: 'Check student list and details',
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      action: () => {
        // TODO: Implement view students functionality
      }
    },
    {
      title: 'Generate Report',
      description: 'Create attendance or performance reports',
      icon: DocumentTextIcon,
      color: 'bg-orange-500',
      action: () => {
        // TODO: Implement generate report functionality
      }
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>

      <div className="grid grid-cols-1 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
          >
            <div className={`p-3 rounded-full ${action.color} text-white mr-4 flex-shrink-0`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions