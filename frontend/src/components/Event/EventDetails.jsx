import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { rsvpEvent, fetchEventAttendees, clearCurrentEvent } from '@/store/slices/eventSlice'
import { cancelEvent } from '@/store/slices/eventAnalyticsSlice'
import { showToast } from '@/store/slices/notificationSlice'
import EventAttendanceCheckIn from './EventAttendanceCheckIn'
import EventRescheduleForm from './EventRescheduleForm'
import {
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  UserCheckIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

const EventDetails = ({ eventId, onClose, userRole = 'student' }) => {
  const dispatch = useDispatch()
  const { currentEvent, currentEventAttendees, loading } = useSelector((state) => state.event)
  const [rsvpStatus, setRsvpStatus] = useState(null)
  const [isRsvpLoading, setIsRsvpLoading] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCanceling, setIsCanceling] = useState(false)

  useEffect(() => {
    if (eventId && currentEvent?._id === eventId) {
      dispatch(fetchEventAttendees(eventId))
      setRsvpStatus(currentEvent.userRsvpStatus || null)
    }
  }, [dispatch, eventId, currentEvent])

  const handleRSVP = async (status) => {
    setIsRsvpLoading(true)
    try {
      const result = await dispatch(rsvpEvent({ eventId, status }))
      if (result.payload) {
        setRsvpStatus(status)
        dispatch(
          showToast({
            message: `You've marked as ${status}!`,
            type: 'success',
          })
        )
        dispatch(fetchEventAttendees(eventId))
      }
    } catch (error) {
      dispatch(
        showToast({
          message: 'Failed to RSVP to event',
          type: 'error',
        })
      )
    } finally {
      setIsRsvpLoading(false)
    }
  }

  const handleCancelEvent = async () => {
    setIsCanceling(true)
    try {
      await dispatch(
        cancelEvent({
          eventId: currentEvent._id,
          reason: cancelReason,
        })
      ).unwrap()

      dispatch(
        showToast({
          message: 'Event cancelled successfully. Attendees will be notified.',
          type: 'success',
        })
      )

      setShowCancelConfirm(false)
      onClose()
    } catch (error) {
      dispatch(
        showToast({
          message: error.message || 'Failed to cancel event',
          type: 'error',
        })
      )
    } finally {
      setIsCanceling(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isAdmin = userRole === 'admin' || userRole === 'teacher'

  if (!currentEvent) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8">
          <p>Loading event details...</p>
        </div>
      </div>
    )
  }

  const yesCount = currentEventAttendees.filter((a) => a.rsvpStatus === 'yes').length
  const noCount = currentEventAttendees.filter((a) => a.rsvpStatus === 'no').length
  const maybeCount = currentEventAttendees.filter((a) => a.rsvpStatus === 'maybe').length

  return (
    <>
      {/* Check-In Modal */}
      {showCheckIn && (
        <EventAttendanceCheckIn
          eventId={eventId}
          attendees={currentEventAttendees}
          onClose={() => setShowCheckIn(false)}
          onSuccess={() => dispatch(fetchEventAttendees(eventId))}
        />
      )}

      {/* Reschedule Modal */}
      {showReschedule && (
        <EventRescheduleForm
          event={currentEvent}
          onClose={() => setShowReschedule(false)}
          onSuccess={() => {
            dispatch(fetchEventAttendees(eventId))
            onClose()
          }}
        />
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
          {/* Header with Close */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Event Content */}
          <div className="p-6 space-y-6">
            {/* Event Image */}
            {currentEvent.image && (
              <div className="rounded-lg overflow-hidden max-h-80">
                <img
                  src={currentEvent.image}
                  alt={currentEvent.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Event Title and Type */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-3xl font-bold text-gray-900">{currentEvent.name}</h3>
                <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {currentEvent.eventType}
                </span>
              </div>
              <p className="text-gray-600">{currentEvent.description}</p>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center space-x-4">
                <CalendarIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(currentEvent.eventDateTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <MapPinIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{currentEvent.location}</p>
                </div>
              </div>

              {currentEvent.maxParticipants && (
                <div className="flex items-center space-x-4">
                  <UsersIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Max Participants</p>
                    <p className="font-semibold text-gray-900">{currentEvent.maxParticipants}</p>
                  </div>
                </div>
              )}
            </div>

            {/* RSVP Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{yesCount}</p>
                <p className="text-sm text-gray-600">Going</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{maybeCount}</p>
                <p className="text-sm text-gray-600">Maybe</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">{noCount}</p>
                <p className="text-sm text-gray-600">Can't Go</p>
              </div>
            </div>

            {/* RSVP Buttons */}
            <div className="border-t pt-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Are you attending?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleRSVP('yes')}
                  disabled={isRsvpLoading || loading}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    rsvpStatus === 'yes'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  } disabled:opacity-50`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleRSVP('maybe')}
                  disabled={isRsvpLoading || loading}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    rsvpStatus === 'maybe'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  } disabled:opacity-50`}
                >
                  Maybe
                </button>
                <button
                  onClick={() => handleRSVP('no')}
                  disabled={isRsvpLoading || loading}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                    rsvpStatus === 'no'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  } disabled:opacity-50`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Attendees List */}
            {currentEventAttendees.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Attendees</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {currentEventAttendees.map((attendee) => (
                    <div
                      key={attendee._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{attendee.name}</p>
                        <p className="text-xs text-gray-500">{attendee.email}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          attendee.rsvpStatus === 'yes'
                            ? 'bg-green-100 text-green-800'
                            : attendee.rsvpStatus === 'maybe'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {attendee.rsvpStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer - Admin Actions (Phase 5) */}
          {isAdmin && (
            <div className="sticky bottom-0 bg-gradient-to-r from-blue-50 to-gray-50 border-t border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Admin Actions</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckIn(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  <UserCheckIcon className="h-5 w-5" />
                  Check-In
                </button>
                <button
                  onClick={() => setShowReschedule(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  <PencilIcon className="h-5 w-5" />
                  Reschedule
                </button>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  <TrashIcon className="h-5 w-5" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Student Close Button */}
          {!isAdmin && (
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Cancel Event?</h3>
            <p className="mb-4 text-gray-600">
              This action will cancel the event and notify all attendees.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation (optional)..."
              className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none"
              rows="3"
            ></textarea>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Keep Event
              </button>
              <button
                onClick={handleCancelEvent}
                disabled={isCanceling}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isCanceling ? 'Canceling...' : 'Cancel Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EventDetails
