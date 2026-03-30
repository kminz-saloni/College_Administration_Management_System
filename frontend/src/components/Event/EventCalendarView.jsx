import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEventCalendarData } from '@/store/slices/eventAnalyticsSlice'
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/solid'

/**
 * EventCalendarView - Interactive calendar for browsing events by date
 * Phase 5: Advanced event management feature
 */
const EventCalendarView = () => {
  const dispatch = useDispatch()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const { calendarData, analyticsLoading } = useSelector((state) => state.eventAnalytics)

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Fetch calendar data when month/year changes
  useEffect(() => {
    dispatch(
      fetchEventCalendarData({
        month: currentMonth + 1,
        year: currentYear,
      })
    )
  }, [currentMonth, currentYear, dispatch])

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

  // Create calendar grid
  const days = []
  
  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i),
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentYear, currentMonth, i),
    })
  }

  // Next month days
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentYear, currentMonth + 1, i),
    })
  }

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!Array.isArray(calendarData)) return []
    return calendarData.filter((event) => {
      const eventDate = new Date(event.date || event.eventDateTime)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
    setSelectedDate(null)
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
    setSelectedDate(null)
  }

  // Format month/year string
  const monthYearString = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // Get selected date events
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      {/* Header */}
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
          <CalendarIcon className="h-6 w-6 text-blue-500" />
          Event Calendar
        </h2>
        <p className="mt-1 text-sm text-gray-600">Browse events by date</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          {/* Month/Year Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-semibold text-gray-800">{monthYearString}</h3>
            <button
              onClick={goToNextMonth}
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="mb-2 grid grid-cols-7 gap-0 bg-blue-50 p-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="flex justify-center p-2 font-bold text-blue-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="space-y-0 border border-gray-200">
            {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200">
                {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((dayObj, dayIndex) => {
                  const dayEvents = dayObj.isCurrentMonth ? getEventsForDate(dayObj.date) : []
                  const isSelected =
                    selectedDate &&
                    selectedDate.getDate() === dayObj.date.getDate() &&
                    selectedDate.getMonth() === dayObj.date.getMonth() &&
                    selectedDate.getFullYear() === dayObj.date.getFullYear()

                  return (
                    <button
                      key={dayIndex}
                      onClick={() => setSelectedDate(dayObj.date)}
                      className={`min-h-24 border-r border-gray-200 p-2 text-left transition-colors ${
                        !dayObj.isCurrentMonth ? 'bg-gray-50' : ''
                      } ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'} ${
                        dayIndex === 6 ? 'border-r-0' : ''
                      }`}
                    >
                      <div
                        className={`inline-block rounded px-2 py-1 text-sm font-semibold ${
                          dayObj.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {dayObj.day}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event, idx) => (
                            <div
                              key={idx}
                              className="truncate rounded bg-blue-100 px-1 py-0.5 text-xs text-blue-700"
                            >
                              {event.name || event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="lg:col-span-1">
          {selectedDate ? (
            <div className="rounded-lg border border-gray-200 p-4">
              <h4 className="mb-4 font-semibold text-gray-800">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </h4>

              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map((event) => (
                    <div key={event._id || event.id} className="rounded-lg bg-blue-50 p-3">
                      <p className="font-semibold text-gray-800">
                        {event.name || event.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        {event.time || new Date(event.eventDateTime).toLocaleTimeString()}
                      </p>
                      {event.location && (
                        <p className="mt-1 text-xs text-gray-600">{event.location}</p>
                      )}
                      {event.type && (
                        <span className="mt-2 inline-block rounded-full bg-blue-200 px-2 py-1 text-xs font-semibold text-blue-800">
                          {event.type}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No events scheduled</p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600">Select a date to view events</p>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {analyticsLoading && (
        <div className="mt-4 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600"></div>
        </div>
      )}
    </div>
  )
}

export default EventCalendarView
