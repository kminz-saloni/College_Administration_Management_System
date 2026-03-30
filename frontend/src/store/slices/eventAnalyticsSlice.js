import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import eventService from '@/services/eventService'

// ===== PHASE 5: ASYNC THUNKS FOR EVENT ANALYTICS & ADVANCED OPERATIONS =====

export const fetchEventAnalytics = createAsyncThunk(
  'eventAnalytics/fetchEventAnalytics',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await eventService.fetchEventAnalytics(filters)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch event analytics')
    }
  }
)

export const fetchEventAttendanceStats = createAsyncThunk(
  'eventAnalytics/fetchEventAttendanceStats',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventService.fetchEventAttendanceStats(eventId)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch attendance statistics')
    }
  }
)

export const checkInAttendee = createAsyncThunk(
  'eventAnalytics/checkInAttendee',
  async ({ eventId, userId }, { rejectWithValue }) => {
    try {
      const response = await eventService.checkInAttendee(eventId, userId)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to check in attendee')
    }
  }
)

export const rescheduleEvent = createAsyncThunk(
  'eventAnalytics/rescheduleEvent',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await eventService.rescheduleEvent(eventId, eventData)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to reschedule event')
    }
  }
)

export const cancelEvent = createAsyncThunk(
  'eventAnalytics/cancelEvent',
  async ({ eventId, reason }, { rejectWithValue }) => {
    try {
      const response = await eventService.cancelEvent(eventId, reason)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to cancel event')
    }
  }
)

export const sendEventInvitations = createAsyncThunk(
  'eventAnalytics/sendEventInvitations',
  async ({ eventId, userIds }, { rejectWithValue }) => {
    try {
      const response = await eventService.sendEventInvitations(eventId, userIds)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send invitations')
    }
  }
)

export const fetchEventCalendarData = createAsyncThunk(
  'eventAnalytics/fetchEventCalendarData',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await eventService.fetchEventCalendarData(params)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch calendar data')
    }
  }
)

export const fetchPopularEvents = createAsyncThunk(
  'eventAnalytics/fetchPopularEvents',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await eventService.fetchPopularEvents(limit)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch popular events')
    }
  }
)

// ===== INITIAL STATE =====

const initialState = {
  eventAnalytics: [],
  attendanceStats: {},
  calendarData: [],
  popularEvents: [],
  currentEventStats: null,
  loading: false,
  analyticsLoading: false,
  error: null,
  filters: {
    dateRange: null,
    eventType: '',
    period: 'month',
  },
}

// ===== SLICE DEFINITION =====

const eventAnalyticsSlice = createSlice({
  name: 'eventAnalytics',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = { dateRange: null, eventType: '', period: 'month' }
    },
    clearError: (state) => {
      state.error = null
    },
    clearAnalytics: (state) => {
      state.eventAnalytics = []
      state.attendanceStats = {}
      state.calendarData = []
      state.popularEvents = []
    },
  },
  extraReducers: (builder) => {
    // Fetch Event Analytics
    builder
      .addCase(fetchEventAnalytics.pending, (state) => {
        state.analyticsLoading = true
        state.error = null
      })
      .addCase(fetchEventAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false
        state.eventAnalytics = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchEventAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false
        state.error = action.payload
        state.eventAnalytics = []
      })

    // Fetch Event Attendance Stats
    builder
      .addCase(fetchEventAttendanceStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventAttendanceStats.fulfilled, (state, action) => {
        state.loading = false
        state.attendanceStats = action.payload || {}
        state.currentEventStats = action.payload || {}
      })
      .addCase(fetchEventAttendanceStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Check In Attendee
    builder
      .addCase(checkInAttendee.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(checkInAttendee.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(checkInAttendee.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Reschedule Event
    builder
      .addCase(rescheduleEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(rescheduleEvent.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(rescheduleEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Cancel Event
    builder
      .addCase(cancelEvent.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelEvent.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(cancelEvent.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Send Event Invitations
    builder
      .addCase(sendEventInvitations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendEventInvitations.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(sendEventInvitations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch Event Calendar Data
    builder
      .addCase(fetchEventCalendarData.pending, (state) => {
        state.analyticsLoading = true
        state.error = null
      })
      .addCase(fetchEventCalendarData.fulfilled, (state, action) => {
        state.analyticsLoading = false
        state.calendarData = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchEventCalendarData.rejected, (state, action) => {
        state.analyticsLoading = false
        state.error = action.payload
        state.calendarData = []
      })

    // Fetch Popular Events
    builder
      .addCase(fetchPopularEvents.pending, (state) => {
        state.analyticsLoading = true
        state.error = null
      })
      .addCase(fetchPopularEvents.fulfilled, (state, action) => {
        state.analyticsLoading = false
        state.popularEvents = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchPopularEvents.rejected, (state, action) => {
        state.analyticsLoading = false
        state.error = action.payload
        state.popularEvents = []
      })
  },
})

export const { setFilters, clearFilters, clearError, clearAnalytics } =
  eventAnalyticsSlice.actions

export default eventAnalyticsSlice.reducer
