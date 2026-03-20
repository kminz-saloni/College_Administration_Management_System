import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import config from '@/config/environment'

/**
 * Async thunks for dashboard data operations
 * These will be called from components to fetch dashboard data
 */

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${config.api.baseURL}/dashboard/stats`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch dashboard stats' })
    }
  }
)

export const fetchUsers = createAsyncThunk(
  'dashboard/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${config.api.baseURL}/dashboard/users`, {
        params,
      })
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
      const response = await axios.get(`${config.api.baseURL}/dashboard/classes`)
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
      const response = await axios.get(`${config.api.baseURL}/dashboard/reports`, {
        params,
      })
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
      const response = await axios.get(`${config.api.baseURL}/notifications`)
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
      const response = await axios.post(`${config.api.baseURL}/notifications/mark-read`, {
        notificationId,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark notification as read' })
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

    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true
        state.usersError = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false
        state.users = action.payload.data || action.payload
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
        state.classes = action.payload.data || action.payload
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
        state.notifications = action.payload.data || action.payload
        state.unreadCount = state.notifications.filter((n) => !n.read).length
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
