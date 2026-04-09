/**
 * Premium Sidebar Component
 * Dark, grouped navigation with Lucide icons
 * Features:
 * - Role-based navigation sections
 * - Active route highlighting with accent bar
 * - Collapsible submenu items
 * - Mobile responsive with overlay
 * - Icon + label layout with section grouping
 * - Collapse mode support
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar, toggleSidebarCollapsed } from '@/store/slices/uiSlice'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  CheckSquare,
  Video,
  Upload,
  Library,
  CreditCard,
  GraduationCap,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Calendar,
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { sidebarOpen, sidebarCollapsed } = useSelector((state) => state.ui)
  const [expandedMenu, setExpandedMenu] = useState(null)

  const getMenuSections = () => {
    const sections = {
      admin: [
        {
          title: 'Overview',
          items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
            { 
              icon: Calendar, 
              label: 'Events', 
              href: '/admin/events',
              submenu: [
                { label: 'Event List', href: '/admin/events/list' },
                { label: 'Calendar', href: '/admin/events/calendar' },
                { label: 'Analytics', href: '/admin/events/analytics' },
              ]
            },
          ],
        },
        {
          title: 'Management',
          items: [
            { icon: Users, label: 'Users', href: '/admin/users' },
            { icon: BookOpen, label: 'Classes', href: '/admin/classes' },
            { 
              icon: Library, 
              label: 'Video Library', 
              href: '/admin/videos',
              submenu: [
                { label: 'Browse All', href: '/admin/videos/library' },
                { label: 'Upload New', href: '/admin/videos/upload' },
              ]
            },
          ],
        },
        {
          title: 'System',
          items: [
            { icon: Settings, label: 'Settings', href: '/admin/settings' },
          ],
        },
      ],
      teacher: [
        {
          title: 'Overview',
          items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher/dashboard' },
            { 
              icon: BarChart3, 
              label: 'Analytics', 
              href: '/teacher/analytics',
              submenu: [
                { label: 'Reports', href: '/teacher/analytics/reports' },
              ]
            },
          ],
        },
        {
          title: 'Teaching',
          items: [
            { icon: BookOpen, label: 'Classes', href: '/teacher/classes' },
            { icon: CheckSquare, label: 'Attendance', href: '/teacher/attendance' },
            { icon: Video, label: 'Videos', href: '/teacher/videos',
              submenu: [
                { label: 'Upload Video', href: '/teacher/videos/upload' },
                { label: 'My Videos', href: '/teacher/videos/library' },
              ],
            },
            { icon: Calendar, label: 'Events Hub', href: '/teacher/events' },
          ],
        },
        {
          title: 'System',
          items: [
            { icon: Settings, label: 'Settings', href: '/teacher/settings' },
          ],
        },
      ],
      student: [
        {
          title: 'Overview',
          items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard' },
          ],
        },
        {
          title: 'Academic',
          items: [
            { icon: BookOpen, label: 'Classes', href: '/student/classes' },
            { icon: CheckSquare, label: 'Attendance', href: '/student/attendance' },
            { icon: Video, label: 'Lessons', href: '/student/videos' },
            { icon: Calendar, label: 'Calendar', href: '/student/events' },
          ],
        },
        {
          title: 'Finance',
          items: [
            { icon: CreditCard, label: 'Payments', href: '/student/payments' },
          ],
        },
        {
          title: 'System',
          items: [
            { icon: Settings, label: 'Settings', href: '/student/settings' },
          ],
        },
      ],
    }

    return sections[user?.role] || []
  }

  const isLinkActive = (href) => {
    if (href === `/${user?.role}/dashboard`) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  const menuSections = getMenuSections()

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="overlay lg:hidden animate-fade-in"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-surface-1 border-r border-border-app overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out z-50 flex flex-col
          ${sidebarCollapsed ? 'w-[68px]' : 'w-64'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-border-app/50 flex-shrink-0 ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 bg-gradient-premium rounded-btn flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <h1 className="text-base font-bold text-text-primary font-heading tracking-tight">CampusFlow</h1>
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-widest">Admin Suite</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 space-y-1 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className={sIdx > 0 ? 'mt-6' : ''}>
              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-text-muted/60 uppercase tracking-widest">
                  {section.title}
                </p>
              )}
              {sidebarCollapsed && sIdx > 0 && <div className="divider !my-3" />}

              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <div key={item.href}>
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() =>
                            setExpandedMenu(expandedMenu === item.href ? null : item.href)
                          }
                          className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-btn text-sm font-medium transition-all duration-200 group ${
                            isLinkActive(item.href)
                              ? 'bg-primary/10 text-primary-400'
                              : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
                          }`}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <span className="flex items-center gap-3">
                            <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isLinkActive(item.href) ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`} />
                            {!sidebarCollapsed && item.label}
                          </span>
                          {!sidebarCollapsed && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                expandedMenu === item.href ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </button>

                        {/* Submenu Items */}
                        {!sidebarCollapsed && expandedMenu === item.href && (
                          <div className="mt-1 ml-5 space-y-0.5 border-l border-border-app/50 pl-3 animate-slide-up">
                            {item.submenu.map((subitem) => (
                              <Link
                                key={subitem.href}
                                to={subitem.href}
                                onClick={() => dispatch(toggleSidebar())}
                                className={`block px-3 py-2 rounded-btn text-sm transition-all duration-200 ${
                                  isLinkActive(subitem.href)
                                    ? 'text-primary-400 font-medium bg-primary/5'
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                                }`}
                              >
                                {subitem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={() => dispatch(toggleSidebar())}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-all duration-200 group relative ${
                          isLinkActive(item.href)
                            ? 'bg-primary/10 text-primary-400'
                            : 'text-text-muted hover:bg-surface-2 hover:text-text-primary'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        {isLinkActive(item.href) && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
                        )}
                        <item.icon className={`w-[18px] h-[18px] flex-shrink-0 ${isLinkActive(item.href) ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'}`} />
                        {!sidebarCollapsed && item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className={`flex-shrink-0 border-t border-border-app/50 p-3 ${sidebarCollapsed ? 'text-center' : ''}`}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-btn bg-surface-2/50 mb-3">
              <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-secondary truncate">CampusFlow v2.0</p>
                <p className="text-[10px] text-text-muted">© 2026</p>
              </div>
            </div>
          )}
          <button
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className="hidden lg:flex items-center justify-center w-full p-2 rounded-btn text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
