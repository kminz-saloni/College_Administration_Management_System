import React from 'react'
import { useSelector } from 'react-redux'
import { BookOpenIcon, UsersIcon, CalendarIcon } from '@heroicons/react/24/outline'

const ClassInformationCards = () => {
  const { classes } = useSelector((state) => state.dashboard)

  // Filter classes for the current teacher (mock teacher ID for now)
  const teacherClasses = classes.filter(cls => cls.teacher_id) // In real app, filter by current user's ID

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {teacherClasses.map((cls) => (
        <div key={cls._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{cls.subject}</h3>
              <p className="text-sm text-gray-600">Code: {cls.class_code}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <UsersIcon className="h-4 w-4 mr-2" />
              <span>{cls.students?.length || 0} Students</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>Next: {cls.nextClass || 'TBD'}</span>
            </div>
          </div>

          <div className="mt-4">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              View Details
            </button>
          </div>
        </div>
      ))}

      {teacherClasses.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          <BookOpenIcon className="h-12 w-12 mx-auto mb-4" />
          <p>No classes assigned yet</p>
        </div>
      )}
    </div>
  )
}

export default ClassInformationCards