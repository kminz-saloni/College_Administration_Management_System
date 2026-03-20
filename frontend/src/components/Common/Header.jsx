/**
 * Header/Navbar Component
 * Main navigation bar displayed on all authenticated pages
 * Features:
 * - Logo and brand name
 * - Role-based navigation items
 * - User profile dropdown
 * - Notification bell with badge
 * - Mobile hamburger menu toggle
 * - Logout functionality
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/store/slices/authSlice'
import { toggleSidebar } from '@/store/slices/uiSlice'

const Header = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notification)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleNotificationClick = () => {
    navigate('/notifications')
  }

  const getRoleLabel = (role) => {
    const roleMap = {
      admin: 'Administrator',
      teacher: 'Teacher',
      student: 'Student',
    }
    return roleMap[role] || role
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Brand */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CA</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 hidden sm:block">
                  College Admin
                </h1>
              </div>
            </div>
          </div>

          {/* Right Side - Notifications and User Menu */}
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{getRoleLabel(user?.role)}</p>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        navigate('/profile')
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      👤 View Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate(`/${user?.role}/settings`)
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      ⚙️ Settings
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        handleLogout()
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
