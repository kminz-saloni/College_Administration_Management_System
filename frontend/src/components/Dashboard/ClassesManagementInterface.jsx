/**
 * Classes Management Interface — Premium Dark Theme
 * Features:
 * - Card-based class list
 * - Search by name/code
 * - Add/Edit/Delete with modal
 * - Subject filtering by teacher's subjects
 * - Student count display
 */

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Pencil, Trash2, X, Search, BookOpen, User, Layers, Hash } from 'lucide-react'
import { addClass, updateClass, deleteClass } from '@/store/slices/dashboardSlice'
import { showToast } from '@/store/slices/notificationSlice'

const ClassesManagementInterface = () => {
  const dispatch = useDispatch()
  const {
    classes = [],
    loading,
    error,
    stats,
  } = useSelector((state) => state.dashboard || {})

  const { user } = useSelector((state) => state.auth || {})
  
  // Safety check: ensure classes is an array before mapping/filtering
  const safeClasses = Array.isArray(classes) ? classes : []
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [teacherSubjects, setTeacherSubjects] = useState([])
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    semester: '1',
    capacity: 50,
    academicYear: new Date().getFullYear().toString()
  })

  // Load teacher's subjects from user data
  useEffect(() => {
    if (user && user.subjects) {
      setTeacherSubjects(user.subjects || [])
    }
  }, [user])

  const filteredClasses = safeClasses.filter(cls =>
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
        description: cls.description || '',
        semester: cls.semester?.toString() || '1',
        capacity: cls.capacity || 50,
        academicYear: cls.academicYear || new Date().getFullYear().toString()
      })
    } else {
      setEditingClass(null)
      setFormData({
        name: '',
        subject: '',
        description: '',
        semester: '1',
        capacity: 50,
        academicYear: new Date().getFullYear().toString()
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
    
    // Validate subject is from teacher's subjects
    const isValidSubject = teacherSubjects.some(subj => {
      if (typeof subj === 'string') return subj === formData.subject
      return subj._id === formData.subject || subj.name === formData.subject
    })
    
    if (!isValidSubject && teacherSubjects.length > 0) {
      dispatch(showToast({ type: 'error', message: 'Please select a valid subject' }))
      return
    }
    
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
    <div className="card h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-text-primary font-heading">Active Classes</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage course offerings and assignments</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary btn-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Class
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, subject, or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 overflow-y-auto pr-1">
        {filteredClasses.map((cls) => (
          <div key={cls._id} className="p-4 rounded-xl bg-surface-2 border border-border-app/50 hover:border-primary/30 hover:bg-surface-3 transition-all group relative overflow-hidden">
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-20 h-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors`} />
            
            <div className="flex justify-between items-start mb-3">
              <div className="min-w-0">
                <span className="badge-primary mb-1.5 uppercase tracking-widest text-[10px]">
                  {cls.academicYear}
                </span>
                <h3 className="text-base font-bold text-text-primary truncate font-heading">{cls.name}</h3>
                <p className="text-xs text-text-muted truncate mt-0.5">{cls.subject}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(cls)}
                  className="btn-icon p-1.5 text-text-muted hover:text-primary hover:bg-primary/10"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cls._id)}
                  className="btn-icon p-1.5 text-text-muted hover:text-danger hover:bg-danger/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border-app/30">
              <div className="flex items-center gap-2 text-text-muted">
                <Layers className="w-3.5 h-3.5 text-accent" />
                <span className="text-[11px] font-medium truncate">Cap: {cls.capacity || 50}</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <Hash className="w-3.5 h-3.5 text-info" />
                <span className="text-[11px] font-medium">Sem {cls.semester}</span>
              </div>
              <div className="flex items-center gap-2 text-text-muted">
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium line-clamp-1">
                  {cls.students?.length || 0} Students
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClasses.length === 0 && (
        <div className="empty-state py-12 flex-1">
          <BookOpen className="h-10 w-10 text-text-muted/20 mb-3" />
          <p className="text-sm text-text-muted">No classes found</p>
        </div>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="overlay" onClick={() => setIsModalOpen(false)} />
          <div className="card w-full max-w-md relative z-[50] animate-scale-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary font-heading">
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {editingClass ? 'Update existing class details' : 'Configure a new class for the system'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="input-label">Class Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input"
                  placeholder="e.g. Computer Science A"
                />
              </div>
              <div>
                <label className="input-label">Subject</label>
                {teacherSubjects.length > 0 ? (
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="select"
                  >
                    <option value="">Select a subject</option>
                    {teacherSubjects.map((subject) => {
                      const subjectName = typeof subject === 'string' ? subject : subject.name
                      const subjectValue = typeof subject === 'string' ? subject : subject._id
                      return (
                        <option key={subjectValue} value={subjectValue || subjectName}>
                          {subjectName}
                        </option>
                      )
                    })}
                  </select>
                ) : (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-input text-sm text-warning">
                    No subjects selected during registration. Please contact administrator.
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 50})}
                    className="input"
                    placeholder="e.g. 50"
                    min="10"
                    max="500"
                  />
                </div>
                <div>
                  <label className="input-label">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="select"
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                    className="input"
                    placeholder="e.g. 2024"
                  />
                </div>
                <div></div>
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input"
                  placeholder="Optional class description"
                  rows="3"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
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