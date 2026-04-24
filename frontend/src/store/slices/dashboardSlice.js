import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

/**
 * Async thunks for dashboard data operations
 * These will be called from components to fetch dashboard data
 */

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard stats' })
    }
  }
)

export const fetchAdminDashboard = createAsyncThunk(
  'dashboard/fetchAdminDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/admin')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch admin dashboard' })
    }
  }
)

export const fetchStudentDashboard = createAsyncThunk(
  'dashboard/fetchStudentDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/student')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch student dashboard' })
    }
  }
)

export const fetchTeacherDashboard = createAsyncThunk(
  'dashboard/fetchTeacherDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/teacher')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch teacher dashboard' })
    }
  }
)

export const fetchUsers = createAsyncThunk(
  'dashboard/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/users', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch users' })
    }
  }
)

export const fetchClasses = createAsyncThunk(
  'dashboard/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/classes')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch classes' })
    }
  }
)

export const fetchReports = createAsyncThunk(
  'dashboard/fetchReports',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/reports', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch reports' })
    }
  }
)

export const fetchNotifications = createAsyncThunk(
  'dashboard/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch notifications' })
    }
  }
)

export const markNotificationAsRead = createAsyncThunk(
  'dashboard/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.post('/notifications/mark-read', { notificationId })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark notification as read' })
    }
  }
)

export const addClass = createAsyncThunk(
  'dashboard/addClass',
  async (classData, { rejectWithValue }) => {
    try {
      const response = await api.post('/classes', classData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to add class' })
    }
  }
)

export const updateClass = createAsyncThunk(
  'dashboard/updateClass',
  async ({ id, classData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/classes/${id}`, classData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update class' })
    }
  }
)

export const deleteClass = createAsyncThunk(
  'dashboard/deleteClass',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/classes/${id}`)
      return { id, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete class' })
    }
  }
)

export const fetchClassById = createAsyncThunk(
  'dashboard/fetchClassById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/classes/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch class details' })
    }
  }
)

const initialState = {
  // Statistics data
  stats: {
    totalUsers: 0,
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalRevenue: 0,
    totalAttendanceAvg: 0,
  },

  // Users data
  users: [],
  usersLoading: false,
  usersError: null,

  // Classes data
  classes: [],
  classesLoading: false,
  classesError: null,

  // Reports data
  reports: [],
  reportsLoading: false,
  reportsError: null,

  // Notifications
  notifications: [],
  notificationsLoading: false,
  notificationsError: null,
  unreadCount: 0,
  selectedClassDetails: null,

  // General loading state
  statsLoading: false,
  statsError: null,

  // Caching - store last fetch time to implement smart caching
  lastFetchTime: {
    stats: null,
    users: null,
    classes: null,
    reports: null,
    notifications: null,
  },

  // Configuration
  cacheDuration: 5 * 60 * 1000, // 5 minutes cache
}

