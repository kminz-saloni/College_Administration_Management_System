import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { addClass, updateClass, deleteClass } from '@/store/slices/dashboardSlice'
import { showToast } from '@/store/slices/notificationSlice'

const ClassesManagementInterface = () => {
  const dispatch = useDispatch()
  const { classes } = useSelector((state) => state.dashboard)
  const { user } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    class_code: '',
    department: '',
    semester: '1',
    teacher: ''
  })

  const filteredClasses = classes.filter(cls =>
    cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.class_code?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setEditingClass(cls)
      setFormData({
        name: cls.name || '',
        subject: cls.subject || '',
        class_code: cls.class_code || '',
        department: cls.department || '',
        semester: cls.semester || '1',
        teacher: cls.teacher?._id || cls.teacher || ''
      })
    } else {
      setEditingClass(null)
      setFormData({
        name: '',
        subject: '',
        class_code: '',
        department: '',
        semester: '1',
        teacher: user?.id || user?._id || ''
      })
    }
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      const result = await dispatch(deleteClass(id))
      if (result.type.endsWith('/fulfilled')) {
        dispatch(showToast({ type: 'success', message: 'Class deleted successfully' }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let result
    if (editingClass) {
      result = await dispatch(updateClass({ id: editingClass._id, classData: formData }))
    } else {
      result = await dispatch(addClass(formData))
    }

    if (result.type.endsWith('/fulfilled')) {
      dispatch(showToast({ 
        type: 'success', 
        message: `Class ${editingClass ? 'updated' : 'added'} successfully` 
      }))
      setIsModalOpen(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Active Classes</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Class
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, subject, or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <div key={cls._id} className="border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all bg-gray-50 group">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {cls.class_code}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">{cls.name}</h3>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(cls)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Edit Class"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(cls._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Delete Class"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex justify-between">
                <span className="font-medium text-gray-500">Subject:</span>
                <span className="text-gray-900 font-semibold">{cls.subject}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium text-gray-500">Department:</span>
                <span>{cls.department}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium text-gray-500">Semester:</span>
                <span>{cls.semester}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium text-gray-500">Students:</span>
                <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold">
                  {cls.students?.length || 0}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">No classes found matching your criteria</p>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Class Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Computer Science A"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  required
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Data Structures"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Class Code</label>
                  <input
                    required
                    type="text"
                    value={formData.class_code}
                    onChange={(e) => setFormData({...formData, class_code: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. CS101"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                <input
                  required
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Engineering"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
                >
                  {editingClass ? 'Update Class' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassesManagementInterface