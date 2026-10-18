'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Calendar, Clock, User, Video, MapPin, Plus, CheckCircle2,
  Mail, Phone, BookOpen, ShieldCheck, ArrowRight, X, AlertCircle,
  Sparkles, CheckSquare, ChevronRight, MessageSquare, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  bookCounselingSlot,
  cancelStudentSession,
  selectMentor,
  BookCounselingSlotInput
} from '@/lib/actions/student.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

export interface CounselorItem {
  id: string
  full_name: string
  email: string
  phone: string | null
  title: string
  cabin: string
  consultation_hours: string
  expertise: string[]
  bio: string
}

export interface SessionItem {
  id: string
  session_date: string
  discussion_summary: string | null
  identified_concerns: string | null
  recommended_actions: string | null
  follow_up_date: string | null
  status: string
  created_at: string
  counselor?: {
    full_name?: string
  } | null
}

export interface BookedSlot {
  counselor_id: string
  session_date: string
  time_slot: string
}

interface EndorsementData {
  header: string
  track: string
  note: string
}

interface CounselorClientProps {
  student: {
    id: string
    full_name: string
    email: string
  }
  assignedCounselor: CounselorItem | null
  availableCounselors: CounselorItem[]
  sessions: SessionItem[]
  bookedSlots: BookedSlot[]
  endorsement: EndorsementData | null
}

const STANDARD_TIME_SLOTS = [
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:15 AM - 11:45 AM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:15 PM - 03:45 PM',
  '04:00 PM - 04:30 PM',
]

const ADVISORY_TOPICS = [
  'Career Diagnostic & Specialization Track Guidance',
  'Semester Academic Roadmap & Subject Choice',
  'Internship & Campus Placement Strategy',
  'Industry Capstone & Research Projects',
  'Technical Skill Gap & Certifications Review'
]

// Generate next 5 upcoming business dates (skipping Sundays)
function getUpcomingDates(): Array<{ label: string; dateStr: string; dayName: string }> {
  const dates = []
  const today = new Date()
  let count = 0
  let offset = 1

  while (count < 5 && offset < 14) {
    const d = new Date()
    d.setDate(today.getDate() + offset)
    offset++
    if (d.getDay() === 0) continue // Skip Sunday

    const dateStr = d.toISOString().split('T')[0]
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dates.push({ label, dateStr, dayName })
    count++
  }
  return dates
}

