import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { rescheduleEvent } from '@/store/slices/eventAnalyticsSlice'
import { showToast } from '@/store/slices/notificationSlice'
import { XMarkIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/solid'

/**
 * EventRescheduleForm - Modal form for rescheduling events
 * Phase 5: Event rescheduling with attendee notifications
 */
const EventRescheduleForm = ({ event, onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  // Format current event date/time for display
  const currentEventDate = event?.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A'

  const currentEventTime = event?.time || '10:00 AM'

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    // Validation
    if (!newDate) newErrors.date = 'New date is required'
    if (!newTime) newErrors.time = 'New time is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const eventData = {
        date: new Date(newDate).toISOString(),
        time: newTime,
        reason: reason,
      }

      await dispatch(
        rescheduleEvent({
          eventId: event._id || event.id,
          eventData,
        })
      ).unwrap()

      dispatch(
        showToast({
          message: 'Event rescheduled successfully. Attendees will be notified.',
          type: 'success',
        })
      )

      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      dispatch(
        showToast({
          message: error.message || 'Failed to reschedule event',
          type: 'error',
        })
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Reschedule Event</h2>
              <p className="text-sm text-gray-600">{event?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Current Schedule Info */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-gray-800">Current Schedule</h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Date:</span> {currentEventDate}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Time:</span> {currentEventTime}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">New Date</label>
            <input
              type="date"
              min={today}
              value={newDate}
              onChange={(e) => {
                setNewDate(e.target.value)
                if (errors.date) setErrors({ ...errors, date: '' })
              }}
              className={`mt-2 w-full rounded-lg border px-4 py-2 focus:outline-none ${
                errors.date ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
          </div>

          {/* New Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">New Time</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => {
                setNewTime(e.target.value)
                if (errors.time) setErrors({ ...errors, time: '' })
              }}
              className={`mt-2 w-full rounded-lg border px-4 py-2 focus:outline-none ${
                errors.time ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
          </div>

          {/* Reschedule Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Reason for Rescheduling (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this event is being rescheduled..."
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              rows="3"
            ></textarea>
          </div>

          {/* Notification Warning */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">⚠️ Note:</span> All attendees will be notified of
              the new schedule.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              ) : (
                'Reschedule Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventRescheduleForm
