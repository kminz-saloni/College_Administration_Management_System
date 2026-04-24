import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideos, setFilters, fetchVideoById } from '@/store/slices/videoSlice'
import { fetchClasses } from '@/store/slices/dashboardSlice'
import { Search, Play, Clock, Eye, Filter, Flame, History, Bookmark, Layers, User } from 'lucide-react'
import VideoPlayer from './VideoPlayer'
import { PageSkeleton } from '@/components/Common/LoadingSpinner'

const StudentVideoLibrary = () => {
  const dispatch = useDispatch()
  const { videos = [], loading, filters, currentVideo } = useSelector((state) => state.video)
  const { classes = [] } = useSelector((state) => state.dashboard)
  const [searchInput, setSearchInput] = useState('')
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('browse')

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

  const getPreviewProgress = (video) => {
    const rawProgress = Number(video.viewCount || 0) % 100
    return Math.max(12, rawProgress)
  }

  if (loading && videos.length === 0) return <PageSkeleton />

  return (
    <div className="space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary font-heading tracking-tight">Media Learning Center</h1>
          <p className="text-sm text-text-muted mt-2 max-w-lg">Stream high-definition curriculum content curated specifically for your academic track.</p>
        </div>
        
        <div className="flex bg-surface-2 p-1 rounded-btn border border-border-app">
           {[ 
             { id: 'browse', icon: Layers, label: 'Explore' },
             { id: 'trending', icon: Flame, label: 'Hot' },
             { id: 'history', icon: History, label: 'Recents' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                 activeTab === tab.id 
                   ? 'bg-primary text-white shadow-glow-primary/20' 
                   : 'text-text-muted hover:text-text-secondary'
               }`}
             >
               <tab.icon className="w-3.5 h-3.5" />
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* Hero Recommendation - Only if browse tab and videos exist */}
      {activeTab === 'browse' && videos.length > 0 && (
         <div className="relative group overflow-hidden rounded-3xl aspect-[21/9] md:aspect-[3/1] shadow-2xl border border-white/5">
            <img 
              src={videos[0].thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt="Featured"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
            <div className="absolute inset-y-0 left-0 p-8 md:p-12 flex flex-col justify-center max-w-xl">
               <span className="bg-primary/20 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">Featured Lecture</span>
               <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 group-hover:text-glow-primary transition-all">
                  {videos[0].title}
               </h2>
               <div className="flex items-center gap-6 text-white/60 text-xs font-bold mb-8">
                  <span className="flex items-center gap-2">
                     <User className="w-4 h-4 text-primary" />
                     {videos[0].teacherName || 'Master Faculty'}
                  </span>
                  <span className="flex items-center gap-2">
                     <Clock className="w-4 h-4 text-primary" />
                     {Math.floor((videos[0].duration || 720) / 60)} mins
                  </span>
               </div>
               <button 
                 onClick={() => handlePlayVideo(videos[0]._id)}
                 className="btn-primary w-fit px-10 py-4 flex items-center gap-3 shadow-glow-primary/30 transform transition-transform active:scale-95"
               >
                  <Play className="w-5 h-5 fill-current" />
                  START STREAMING
               </button>
            </div>
         </div>
      )}

      {/* Filters Hub */}
      <div className="card !p-4 bg-surface-1/40 backdrop-blur-md border border-white/5 shadow-inner flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
           <input
             type="text"
             placeholder="Search educational archives..."
             value={searchInput}
             onChange={handleSearch}
             className="input pl-11 w-full !bg-surface-2/40 !border-none text-sm font-medium focus:ring-1 focus:ring-primary/40"
           />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
           <select
             name="subject"
             value={filters.subject || ''}
             onChange={handleFilterChange}
             className="select py-2.5 !bg-surface-2/40 !border-none text-xs font-black uppercase tracking-wider min-w-[140px]"
           >
             <option value="">All Disciplines</option>
             {['Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Biology'].map(sub => (
               <option key={sub} value={sub.toLowerCase()}>{sub}</option>
             ))}
           </select>

           <select
             name="classId"
             value={filters.classId || ''}
             onChange={handleFilterChange}
             className="select py-2.5 !bg-surface-2/40 !border-none text-xs font-black uppercase tracking-wider min-w-[140px]"
           >
             <option value="">Enrollment Cohort</option>
             {classes.map((cls) => (
               <option key={cls._id} value={cls._id}>{cls.name}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-sm font-black text-text-muted uppercase tracking-[0.2em]">Latest Curations</h3>
           <div className="h-px flex-1 mx-6 bg-border-app/50" />
           <span className="text-[10px] font-bold text-text-muted">{videos.length} Results</span>
        </div>

        {videos.length === 0 ? (
          <div className="card py-20 bg-surface-2/30 border-dashed border-border-app flex flex-col items-center justify-center text-center">
            <Bookmark className="w-12 h-12 text-text-muted/20 mb-4" />
            <p className="text-text-muted font-bold">No academic resources found for this criteria.</p>
            <p className="text-xs text-text-muted mt-2">Adjust filters or search query to broaden your discovery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {videos.map((video) => (
              <div
                key={video._id}
                className="group cursor-pointer"
                onClick={() => handlePlayVideo(video._id)}
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-xl border border-white/5">
                  {video.thumbnail ? (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-surface-3 to-surface-2 flex items-center justify-center">
                       <Play className="w-10 h-10 text-white/10 group-hover:text-primary/40 transition-colors" />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                  
                  {/* Progress bar simulation for "watched" effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-primary" style={{ width: `${getPreviewProgress(video)}%` }} />
                  </div>

                  <div className="absolute top-3 left-3 flex gap-2">
                     <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase px-2 py-0.5 rounded border border-white/10">
                        {video.subject || 'Core'}
                     </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                     <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-glow-primary text-white">
                        <Play className="w-6 h-6 fill-current ml-1" />
                     </div>
                  </div>

                  {video.duration && (
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-black tracking-widest border border-white/5">
                      {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                    </div>
                  )}
                </div>

                <div className="px-1">
                   <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                     {video.title}
                   </h4>
                   <div className="flex items-center justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                         <User className="w-3 h-3" />
                         {video.uploadedBy || 'Faculty'}
                      </span>
                      <span className="flex items-center gap-1.5">
                         <Eye className="w-3 h-3" />
                         {video.viewCount || 0}
                      </span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isPlayerOpen && currentVideo && (
        <VideoPlayer video={currentVideo} onClose={() => setIsPlayerOpen(false)} />
      )}
    </div>
  )
}

export default StudentVideoLibrary
