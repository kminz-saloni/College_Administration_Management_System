import React from 'react'
import EventCalendarView from '@/components/Event/EventCalendarView'

/**
 * EventCalendarPage - Page-level wrapper for event calendar view
 * Route: /events/calendar
 */
const EventCalendarPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <EventCalendarView />
    </div>
  )
}

export default EventCalendarPage
