/**
 * Main Layout Component
 * Wrapper layout for all authenticated pages (Admin, Teacher, Student dashboards)
 * Features:
 * - Header component (top navigation)
 * - Sidebar component (left navigation)
 * - Main content area with dynamic page outlet
 * - Responsive design (mobile, tablet, desktop)
 * - Consistent spacing and styling
 */

import { Outlet } from 'react-router-dom'
import Header from '@/components/Common/Header'
import Sidebar from '@/components/Common/Sidebar'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content Wrapper */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-auto">
          {/* Content Container with padding */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Page Content Outlet */}
            <Outlet />
          </div>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-12 py-6">
            <div className="max-w-full px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                <p>© 2026 College Administration Management System</p>
                <div className="flex gap-4 mt-4 sm:mt-0">
                  <a href="#" className="hover:text-gray-900">
                    Privacy
                  </a>
                  <a href="#" className="hover:text-gray-900">
                    Terms
                  </a>
                  <a href="#" className="hover:text-gray-900">
                    Support
                  </a>
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
