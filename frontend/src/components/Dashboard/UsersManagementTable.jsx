/**
 * Users Management Table — Invitation-based Admin Flow
 */

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Pencil,
  Trash2,
  UserPlus,
  Search,
  ShieldCheck,
  GraduationCap,
  User,
  X,
  BookOpen,
} from 'lucide-react'
import userService from '@/services/userService'
import { authService } from '@/services'
import { fetchUsers } from '@/store/slices/dashboardSlice'

const initialFormState = {
  name: '',
  email: '',
  role: 'student',
  phone: '',
  department: '',
  designation: '',
  employeeId: '',
  rollNo: '',
  semester: '',
  section: '',
  className: '',
  admissionYear: '',
  photo: '',
  status: 'invite_pending',
  subjectIds: [],
}

const UsersManagementTable = () => {
  const dispatch = useDispatch()
  const { users = [] } = useSelector((state) => state.dashboard || {})

  const [searchTerm, setSearchTerm] = useState('')
  const [subjects, setSubjects] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

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

  const safeUsers = Array.isArray(users) ? users : []

  const filteredUsers = safeUsers.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (user = null) => {
    setEditingUser(user)

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
        phone: user.phone || '',
        department: user.department || '',
        designation: user.designation || '',
        employeeId: user.employeeId || '',
        rollNo: user.rollNo || '',
        semester: user.semester || '',
        section: user.section || '',
        className: user.className || '',
        admissionYear: user.admissionYear || '',
        photo: user.photo || '',
        status: user.status || (user.isActive ? 'active' : 'inactive'),
        subjectIds: user.subjectIds || user.subjects || [],
      })
    } else {
      setFormData(initialFormState)
    }

    setSubmitError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setFormData(initialFormState)
    setSubmitError(null)
  }

  const handleSubjectToggle = (subjectId) => {
    setFormData((prev) => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(subjectId)
        ? prev.subjectIds.filter((id) => id !== subjectId)
        : [...prev.subjectIds, subjectId],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError(null)

    try {
      if (editingUser) {
        await userService.updateUser(editingUser._id || editingUser.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          designation: formData.designation,
          status: formData.status,
        })
      } else {
        await userService.createUser(formData)
      }

      dispatch(fetchUsers())
      handleCloseModal()
    } catch (err) {
      setSubmitError(err.message || 'Failed to save user')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    setSubmitLoading(true)
    setSubmitError(null)

    try {
      await userService.deleteUser(userId)
      dispatch(fetchUsers())
    } catch (err) {
      setSubmitError(err.message || 'Failed to delete user')
    } finally {
      setSubmitLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <span className="badge-primary"><ShieldCheck className="w-3 h-3" /> Admin</span>
      case 'teacher':
        return <span className="badge-warning"><User className="w-3 h-3" /> Teacher</span>
      case 'student':
        return <span className="badge-info"><GraduationCap className="w-3 h-3" /> Student</span>
      default:
        return <span className="badge-muted">{role}</span>
    }
  }

  const renderStatus = (user) => {
    const status = user.status || (user.isActive ? 'active' : 'inactive')
    const label = status.replace('_', ' ')
    const className =
      status === 'active'
        ? 'badge-success'
        : status === 'invite_pending'
          ? 'badge-warning'
          : 'badge-danger'

    return <span className={`badge ${className}`}>{label}</span>
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-text-primary font-heading">Users Management</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage invited students, teachers, and admin access</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary btn-sm flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, email, role or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      <div className="table-container flex-1">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-app/30">
            <thead className="table-header">
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Role</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-app/30">
              {filteredUsers.map((user) => (
                <tr key={user._id || user.id} className="table-row group">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="avatar-sm bg-surface-3 text-text-secondary">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">{user.name}</div>
                        <div className="text-xs text-text-muted truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">{getRoleBadge(user.role)}</td>
                  <td className="table-td">{renderStatus(user)}</td>
                  <td className="table-td text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="btn-icon text-text-muted hover:text-primary hover:bg-primary/10"
                        title="Edit User"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id || user.id)}
                        disabled={submitLoading}
                        className="btn-icon text-text-muted hover:text-danger hover:bg-danger/10 disabled:opacity-50"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state py-12">
            <div className="text-center text-text-muted">
              <User className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No users found</p>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="overlay" onClick={handleCloseModal} />
          <div className="card w-full max-w-2xl relative z-[50] animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary font-heading">
                  {editingUser ? 'Edit User' : 'Invite New User'}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {editingUser ? 'Update user details' : 'Create a pre-registered student or teacher account'}
                </p>
              </div>
              <button onClick={handleCloseModal} className="btn-icon text-text-muted hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitError && (
              <div className="mb-4 p-3 bg-danger/10 border border-danger/30 rounded text-danger text-sm">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Full Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="input-label">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="john@college.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="select"
                    disabled={Boolean(editingUser)}
                  >
                    {editingUser && formData.role === 'admin' && <option value="admin">Admin</option>}
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="input-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="select"
                  >
                    <option value="invite_pending">Invite Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {formData.role === 'student' && (
                <div className="space-y-4 rounded-input border border-border-app p-4">
                  <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
                    <GraduationCap className="w-4 h-4" /> Student Profile
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Roll Number</label>
                      <input
                        type="text"
                        value={formData.rollNo}
                        onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                        className="input"
                        placeholder="2024-CS-001"
                        required={!editingUser}
                      />
                    </div>
                    <div>
                      <label className="input-label">Admission Year</label>
                      <input
                        type="text"
                        value={formData.admissionYear}
                        onChange={(e) => setFormData({ ...formData, admissionYear: e.target.value })}
                        className="input"
                        placeholder="2024"
                        required={!editingUser}
                      />
                    </div>
                    <div>
                      <label className="input-label">Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="input"
                        placeholder="Computer Science"
                        required={!editingUser}
                      />
                    </div>
                    <div>
                      <label className="input-label">Semester</label>
                      <input
                        type="text"
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                        className="input"
                        placeholder="Semester 3"
                        required={!editingUser}
                      />
                    </div>
                    <div>
                      <label className="input-label">Section</label>
                      <input
                        type="text"
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        className="input"
                        placeholder="Section A"
                        required={!editingUser}
                      />
                    </div>
                    <div>
                      <label className="input-label">Class Name</label>
                      <input
                        type="text"
                        value={formData.className}
                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                        className="input"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.role === 'teacher' && (
                <div className="space-y-4 rounded-input border border-border-app p-4">
                  <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
                    <BookOpen className="w-4 h-4" /> Teacher Profile
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Employee ID</label>
                      <input
                        type="text"
                        value={formData.employeeId}
                        onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        className="input"
                        placeholder="EMP-1001"
                        required={!editingUser}
                      />
                    </div>
                    <div>
                      <label className="input-label">Designation</label>
                      <input
                        type="text"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="input"
                        placeholder="Assistant Professor"
                        required={!editingUser}
                      />
                    </div>
                    <div>
                      <label className="input-label">Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="input"
                        placeholder="Computer Science"
                        required={!editingUser}
                      />
                    </div>
                    <div>
                      <label className="input-label">Photo URL</label>
                      <input
                        type="url"
                        value={formData.photo}
                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                        className="input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Subjects Assigned</label>
                    <div className="max-h-48 overflow-y-auto space-y-2 rounded-input border border-border-app p-3">
                      {subjects.map((subject) => (
                        <label key={subject._id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.subjectIds.includes(subject._id)}
                            onChange={() => handleSubjectToggle(subject._id)}
                            className="rounded border-border-app accent-primary"
                          />
                          <span className="text-sm text-text-primary">{subject.name}</span>
                          <span className="text-xs text-text-muted">{subject.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-outline flex-1" disabled={submitLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : editingUser ? 'Update' : 'Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersManagementTable