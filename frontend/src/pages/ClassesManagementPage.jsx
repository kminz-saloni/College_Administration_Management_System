import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchClasses } from '@/store/slices/dashboardSlice'
import ClassesManagementInterface from '@/components/Dashboard/ClassesManagementInterface'
import LoadingSpinner from '@/components/Common/LoadingSpinner'

const ClassesManagementPage = () => {
  const dispatch = useDispatch()
  const { classesLoading, classesError } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  if (classesLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (classesError) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-red-600">
        <h2 className="text-lg font-bold">Error Loading Classes</h2>
        <p>{classesError}</p>
        <button 
          onClick={() => dispatch(fetchClasses())}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Classes Management</h1>
      <ClassesManagementInterface />
    </div>
  )
}

export default ClassesManagementPage
