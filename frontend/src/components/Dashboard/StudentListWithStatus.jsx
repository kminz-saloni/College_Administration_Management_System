import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { api } from '@/services'
import { CheckCircleIcon, XCircleIcon, ClockIcon, MagnifyingGlassIcon, Plus } from 'lucide-react'
import { fetchClasses } from '@/store/slices/dashboardSlice'
import toast from 'react-hot-toast'

const StudentListWithStatus = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth || {})
  const { classes = [] } = useSelector((state) => state.dashboard || {})
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddStudents, setShowAddStudents] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        // Fetch students from teacher's classes
        const response = await api.get('/dashboard/users')
        
        if (response.data?.data?.users) {
          setStudents(response.data.data.users)
        }
      } catch (error) {
        console.error('Failed to fetch students:', error)
        toast.error('Failed to load students')
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'teacher') {
      fetchStudents()
    }
  }, [user])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Students</h2>
        <button 
          onClick={() => setShowAddStudents(!showAddStudents)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Students to Class
        </button>
      </div>

      {/* Add Students Section */}
      {showAddStudents && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">Add Students to Class</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Choose a class...</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Students</label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
                {students.map((student) => (
                  <label key={student.id} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{student.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                Add Students
              </button>
              <button 
                onClick={() => setShowAddStudents(false)}
                className="flex-1 bg-gray-300 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading students...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No students found</p>
          <p className="text-sm">Students from your classes will appear here</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
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

          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default StudentListWithStatus