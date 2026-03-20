/**
 * Custom Redux Hooks
 * Provides typed dispatch and selector hooks
 */

import { useDispatch, useSelector } from 'react-redux'

export const useAppDispatch = () => useDispatch()

export const useAppSelector = useSelector

/**
 * Custom hook to access auth state
 */
export const useAuth = () => {
  return useSelector((state) => state.auth)
}

/**
 * Custom hook to access user state
 */
export const useUser = () => {
  return useSelector((state) => state.user)
}

/**
 * Custom hook to access notifications
 */
export const useNotifications = () => {
  return useSelector((state) => state.notification)
}

/**
 * Custom hook to access UI state
 */
export const useUI = () => {
  return useSelector((state) => state.ui)
}

/**
 * Custom hook to access dashboard state
 */
export const useDashboard = () => {
  return useSelector((state) => state.dashboard)
}

export default {
  useAppDispatch,
  useAppSelector,
  useAuth,
  useUser,
  useNotifications,
  useUI,
  useDashboard,
}
