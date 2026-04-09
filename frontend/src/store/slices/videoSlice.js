import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/services/api'

// Async thunks for video management
export const fetchVideos = createAsyncThunk(
  'video/fetchVideos',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/videos', { params: filters })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch videos')
    }
  }
)

export const fetchVideoById = createAsyncThunk(
  'video/fetchVideoById',
  async (videoId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/videos/${videoId}`)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch video')
    }
  }
)

export const uploadVideo = createAsyncThunk(
  'video/uploadVideo',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload video')
    }
  }
)

export const updateVideo = createAsyncThunk(
  'video/updateVideo',
  async ({ videoId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/videos/${videoId}`, data)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update video')
    }
  }
)

export const deleteVideo = createAsyncThunk(
  'video/deleteVideo',
  async (videoId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/videos/${videoId}`)
      return videoId
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete video')
    }
  }
)

export const updateWatchProgress = createAsyncThunk(
  'video/updateWatchProgress',
  async ({ videoId, progress }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/videos/${videoId}/progress`, {
        watchedDuration: progress,
      })
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update progress')
    }
  }
)

const initialState = {
  videos: [],
  currentVideo: null,
  loading: false,
  error: null,
  uploadProgress: 0,
  filters: {
    subject: '',
    classId: '',
    searchTerm: '',
  },
}

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { subject: '', classId: '', searchTerm: '' }
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch Videos
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false
        state.videos = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch Video by ID
    builder
      .addCase(fetchVideoById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.loading = false
        state.currentVideo = action.payload
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Upload Video
    builder
      .addCase(uploadVideo.pending, (state) => {
        state.loading = true
        state.error = null
        state.uploadProgress = 0
      })
      .addCase(uploadVideo.fulfilled, (state, action) => {
        state.loading = false
        state.uploadProgress = 100
        state.videos.unshift(action.payload)
      })
      .addCase(uploadVideo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.uploadProgress = 0
      })

    // Update Video
    builder
      .addCase(updateVideo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.loading = false
        const index = state.videos.findIndex((v) => v._id === action.payload._id)
        if (index !== -1) {
          state.videos[index] = action.payload
        }
        if (state.currentVideo?._id === action.payload._id) {
          state.currentVideo = action.payload
        }
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Delete Video
    builder
      .addCase(deleteVideo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.loading = false
        state.videos = state.videos.filter((v) => v._id !== action.payload)
        if (state.currentVideo?._id === action.payload) {
          state.currentVideo = null
        }
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update Watch Progress
    builder
      .addCase(updateWatchProgress.pending, (state) => {
        state.error = null
      })
      .addCase(updateWatchProgress.fulfilled, (state, action) => {
        if (state.currentVideo?._id === action.payload._id) {
          state.currentVideo = action.payload
        }
      })
      .addCase(updateWatchProgress.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { setFilters, clearFilters, setUploadProgress, clearCurrentVideo, clearError } =
  videoSlice.actions

export default videoSlice.reducer
