'use client'

import { useState, useTransition } from 'react'
import {
  Calendar, Clock, User, Video, MapPin, Plus, CheckCircle2,
  Trash2, Sparkles, X, Copy, ExternalLink, SlidersHorizontal,
  ArrowRight, CheckSquare, MessageSquare, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  saveCounselingSession,
  deleteCounselingSession,
  updateMentorSlotsConfig,
  DynamicSlotsConfig
} from '@/lib/actions/mentor.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Advisee {
  id: string
  full_name: string
  email: string
  student_profile?: {
    prn?: string
    current_program?: string
    current_semester?: number
  } | null
}

interface SessionRecord {
  id: string
  session_date: string
  discussion_summary: string | null
  identified_concerns: string | null
  recommended_actions: string | null
  follow_up_date: string | null
  status: 'OPEN' | 'FOLLOW_UP' | 'RESOLVED' | string
  student: {
    id: string
    full_name: string
    email: string
  }
}

interface AvailabilityClientProps {
  mentorProfile: {
    title: string
    cabin: string
    expertise: string[]
    consultation_hours: string
    bio: string
    google_meet_link?: string
    available_days?: string[]
    custom_slots?: string[]
  }
  advisees: Advisee[]
  sessions: SessionRecord[]
}

const DEFAULT_STANDARD_SLOTS = [
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:15 AM - 11:45 AM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:15 PM - 03:45 PM',
  '04:00 PM - 04:30 PM',
]

const DAYS_OF_WEEK = [
  { key: 'Mon', label: 'Monday' },
  { key: 'Tue', label: 'Tuesday' },
  { key: 'Wed', label: 'Wednesday' },
  { key: 'Thu', label: 'Thursday' },
  { key: 'Fri', label: 'Friday' },
  { key: 'Sat', label: 'Saturday' },
]

// Helper to generate a realistic Google Meet link code: 3-4-3 lowercase letters
function generateMeetCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const part = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `https://meet.google.com/${part(3)}-${part(4)}-${part(3)}`
}

