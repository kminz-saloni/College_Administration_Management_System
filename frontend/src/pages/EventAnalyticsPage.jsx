import React from 'react'
import EventAnalyticsDashboard from '@/components/Event/EventAnalyticsDashboard'

/**
 * EventAnalyticsPage - Page-level wrapper for event analytics dashboard
 * Route: /events/analytics
 */
const EventAnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <EventAnalyticsDashboard />
    </div>
  )
}

export default EventAnalyticsPage
