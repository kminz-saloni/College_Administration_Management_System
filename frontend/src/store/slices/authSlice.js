import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isAuthenticated: false,
  user: {
    id: null,
    email: null,
    name: null,
    role: null, // 'admin', 'teacher', 'student'
    avatar: null,
    verified: false,
  },
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set authentication after successful login
    setAuth: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      state.error = null
    },

    // Set user data
    setUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
    },

    // Clear authentication
    clearAuth: (state) => {
      state.isAuthenticated = false
      state.user = initialState.user
      state.token = null
      state.refreshToken = null
      state.error = null
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload
    },

    // Set error message
    setError: (state, action) => {
      state.error = action.payload
    },

    // Clear error message
    clearError: (state) => {
      state.error = null
    },

    // Update token (for token refresh)
    updateToken: (state, action) => {
      state.token = action.payload
    },

    // Check if user is authenticated (used when app loads)
    initializeAuth: (state, action) => {
      if (action.payload) {
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
      } else {
        state.isAuthenticated = false
      }
    },
  },
})

export const {
  setAuth,
  setUser,
  clearAuth,
  setLoading,
  setError,
  clearError,
  updateToken,
  initializeAuth,
} = authSlice.actions

export default authSlice.reducer