export function AvailabilityClient({
  mentorProfile,
  advisees,
  sessions
}: AvailabilityClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'preferences' | 'past'>('upcoming')
  const [filterMode, setFilterMode] = useState<string>('ALL')

  // Modal State for Dynamic Slots & Google Meet Configuration
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)

  // Configuration Form State
  const [availableDays, setAvailableDays] = useState<string[]>(
    mentorProfile.available_days && mentorProfile.available_days.length > 0
      ? mentorProfile.available_days
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  )
  const [customSlots, setCustomSlots] = useState<string[]>(
    mentorProfile.custom_slots && mentorProfile.custom_slots.length > 0
      ? mentorProfile.custom_slots
      : DEFAULT_STANDARD_SLOTS
  )
  const [newSlotInput, setNewSlotInput] = useState<string>('')
  const [googleMeetLink, setGoogleMeetLink] = useState<string>(
    mentorProfile.google_meet_link || ''
  )
  const [cabinOffice, setCabinOffice] = useState<string>(
    mentorProfile.cabin || ''
  )

  // Parsing helper for session summaries that have [Slot: ...] header
  function parseSummary(summary: string | null) {
    if (!summary) return { slot: 'Scheduled Slot', mode: 'IN_PERSON', venue: '', topic: 'Advisory Consultation', notes: '' }
    const match = summary.match(/^\[Slot:\s*([^|]+)\s*\|\s*Mode:\s*([^|]+)(?:\s*\|\s*Venue:\s*([^|]+))?(?:\s*\|\s*Topic:\s*([^\]]+))?\]([\s\S]*)$/)
    if (match) {
      return {
        slot: match[1]?.trim() || 'Scheduled Slot',
        mode: match[2]?.trim() || 'IN_PERSON',
        venue: match[3]?.trim() || '',
        topic: match[4]?.trim() || 'Advisory Consultation',
        notes: match[5]?.replace(/^Student Agenda:\s*/, '').trim() || ''
      }
    }
    return { slot: 'Scheduled Slot', mode: 'IN_PERSON', venue: '', topic: 'Advisory Consultation', notes: summary }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const upcomingSessions = sessions.filter(
    s => s.status === 'OPEN' || s.status === 'FOLLOW_UP' || (s.status !== 'RESOLVED' && s.session_date >= todayStr)
  )
  const pastSessions = sessions.filter(
    s => s.status === 'RESOLVED' || (s.session_date < todayStr && s.status !== 'OPEN')
  )

  const filteredUpcoming = upcomingSessions.filter(s => {
    if (filterMode === 'ALL') return true
    const parsed = parseSummary(s.discussion_summary)
    return parsed.mode === filterMode
  })

  function handleToggleDay(dayKey: string) {
    if (availableDays.includes(dayKey)) {
      if (availableDays.length === 1) {
        toast.error('Please maintain at least one active advisory day.')
        return
      }
      setAvailableDays(prev => prev.filter(d => d !== dayKey))
    } else {
      setAvailableDays(prev => [...prev, dayKey])
    }
  }

  function handleToggleStandardSlot(slot: string) {
    if (customSlots.includes(slot)) {
      if (customSlots.length === 1) {
        toast.error('Please keep at least one available slot.')
        return
      }
      setCustomSlots(prev => prev.filter(s => s !== slot))
    } else {
      setCustomSlots(prev => [...prev, slot])
    }
  }

  function handleAddCustomSlot() {
    const trimmed = newSlotInput.trim()
    if (!trimmed) return
    if (customSlots.includes(trimmed)) {
      toast.error('This slot is already added.')
      return
    }
    setCustomSlots(prev => [...prev, trimmed])
    setNewSlotInput('')
  }

  function handleRemoveSlot(slotToRemove: string) {
    if (customSlots.length === 1) {
      toast.error('Please keep at least one available slot.')
      return
    }
    setCustomSlots(prev => prev.filter(s => s !== slotToRemove))
  }

  function handleGenerateMeetLink() {
    const newMeet = generateMeetCode()
    setGoogleMeetLink(newMeet)
    toast.success('Instant Google Meet link generated!')
  }

  function handleCopyMeetLink(linkToCopy: string) {
    if (!linkToCopy) return
    navigator.clipboard.writeText(linkToCopy)
    toast.success('Google Meet link copied to clipboard!')
  }

  function handleSaveSlotsConfig(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const payload: DynamicSlotsConfig = {
        available_days: availableDays,
        custom_slots: customSlots,
        google_meet_link: googleMeetLink.trim(),
        cabin: cabinOffice.trim(),
        consultation_hours: `${availableDays.join(', ')} (${customSlots.length} daily consultation slots)`
      }

      const res = await updateMentorSlotsConfig(payload)
      if (res.success) {
        toast.success('Dynamic availability slots & Google Meet link saved!')
        setIsConfigModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save availability configuration.')
      }
    })
  }

  function handleCompleteSession(session: SessionRecord) {
    startTransition(async () => {
      const res = await saveCounselingSession({
        sessionId: session.id,
        student_id: session.student.id,
        session_date: session.session_date,
        discussion_summary: session.discussion_summary || '',
        identified_concerns: session.identified_concerns || undefined,
        recommended_actions: session.recommended_actions || undefined,
        status: 'RESOLVED'
      })
      if (res.success) {
        toast.success('Session marked as completed & archived to guidance logs')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update session')
      }
    })
  }

  function handleDeleteSession(sessionId: string) {
    if (!confirm('Are you sure you want to cancel this scheduled appointment?')) return
    startTransition(async () => {
      const res = await deleteCounselingSession(sessionId)
      if (res.success) {
        toast.success('Appointment cancelled')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to cancel appointment')
      }
    })
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* ─── 1. TOP BANNER CONTAINER (MATCHES IMAGE-2) ─────────────────────────── */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] mb-2 gap-1.5 font-bold text-xs px-3 py-1">
            <Calendar className="w-3.5 h-3.5" /> Mentorship Operations
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Available Slots & Scheduling
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Configure your dynamic consultation slots, generate your Google Meet room link, and manage advisee bookings.
          </p>
        </div>

        <Button
          onClick={() => setIsConfigModalOpen(true)}
          className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl shadow-xs px-5 font-semibold text-xs h-10 gap-2 shrink-0 cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" /> Configure Slots & Google Meet
        </Button>
      </div>

      {/* ─── 2. KPI STAT CARDS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Advisee Bookings</p>
              <h3 className="text-2xl font-bold text-[#2C2621]">{upcomingSessions.length}</h3>
              <p className="text-xs text-[#77734B] font-medium">Scheduled student slots</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#A36B40]">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Cabin Office</p>
              <h3 className="text-sm font-bold text-[#2C2621] truncate max-w-[150px]">
                {mentorProfile.cabin || 'Not configured'}
              </h3>
              <p className="text-xs text-[#7A7067] font-medium">In-Person Consultation</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#77734B]">
              <MapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Virtual Room</p>
              <h3 className="text-xs font-bold text-[#2C2621] truncate max-w-[150px]">
                {mentorProfile.google_meet_link ? 'Google Meet Active' : 'Not configured'}
              </h3>
              <p className="text-xs text-[#77734B] font-medium">
                {mentorProfile.google_meet_link ? 'Link auto-shared' : '1-click generate'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#A36B40]">
              <Video className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Active Slots</p>
              <h3 className="text-2xl font-bold text-[#2C2621]">
                {customSlots.length}
              </h3>
              <p className="text-xs text-[#77734B] font-medium">
                across {availableDays.length} weekdays
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#77734B]">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── 3. MAIN TABS NAVIGATION ────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#DFD7CB] pb-3">
          <div className="flex items-center gap-1 bg-[#FAF6F0] border border-[#DFD7CB] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`text-xs font-semibold rounded-lg px-4 py-2 transition-all cursor-pointer ${
                activeTab === 'upcoming' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067] hover:text-[#2C2621]'
              }`}
            >
              Advisee Bookings ({upcomingSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`text-xs font-semibold rounded-lg px-4 py-2 transition-all cursor-pointer ${
                activeTab === 'preferences' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067] hover:text-[#2C2621]'
              }`}
            >
              Slots & Google Meet Settings
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`text-xs font-semibold rounded-lg px-4 py-2 transition-all cursor-pointer ${
                activeTab === 'past' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067] hover:text-[#2C2621]'
              }`}
            >
              Completed Records ({pastSessions.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7A7067] font-semibold">Mode Filter:</span>
            <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-lg border border-[#DFD7CB]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterMode('ALL')}
                className={`text-xs h-7 px-2.5 rounded-md cursor-pointer ${filterMode === 'ALL' ? 'bg-white font-bold text-[#2C2621] shadow-xs' : 'text-[#7A7067]'}`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterMode('IN_PERSON')}
                className={`text-xs h-7 px-2.5 rounded-md cursor-pointer ${filterMode === 'IN_PERSON' ? 'bg-white font-bold text-[#2C2621] shadow-xs' : 'text-[#7A7067]'}`}
              >
                Cabin
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterMode('GOOGLE_MEET')}
                className={`text-xs h-7 px-2.5 rounded-md cursor-pointer ${filterMode === 'GOOGLE_MEET' ? 'bg-white font-bold text-[#2C2621] shadow-xs' : 'text-[#7A7067]'}`}
              >
                Virtual
              </Button>
            </div>
          </div>
        </div>

        {/* ─── TAB 1: UPCOMING APPOINTMENTS ──────────────────────────────────── */}
        {activeTab === 'upcoming' && (
          <div>
            {filteredUpcoming.length === 0 ? (
              <Card className="border-[#DFD7CB] bg-white rounded-3xl p-12 text-center shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center mx-auto mb-3 border border-[#DFD7CB]">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#2C2621]">No upcoming appointments found</h3>
                <p className="text-xs text-[#7A7067] mt-1 max-w-sm mx-auto">
                  When students book your available consultation slots from their portal, their scheduled appointments appear here automatically.
                </p>
                <Button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="mt-4 bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold px-4 cursor-pointer gap-1.5"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Dynamic Slots
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUpcoming.map(session => {
                  const parsed = parseSummary(session.discussion_summary)
                  const isVirtual = parsed.mode === 'GOOGLE_MEET'
                  const meetLink = isVirtual && parsed.venue.startsWith('http') ? parsed.venue : mentorProfile.google_meet_link

                  return (
                    <Card
                      key={session.id}
                      className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs overflow-hidden flex flex-col justify-between"
                    >
                      <CardContent className="p-6 space-y-4">
                        {/* Header: Student & Mode */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center font-bold text-sm border border-[#DFD7CB] shrink-0">
                              {session.student?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST'}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#2C2621]">{session.student?.full_name}</h4>
                              <p className="text-xs text-[#7A7067]">{session.student?.email}</p>
                            </div>
                          </div>
                          <Badge
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border-0 shrink-0 ${
                              isVirtual ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {isVirtual ? 'Google Meet' : 'In-Person Cabin'}
                          </Badge>
                        </div>

                        {/* Date & Time Slot Box */}
                        <div className="p-3 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-[#2C2621] font-semibold">
                            <Calendar className="w-4 h-4 text-[#A36B40]" />
                            <span>{session.session_date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#77734B] font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{parsed.slot}</span>
                          </div>
                        </div>

                        {/* Google Meet Link Bar (if Virtual) */}
                        {isVirtual && meetLink && (
                          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 truncate text-sky-900 font-medium">
                              <Video className="w-4 h-4 text-sky-600 shrink-0" />
                              <span className="truncate">{meetLink}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopyMeetLink(meetLink)}
                                className="p-1.5 rounded-lg hover:bg-sky-100 text-sky-700"
                                title="Copy Meet Link"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <a
                                href={meetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-[11px] px-2.5 py-1 rounded-lg shadow-xs"
                              >
                                Join Meet <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        )}

                        {/* In-Person Cabin Venue */}
                        {!isVirtual && (
                          <div className="p-2.5 rounded-xl bg-white border border-[#DFD7CB] flex items-center gap-2 text-xs text-[#2C2621]">
                            <MapPin className="w-3.5 h-3.5 text-[#A36B40] shrink-0" />
                            <span className="truncate font-medium">{parsed.venue || mentorProfile.cabin || 'Faculty Cabin'}</span>
                          </div>
                        )}

                        {/* Topic & Agenda */}
                        <div className="space-y-1.5 text-xs">
                          {parsed.topic && (
                            <div className="font-semibold text-[#2C2621] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#A36B40]" />
                              <span>{parsed.topic}</span>
                            </div>
                          )}
                          {parsed.notes && (
                            <p className="text-[#7A7067] bg-[#FAF6F0]/40 p-2.5 rounded-xl border border-[#DFD7CB]/60 italic leading-relaxed">
                              &quot;{parsed.notes}&quot;
                            </p>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="pt-2 border-t border-[#DFD7CB]/60 flex items-center justify-between gap-2">
                          <Link href={`/mentor/students/${session.student.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs border-[#DFD7CB] rounded-xl h-8 font-semibold text-[#2C2621] hover:bg-[#FAF6F0] cursor-pointer"
                            >
                              Student 360 &rarr;
                            </Button>
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isPending}
                              onClick={() => handleDeleteSession(session.id)}
                              className="text-xs text-red-600 hover:bg-red-50 rounded-xl h-8 cursor-pointer"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              disabled={isPending}
                              onClick={() => handleCompleteSession(session)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold h-8 px-3 gap-1 shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: CONSULTATION PREFERENCES & PUBLISHED SLOTS ──────────────── */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFD7CB]/60 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#2C2621]">Dynamic Consultation Slots & Google Meet</h3>
                  <p className="text-xs text-[#7A7067] mt-0.5">
                    Your configured preferences dictate when and how students can book 1-on-1 advisory sessions.
                  </p>
                </div>
                <Button
                  onClick={() => setIsConfigModalOpen(true)}
                  className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold h-9 px-4 gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Edit Slots & Link
                </Button>
              </div>

              {/* Google Meet Room Card */}
              <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-sky-950">Dedicated Google Meet Room</h4>
                      <p className="text-xs text-sky-800">Shared automatically with advisees for virtual consultations</p>
                    </div>
                  </div>
                  {mentorProfile.google_meet_link && (
                    <Badge className="bg-sky-600 text-white border-0 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      Configured
                    </Badge>
                  )}
                </div>

                {mentorProfile.google_meet_link ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-sky-200 text-xs">
                    <span className="font-mono text-sky-900 truncate">{mentorProfile.google_meet_link}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleCopyMeetLink(mentorProfile.google_meet_link || '')}
                        className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-700"
                        title="Copy link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={mentorProfile.google_meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-3 py-1 rounded-lg"
                      >
                        Open Room <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-sky-200 text-xs text-sky-800 flex items-center justify-between">
                    <span>No Google Meet room configured yet.</span>
                    <Button
                      size="sm"
                      onClick={() => setIsConfigModalOpen(true)}
                      className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-7 px-2.5 rounded-lg"
                    >
                      Generate Room Link
                    </Button>
                  </div>
                )}
              </div>

              {/* Weekly Days & Cabin Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB] space-y-2">
                  <p className="text-xs font-bold text-[#7A7067] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#A36B40]" /> Active Consultation Days
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableDays.map(d => (
                      <span
                        key={d}
                        className="px-3 py-1 rounded-lg bg-white border border-[#DFD7CB] text-xs font-bold text-[#2C2621] shadow-xs"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB] space-y-2">
                  <p className="text-xs font-bold text-[#7A7067] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A36B40]" /> Physical Cabin Venue
                  </p>
                  <p className="text-sm font-bold text-[#2C2621]">
                    {mentorProfile.cabin || 'Location not configured'}
                  </p>
                  <p className="text-xs text-[#7A7067]">Open for in-person advisory appointments</p>
                </div>
              </div>

              {/* Dynamic Time Slots Grid */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold text-[#7A7067] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#77734B]" /> Published Dynamic Time Slots ({customSlots.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {customSlots.map(slot => (
                    <div
                      key={slot}
                      className="p-3 rounded-xl bg-white border border-[#DFD7CB] text-xs font-semibold text-[#2C2621] flex items-center justify-between shadow-xs"
                    >
                      <span>{slot}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ─── TAB 3: COMPLETED RECORDS ──────────────────────────────────────── */}
        {activeTab === 'past' && (
          <div>
            {pastSessions.length === 0 ? (
              <Card className="border-[#DFD7CB] bg-white rounded-3xl p-10 text-center text-xs text-[#7A7067]">
                No completed or archived advisory sessions recorded yet.
              </Card>
            ) : (
              <div className="border border-[#DFD7CB] rounded-3xl bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6F0] border-b border-[#DFD7CB] text-[#7A7067] font-semibold">
                    <tr>
                      <th className="p-4">Session Date</th>
                      <th className="p-4">Advisee</th>
                      <th className="p-4">Topic & Summary</th>
                      <th className="p-4">Follow-up Date</th>
                      <th className="p-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFD7CB]">
                    {pastSessions.map(s => {
                      const parsed = parseSummary(s.discussion_summary)
                      return (
                        <tr key={s.id} className="hover:bg-[#FAF6F0]/40 transition-colors">
                          <td className="p-4 font-bold text-[#2C2621]">{s.session_date}</td>
                          <td className="p-4 font-medium text-[#2C2621]">{s.student?.full_name}</td>
                          <td className="p-4 text-[#7A7067] max-w-xs truncate">{parsed.topic || parsed.notes || 'Guidance session'}</td>
                          <td className="p-4 text-[#7A7067]">{s.follow_up_date || 'None'}</td>
                          <td className="p-4 text-right">
                            <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-xs rounded-full font-bold">
                              {s.status}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 4. DYNAMIC SLOTS & GOOGLE MEET CONFIGURATION MODAL ─────────────── */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in-50 zoom-in-95 font-sans space-y-5">
            <div className="flex items-start justify-between border-b border-[#DFD7CB]/60 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-1">
                  <SlidersHorizontal className="w-3 h-3" /> Faculty Availability Setup
                </div>
                <h3 className="text-xl font-bold text-[#2C2621]">Set Dynamic Slots & Google Meet Room</h3>
                <p className="text-xs text-[#7A7067] mt-0.5">
                  Configure the consultation slots and virtual meeting links published to your students.
                </p>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1.5 rounded-xl hover:bg-[#FAF6F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlotsConfig} className="space-y-5">
              {/* Google Meet Link Generator Feature */}
              <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-sky-600" /> Virtual Consultation Room (Google Meet)
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleGenerateMeetLink}
                    className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold h-7 px-2.5 gap-1 shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" /> Generate Meet Link
                  </Button>
                </div>
                <p className="text-[11px] text-sky-800 leading-tight">
                  Generate a dedicated institutional Google Meet link or paste your personal room URL below. Students who book virtual consultations will automatically receive this link.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={googleMeetLink}
                    onChange={e => setGoogleMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/xxx-yyyy-zzz"
                    className="border-sky-200 bg-white rounded-xl text-xs h-9 font-mono"
                  />
                  {googleMeetLink && (
                    <button
                      type="button"
                      onClick={() => handleCopyMeetLink(googleMeetLink)}
                      className="px-3 border border-sky-200 bg-white hover:bg-sky-100 rounded-xl text-xs font-semibold text-sky-700 flex items-center gap-1 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </button>
                  )}
                </div>
              </div>

              {/* Physical Cabin Office */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Physical Cabin Office Location</Label>
                <Input
                  value={cabinOffice}
                  onChange={e => setCabinOffice(e.target.value)}
                  placeholder="e.g. Cabin 304, Academic Block 2, Sandip University"
                  className="border-[#DFD7CB] rounded-xl text-xs h-10"
                />
              </div>

              {/* Active Consultation Days */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#2C2621]">Active Consultation Days *</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {DAYS_OF_WEEK.map(d => {
                    const isActive = availableDays.includes(d.key)
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => handleToggleDay(d.key)}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                          isActive
                            ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-xs'
                            : 'bg-white text-[#7A7067] border-[#DFD7CB] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        {d.key}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Dynamic Time Slots Configuration */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#2C2621]">
                    Available Consultation Slots ({customSlots.length}) *
                  </Label>
                  <span className="text-[11px] text-[#7A7067]">Click to toggle / add custom</span>
                </div>

                {/* Standard presets toggle pills */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[#7A7067]">Standard Slots:</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DEFAULT_STANDARD_SLOTS.map(slot => {
                      const isIncluded = customSlots.includes(slot)
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleToggleStandardSlot(slot)}
                          className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-between transition-all ${
                            isIncluded
                              ? 'bg-[#FAF6F0] border-[#A36B40] text-[#A36B40] ring-1 ring-[#A36B40]/40'
                              : 'bg-white border-[#DFD7CB] text-[#7A7067] hover:bg-[#FAF6F0]/40'
                          }`}
                        >
                          <span>{slot}</span>
                          {isIncluded && <CheckCircle2 className="w-3.5 h-3.5 text-[#A36B40]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Add Custom Slot Input */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold text-[#7A7067]">Add Custom Time Window:</p>
                  <div className="flex gap-2">
                    <Input
                      value={newSlotInput}
                      onChange={e => setNewSlotInput(e.target.value)}
                      placeholder="e.g. 05:00 PM - 05:30 PM"
                      className="border-[#DFD7CB] rounded-xl text-xs h-9"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomSlot}
                      className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold h-9 px-3 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {/* Active Custom Slots Tags */}
                {customSlots.some(s => !DEFAULT_STANDARD_SLOTS.includes(s)) && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-[#7A7067]">Your Custom Windows:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {customSlots.filter(s => !DEFAULT_STANDARD_SLOTS.includes(s)).map(s => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#DFD7CB] text-xs font-bold text-[#A36B40]"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(s)}
                            className="text-[#7A7067] hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DFD7CB]/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="border-[#DFD7CB] text-[#2C2621] rounded-xl text-xs h-10 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold h-10 px-5 gap-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isPending ? 'Saving...' : 'Save Availability & Slots'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
