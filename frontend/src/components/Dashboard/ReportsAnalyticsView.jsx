/**
 * Reports & Analytics View — Premium Dark Theme
 * Features:
 * - KPIs with trend indicators
 * - Sleek Recharts integration (Line, Bar, Pie)
 * - Heatmap styling
 * - Report generation interface
 * - Recent reports list
 */

import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts'
import {
  BarChart3,
  Clock,
  Users,
  TrendingUp,
  Filter,
  Download,
  Calendar,
  AlertCircle,
  FileText,
  ChevronRight,
  Layers,
  CheckCircle,
} from 'lucide-react'

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-1 border border-border-app p-3 rounded-lg shadow-dropdown animate-scale-in">
        <p className="text-xs font-bold text-text-primary mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <p className="text-xs text-text-muted">
              <span className="capitalize">{entry.name}:</span>
              <span className="ml-2 font-medium text-text-secondary">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    )
  }

  return null
}

const ReportsAnalyticsView = ({ onGenerateReport, userRole }) => {
  const [reportType, setReportType] = useState('video')
  const [reportPeriod, setReportPeriod] = useState('last30days')

  const { reports = [] } = useSelector((state) => state.dashboard || {})
  const analytics = useSelector((state) => state.analytics || {})

  const {
    summary = {},
    trendData = [],
    videos = [],
    engagementBreakdown = [],
    peakTimeHeatmap = [],
    peakWatchSummary = {},
    hourlyWatchBreakdown = [],
    attendanceSummary = {},
    attendanceByClass = [],
    chronicAbsentees = [],
    revenueSummary = {},
    availableReports = [],
    generatedReport = null,
    usingFallbackData = false,
  } = analytics

  const reportItems = [
    {
      title: 'Total Views',
      value: (summary.totalViews || 0).toLocaleString(),
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Watch Time',
      value: `${(summary.totalWatchTime || 0).toLocaleString()} min`,
      icon: Clock,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Active Students',
      value: (summary.activeStudents || 0).toLocaleString(),
      icon: Users,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      title: 'Engagement Rate',
      value: `${summary.engagementRate || 0}%`,
      icon: BarChart3,
      color: 'text-info',
      bg: 'bg-info/10',
    },
  ]

  const topVideos = Array.isArray(videos) ? videos.slice(0, 5) : []
  const classAttendance = Array.isArray(attendanceByClass) ? attendanceByClass.slice(0, 6) : []

  // Custom theme colors for charts
  const CHART_COLORS = {
    primary: '#2563EB',
    accent: '#14B8A6',
    info: '#38BDF8',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    text: '#94A3B8',
    border: '#334155',
  }
  
  const pieColors = [CHART_COLORS.success, CHART_COLORS.primary, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.accent]

  const reportsCatalog = useMemo(() => {
    if (Array.isArray(availableReports) && availableReports.length > 0) return availableReports
    return [
      { id: 'video', name: 'Video Performance Report' },
      { id: 'engagement', name: 'Student Engagement Report' },
      { id: 'attendance', name: 'Attendance Report' },
      { id: 'comprehensive', name: 'Comprehensive Report' },
    ]
  }, [availableReports])

  const getHeatColor = (value) => {
    if (value >= 40) return 'bg-primary text-white'
    if (value >= 30) return 'bg-primary/70 text-white'
    if (value >= 20) return 'bg-primary/40 text-text-primary'
    if (value >= 10) return 'bg-primary/20 text-text-secondary'
    return 'bg-surface-3 text-text-muted'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary font-heading">Reports & Analytics</h2>
          <p className="text-sm text-text-muted mt-1">Deep dive into system performance and engagement</p>
        </div>
        
        <div className="flex items-center gap-3">
          {usingFallbackData && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-pill bg-warning/10 text-warning text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              Fallback Data Active
            </div>
          )}
          <button className="btn-secondary btn-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportItems.map((item, index) => (
          <div key={index} className="card p-5 group hover:shadow-glow-primary transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-btn ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{item.title}</p>
                <h3 className="text-xl font-bold text-text-primary font-heading mt-0.5">{item.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Area Chart */}
        <div className="card">
          <h3 className="text-base font-bold text-text-primary font-heading mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Daily Viewership Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} vertical={false} />
                <XAxis dataKey="period" stroke={CHART_COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={CHART_COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="views" stroke={CHART_COLORS.primary} strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" name="Views" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Videos Bar Chart */}
        <div className="card">
          <h3 className="text-base font-bold text-text-primary font-heading mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            Top Performing Videos
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVideos} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="title" width={100} stroke={CHART_COLORS.text} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="views" fill={CHART_COLORS.accent} radius={[0, 4, 4, 0]} barSize={20} name="Total Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Pie Chart */}
        <div className="card">
          <h3 className="text-base font-bold text-text-primary font-heading mb-6 flex items-center gap-2">
            <Layers className="w-4 h-4 text-info" />
            Engagement Distribution
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Array.isArray(engagementBreakdown) ? engagementBreakdown : []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {(Array.isArray(engagementBreakdown) ? engagementBreakdown : []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap */}
        <div className="card">
          <h3 className="text-base font-bold text-text-primary font-heading mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-warning" />
            Peak Viewing Activity
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest pl-16">
              <span>08-12</span>
              <span>12-16</span>
              <span>16-20</span>
              <span>20-24</span>
            </div>
            {(Array.isArray(peakTimeHeatmap) ? peakTimeHeatmap : []).map((row) => (
              <div key={row.day} className="flex items-center gap-4">
                <span className="w-12 text-xs font-bold text-text-secondary">{row.day}</span>
                <div className="flex-1 grid grid-cols-4 gap-2">
                  {(Array.isArray(row.slots) ? row.slots : []).map((value, idx) => (
                    <div
                      key={`${row.day}-${idx}`}
                      className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all hover:scale-105 cursor-help ${getHeatColor(value)}`}
                      title={`${value} active views`}
                    >
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 p-3 bg-surface-2 rounded-input border border-border-app/50">
             <div className="text-center">
                <p className="text-[10px] text-text-muted mb-0.5">Peak Hour</p>
                <p className="text-sm font-bold text-text-primary">{peakWatchSummary.hour}</p>
             </div>
             <div className="w-px h-8 bg-border-app/50" />
             <div className="text-center">
                <p className="text-[10px] text-text-muted mb-0.5">Max Views</p>
                <p className="text-sm font-bold text-text-primary">{peakWatchSummary.viewCount}</p>
             </div>
             <div className="w-px h-8 bg-border-app/50" />
             <div className="text-center">
                <p className="text-[10px] text-text-muted mb-0.5">Unique Viewers</p>
                <p className="text-sm font-bold text-text-primary">{peakWatchSummary.viewerCount}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Generate Report Card */}
      <div className="card !bg-gradient-to-r from-surface-1 to-surface-2">
        <h3 className="text-base font-bold text-text-primary font-heading mb-4">Generate Custom Intelligence Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              className="select pl-10 w-full"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {reportsCatalog.map((report) => (
                <option key={report.id} value={report.id}>{report.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <select
              className="select pl-10 w-full"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <option value="last30days">Last 30 Days</option>
              <option value="last90days">Last 90 Days</option>
              <option value="custom">Custom Window</option>
            </select>
          </div>

          <button
            onClick={() => onGenerateReport?.(reportType, reportPeriod)}
            className="btn-primary md:col-span-2"
          >
            Generate Intelligence Report
          </button>
        </div>

        {generatedReport && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-input flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-bold text-text-primary">{generatedReport.title || 'Report Ready'}</p>
                <p className="text-xs text-text-muted">Generated at {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <button className="btn-secondary btn-sm">Download</button>
          </div>
        )}
      </div>

      {/* Recent Activity / Reports */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-text-primary font-heading">Recent Reports Archive</h3>
          <button className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors">View All Archive</button>
        </div>
        <div className="space-y-3">
          {Array.isArray(reports) && reports.length > 0 ? (
            reports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-surface-2 rounded-xl border border-border-app/50 hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-surface-3 text-text-muted group-hover:text-primary transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{report.title}</h4>
                    <p className="text-xs text-text-muted mt-0.5">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-text-secondary">{report.date}</p>
                    <p className="text-[10px] text-text-muted uppercase">PDF Exported</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state py-8">
              <p className="text-sm text-text-muted">No reports found in archive</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsAnalyticsView