import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideos } from '@/store/slices/videoSlice'
import StudentVideoLibrary from '@/components/Video/StudentVideoLibrary'
import VideoLibrary from '@/components/Video/VideoLibrary'
import LoadingSpinner from '@/components/Common/LoadingSpinner'

const VideoLibraryPage = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="p-0">
      {user?.role === 'student' ? <StudentVideoLibrary /> : <VideoLibrary />}
    </div>
  )
}

export default VideoLibraryPage
