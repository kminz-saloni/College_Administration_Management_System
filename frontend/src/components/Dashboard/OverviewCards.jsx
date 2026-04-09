/**
 * Overview KPI Cards Component
 * Premium card grid for dashboard metrics
 */

import { Users, BookOpen, Clock, TrendingUp, TrendingDown, Minus, GraduationCap } from 'lucide-react'

const OverviewCards = ({ stats = {} }) => {
  // Map backend response properly
  const totalStudents = stats?.usersByRole?.student || 0
  const totalTeachers = stats?.usersByRole?.teacher || 0
  const totalClasses = stats?.totalClasses || 0
  
  const cards = [
    {
      label: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'text-primary',
      bg: 'bg-primary/10',
      change: { value: '+12%', type: 'increase' }
    },
    {
      label: 'Total Teachers',
      value: totalTeachers,
      icon: Users,
      color: 'text-accent',
      bg: 'bg-accent/10',
      change: { value: '+4%', type: 'increase' }
    },
    {
      label: 'Active Classes',
      value: totalClasses,
      icon: BookOpen,
      color: 'text-info',
      bg: 'bg-info/10',
      change: { value: '0%', type: 'neutral' }
    },
    {
      label: 'Avg. Attendance',
      value: stats?.averageAttendance ? `${stats.averageAttendance}%` : '0%',
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
      change: { value: '-2%', type: 'decrease' }
    },
  ]

  // Actual icon mapping to avoid prop drilling issues in some role dashboards
  const getIcon = (label) => {
    switch (label) {
      case 'Total Students': return GraduationCap
      case 'Total Teachers': return Users // Simplified for now
      case 'Active Classes': return BookOpen
      case 'Avg. Attendance': return Clock
      default: return Users
    }
  }

  const TrendIcon = ({ type }) => {
    if (type === 'increase') return <TrendingUp className="w-3 h-3 text-success" />
    if (type === 'decrease') return <TrendingDown className="w-3 h-3 text-danger" />
    return <Minus className="w-3 h-3 text-text-muted" />
  }

  const getTrendColor = (type) => {
    if (type === 'increase') return 'text-success'
    if (type === 'decrease') return 'text-danger'
    return 'text-text-muted'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {cards.map((card, index) => {
        const Icon = getIcon(card.label)
        return (
          <div key={index} className="kpi-card group hover:shadow-glow-primary transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-btn ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-pill bg-surface-2 ${getTrendColor(card.change.type)}`}>
                <TrendIcon type={card.change.type} />
                {card.change.value}
              </div>
            </div>
            <div>
              <p className="kpi-label">{card.label}</p>
              <h3 className="kpi-value">{card.value}</h3>
            </div>
            
            {/* Subtle background decoration */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          </div>
        )
      })}
    </div>
  )
}

export default OverviewCards