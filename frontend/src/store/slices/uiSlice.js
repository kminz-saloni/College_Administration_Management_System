import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarOpen: true,
  modals: {
    // Modal name: { isOpen: boolean, data: any }
  },
  loading: {
    // Component name: boolean
  },
  theme: 'light', // 'light' or 'dark'
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toggle sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },

    // Set sidebar state
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },

    // Open modal
    openModal: (state, action) => {
      const { modalName, data } = action.payload
      state.modals[modalName] = {
        isOpen: true,
        data: data || null,
      }
    },

    // Close modal
    closeModal: (state, action) => {
      const modalName = action.payload
      state.modals[modalName] = {
        isOpen: false,
        data: null,
      }
    },

    // Toggle modal
    toggleModal: (state, action) => {
      const { modalName, data } = action.payload
      if (state.modals[modalName]?.isOpen) {
        state.modals[modalName] = {
          isOpen: false,
          data: null,
        }
      } else {
        state.modals[modalName] = {
          isOpen: true,
          data: data || null,
        }
      }
    },

    // Set component loading state
    setLoading: (state, action) => {
      const { componentName, isLoading } = action.payload
      state.loading[componentName] = isLoading
    },

    // Toggle theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },

    // Set theme
    setTheme: (state, action) => {
      state.theme = action.payload
    },

    // Reset UI state
    resetUI: () => initialState,
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  toggleModal,
  setLoading,
  toggleTheme,
  setTheme,
  resetUI,
} = uiSlice.actions

export default uiSlice.reducer