export function CounselorClient({
  student,
  assignedCounselor,
  availableCounselors,
  sessions,
  bookedSlots,
  endorsement
}: CounselorClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [showMentorDirectory, setShowMentorDirectory] = useState(!assignedCounselor)
  const upcomingDatePresets = getUpcomingDates()

  // Form State for Slot Booking
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>(
    assignedCounselor?.id || availableCounselors[0]?.id || ''
  )
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDatePresets[0]?.dateStr || '')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(STANDARD_TIME_SLOTS[0])
  const [meetingMode, setMeetingMode] = useState<'IN_PERSON' | 'GOOGLE_MEET'>('IN_PERSON')
  const [topic, setTopic] = useState<string>(ADVISORY_TOPICS[0])
  const [agenda, setAgenda] = useState<string>('')

  // Check if a given slot is already booked for the selected counselor on the selected date
  function isSlotBooked(slot: string, counselorId: string = selectedCounselorId, date: string = selectedDate) {
    return bookedSlots.some(
      b => b.counselor_id === counselorId &&
           b.session_date === date &&
           b.time_slot.trim() === slot.trim()
    )
  }

  // When selected date or counselor changes, ensure selected slot is not already booked
  useEffect(() => {
    if (isSlotBooked(selectedTimeSlot, selectedCounselorId, selectedDate)) {
      const firstAvailable = STANDARD_TIME_SLOTS.find(slot => !isSlotBooked(slot, selectedCounselorId, selectedDate))
      if (firstAvailable) {
        setSelectedTimeSlot(firstAvailable)
      }
    }
  }, [selectedDate, selectedCounselorId])

  // Parsing helper for session summaries that have [Slot: ...] header
  function parseSummary(summary: string | null) {
    if (!summary) return { slot: 'Advisory Slot', mode: 'IN_PERSON', venue: '', topic: 'Guidance Session', notes: '' }
    const match = summary.match(/^\[Slot:\s*([^|]+)\s*\|\s*Mode:\s*([^|]+)(?:\s*\|\s*Venue:\s*([^|]+))?(?:\s*\|\s*Topic:\s*([^\]]+))?\]([\s\S]*)$/)
    if (match) {
      return {
        slot: match[1]?.trim() || 'Advisory Slot',
        mode: match[2]?.trim() || 'IN_PERSON',
        venue: match[3]?.trim() || '',
        topic: match[4]?.trim() || 'Guidance Session',
        notes: match[5]?.replace(/^Student Agenda:\s*/, '').trim() || ''
      }
    }
    return { slot: 'Advisory Slot', mode: 'IN_PERSON', venue: '', topic: 'Guidance Session', notes: summary }
  }

  function handleOpenBookingModal(counselorId?: string) {
    const targetCounselorId = counselorId || selectedCounselorId || assignedCounselor?.id || availableCounselors[0]?.id || ''
    setSelectedCounselorId(targetCounselorId)

    const initialDate = upcomingDatePresets[0]?.dateStr || new Date().toISOString().split('T')[0]
    setSelectedDate(initialDate)

    const firstAvailable = STANDARD_TIME_SLOTS.find(slot => !isSlotBooked(slot, targetCounselorId, initialDate))
    setSelectedTimeSlot(firstAvailable || STANDARD_TIME_SLOTS[0])

    setMeetingMode('IN_PERSON')
    setTopic(ADVISORY_TOPICS[0])
    setAgenda('')
    setIsBookingModalOpen(true)
  }

  function handleSelectMentor(counselorId: string) {
    startTransition(async () => {
      const res = await selectMentor(counselorId)
      if (res.success) {
        const mentor = availableCounselors.find(c => c.id === counselorId)
        toast.success(`Prof. ${mentor?.full_name || 'Advisor'} selected as your Faculty Mentor!`)
        setShowMentorDirectory(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to select mentor.')
      }
    })
  }

  function handleConfirmBooking(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCounselorId) {
      toast.error('Please select an advisor.')
      return
    }
    if (!selectedDate || !selectedTimeSlot) {
      toast.error('Please select both a consultation date and time slot.')
      return
    }

    if (isSlotBooked(selectedTimeSlot)) {
      toast.error('This slot is already booked. Please choose an available time slot.')
      return
    }

    startTransition(async () => {
      const payload: BookCounselingSlotInput = {
        counselor_id: selectedCounselorId,
        session_date: selectedDate,
        time_slot: selectedTimeSlot,
        mode: meetingMode,
        topic: topic,
        agenda: agenda.trim() || undefined
      }

      const res = await bookCounselingSlot(payload)
      if (res.success) {
        toast.success('Advisory consultation slot booked successfully!')
        setIsBookingModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to book consultation slot.')
      }
    })
  }

  function handleCancelSession(sessionId: string) {
    if (!confirm('Are you sure you want to cancel this scheduled advisory slot?')) return

    startTransition(async () => {
      const res = await cancelStudentSession(sessionId)
      if (res.success) {
        toast.success('Scheduled session cancelled.')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to cancel session.')
      }
    })
  }

  const chosenMentor = availableCounselors.find(c => c.id === selectedCounselorId) || assignedCounselor
  const bookedSlotsCountForSelected = STANDARD_TIME_SLOTS.filter(s => isSlotBooked(s)).length
  const allSlotsBooked = bookedSlotsCountForSelected === STANDARD_TIME_SLOTS.length

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans pb-12">
      {/* ─── 1. ELEVATED HEADER CONTAINER (MATCHES IMAGE-2) ─────────────────── */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] mb-2 gap-1.5 font-bold text-xs px-3 py-1">
            <MessageSquare className="w-3.5 h-3.5" /> Institutional Support
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Career Counseling & Mentorship
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Select your faculty career mentor, book 1-on-1 consultation slots, and track action items.
          </p>
        </div>

        <Button
          onClick={() => handleOpenBookingModal()}
          className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl shadow-xs px-5 font-semibold text-xs h-10 gap-2 shrink-0 cursor-pointer"
        >
          <Calendar className="w-4 h-4" /> Book Consultation Slot
        </Button>
      </div>

      {/* ─── 2. OFFICIAL FACULTY ENDORSEMENT BANNER (IF PRESENT) ────────────── */}
      {endorsement && (
        <Card className="border-emerald-200 bg-emerald-50/80 rounded-3xl shadow-xs overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-700 text-white border-0 text-xs font-bold rounded-full px-2.5 py-0.5">
                  Official Faculty Endorsement
                </Badge>
                <span className="text-xs text-emerald-800 font-semibold">{endorsement.header}</span>
              </div>
              <h3 className="text-base font-extrabold text-[#2C2621]">
                Specialization Track: {endorsement.track}
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed italic">
                &quot;{endorsement.note}&quot;
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── 3. ASSIGNED MENTOR CARD OR MENTOR DIRECTORY ─────────────────────── */}
      {assignedCounselor && !showMentorDirectory ? (
        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs overflow-hidden">
          <div className="h-2.5 w-full bg-[#A36B40]" />
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center font-bold text-xl border border-[#DFD7CB] shadow-xs shrink-0">
                  {assignedCounselor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'FA'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-[#2C2621]">{assignedCounselor.full_name}</h2>
                    <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs rounded-full px-2.5 py-0.5 font-bold">
                      Your Selected Mentor
                    </Badge>
                  </div>
                  <p className="text-xs text-[#7A7067] font-medium">{assignedCounselor.title}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#7A7067] pt-1">
                    {assignedCounselor.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#A36B40]" /> {assignedCounselor.email}
                      </span>
                    )}
                    {assignedCounselor.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#A36B40]" /> {assignedCounselor.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2.5">
                <Button
                  variant="outline"
                  onClick={() => setShowMentorDirectory(true)}
                  className="border-[#DFD7CB] text-[#2C2621] rounded-xl text-xs h-10 px-4 font-semibold hover:bg-[#FAF6F0] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Switch Mentor
                </Button>
                <Button
                  onClick={() => handleOpenBookingModal(assignedCounselor.id)}
                  className="gap-2 bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl h-10 px-5 shadow-xs cursor-pointer font-bold text-xs"
                >
                  <Clock className="w-4 h-4" /> Select Advisory Slot
                </Button>
              </div>
            </div>

            {/* Bio */}
            {assignedCounselor.bio && (
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-xs text-[#7A7067] italic leading-relaxed">
                &quot;{assignedCounselor.bio}&quot;
              </div>
            )}

            {/* Cabin & Consultation Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#DFD7CB]/60 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-[#DFD7CB] space-y-1">
                <p className="font-semibold text-[#7A7067] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#A36B40]" /> Cabin Office Location
                </p>
                <p className="font-bold text-[#2C2621]">
                  {assignedCounselor.cabin || 'Location not configured'}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#DFD7CB] space-y-1">
                <p className="font-semibold text-[#7A7067] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#77734B]" /> Consultation Hours
                </p>
                <p className="font-bold text-[#2C2621]">
                  {assignedCounselor.consultation_hours || 'Advisory hours not configured'}
                </p>
              </div>
            </div>

            {assignedCounselor.expertise.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-[#7A7067] uppercase tracking-wider">
                  Advisory Focus Areas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {assignedCounselor.expertise.map(tag => (
                    <Badge
                      key={tag}
                      className="bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] text-xs font-semibold rounded-md px-2.5 py-0.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Mentor Selection Directory */
        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs overflow-hidden">
          <div className="h-2.5 w-full bg-[#A36B40]" />
          <CardHeader className="p-6 md:p-8 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-bold text-[#2C2621]">
                  Choose Your Faculty Career Mentor
                </CardTitle>
                <CardDescription className="text-xs text-[#7A7067] mt-0.5">
                  Select a faculty advisor from your department. You can book consultation slots and receive personalized guidance.
                </CardDescription>
              </div>
              {assignedCounselor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMentorDirectory(false)}
                  className="text-xs text-[#7A7067] hover:text-[#2C2621] self-start"
                >
                  Close Directory
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8 pt-0 space-y-4">
            {availableCounselors.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-[#7A7067]">
                <User className="w-8 h-8 text-[#DFD7CB] mx-auto" />
                <p className="text-sm font-semibold text-[#2C2621]">No faculty mentors available at the moment.</p>
                <p className="text-xs">Faculty mentors will be listed here as soon as their profiles are published.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCounselors.map(c => {
                  const isCurrent = assignedCounselor?.id === c.id
                  return (
                    <div
                      key={c.id}
                      className={`p-5 rounded-2xl border transition-all space-y-4 ${
                        isCurrent
                          ? 'border-[#A36B40] bg-[#FAF6F0]/40 ring-1 ring-[#A36B40]/30'
                          : 'border-[#DFD7CB] bg-white hover:border-[#A36B40]/60 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center font-bold text-base border border-[#DFD7CB] shrink-0">
                            {c.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-[#2C2621]">{c.full_name}</h4>
                              {isCurrent && (
                                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Current Mentor
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-[#7A7067] font-medium">{c.title}</p>
                            <p className="text-xs text-[#7A7067] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[#A36B40]" /> {c.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Location & Hours */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="p-2.5 rounded-xl bg-[#FAF6F0]/50 border border-[#DFD7CB]/60">
                          <span className="text-[10px] uppercase font-bold text-[#7A7067] block">Office Location</span>
                          <span className="text-[#2C2621] font-semibold truncate block mt-0.5">
                            {c.cabin || 'Academic Block'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FAF6F0]/50 border border-[#DFD7CB]/60">
                          <span className="text-[10px] uppercase font-bold text-[#7A7067] block">Advisory Hours</span>
                          <span className="text-[#2C2621] font-semibold truncate block mt-0.5">
                            {c.consultation_hours || 'Configured by slot'}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-[#DFD7CB]/60">
                        {!isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            onClick={() => handleSelectMentor(c.id)}
                            className="flex-1 text-xs border-[#DFD7CB] rounded-xl h-9 font-semibold text-[#2C2621] hover:bg-[#FAF6F0] cursor-pointer"
                          >
                            Select As My Mentor
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleOpenBookingModal(c.id)}
                          className="flex-1 bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold h-9 gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Clock className="w-3.5 h-3.5" /> Book Slot
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── 4. ADVISORY SESSIONS & ACTION PLANS ─────────────────────────────── */}
      <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
        <CardHeader className="p-6 md:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold text-[#2C2621]">Advisory Sessions & Action Plans</CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Official notes, scheduled consultation appointments, and faculty development milestones
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-semibold bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] rounded-full px-3 py-1">
                {sessions.length} Total Sessions
              </Badge>
              <Button
                size="sm"
                onClick={() => handleOpenBookingModal()}
                className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold h-8 px-3 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> New Slot
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-7 pt-0">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-[#7A7067] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center mx-auto border border-[#DFD7CB]">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#2C2621]">No counseling sessions recorded yet.</p>
              <p className="text-xs text-[#7A7067] max-w-sm mx-auto">
                Schedule an advisory consultation slot to receive tailored career guidance and track action milestones.
              </p>
              <Button
                onClick={() => handleOpenBookingModal()}
                className="mt-2 bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold px-4 cursor-pointer"
              >
                <Calendar className="w-4 h-4 mr-1.5" /> Book Your First Slot
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map(session => {
                const parsed = parseSummary(session.discussion_summary)
                const isResolved = session.status === 'RESOLVED' || session.status === 'CLOSED'
                const isFollowUp = session.status === 'FOLLOW_UP' || session.status === 'IN_PROGRESS'
                const isOpen = session.status === 'OPEN'

                return (
                  <div
                    key={session.id}
                    className="p-5 rounded-2xl border border-[#DFD7CB] hover:border-[#A36B40]/60 transition-all space-y-3.5 bg-[#FAF6F0]/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#DFD7CB] flex items-center justify-center text-[#A36B40] font-bold text-xs shrink-0 shadow-xs">
                          <Calendar className="w-5 h-5 text-[#A36B40]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-[#2C2621]">
                              {formatDate(session.session_date)}
                            </h4>
                            <span className="text-xs text-[#7A7067] font-semibold bg-white px-2 py-0.5 rounded border border-[#DFD7CB]">
                              {parsed.slot}
                            </span>
                            <Badge
                              className={`text-xs px-2.5 py-0.5 rounded-full font-bold border-0 ${
                                isResolved
                                  ? 'bg-[#77734B]/15 text-[#77734B]'
                                  : isFollowUp
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-[#A36B40]/15 text-[#A36B40]'
                              }`}
                            >
                              {isResolved ? 'Completed' : isFollowUp ? 'Follow Up' : 'Scheduled'}
                            </Badge>
                          </div>
                          <p className="text-xs text-[#7A7067] mt-0.5">
                            Advisor: <span className="font-semibold text-[#2C2621]">{session.counselor?.full_name || 'Faculty Mentor'}</span>
                            {parsed.mode === 'GOOGLE_MEET' ? ' • Virtual Meeting' : ' • In-Person Cabin'}
                          </p>
                        </div>
                      </div>

                      {isOpen && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelSession(session.id)}
                          disabled={isPending}
                          className="text-xs text-red-600 hover:bg-red-50 rounded-xl h-8 self-end sm:self-center cursor-pointer"
                        >
                          Cancel Appointment
                        </Button>
                      )}
                    </div>

                    {/* Topic badge & notes */}
                    <div className="space-y-2 pt-1 text-xs">
                      {parsed.topic && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#DFD7CB] font-semibold text-[#2C2621]">
                          <Sparkles className="w-3.5 h-3.5 text-[#A36B40]" /> {parsed.topic}
                        </div>
                      )}

                      {parsed.notes && (
                        <div className="bg-white p-3.5 rounded-xl border border-[#DFD7CB] text-[#2C2621] leading-relaxed">
                          <span className="font-bold text-[#7A7067] block mb-1">Agenda / Meeting Takeaways:</span>
                          <p className="whitespace-pre-wrap">{parsed.notes}</p>
                        </div>
                      )}

                      {session.recommended_actions && (
                        <div className="bg-[#77734B]/10 p-3.5 rounded-xl border border-[#77734B]/30 text-[#2C2621] leading-relaxed">
                          <span className="font-bold text-[#77734B] flex items-center gap-1.5 mb-1">
                            <CheckSquare className="w-3.5 h-3.5 text-[#77734B]" /> Mentor Recommended Next Steps:
                          </span>
                          <p className="whitespace-pre-wrap font-medium">{session.recommended_actions}</p>
                        </div>
                      )}

                      {session.follow_up_date && (
                        <div className="flex items-center gap-1.5 text-xs text-[#A36B40] font-bold pt-0.5">
                          <Clock className="w-3.5 h-3.5" /> Next Scheduled Check-in: {formatDate(session.follow_up_date)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── 5. INTERACTIVE SLOT SELECTION MODAL ─────────────────────────────── */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-in fade-in-50 zoom-in-95 font-sans space-y-5">
            <div className="flex items-start justify-between border-b border-[#DFD7CB]/60 pb-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-1">
                  <Calendar className="w-3 h-3" /> Consultation Scheduling
                </div>
                <h3 className="text-xl font-bold text-[#2C2621]">Select Advisory Consultation Slot</h3>
                <p className="text-xs text-[#7A7067] mt-0.5">
                  Pick a mentor and available time slot. Already booked slots are blocked.
                </p>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1.5 rounded-xl hover:bg-[#FAF6F0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              {/* Advisor Selection Cards */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#2C2621]">Select Faculty Advisor *</Label>
                {availableCounselors.length === 0 ? (
                  <p className="text-xs text-red-600">No mentors available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableCounselors.map(c => {
                      const isSelected = selectedCounselorId === c.id
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCounselorId(c.id)}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#FAF6F0] border-[#A36B40] ring-1 ring-[#A36B40]'
                              : 'bg-white border-[#DFD7CB] hover:bg-[#FAF6F0]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#2C2621] truncate">{c.full_name}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#A36B40] shrink-0" />}
                          </div>
                          <p className="text-[11px] text-[#7A7067] truncate mt-0.5">{c.title}</p>
                          {c.cabin && (
                            <p className="text-[10px] text-[#A36B40] font-medium truncate mt-1 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" /> {c.cabin}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Consultation Date */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#2C2621]">Consultation Date *</Label>
                  <span className="text-[11px] text-[#7A7067]">Pick upcoming business day</span>
                </div>

                {/* Quick Date Chips */}
                <div className="grid grid-cols-5 gap-1.5">
                  {upcomingDatePresets.map(preset => {
                    const isSelected = selectedDate === preset.dateStr
                    return (
                      <button
                        key={preset.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(preset.dateStr)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-xs'
                            : 'bg-white text-[#2C2621] border-[#DFD7CB] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">{preset.dayName}</p>
                        <p className="text-xs font-extrabold mt-0.5">{preset.label}</p>
                      </button>
                    )
                  })}
                </div>

                <Input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="border-[#DFD7CB] rounded-xl text-xs h-9 mt-1"
                  required
                />
              </div>

              {/* Consultation Time Slot Grid with Booked Slot Blocking */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#2C2621]">Select Available Time Slot *</Label>
                  {bookedSlotsCountForSelected > 0 && (
                    <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {bookedSlotsCountForSelected} slot(s) already booked
                    </span>
                  )}
                </div>

                {allSlotsBooked ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>All slots for this advisor are fully booked on this date. Please pick another date or mentor.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {STANDARD_TIME_SLOTS.map(slot => {
                      const booked = isSlotBooked(slot)
                      const isSelected = selectedTimeSlot === slot

                      if (booked) {
                        return (
                          <div
                            key={slot}
                            className="p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-70 select-none"
                            title="This slot has already been booked by another student"
                          >
                            <span className="flex items-center gap-1.5 line-through">
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              {slot}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded">
                              Booked
                            </span>
                          </div>
                        )
                      }

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-[#FAF6F0] border-[#A36B40] text-[#A36B40] ring-1 ring-[#A36B40]'
                              : 'bg-white border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]/40'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-[#A36B40]' : 'text-[#7A7067]'}`} />
                            {slot}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#A36B40]" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Mode: In-Person / Virtual */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Consultation Mode *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMeetingMode('IN_PERSON')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      meetingMode === 'IN_PERSON'
                        ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-xs'
                        : 'bg-white text-[#2C2621] border-[#DFD7CB] hover:bg-[#FAF6F0]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" /> In-Person (Faculty Cabin)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMeetingMode('GOOGLE_MEET')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      meetingMode === 'GOOGLE_MEET'
                        ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-xs'
                        : 'bg-white text-[#2C2621] border-[#DFD7CB] hover:bg-[#FAF6F0]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" /> Google Meet (Virtual)
                  </button>
                </div>
              </div>

              {/* Topic Preset Chips */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Advisory Focus Area *</Label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {ADVISORY_TOPICS.map(top => (
                    <button
                      key={top}
                      type="button"
                      onClick={() => setTopic(top)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-colors ${
                        topic === top
                          ? 'bg-[#FAF6F0] text-[#A36B40] border-[#A36B40] font-bold'
                          : 'bg-white text-[#7A7067] border-[#DFD7CB] hover:bg-[#FAF6F0]'
                      }`}
                    >
                      {top}
                    </button>
                  ))}
                </div>
                <Input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="Or type custom advisory topic..."
                  className="border-[#DFD7CB] rounded-xl text-xs h-9"
                  required
                />
              </div>

              {/* Student Agenda / Questions */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">
                  Specific Questions or Areas You Want Advice On (Optional)
                </Label>
                <Textarea
                  value={agenda}
                  onChange={e => setAgenda(e.target.value)}
                  placeholder="e.g. Need clarification on which elective track best aligns with cloud architecture roles, or review my placement resume..."
                  rows={3}
                  className="border-[#DFD7CB] rounded-xl text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DFD7CB]/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="border-[#DFD7CB] text-[#2C2621] rounded-xl text-xs h-10 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || allSlotsBooked}
                  className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold h-10 px-5 gap-1.5 shadow-xs cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  {isPending ? 'Confirming...' : 'Confirm Advisory Slot'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
