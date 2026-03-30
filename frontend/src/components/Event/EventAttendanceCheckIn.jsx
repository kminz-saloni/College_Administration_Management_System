import React, { useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { checkInAttendee } from '@/store/slices/eventAnalyticsSlice'
import { showToast } from '@/store/slices/notificationSlice'
import { UserCheckIcon, XMarkIcon } from '@heroicons/react/24/solid'

/**
 * EventAttendanceCheckIn - QR/Manual check-in component for event attendees
 * Phase 5: Event attendance verification system
 */
const EventAttendanceCheckIn = ({ eventId, attendees = [], onClose, onSuccess }) => {
  const dispatch = useDispatch()
  const [checkedInUsers, setCheckedInUsers] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [qrInput, setQrInput] = useState('')
  const [loadingStates, setLoadingStates] = useState({})

  // Filter attendees by search term
  const filteredAttendees = useMemo(() => {
    return attendees.filter((attendee) =>
      `${attendee.name} ${attendee.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  }, [attendees, searchTerm])

  // Calculate check-in statistics
  const checkedInCount = checkedInUsers.size
  const totalCount = attendees.length
  const checkInPercentage = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0

  // Handle QR code input (simulate QR scanning)
  const handleQRInput = (e) => {
    const value = e.target.value.trim()
    if (value) {
      const attendee = attendees.find((a) => a._id === value || a.id === value)
      if (attendee) {
        handleCheckIn(attendee)
        setQrInput('')
      } else {
        dispatch(showToast({ message: 'Invalid QR code', type: 'error' }))
        setQrInput('')
      }
    }
  }

  // Handle check-in for an attendee
  const handleCheckIn = async (attendee) => {
    if (checkedInUsers.has(attendee._id || attendee.id)) {
      dispatch(showToast({ message: 'Already checked in', type: 'info' }))
      return
    }

    const attendeeId = attendee._id || attendee.id
    setLoadingStates((prev) => ({ ...prev, [attendeeId]: true }))

    try {
      await dispatch(
        checkInAttendee({
          eventId,
          userId: attendeeId,
        })
      ).unwrap()

      setCheckedInUsers((prev) => new Set([...prev, attendeeId]))
      dispatch(showToast({ message: `${attendee.name} checked in successfully`, type: 'success' }))

      if (onSuccess) onSuccess()
    } catch (error) {
      dispatch(showToast({ message: error.message || 'Check-in failed', type: 'error' }))
    } finally {
      setLoadingStates((prev) => ({ ...prev, [attendeeId]: false }))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-90vh my-4 w-full max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <UserCheckIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Event Check-In</h2>
              <p className="text-sm text-gray-600">Verify attendee attendance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Check-In Statistics */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              {checkedInCount} of {totalCount} checked in
            </span>
            <span className="text-lg font-bold text-blue-600">{checkInPercentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-blue-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${checkInPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* QR Code Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Scan QR Code or Enter ID
          </label>
          <input
            type="text"
            placeholder="Place cursor here and scan QR code..."
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            onKeyUp={handleQRInput}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Search Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Search Attendees</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Attendees List */}
        <div className="max-h-96 space-y-2 overflow-y-auto">
          {filteredAttendees.length > 0 ? (
            filteredAttendees.map((attendee) => {
              const attendeeId = attendee._id || attendee.id
              const isCheckedIn = checkedInUsers.has(attendeeId)
              const isLoading = loadingStates[attendeeId]

              return (
                <div
                  key={attendeeId}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                    isCheckedIn
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-medium ${
                        isCheckedIn ? 'text-green-700' : 'text-gray-800'
                      }`}
                    >
                      {attendee.name}
                    </p>
                    <p className="truncate text-sm text-gray-600">{attendee.email}</p>
                    {attendee.rsvpStatus && (
                      <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        RSVP: {attendee.rsvpStatus}
                      </span>
                    )}
                  </div>

                  {isCheckedIn ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                        <UserCheckIcon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-green-700">Checked In</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(attendee)}
                      disabled={isLoading}
                      className="ml-3 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      ) : (
                        'Check In'
                      )}
                    </button>
                  )}
                </div>
              )
            })
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-600">
                {searchTerm ? 'No attendees match your search' : 'No attendees available'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 border-t border-gray-200 pt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              dispatch(
                showToast({ message: 'Check-in session ended', type: 'success' })
              )
              onClose()
            }}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            End Check-In
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventAttendanceCheckIn
