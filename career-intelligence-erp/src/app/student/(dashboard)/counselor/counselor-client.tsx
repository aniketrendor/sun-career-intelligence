'use client'

import { useState, useTransition } from 'react'
import {
  Calendar, Clock, User, Video, MapPin, Plus, CheckCircle2,
  Mail, Phone, BookOpen, ShieldCheck, ArrowRight, X, AlertCircle,
  Sparkles, CheckSquare, ChevronRight, MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { bookCounselingSlot, cancelStudentSession, BookCounselingSlotInput } from '@/lib/actions/student.actions'
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
  endorsement
}: CounselorClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const upcomingDatePresets = getUpcomingDates()

  // Form State for Slot Booking
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>(
    assignedCounselor?.id || availableCounselors[0]?.id || ''
  )
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDatePresets[0]?.dateStr || '')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(STANDARD_TIME_SLOTS[1])
  const [meetingMode, setMeetingMode] = useState<'IN_PERSON' | 'GOOGLE_MEET'>('IN_PERSON')
  const [topic, setTopic] = useState<string>(ADVISORY_TOPICS[0])
  const [agenda, setAgenda] = useState<string>('')

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
    if (counselorId) {
      setSelectedCounselorId(counselorId)
    } else if (assignedCounselor) {
      setSelectedCounselorId(assignedCounselor.id)
    } else if (availableCounselors.length > 0) {
      setSelectedCounselorId(availableCounselors[0].id)
    }
    setSelectedDate(upcomingDatePresets[0]?.dateStr || new Date().toISOString().split('T')[0])
    setSelectedTimeSlot(STANDARD_TIME_SLOTS[1])
    setMeetingMode('IN_PERSON')
    setTopic(ADVISORY_TOPICS[0])
    setAgenda('')
    setIsBookingModalOpen(true)
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
            Connect with your assigned career advisor, book advisory consultation slots, and track action items.
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

      {/* ─── 3. ASSIGNED ADVISOR CARD / UNASSIGNED STATE ─────────────────────── */}
      <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs overflow-hidden">
        <div className="h-2.5 w-full bg-[#A36B40]" />
        <CardContent className="p-6 md:p-8 space-y-6">
          {assignedCounselor ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center font-bold text-xl border border-[#DFD7CB] shadow-xs shrink-0">
                    {assignedCounselor.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'FA'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-bold text-[#2C2621]">{assignedCounselor.full_name}</h2>
                      <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-xs rounded-full px-2.5 py-0.5 font-bold">
                        Assigned Advisor
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

                <div className="shrink-0 flex items-center gap-3">
                  <Button
                    onClick={() => handleOpenBookingModal(assignedCounselor.id)}
                    className="gap-2 bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl h-10 px-5 shadow-xs cursor-pointer font-bold text-xs"
                  >
                    <Clock className="w-4 h-4" /> Select Advisory Slot
                  </Button>
                </div>
              </div>

              {/* Bio if available */}
              {assignedCounselor.bio && (
                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-xs text-[#7A7067] italic leading-relaxed">
                  &quot;{assignedCounselor.bio}&quot;
                </div>
              )}

              {/* Cabin, Consultation Hours, Specializations */}
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
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-[#FAF6F0] text-[#A36B40] rounded-2xl flex items-center justify-center mx-auto border border-[#DFD7CB]">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[#2C2621] text-lg">No Counselor Assigned Yet</h3>
                <p className="text-xs text-[#7A7067] max-w-lg mx-auto">
                  Your department assigns dedicated mentors upon semester registration. In the meantime, you can directly select an institutional mentor below to book your career diagnostic consultation.
                </p>
              </div>

              {/* Available Mentors List for Quick Slot Booking */}
              {availableCounselors.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-[#DFD7CB]/60">
                  <p className="text-xs font-bold text-[#7A7067] uppercase tracking-wider">
                    Available Institutional Faculty Mentors ({availableCounselors.length})
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCounselors.map(c => (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/30 hover:border-[#A36B40] transition-colors flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-[#2C2621]">{c.full_name}</h4>
                          <p className="text-xs text-[#7A7067]">{c.title}</p>
                          {c.cabin && (
                            <p className="text-xs text-[#7A7067] flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-[#A36B40]" /> {c.cabin}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleOpenBookingModal(c.id)}
                          className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold h-8 px-3 shrink-0 cursor-pointer"
                        >
                          Book Slot <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
                Schedule a consultation slot with your advisor to receive personalized career guidance and track milestone action plans.
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
                  Pick a convenient time slot and outline your discussion topics for your faculty mentor.
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
              {/* Advisor Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Faculty Advisor *</Label>
                {availableCounselors.length > 1 ? (
                  <select
                    value={selectedCounselorId}
                    onChange={e => setSelectedCounselorId(e.target.value)}
                    className="w-full border border-[#DFD7CB] rounded-xl text-xs bg-white h-10 px-3 text-[#2C2621] focus:outline-hidden focus:border-[#A36B40]"
                    required
                  >
                    {availableCounselors.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.title || 'Faculty Advisor'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-[#FAF6F0]/60 rounded-xl border border-[#DFD7CB] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2C2621]">{chosenMentor?.full_name || 'Faculty Advisor'}</span>
                    <span className="text-[#7A7067]">{chosenMentor?.title || 'Career Mentor'}</span>
                  </div>
                )}
              </div>

              {/* Consultation Date */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#2C2621]">Consultation Date *</Label>
                  <span className="text-[11px] text-[#7A7067]">Pick upcoming date</span>
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

              {/* Consultation Time Slot Grid */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-[#2C2621]">Select Available Time Slot *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {STANDARD_TIME_SLOTS.map(slot => {
                    const isSelected = selectedTimeSlot === slot
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
                  disabled={isPending}
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
