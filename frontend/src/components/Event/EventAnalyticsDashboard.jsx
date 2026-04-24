import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEventAnalytics, fetchPopularEvents } from '@/store/slices/eventAnalyticsSlice'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  UserMinus, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react'
import PageHeader from '@/components/Common/PageHeader'
import PageSkeleton from '@/components/Common/PageSkeleton'

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-1 border border-border-app p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 border-b border-white/5 pb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mt-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-sm font-bold text-text-primary">
              {entry.name}: <span className="ml-1 text-primary">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    )
  }

  return null
}

const EventAnalyticsDashboard = () => {
  const dispatch = useDispatch()
  const { eventAnalytics, popularEvents, analyticsLoading, error } = useSelector(
    (state) => state.eventAnalytics
  )

  useEffect(() => {
    dispatch(fetchEventAnalytics({}))
    dispatch(fetchPopularEvents(5))
  }, [dispatch])

  // Colors
  const COLORS = ['#2563EB', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981']
  const CHART_COLORS = {
    primary: '#2563EB',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    danger: '#EF4444',
    success: '#10B981',
    grid: 'rgba(255, 255, 255, 0.05)',
    text: '#94A3B8'
  }

  // Metrics
  const totalEvents = eventAnalytics?.length || 0
  const totalAttendees = eventAnalytics?.reduce((sum, event) => sum + (event.attendees || 0), 0) || 0
  const averageAttendanceRate = eventAnalytics?.length > 0
    ? (eventAnalytics.reduce((sum, event) => sum + (event.attendanceRate || 0), 0) / eventAnalytics.length).toFixed(1)
    : 0
  const noShowRate = 100 - averageAttendanceRate

  if (analyticsLoading && !eventAnalytics) return <PageSkeleton type="dashboard" />

  if (error) {
    return (
      <div className="card border-danger/20 bg-danger/5 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-6">
           <Info className="w-8 h-8 text-danger" />
        </div>
        <h3 className="text-lg font-black text-danger uppercase tracking-widest">Analytics Failure</h3>
        <p className="text-xs text-text-muted mt-2 max-w-md">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Event Intelligence" 
        subtitle="Real-time telemetry and engagement metrics for campus-wide activities"
      />

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Events', val: totalEvents, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10', trend: '+12%', up: true },
          { label: 'Global Reach', val: totalAttendees, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10', trend: '+8.4%', up: true },
          { label: 'Avg Attendance', val: `${averageAttendanceRate}%`, icon: Activity, color: 'text-success', bg: 'bg-success/10', trend: '-2.1%', up: false },
          { label: 'No-Show Index', val: `${noShowRate.toFixed(1)}%`, icon: UserMinus, color: 'text-danger', bg: 'bg-danger/10', trend: '+0.5%', up: false },
        ].map((item, idx) => (
          <div key={idx} className="card relative overflow-hidden group">
             <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-2xl ${item.bg} ${item.color}`}>
                   <item.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black tracking-widest ${item.up ? 'text-success' : 'text-danger'}`}>
                   {item.trend}
                   {item.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </div>
             </div>
             <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.label}</p>
                <h4 className="text-3xl font-black text-text-primary mt-1 tracking-tight">{item.val}</h4>
             </div>
             <div className="absolute -bottom-1 -right-1 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Attendance Distribution */}
        <div className="lg:col-span-8 card">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Attendance Flux</h3>
                 <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-tighter">Attended vs Neutral vs No-Show (Top 10)</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-success" />
                    <span className="text-[9px] font-black text-text-muted tracking-widest">ATTENDED</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-danger" />
                    <span className="text-[9px] font-black text-text-muted tracking-widest">NO-SHOW</span>
                 </div>
              </div>
           </div>

           <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart
                 data={eventAnalytics?.slice(0, 10).map(e => ({
                   name: (e.name || 'Event').toUpperCase().slice(0, 10),
                   Attended: Math.round((e.attendees * (e.attendanceRate || 50)) / 100),
                   'No-Show': Math.round(e.attendees * (1 - (e.attendanceRate || 50) / 100)),
                 }))}
                 barGap={8}
               >
                 <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                 <XAxis 
                   dataKey="name" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 9, fontWeight: 900, fill: CHART_COLORS.text }} 
                   dy={10}
                 />
                 <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 9, fontWeight: 900, fill: CHART_COLORS.text }} 
                 />
                 <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                 <Bar dataKey="Attended" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} barSize={20} />
                 <Bar dataKey="No-Show" fill={CHART_COLORS.danger} radius={[4, 4, 0, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Popularity Matrix */}
        <div className="lg:col-span-4 card">
           <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-10">Popularity Vector</h3>
           <div className="h-[300px] relative">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={popularEvents?.map(e => ({ name: e.name || 'Unknown', value: e.attendees || 0 }))}
                   innerRadius={65}
                   outerRadius={95}
                   paddingAngle={8}
                   dataKey="value"
                 >
                   {popularEvents?.map((_, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                   ))}
                 </Pie>
                 <Tooltip content={<ChartTooltip />} />
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">TOTAL</span>
                <span className="text-2xl font-black text-text-primary tracking-tighter">{totalAttendees}</span>
             </div>
           </div>

           <div className="mt-8 space-y-3">
              {popularEvents?.slice(0, 3).map((e, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-surface-2/40 rounded-xl border border-border-app/50">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                       <span className="text-[11px] font-bold text-text-primary truncate max-w-[120px]">{e.name}</span>
                    </div>
                    <span className="text-[11px] font-black text-primary">{e.attendees} PAX</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Granular Data Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-6 border-b border-border-app flex justify-between items-center bg-surface-2/20">
           <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Granular Performance Matrix</h3>
           <button className="text-[10px] font-black text-primary tracking-widest bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20 transition-all">EXPORT JSON</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-2/40 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-app">
                <th className="px-6 py-4 text-left">Event Designation</th>
                <th className="px-6 py-4 text-left">Classification</th>
                <th className="px-6 py-4 text-center">Engagement (PAX)</th>
                <th className="px-6 py-4 text-center">Efficiency Flux</th>
                <th className="px-6 py-4 text-center">Deviation (No-Shows)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-app/30">
              {eventAnalytics?.map((event) => (
                <tr key={event._id || event.id} className="hover:bg-surface-2/20 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{event.name}</p>
                    <p className="text-[10px] text-text-muted font-medium mt-0.5">ID: {event._id?.slice(-8)}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="badge badge-secondary text-[9px] font-black py-0.5 tracking-widest">{(event.type || 'GENERAL').toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-5 text-center text-sm font-black text-text-primary">
                    {event.attendees || 0}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-surface-3 overflow-hidden">
                        <div
                          className="h-full bg-success shadow-glow-success/20 transition-all duration-1000"
                          style={{ width: `${event.attendanceRate || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-success">
                        {event.attendanceRate || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center text-sm font-bold text-danger">
                    {Math.round(((event.attendees || 0) * (100 - (event.attendanceRate || 0))) / 100)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default EventAnalyticsDashboard
