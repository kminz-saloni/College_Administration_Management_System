import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
  toasts: [],
}

let toastId = 0
let notificationId = 0

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Add a new notification (from API)
    addNotification: (state, action) => {
      const notification = {
        id: notificationId++,
        read: false,
        ...action.payload,
      }
      state.notifications.unshift(notification)
      if (!notification.read) {
        state.unreadCount += 1
      }
    },

    // Mark notification as read
    markAsRead: (state, action) => {
      const notification = state.notifications.find((n) => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount -= 1
      }
    },

    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        if (!n.read) {
          n.read = true
        }
      })
      state.unreadCount = 0
    },

    // Delete notification
    deleteNotification: (state, action) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload)
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount -= 1
        }
        state.notifications.splice(index, 1)
      }
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },

    // Show toast notification
    showToast: (state, action) => {
      const toast = {
        id: toastId++,
        type: 'info', // 'success', 'error', 'warning', 'info'
        duration: 3000,
        ...action.payload,
      }
      state.toasts.push(toast)
    },

    // Remove toast
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },

    // Set notifications from API
    setNotifications: (state, action) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter((n) => !n.read).length
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
  showToast,
  removeToast,
  setNotifications,
} = notificationSlice.actions

export default notificationSlice.reducer
