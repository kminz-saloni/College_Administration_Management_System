import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import notificationReducer from './slices/notificationSlice'
import uiReducer from './slices/uiSlice'
import dashboardReducer from './slices/dashboardSlice'
import videoReducer from './slices/videoSlice'
import eventReducer from './slices/eventSlice'
import eventAnalyticsReducer from './slices/eventAnalyticsSlice'
import analyticsReducer from './slices/analyticsSlice'
import paymentReducer from './slices/paymentSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    notification: notificationReducer,
    ui: uiReducer,
    dashboard: dashboardReducer,
    video: videoReducer,
    event: eventReducer,
    eventAnalytics: eventAnalyticsReducer,
    analytics: analyticsReducer,
    payment: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore serialization check errors for specific actions
        ignoredActions: ['notification/showToast'],
      },
    }),
})

export default store
