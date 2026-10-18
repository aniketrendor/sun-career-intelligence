/**
 * Utilities for Google Calendar URLs, iCalendar (.ics) exports,
 * and meeting lifecycle calculation for advisory consultations.
 */

export interface CalendarEventData {
  title: string
  details: string
  location: string
  dateStr: string   // YYYY-MM-DD
  slotStr: string   // e.g. "10:00 AM - 10:30 AM" or "02:30 PM - 03:00 PM"
}

export interface SessionLiveStatus {
  status: 'LIVE_NOW' | 'STARTING_SOON' | 'TODAY_UPCOMING' | 'FUTURE' | 'PAST_DUE'
  label: string
  badgeClass: string
  isActionable: boolean
}

/**
 * Parses time strings like "10:00 AM" or "02:30 PM" into hours and minutes
 */
function parseTimeString(timeStr: string): { hours: number; minutes: number } | null {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return null

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const modifier = match[3]?.toUpperCase()

  if (modifier === 'PM' && hours < 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0

  return { hours, minutes }
}

/**
 * Parses dateStr and slotStr into JavaScript Date objects
 */
export function parseSlotDateRange(dateStr: string, slotStr: string): { start: Date; end: Date } | null {
  try {
    const parts = slotStr.split('-')
    if (parts.length < 2) return null

    const startTime = parseTimeString(parts[0])
    const endTime = parseTimeString(parts[1])
    if (!startTime || !endTime) return null

    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) return null

    const start = new Date(year, month - 1, day, startTime.hours, startTime.minutes, 0)
    const end = new Date(year, month - 1, day, endTime.hours, endTime.minutes, 0)

    return { start, end }
  } catch {
    return null
  }
}

/**
 * Formats a Date object to Google Calendar's required UTC format: YYYYMMDDTHHmmssZ
 */
function formatToGCalUtc(d: Date): string {
  return d.toISOString().replace(/-|:|\.\d{3}/g, '')
}

/**
 * Generates a direct Google Calendar Web URL with pre-filled details
 */
export function buildGoogleCalendarUrl(event: CalendarEventData): string {
  const range = parseSlotDateRange(event.dateStr, event.slotStr)
  let datesParam = ''

  if (range) {
    datesParam = `${formatToGCalUtc(range.start)}/${formatToGCalUtc(range.end)}`
  } else {
    // Fallback: whole day
    const cleanDate = event.dateStr.replace(/-/g, '')
    datesParam = `${cleanDate}/${cleanDate}`
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: datesParam,
    details: event.details,
    location: event.location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generates and downloads an .ics iCalendar file for Outlook, Apple Calendar, etc.
 */
export function downloadIcsFile(event: CalendarEventData, filename?: string): void {
  const range = parseSlotDateRange(event.dateStr, event.slotStr)
  const now = new Date()

  const startUtc = range ? formatToGCalUtc(range.start) : formatToGCalUtc(now)
  const endUtc = range ? formatToGCalUtc(range.end) : formatToGCalUtc(new Date(now.getTime() + 30 * 60000))
  const stampUtc = formatToGCalUtc(now)
  const uid = `session-${Date.now()}@career-intelligence-erp`

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Career Intelligence ERP//Faculty Advisory Session//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stampUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.details)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Advisory Session starting in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `advisory-session-${event.dateStr}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeIcs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

/**
 * Determines current live lifecycle of an advisory session
 */
export function getSessionLiveStatus(dateStr: string, slotStr: string, isResolved: boolean): SessionLiveStatus {
  if (isResolved) {
    return {
      status: 'FUTURE',
      label: 'Completed',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      isActionable: false
    }
  }

  const range = parseSlotDateRange(dateStr, slotStr)
  const now = new Date()

  if (!range) {
    const todayStr = now.toISOString().split('T')[0]
    if (dateStr < todayStr) {
      return {
        status: 'PAST_DUE',
        label: 'Past Due',
        badgeClass: 'bg-stone-100 text-stone-700 border-stone-200',
        isActionable: false
      }
    }
    return {
      status: 'FUTURE',
      label: 'Scheduled',
      badgeClass: 'bg-[#A36B40]/10 text-[#A36B40] border-[#DFD7CB]',
      isActionable: false
    }
  }

  const diffMs = range.start.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / 60000)

  // Within session time window (from 10 mins before start until end)
  if (now >= new Date(range.start.getTime() - 10 * 60000) && now <= range.end) {
    return {
      status: 'LIVE_NOW',
      label: 'Meeting Live Now',
      badgeClass: 'bg-emerald-600 text-white border-emerald-700 animate-pulse font-extrabold',
      isActionable: true
    }
  }

  // Starting within next 45 minutes
  if (diffMins > 0 && diffMins <= 45) {
    return {
      status: 'STARTING_SOON',
      label: `Starts in ${diffMins}m`,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      isActionable: true
    }
  }

  // Past session end time
  if (now > range.end) {
    return {
      status: 'PAST_DUE',
      label: 'Pending Wrap-up',
      badgeClass: 'bg-stone-100 text-stone-600 border-stone-200',
      isActionable: false
    }
  }

  // Same day later
  const todayStr = now.toISOString().split('T')[0]
  if (dateStr === todayStr) {
    return {
      status: 'TODAY_UPCOMING',
      label: 'Today',
      badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 font-bold',
      isActionable: false
    }
  }

  return {
    status: 'FUTURE',
    label: 'Upcoming',
    badgeClass: 'bg-[#A36B40]/10 text-[#A36B40] border-[#DFD7CB]',
    isActionable: false
  }
}
