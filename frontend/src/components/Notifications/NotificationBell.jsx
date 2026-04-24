import { useCallback, useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  addNotification,
  setNotifications,
  markAsRead,
} from '@/store/slices/notificationSlice'
import notificationService from '@/services/notificationService'
import { BellIcon } from '@heroicons/react/24/outline'

const NotificationBell = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { notifications, unreadCount } = useSelector((state) => state.notification)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const wsRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.fetchNotifications({ limit: 10 })
      dispatch(setNotifications(response.data || response))
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [dispatch])

  const setupWebSocket = useCallback(() => {
    const userId = localStorage.getItem('userId') // Get from auth state
    if (!userId) return

    const ws = notificationService.setupWebSocket(userId, (notification) => {
      dispatch(addNotification(notification))
    })
    wsRef.current = ws
  }, [dispatch])

  // Initialize notifications on mount
  useEffect(() => {
    const initialize = async () => {
      await fetchNotifications()
      setupWebSocket()
    }

    initialize()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [fetchNotifications, setupWebSocket])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id))
    }
    // Navigate based on notification type
    switch (notification.type) {
      case 'payment':
        navigate('/student/payments')
        break
      case 'attendance':
        navigate('/student/attendance')
        break
      case 'event':
        navigate('/events')
        break
      case 'video':
        navigate('/student/videos')
        break
      default:
        break
    }
    setIsOpen(false)
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment':
        return '💳'
      case 'attendance':
        return '📋'
      case 'event':
        return '📅'
      case 'system':
        return '⚙️'
      case 'video':
        return '🎥'
      default:
        return '📬'
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const recentNotifications = notifications.slice(0, 5)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BellIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {recentNotifications.map((notification) => (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition ${
                      notification.read ? 'opacity-75' : 'font-semibold'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg mt-0.5">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">
                          {notification.title || notification.message}
                        </p>
                        {notification.title && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => {
                navigate('/notifications')
                setIsOpen(false)
              }}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-semibold py-2 hover:bg-gray-50 rounded transition"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
