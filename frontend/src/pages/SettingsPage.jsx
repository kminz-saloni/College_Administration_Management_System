import React from 'react'
import { useSelector } from 'react-redux'

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
      
      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-base text-gray-900">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email Address</label>
              <p className="mt-1 text-base text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Role</label>
              <p className="mt-1 text-base capitalize text-gray-900">{user?.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">User ID</label>
              <p className="mt-1 text-xs text-gray-400">{user?.id || user?._id}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Change Password
          </button>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive alerts about events and attendance</p>
            </div>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative shadow-inner">
               <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
