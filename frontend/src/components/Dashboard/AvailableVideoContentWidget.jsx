import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { api } from '@/services'
import { PlayIcon, ClockIcon, EyeIcon, Trash2, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

const AvailableVideoContentWidget = () => {
  const { user } = useSelector((state) => state.auth || {})
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeacherVideos = async () => {
      try {
        setLoading(true)
        // Fetch videos uploaded by the teacher
        const response = await api.get('/videos', { params: { teacher: user?.id } })
        
        if (response.data?.data?.videos) {
          setVideos(response.data.data.videos)
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error)
        toast.error('Failed to load videos')
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'teacher') {
      fetchTeacherVideos()
    }
  }, [user])

  const handleDelete = (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      // TODO: Implement delete functionality
      toast.success('Video deleted successfully')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Video Content</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Upload New Video
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <PlayIcon className="h-12 w-12 mx-auto mb-4" />
          <p>No video content uploaded yet</p>
          <p className="text-sm">Start by uploading your first video</p>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <div key={video._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center flex-1">
                <div className="p-3 bg-blue-100 rounded-full mr-4">
                  <PlayIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{video.title}</h3>
                  <p className="text-sm text-gray-600">{video.subject}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {video.duration || '0 min'}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      {video.views || 0} views
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(video._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AvailableVideoContentWidget