const normalizeClass = (value) => {
  if (!value || typeof value !== 'object') return value

  const normalized = { ...value }
  if (!normalized._id && normalized.id) {
    normalized._id = normalized.id
  }

  if (normalized.teacher && typeof normalized.teacher === 'object' && !normalized.teacher._id && normalized.teacher.id) {
    normalized.teacher = { ...normalized.teacher, _id: normalized.teacher.id }
  }

  return normalized
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,

  reducers: {
    // Clear all dashboard data
    clearDashboardData: () => initialState,

    // Clear specific data type
    clearStats: (state) => {
      state.stats = initialState.stats
      state.statsError = null
    },

    clearUsers: (state) => {
      state.users = []
      state.usersError = null
    },

    clearClasses: (state) => {
      state.classes = []
      state.classesError = null
    },

    clearReports: (state) => {
      state.reports = []
      state.reportsError = null
    },

    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
      state.notificationsError = null
    },

    // Reset errors
    clearError: (state, action) => {
      const errorType = action.payload
      if (errorType === 'stats') state.statsError = null
      else if (errorType === 'users') state.usersError = null
      else if (errorType === 'classes') state.classesError = null
      else if (errorType === 'reports') state.reportsError = null
      else if (errorType === 'notifications') state.notificationsError = null
    },
  },

  extraReducers: (builder) => {
    // Fetch Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload.data || action.payload
        state.lastFetchTime.stats = Date.now()
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError = action.payload?.message || 'Failed to fetch stats'
      })

    // Fetch Admin Dashboard
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload.data || action.payload
        state.lastFetchTime.stats = Date.now()
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError = action.payload?.message || 'Failed to fetch admin dashboard'
      })

    // Fetch Student Dashboard
    builder
      .addCase(fetchStudentDashboard.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchStudentDashboard.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload.data || action.payload
        state.lastFetchTime.stats = Date.now()
      })
      .addCase(fetchStudentDashboard.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError = action.payload?.message || 'Failed to fetch student dashboard'
      })

    // Fetch Teacher Dashboard
    builder
      .addCase(fetchTeacherDashboard.pending, (state) => {
        state.statsLoading = true
        state.statsError = null
      })
      .addCase(fetchTeacherDashboard.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload.data || action.payload
        state.lastFetchTime.stats = Date.now()
      })
      .addCase(fetchTeacherDashboard.rejected, (state, action) => {
        state.statsLoading = false
        state.statsError = action.payload?.message || 'Failed to fetch teacher dashboard'
      })

    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true
        state.usersError = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false
        // Extract users array from the response structure
        const usersData = action.payload.data?.users || (Array.isArray(action.payload.data) ? action.payload.data : action.payload.users || [])
        state.users = usersData
        state.totalUsers = action.payload.data?.total || action.payload.total || (Array.isArray(usersData) ? usersData.length : 0)
        state.totalPages = action.payload.data?.pages || action.payload.pages || 1
        state.currentPage = action.payload.data?.page || action.payload.page || 1
        state.lastFetchTime.users = Date.now()
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false
        state.usersError = action.payload?.message || 'Failed to fetch users'
      })

    // Fetch Classes
    builder
      .addCase(fetchClasses.pending, (state) => {
        state.classesLoading = true
        state.classesError = null
      })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.classesLoading = false
        // Extract classes array from the response structure
        const classes = action.payload.data?.classes
          || (Array.isArray(action.payload.data) ? action.payload.data : action.payload.classes || [])
        state.classes = Array.isArray(classes) ? classes.map((item) => normalizeClass(item)) : []
        state.lastFetchTime.classes = Date.now()
      })
      .addCase(fetchClasses.rejected, (state, action) => {
        state.classesLoading = false
        state.classesError = action.payload?.message || 'Failed to fetch classes'
      })

    // Fetch Reports
    builder
      .addCase(fetchReports.pending, (state) => {
        state.reportsLoading = true
        state.reportsError = null
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reportsLoading = false
        // Extract reports data
        state.reports = action.payload.data || action.payload
        state.lastFetchTime.reports = Date.now()
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.reportsLoading = false
        state.reportsError = action.payload?.message || 'Failed to fetch reports'
      })

    // Fetch Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsLoading = true
        state.notificationsError = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false
        // Extract notifications array from the response structure
        const notifications = action.payload.data?.notifications || (Array.isArray(action.payload.data) ? action.payload.data : action.payload.notifications || [])
        state.notifications = notifications
        state.unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0
        state.lastFetchTime.notifications = Date.now()
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsLoading = false
        state.notificationsError = action.payload?.message || 'Failed to fetch notifications'
      })

    // Mark Notification as Read
    builder
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.meta.arg
        const notification = state.notifications.find((n) => n.id === notificationId)
        if (notification) {
          notification.read = true
          state.unreadCount = state.notifications.filter((n) => !n.read).length
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.notificationsError = action.payload?.message || 'Failed to mark notification as read'
      })

    // Add Class
    builder
      .addCase(addClass.fulfilled, (state, action) => {
        const newClass = normalizeClass(action.payload.data || action.payload)
        if (state.classes && newClass && typeof newClass === 'object') {
          state.classes.unshift(newClass)
        }
      })

    // Update Class
    builder
      .addCase(updateClass.fulfilled, (state, action) => {
        const updatedClass = normalizeClass(action.payload.data || action.payload)
        const updatedId = updatedClass?._id || updatedClass?.id
        const index = state.classes?.findIndex((c) => (c._id || c.id) === updatedId)
        if (index !== -1 && index !== undefined) {
          state.classes[index] = updatedClass
        }
      })

    // Delete Class
    builder
      .addCase(deleteClass.fulfilled, (state, action) => {
        const id = action.payload.id
        state.classes = state.classes?.filter((c) => (c._id || c.id) !== id)
      })

    // Fetch Class By ID
    builder
      .addCase(fetchClassById.fulfilled, (state, action) => {
        state.selectedClassDetails = action.payload.data || action.payload
      })
  },
})

export const {
  clearDashboardData,
  clearStats,
  clearUsers,
  clearClasses,
  clearReports,
  clearNotifications,
  clearError,
} = dashboardSlice.actions

export default dashboardSlice.reducer
