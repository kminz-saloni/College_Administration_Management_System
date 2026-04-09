import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { uploadVideo } from '@/store/slices/videoSlice'
import { showToast } from '@/store/slices/notificationSlice'
import { CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { fetchClasses } from '@/store/slices/dashboardSlice'
import { useEffect } from 'react'

const VideoUploadScreen = () => {
  const dispatch = useDispatch()
  const { loading, uploadProgress, error } = useSelector((state) => state.video)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    classId: '',
    file: null,
    thumbnail: null,
    status: 'draft',
  })
  const [fileName, setFileName] = useState('')
  const [thumbnailName, setThumbnailName] = useState('')
  const { classes, classesLoading } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchClasses())
  }, [dispatch])

  const supportedFormats = ['mp4', 'webm', 'mov', 'avi', 'mkv']
  const maxFileSize = 500 * 1024 * 1024 // 500 MB

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    if (type === 'video') {
      const fileExtension = file.name.split('.').pop().toLowerCase()
      if (!supportedFormats.includes(fileExtension)) {
        dispatch(
          showToast({
            message: `Unsupported format. Supported: ${supportedFormats.join(', ')}`,
            type: 'error',
          })
        )
        return
      }

      if (file.size > maxFileSize) {
        dispatch(
          showToast({
            message: 'File size exceeds 500 MB limit',
            type: 'error',
          })
        )
        return
      }

      setFormData((prev) => ({
        ...prev,
        file,
      }))
      setFileName(file.name)
    } else if (type === 'thumbnail') {
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(file.name.split('.').pop().toLowerCase())) {
        dispatch(
          showToast({
            message: 'Thumbnail must be JPG, PNG, or WebP',
            type: 'error',
          })
        )
        return
      }

      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }))
      setThumbnailName(file.name)
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      dispatch(showToast({ message: 'Please enter video title', type: 'error' }))
      return false
    }

    if (!formData.description.trim()) {
      dispatch(showToast({ message: 'Please enter video description', type: 'error' }))
      return false
    }

    if (!formData.subject) {
      dispatch(showToast({ message: 'Please select subject', type: 'error' }))
      return false
    }

    if (!formData.classId) {
      dispatch(showToast({ message: 'Please select class', type: 'error' }))
      return false
    }

    if (!formData.file) {
      dispatch(showToast({ message: 'Please select video file', type: 'error' }))
      return false
    }

    return true
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    const uploadFormData = new FormData()
    uploadFormData.append('title', formData.title)
    uploadFormData.append('description', formData.description)
    uploadFormData.append('subject', formData.subject)
    uploadFormData.append('classId', formData.classId)
    uploadFormData.append('status', formData.status)
    uploadFormData.append('file', formData.file)
    if (formData.thumbnail) {
      uploadFormData.append('thumbnail', formData.thumbnail)
    }

    try {
      const result = await dispatch(uploadVideo(uploadFormData))
      if (result.payload) {
        dispatch(
          showToast({
            message: 'Video uploaded successfully!',
            type: 'success',
          })
        )
        // Reset form
        setFormData({
          title: '',
          description: '',
          subject: '',
          classId: '',
          file: null,
          thumbnail: null,
          status: 'draft',
        })
        setFileName('')
        setThumbnailName('')
      }
    } catch (_err) {
      dispatch(
        showToast({
          message: error || 'Failed to upload video',
          type: 'error',
        })
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Video</h1>
          <p className="text-gray-600 mb-8">Share educational content with your classes</p>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Video Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter video title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter video description"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Subject and Class */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Subject</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="english">English</option>
                  <option value="history">History</option>
                  <option value="biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  disabled={classesLoading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Class</option>
                  {classes && classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - {cls.subject || 'All Subjects'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File * (Max 500MB)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
                <input
                  type="file"
                  accept={supportedFormats.map((f) => `.${f}`).join(',')}
                  onChange={(e) => handleFileSelect(e, 'video')}
                  className="hidden"
                  id="videoFile"
                  disabled={loading}
                />
                <label htmlFor="videoFile" className="cursor-pointer">
                  <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">
                    {fileName || 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: {supportedFormats.join(', ')}
                  </p>
                </label>
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={(e) => handleFileSelect(e, 'thumbnail')}
                  className="hidden"
                  id="thumbnailFile"
                  disabled={loading}
                />
                <label htmlFor="thumbnailFile" className="cursor-pointer">
                  <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">
                    {thumbnailName || 'Click to upload thumbnail'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, or WebP</p>
                </label>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Draft (Not Published)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Published</span>
                </label>
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading... {uploadProgress}%
                </span>
              ) : (
                'Upload Video'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VideoUploadScreen
