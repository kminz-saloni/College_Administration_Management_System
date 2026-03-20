import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

const ClassesManagementInterface = () => {
  const { classes } = useSelector((state) => state.dashboard)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredClasses = classes.filter(cls =>
    cls.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.class_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = () => {
    // TODO: Implement edit class functionality
  }

  const handleDelete = () => {
    // TODO: Implement delete class functionality
  }

  const handleAddClass = () => {
    // TODO: Implement add class functionality
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Classes Management</h2>
        <button
          onClick={handleAddClass}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Class
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClasses.map((cls) => (
          <div key={cls._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{cls.subject}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(cls._id)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(cls._id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-2">Code: {cls.class_code}</p>
            <p className="text-sm text-gray-600 mb-2">Teacher: {cls.teacher_id?.name || 'Not assigned'}</p>
            <p className="text-sm text-gray-600">Students: {cls.students?.length || 0}</p>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No classes found
        </div>
      )}
    </div>
  )
}

export default ClassesManagementInterface