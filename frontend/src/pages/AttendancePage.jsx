import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchClasses, fetchClassById } from '@/store/slices/dashboardSlice'
import { markAttendance, fetchClassAttendance, fetchStudentAttendance } from '@/store/slices/attendanceSlice'
import LoadingSpinner from '@/components/Common/LoadingSpinner'
import { showToast } from '@/store/slices/notificationSlice'

const AttendancePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { classes, selectedClassDetails } = useSelector((state) => state.dashboard)
  const { classAttendance, studentAttendance, loading, error } = useSelector((state) => state.attendance)
  
  const [selectedClass, setSelectedClass] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [markingMode, setMarkingMode] = useState(false)
  const [attendanceData, setAttendanceData] = useState([])

  useEffect(() => {
    if (!user) return

    if (user.role === 'teacher' || user.role === 'admin') {
      dispatch(fetchClasses())
    } else if (user.role === 'student') {
      dispatch(fetchStudentAttendance({ studentId: user.id || user._id }))
    }
  }, [dispatch, user])

  const handleFetchAttendance = () => {
    if (!selectedClass) {
      dispatch(showToast({ type: 'error', message: 'Please select a class' }))
      return
    }
    dispatch(fetchClassAttendance({ classId: selectedClass, params: { date } }))
  }

  const handleMarkMode = async () => {
    if (!selectedClass) {
      dispatch(showToast({ type: 'error', message: 'Please select a class first' }))
      return
    }

    const { payload } = await dispatch(fetchClassById(selectedClass))
    const classInfo = payload?.data || payload
    
    if (classInfo?.students?.length > 0) {
      setAttendanceData(classInfo.students.map(s => ({ 
        studentId: s._id || s.id, 
        studentName: s.name || 'Student',
        status: 'present' 
      })))
      setMarkingMode(true)
    } else {
      dispatch(showToast({ type: 'warning', message: 'No students enrolled in this class' }))
    }
  }

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, status } : item
    ))
  }

  const handleSubmitAttendance = async () => {
    const result = await dispatch(markAttendance({
      classId: selectedClass,
      date,
      attendance: attendanceData.map(r => ({ studentId: r.studentId, status: r.status }))
    }))

    if (result.type.endsWith('/fulfilled')) {
      dispatch(showToast({ type: 'success', message: 'Attendance marked successfully' }))
      setMarkingMode(false)
      handleFetchAttendance()
    }
  }

  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <div className="p-8 text-center text-red-600">Please login to view attendance</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Attendance Management</h1>

      {(user?.role === 'teacher' || user?.role === 'admin') && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border rounded-lg p-2"
              >
                <option value="">Select a class</option>
                {classes?.map(c => (
                  <option key={c._id} value={c._id}>{c.name} - {c.subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleFetchAttendance}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View Records
              </button>
              <button 
                onClick={handleMarkMode}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Mark Attendance
              </button>
            </div>
          </div>
        </div>
      )}

      {markingMode ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendanceData.length > 0 ? attendanceData.map(record => (
                <tr key={record.studentId}>
                  <td className="px-6 py-4">{record.studentName}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      {['present', 'absent', 'late'].map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(record.studentId, status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record.status === status 
                              ? (status === 'present' ? 'bg-green-100 text-green-800' : status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800')
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {status.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-gray-500">
                    No students found for this class. 
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 flex justify-end gap-2">
            <button onClick={() => setMarkingMode(false)} className="px-4 py-2 text-gray-600 hover:text-gray-900">Cancel</button>
            <button onClick={handleSubmitAttendance} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Submit Attendance</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            {user?.role === 'student' ? 'My Attendance' : 'Attendance Records'}
          </h2>
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    {user?.role !== 'student' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    const data = user?.role === 'student' 
                      ? (studentAttendance?.attendance || []) 
                      : (classAttendance?.recentAttendance || []).flatMap(day => 
                          (day.attendance || []).map(r => ({ ...r, date: day.date }))
                        );
                    
                    if (data.length === 0) {
                      return (
                        <tr>
                          <td colSpan={user?.role === 'student' ? 3 : 4} className="px-6 py-8 text-center text-gray-500">
                            No records found.
                          </td>
                        </tr>
                      );
                    }

                    return data.map((record, idx) => (
                      <tr key={record._id || record.id || `rec-${idx}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                        </td>
                        {user?.role !== 'student' && (
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {record.studentId?.name || record.studentName || 'N/A'}
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.status === 'present' ? 'bg-green-100 text-green-800' : 
                            record.status === 'absent' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {(record.status || 'unknown').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{record.notes || '-'}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendancePage
