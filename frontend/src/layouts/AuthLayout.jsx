/**
 * Auth Layout
 * Layout component for authentication pages (Login, Register, etc.)
 * No navigation or sidebar required
 */

import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  )
}

export default AuthLayout
