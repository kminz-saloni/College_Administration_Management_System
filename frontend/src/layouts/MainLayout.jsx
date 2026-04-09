/**
 * Main Layout Component
 * Premium dark app shell with sidebar + header + content
 * Features:
 * - Fixed sidebar with collapse support
 * - Sticky header with blur backdrop
 * - Main content area with proper spacing
 * - Smooth responsive behavior
 */

import { useSelector } from 'react-redux'
import { Outlet } from 'react-router-dom'
import Header from '@/components/Common/Header'
import Sidebar from '@/components/Common/Sidebar'

const MainLayout = () => {
  const { sidebarCollapsed } = useSelector((state) => state.ui)

  return (
    <div className="min-h-screen bg-app">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper — offset by sidebar width (responsive to collapse) */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
      }`}>
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="border-t border-border-app/30 mt-12 py-6">
            <div className="max-w-full px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-text-muted gap-4">
                <p>© 2026 CampusFlow — College Administration Management System</p>
                <div className="flex gap-6">
                  <a href="#" className="hover:text-text-secondary transition-colors">Privacy</a>
                  <a href="#" className="hover:text-text-secondary transition-colors">Terms</a>
                  <a href="#" className="hover:text-text-secondary transition-colors">Support</a>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
