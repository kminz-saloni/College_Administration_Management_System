import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  profile: {
    bio: null,
    phone: null,
    dateOfBirth: null,
    address: null,
    city: null,
    state: null,
    zipCode: null,
  },
  preferences: {
    theme: 'light',
    notifications: true,
    emailNotifications: true,
  },
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Update user profile
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload }
      state.error = null
    },

    // Update user preferences
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload }
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

    // Reset user state
    resetUser: (state) => {
      state.profile = initialState.profile
      state.preferences = initialState.preferences
    },
  },
})

export const {
  updateProfile,
  updatePreferences,
  setLoading,
  setError,
  clearError,
  resetUser,
} = userSlice.actions

export default userSlice.reducer
