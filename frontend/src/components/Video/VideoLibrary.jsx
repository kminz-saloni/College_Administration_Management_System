import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideos, deleteVideo, setFilters } from '@/store/slices/videoSlice'
import { fetchClasses } from '@/store/slices/dashboardSlice'
import { showToast } from '@/store/slices/notificationSlice'
import {
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

const VideoLibrary = () => {
  const dispatch = useDispatch()
  const { videos, loading, filters } = useSelector((state) => state.video)
  const { classes } = useSelector((state) => state.dashboard)
  const [searchInput, setSearchInput] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    dispatch(fetchVideos(filters))
  }, [dispatch, filters])

  useEffect(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchInput(value)
    dispatch(setFilters({ searchTerm: value }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    dispatch(setFilters({ [name]: value }))
  }

  const handleDelete = async (videoId) => {
    try {
      await dispatch(deleteVideo(videoId))
      dispatch(
        showToast({
          message: 'Video deleted successfully',
          type: 'success',
        })
      )
      setDeleteConfirm(null)
    } catch (_err) {
      dispatch(
        showToast({
          message: 'Failed to delete video',
          type: 'error',
        })
      )
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block">
            <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-600">Loading videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Video Library</h1>
          <p className="text-gray-600">Manage your uploaded videos</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchInput}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Subject Filter */}
            <select
              name="subject"
              value={filters.subject}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Subjects</option>
              <option value="mathematics">Mathematics</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="english">English</option>
              <option value="history">History</option>
              <option value="biology">Biology</option>
            </select>

            {/* Class Filter */}
            <select
              name="classId"
              value={filters.classId}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Videos List */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-xl text-gray-500">No videos found. Upload your first video to get started!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {videos.map((video) => (
                    <tr key={video._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {video.thumbnail && (
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {video.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {video.subject || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {video.class || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            video.status === 'published'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {video.status || 'draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="h-4 w-4" />
                          <span>{video.viewCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(video.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button className="text-blue-600 hover:text-blue-800 transition">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          {deleteConfirm === video._id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDelete(video._id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(video._id)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoLibrary
