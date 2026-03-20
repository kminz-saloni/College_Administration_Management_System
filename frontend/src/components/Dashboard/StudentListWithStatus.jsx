import React, { useState } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

const StudentListWithStatus = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')

  // Mock student data - in real app, this would come from students API
  const students = [
    { id: 1, name: 'Alice Johnson', class: 'Math 101', status: 'Present', lastAttendance: '2024-03-14' },
    { id: 2, name: 'Bob Smith', class: 'Math 101', status: 'Absent', lastAttendance: '2024-03-13' },
    { id: 3, name: 'Carol Davis', class: 'Chemistry 201', status: 'Late', lastAttendance: '2024-03-14' },
    { id: 4, name: 'David Wilson', class: 'Chemistry 201', status: 'Present', lastAttendance: '2024-03-14' },
    { id: 5, name: 'Eva Brown', class: 'History 101', status: 'Present', lastAttendance: '2024-03-14' }
  ]

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === 'all' || student.class === selectedClass
    return matchesSearch && matchesClass
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case 'Absent':
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case 'Late':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800'
      case 'Absent':
        return 'bg-red-100 text-red-800'
      case 'Late':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const classes = ['all', ...new Set(students.map(s => s.class))]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Student List with Status</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {classes.map(cls => (
              <option key={cls} value={cls}>
                {cls === 'all' ? 'All Classes' : cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center flex-1">
              <div className="mr-4">
                {getStatusIcon(student.status)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{student.name}</h3>
                <p className="text-sm text-gray-600">{student.class}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.status)}`}>
                {student.status}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(student.lastAttendance).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No students found matching your criteria</p>
        </div>
      )}

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total Students: {filteredStudents.length}</span>
          <span>
            Present: {filteredStudents.filter(s => s.status === 'Present').length} |
            Absent: {filteredStudents.filter(s => s.status === 'Absent').length} |
            Late: {filteredStudents.filter(s => s.status === 'Late').length}
          </span>
        </div>
      </div>
    </div>
  )
}

export default StudentListWithStatus