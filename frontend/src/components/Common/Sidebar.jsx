/**
 * Sidebar Component
 * Navigation menu for authenticated users
 * Features:
 * - Role-based menu items (Admin, Teacher, Student)
 * - Active route highlighting
 * - Collapsible submenu items
 * - Mobile responsive (hidden on mobile, shown on lg+)
 * - Icon + label navigation
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar } from '@/store/slices/uiSlice'

const Sidebar = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { sidebarOpen } = useSelector((state) => state.ui)
  const [expandedMenu, setExpandedMenu] = useState(null)

  const getMenuItems = () => {
    const baseItems = [
      {
        icon: '📊',
        label: 'Dashboard',
        href: `/${user?.role}/dashboard`,
      },
    ]

    const roleSpecificItems = {
      admin: [
        {
          icon: '👥',
          label: 'Users Management',
          href: '/admin/users',
        },
        {
          icon: '📚',
          label: 'Classes',
          href: '/admin/classes',
        },
        {
          icon: '📊',
          label: 'Analytics',
          href: '/admin/analytics',
          submenu: [
            { label: 'Reports', href: '/admin/analytics/reports' },
            { label: 'System Health', href: '/admin/analytics/health' },
          ],
        },
        {
          icon: '⚙️',
          label: 'Settings',
          href: '/admin/settings',
        },
      ],
      teacher: [
        {
          icon: '📚',
          label: 'Classes',
          href: '/teacher/classes',
        },
        {
          icon: '✅',
          label: 'Attendance',
          href: '/teacher/attendance',
        },
        {
          icon: '🎥',
          label: 'Videos',
          href: '/teacher/videos',
          submenu: [
            { label: 'Upload Video', href: '/teacher/videos/upload' },
            { label: 'My Videos', href: '/teacher/videos/library' },
          ],
        },
        {
          icon: '📊',
          label: 'Analytics',
          href: '/teacher/analytics',
        },
        {
          icon: '⚙️',
          label: 'Settings',
          href: '/teacher/settings',
        },
      ],
      student: [
        {
          icon: '📚',
          label: 'Classes',
          href: '/student/classes',
        },
        {
          icon: '✅',
          label: 'Attendance',
          href: '/student/attendance',
        },
        {
          icon: '🎥',
          label: 'Videos',
          href: '/student/videos',
        },
        {
          icon: '💰',
          label: 'Payments',
          href: '/student/payments',
        },
        {
          icon: '⚙️',
          label: 'Settings',
          href: '/student/settings',
        },
      ],
    }

    return [...baseItems, ...(roleSpecificItems[user?.role] || [])]
  }

  const isLinkActive = (href) => {
    return location.pathname.startsWith(href)
  }

  const menuItems = getMenuItems()

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 w-64 h-[calc(100vh-64px)] bg-white border-r border-gray-200 overflow-y-auto transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } lg:translate-x-0 lg:relative lg:top-0 lg:h-auto`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.href}>
              {item.submenu ? (
                // Collapsible Menu Item
                <div>
                  <button
                    onClick={() =>
                      setExpandedMenu(
                        expandedMenu === item.href ? null : item.href
                      )
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isLinkActive(item.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      {item.label}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedMenu === item.href ? 'rotate-180' : ''
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

                  {/* Submenu Items */}
                  {expandedMenu === item.href && (
                    <div className="mt-2 ml-4 space-y-1 border-l border-gray-200 pl-4">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.href}
                          to={subitem.href}
                          onClick={() => dispatch(toggleSidebar())}
                          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                            isLinkActive(subitem.href)
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Simple Menu Item
                <Link
                  to={item.href}
                  onClick={() => dispatch(toggleSidebar())}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isLinkActive(item.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 space-y-1">
            <p>© 2026 College Admin</p>
            <p>Version 1.0</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
