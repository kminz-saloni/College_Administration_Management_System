import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import attendanceService from '@/services/attendanceService'

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async (data, { rejectWithValue }) => {
    try {
      const response = await attendanceService.markAttendance(data)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const fetchClassAttendance = createAsyncThunk(
  'attendance/fetchClassAttendance',
  async ({ classId, params }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getClassAttendance(classId, params)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const fetchStudentAttendance = createAsyncThunk(
  'attendance/fetchStudentAttendance',
  async ({ studentId, params }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getStudentAttendance(studentId, params)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

export const fetchAttendanceSummary = createAsyncThunk(
  'attendance/fetchSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getSummary(params)
      return response
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

const initialState = {
  classAttendance: [],
  studentAttendance: [],
  summary: null,
  loading: false,
  error: null,
  success: false,
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.success = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAttendance.pending, (state) => {
        state.loading = true
      })
      .addCase(markAttendance.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to mark attendance'
      })
      .addCase(fetchClassAttendance.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchClassAttendance.fulfilled, (state, action) => {
        state.loading = false
        state.classAttendance = action.payload.data || action.payload
      })
      .addCase(fetchClassAttendance.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Failed to fetch attendance'
      })
      .addCase(fetchStudentAttendance.fulfilled, (state, action) => {
        state.studentAttendance = action.payload.data || action.payload
      })
      .addCase(fetchAttendanceSummary.fulfilled, (state, action) => {
        state.summary = action.payload.data || action.payload
      })
  },
})

export const { resetStatus } = attendanceSlice.actions
export default attendanceSlice.reducer
