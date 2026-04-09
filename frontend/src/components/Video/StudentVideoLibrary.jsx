import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideos, setFilters, fetchVideoById } from '@/store/slices/videoSlice'
import { fetchClasses } from '@/store/slices/dashboardSlice'
import { MagnifyingGlassIcon, PlayIcon } from '@heroicons/react/24/outline'
import VideoPlayer from './VideoPlayer'

const StudentVideoLibrary = () => {
  const dispatch = useDispatch()
  const { videos, loading, filters, currentVideo } = useSelector((state) => state.video)
  const { classes } = useSelector((state) => state.dashboard)
  const [searchInput, setSearchInput] = useState('')
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

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

  const handlePlayVideo = async (videoId) => {
    await dispatch(fetchVideoById(videoId))
    setIsPlayerOpen(true)
  }

  if (loading && videos.length === 0) {
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
          <p className="text-gray-600">Access learning materials for your classes</p>
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

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-xl text-gray-500">No videos available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                {/* Thumbnail */}
                <div className="relative bg-gray-200 h-40 overflow-hidden group">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:opacity-70 transition"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                      <PlayIcon className="h-12 w-12 text-gray-500" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <button
                    onClick={() => handlePlayVideo(video._id)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition"
                  >
                    <div className="bg-blue-600 rounded-full p-4 transform group-hover:scale-110 transition">
                      <PlayIcon className="h-8 w-8 text-white" />
                    </div>
                  </button>

                  {/* Duration */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-semibold">
                      {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                    {video.title}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {video.subject}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {video.class}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {video.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                    <span>{video.viewCount || 0} views</span>
                    <span>
                      {video.uploadedBy || 'Teacher'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Video Player Modal */}
        {isPlayerOpen && currentVideo && (
          <VideoPlayer video={currentVideo} onClose={() => setIsPlayerOpen(false)} />
        )}
      </div>
    </div>
  )
}

export default StudentVideoLibrary
