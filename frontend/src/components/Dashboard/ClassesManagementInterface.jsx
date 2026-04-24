/**
 * Classes Management Interface — Normalized Class Flow
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Pencil, Trash2, X, Search, BookOpen, User, Layers, Hash } from 'lucide-react'
import { addClass, updateClass, deleteClass, fetchClasses } from '@/store/slices/dashboardSlice'
import { showToast } from '@/store/slices/notificationSlice'
import { authService } from '@/services'

const initialFormState = {
  name: '',
  classCode: '',
  subjectId: '',
  teacherId: '',
  description: '',
  semester: '',
  capacity: 50,
  academicYear: new Date().getFullYear().toString(),
}

const ClassesManagementInterface = () => {
  const dispatch = useDispatch()
  const { classes = [], users = [] } = useSelector((state) => state.dashboard || {})
  const { user } = useSelector((state) => state.auth || {})

  const safeClasses = Array.isArray(classes) ? classes : []
  const safeUsers = Array.isArray(users) ? users : []

  const [searchTerm, setSearchTerm] = useState('')
  const [subjects, setSubjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [formData, setFormData] = useState(initialFormState)

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await authService.getSubjects()
        setSubjects(response?.data?.subjects || [])
      } catch (error) {
        console.error('Failed to fetch subjects:', error)
      }
    }

    loadSubjects()
  }, [])

  const teacherOptions = safeUsers.filter((candidate) => candidate.role === 'teacher')

  const filteredClasses = safeClasses.filter((cls) =>
    cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.classCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setEditingClass(cls)
      setFormData({
        name: cls.name || '',
        classCode: cls.classCode || '',
        subjectId: cls.subjectId || '',
        teacherId: cls.teacher?._id || cls.teacher?.id || cls.teacher || user?.id || '',
        description: cls.description || '',
        semester: cls.semester?.toString() || '',
        capacity: cls.capacity || 50,
        academicYear: cls.academicYear || new Date().getFullYear().toString(),
      })
    } else {
      setEditingClass(null)
      setFormData({
        ...initialFormState,
        teacherId: user?.role === 'teacher' ? user.id : '',
      })
    }

    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return

    const result = await dispatch(deleteClass(id))
    if (result.type.endsWith('/fulfilled')) {
      dispatch(showToast({ type: 'success', message: 'Class archived successfully' }))
      dispatch(fetchClasses())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.subjectId) {
      dispatch(showToast({ type: 'error', message: 'Please select a subject' }))
      return
    }

    if (user?.role === 'admin' && !formData.teacherId) {
      dispatch(showToast({ type: 'error', message: 'Please select a teacher' }))
      return
    }

    const payload = {
      name: formData.name,
      classCode: formData.classCode,
      subjectId: formData.subjectId,
      teacherId: user?.role === 'teacher' ? user.id : formData.teacherId,
      description: formData.description,
      semester: formData.semester,
      capacity: Number(formData.capacity) || 50,
      academicYear: formData.academicYear,
    }

    let result
    if (editingClass) {
      result = await dispatch(updateClass({ id: editingClass._id || editingClass.id, classData: payload }))
    } else {
      result = await dispatch(addClass(payload))
    }

    if (result.type.endsWith('/fulfilled')) {
      dispatch(
        showToast({
          type: 'success',
          message: `Class ${editingClass ? 'updated' : 'created'} successfully`,
        })
      )
      dispatch(fetchClasses())
      setIsModalOpen(false)
    }
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-text-primary font-heading">Active Classes</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage class codes, teachers and subjects</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary btn-sm flex items-center gap-2">
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
          <div
            key={cls._id || cls.id}
            className="p-4 rounded-xl bg-surface-2 border border-border-app/50 hover:border-primary/30 hover:bg-surface-3 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />

            <div className="flex justify-between items-start mb-3">
              <div className="min-w-0">
                <span className="badge-primary mb-1.5 uppercase tracking-widest text-[10px]">
                  {cls.classCode || cls.academicYear}
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
                  onClick={() => handleDelete(cls._id || cls.id)}
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
              <div className="flex items-center gap-2 text-text-muted col-span-2">
                <User className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium line-clamp-1">
                  {cls.teacher?.name || cls.teacherName || 'Unassigned'}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="overlay" onClick={() => setIsModalOpen(false)} />
          <div className="card w-full max-w-2xl relative z-[50] animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary font-heading">
                  {editingClass ? 'Edit Class' : 'Create Class'}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {editingClass ? 'Update class details' : 'Create a class with duplicate protection'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn-icon text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Class Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="e.g. Computer Science A"
                  />
                </div>

                <div>
                  <label className="input-label">Class Code</label>
                  <input
                    type="text"
                    value={formData.classCode}
                    onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                    className="input"
                    placeholder="Optional unique code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Subject</label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    className="select"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="input-label">Teacher</label>
                  {user?.role === 'admin' ? (
                    <select
                      required
                      value={formData.teacherId}
                      onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                      className="select"
                    >
                      <option value="">Select teacher</option>
                      {teacherOptions.map((teacher) => (
                        <option key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={user?.name || ''}
                      className="input"
                      disabled
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 50 })}
                    className="input"
                    min="10"
                    max="500"
                  />
                </div>
                <div>
                  <label className="input-label">Semester</label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="input"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="input-label">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="input"
                    placeholder="2025-2026"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  placeholder="Optional class description"
                  rows="3"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
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