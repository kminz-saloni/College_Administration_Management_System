import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsers } from '@/store/slices/dashboardSlice'
import UsersManagementTable from '@/components/Dashboard/UsersManagementTable'
import LoadingSpinner from '@/components/Common/LoadingSpinner'

const UsersManagementPage = () => {
  const dispatch = useDispatch()
  const { usersLoading, usersError } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  if (usersLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (usersError) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-red-600">
        <h2 className="text-lg font-bold">Error Loading Users</h2>
        <p>{usersError}</p>
        <button 
          onClick={() => dispatch(fetchUsers())}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <UsersManagementTable />
    </div>
  )
}

export default UsersManagementPage
