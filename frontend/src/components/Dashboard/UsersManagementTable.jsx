/**
 * Users Management Table — Premium Dark Theme
 * Features:
 * - Searchable table
 * - Role-based badges
 * - Status pills
 * - Action buttons
 * - Add/Edit/Delete modals
 * - Responsive layout
 */

import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Pencil, Trash2, UserPlus, Search, ShieldCheck, GraduationCap, User, X } from 'lucide-react'
import userService from '@/services/userService'
import { fetchUsers } from '@/store/slices/dashboardSlice'

const UsersManagementTable = () => {
  const dispatch = useDispatch()
  const {
    users = [],
    loading,
    error,
    totalUsers,
    totalPages,
    currentPage,
  } = useSelector((state) => state.dashboard || {})
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({ name: '', email: '', role: 'student', phone: '' })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Safety check: ensure users is an array before filtering
  const safeUsers = Array.isArray(users) ? users : []

  const filteredUsers = safeUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (user = null) => {
    setEditingUser(user)
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student',
        phone: user.phone || '',
      })
    } else {
      setFormData({ name: '', email: '', role: 'student', phone: '', password: '' })
    }
    setSubmitError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
    setFormData({ name: '', email: '', role: 'student', phone: '' })
    setSubmitError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError(null)

    try {
      if (editingUser) {
        // Update user
        await userService.updateUser(editingUser._id, formData)
      } else {
        // Create user - require password for new users
        if (!formData.password) {
          setSubmitError('Password is required for new users')
          setSubmitLoading(false)
          return
        }
        await userService.createUser(formData)
      }

      // Refresh users list
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

  return (
    <div className="card h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-text-primary font-heading">Users Management</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage all registered users and roles</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary btn-sm flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Users Table */}
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
                  <td className="table-td">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="table-td">
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="overlay" onClick={handleCloseModal} />
          <div className="card w-full max-w-md relative z-[50] animate-scale-in">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary font-heading">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {editingUser ? 'Update user details' : 'Create a new user account'}
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
              <div>
                <label className="input-label">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input"
                  placeholder="john@college.edu"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="select"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="input-label">Password</label>
                  <input
                    required
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="input"
                    placeholder="Min 8 chars, 1 number, 1 special char"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-outline flex-1"
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Saving...' : editingUser ? 'Update' : 'Create'}
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