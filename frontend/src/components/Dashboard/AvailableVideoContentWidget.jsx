import React from 'react'
import { PlayIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline'

const AvailableVideoContentWidget = () => {
  // Mock video data - in real app, this would come from videos API
  const videos = [
    {
      id: 1,
      title: 'Introduction to Algebra',
      subject: 'Mathematics',
      duration: '45 min',
      views: 234,
      uploadDate: '2024-03-10'
    },
    {
      id: 2,
      title: 'Basic Chemistry Concepts',
      subject: 'Chemistry',
      duration: '32 min',
      views: 189,
      uploadDate: '2024-03-08'
    },
    {
      id: 3,
      title: 'World History Overview',
      subject: 'History',
      duration: '58 min',
      views: 156,
      uploadDate: '2024-03-05'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Available Video Content</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Upload New Video
        </button>
      </div>

      <div className="space-y-4">
        {videos.map((video) => (
          <div key={video.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
                    {video.duration}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <EyeIcon className="h-3 w-3 mr-1" />
                    {video.views} views
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Edit
              </button>
              <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <PlayIcon className="h-12 w-12 mx-auto mb-4" />
          <p>No video content uploaded yet</p>
          <p className="text-sm">Start by uploading your first video</p>
        </div>
      )}
    </div>
  )
}

export default AvailableVideoContentWidget