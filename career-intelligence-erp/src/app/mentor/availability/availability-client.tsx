'use client'

import { useState, useTransition } from 'react'
import {
  Calendar, Clock, User, Video, MapPin, Plus, CheckCircle2,
  Trash2, Sparkles, X
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { saveCounselingSession, deleteCounselingSession, CounselingSessionInput } from '@/lib/actions/mentor.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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
  }
  advisees: Advisee[]
  sessions: SessionRecord[]
}

const TIME_SLOTS = [
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:15 AM - 11:45 AM',
  '11:45 AM - 12:15 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:15 PM - 03:45 PM',
  '04:00 PM - 04:30 PM',
]

export function AvailabilityClient({
  mentorProfile,
  advisees,
  sessions
}: AvailabilityClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'schedule' | 'past'>('upcoming')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null)
  const [filterMode, setFilterMode] = useState<string>('ALL')

  // Form states
  const [studentId, setStudentId] = useState<string>(advisees[0]?.id || '')
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[1])
  const [meetingMode, setMeetingMode] = useState<'IN_PERSON' | 'GOOGLE_MEET'>('IN_PERSON')
  const [locationOrLink, setLocationOrLink] = useState<string>(mentorProfile.cabin || '')
  const [topic, setTopic] = useState<string>('Career Diagnostic & Semester Academic Roadmap')
  const [initialNotes, setInitialNotes] = useState<string>('')

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
        notes: match[5]?.trim() || ''
      }
    }
    return { slot: 'Scheduled Slot', mode: 'IN_PERSON', venue: '', topic: 'Advisory Consultation', notes: summary }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const upcomingSessions = sessions.filter(s => s.status === 'OPEN' || s.status === 'FOLLOW_UP' || (s.status as string) === 'IN_PROGRESS' || (s.status !== 'RESOLVED' && (s.status as string) !== 'CLOSED' && s.session_date >= todayStr))
  const pastSessions = sessions.filter(s => s.status === 'RESOLVED' || (s.status as string) === 'CLOSED' || (s.session_date < todayStr && s.status !== 'OPEN' && s.status !== 'FOLLOW_UP'))

  const filteredUpcoming = upcomingSessions.filter(s => {
    if (filterMode === 'ALL') return true
    const parsed = parseSummary(s.discussion_summary)
    return parsed.mode === filterMode
  })

  function handleOpenCreateModal() {
    setSelectedSession(null)
    setStudentId(advisees[0]?.id || '')
    setSessionDate(new Date().toISOString().split('T')[0])
    setTimeSlot(TIME_SLOTS[1])
    setMeetingMode('IN_PERSON')
    setLocationOrLink(mentorProfile.cabin || '')
    setTopic('Career Diagnostic & Semester Academic Roadmap')
    setInitialNotes('')
    setIsModalOpen(true)
  }

  function handleOpenEditModal(session: SessionRecord) {
    setSelectedSession(session)
    setStudentId(session.student?.id || '')
    setSessionDate(session.session_date)
    const parsed = parseSummary(session.discussion_summary)
    setTimeSlot(parsed.slot)
    setMeetingMode(parsed.mode as any)
    setLocationOrLink(parsed.venue)
    setTopic(parsed.topic)
    setInitialNotes(parsed.notes)
    setIsModalOpen(true)
  }

  function handleSaveSlot(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId) {
      toast.error('Please select an advisee')
      return
    }

    startTransition(async () => {
      const payload: CounselingSessionInput = {
        sessionId: selectedSession?.id,
        student_id: studentId,
        session_date: sessionDate,
        time_slot: timeSlot,
        mode: meetingMode,
        location_or_link: locationOrLink,
        topic: topic,
        discussion_summary: initialNotes || `Advisory session focused on ${topic}`,
        status: selectedSession ? selectedSession.status : 'OPEN'
      }

      const res = await saveCounselingSession(payload)
      if (res.success) {
        toast.success(selectedSession ? 'Appointment slot updated' : 'Appointment slot confirmed & scheduled')
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save appointment slot')
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
    <div className="space-y-8 font-sans">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
            <Calendar className="w-3.5 h-3.5 text-[#A36B40]" /> Mentorship Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Available Slots & Scheduling</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Publish consultation slots, configure cabin/virtual consultation hours, and manage advisee appointments.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl shadow-xs px-5 font-semibold text-xs h-10 gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Schedule Advisee Slot
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Upcoming Bookings</p>
              <h3 className="text-2xl font-bold text-[#2C2621]">{upcomingSessions.length}</h3>
              <p className="text-xs text-[#77734B] font-medium">Active advisee slots</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#A36B40]">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Consultation Venue</p>
              <h3 className="text-sm font-bold text-[#2C2621] truncate max-w-[150px]">{mentorProfile.cabin || 'Not configured'}</h3>
              <p className="text-xs text-[#7A7067] font-medium">In-Person & Meet</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#77734B]">
              <MapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Consultation Window</p>
              <h3 className="text-xs font-bold text-[#2C2621] truncate max-w-[150px]">{mentorProfile.consultation_hours || 'Not configured'}</h3>
              <p className="text-xs text-[#77734B] font-medium">Weekly designated hours</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#A36B40]">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Assigned Advisees</p>
              <h3 className="text-2xl font-bold text-[#2C2621]">{advisees.length}</h3>
              <p className="text-xs text-[#77734B] font-medium">Active student cohort</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#77734B]">
              <User className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#DFD7CB] pb-3">
          <div className="flex items-center gap-1 bg-[#FAF6F0] border border-[#DFD7CB] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`text-xs font-semibold rounded-lg px-4 py-2 transition-all cursor-pointer ${
                activeTab === 'upcoming' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067] hover:text-[#2C2621]'
              }`}
            >
              Upcoming Appointments ({upcomingSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`text-xs font-semibold rounded-lg px-4 py-2 transition-all cursor-pointer ${
                activeTab === 'schedule' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067] hover:text-[#2C2621]'
              }`}
            >
              Consultation Preferences
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

        {/* Tab 1: Upcoming */}
        {activeTab === 'upcoming' && (
          <div>
            {filteredUpcoming.length === 0 ? (
              <Card className="border-[#DFD7CB] bg-white rounded-2xl p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-[#FAF6F0] text-[#A36B40] mx-auto flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#2C2621]">No upcoming appointments found</h3>
                <p className="text-xs text-[#7A7067] mt-1 max-w-sm mx-auto">
                  You have no scheduled advisee slots matching your current view. Click &quot;Schedule Advisee Slot&quot; to open a consultation slot.
                </p>
                <Button
                  onClick={handleOpenCreateModal}
                  className="mt-5 bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold px-4 cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Book First Session
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredUpcoming.map(session => {
                  const parsed = parseSummary(session.discussion_summary)
                  const isVirtual = parsed.mode === 'GOOGLE_MEET'
                  return (
                    <Card key={session.id} className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#A36B40] transition-colors">
                      <div>
                        <div className="p-4 border-b border-[#DFD7CB] bg-[#FAF6F0]/60 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#2C2621]">{session.session_date}</span>
                            <span className="text-xs text-[#7A7067]">•</span>
                            <span className="text-xs font-semibold text-[#A36B40]">{parsed.slot}</span>
                          </div>
                          <Badge
                            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border-0 ${
                              isVirtual ? 'bg-blue-50 text-blue-700' : 'bg-[#77734B]/15 text-[#77734B]'
                            }`}
                          >
                            {isVirtual ? 'Google Meet' : 'Cabin In-Person'}
                          </Badge>
                        </div>

                        <CardContent className="p-5 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-[#7A7067]">Advisee</p>
                            <h4 className="text-base font-bold text-[#2C2621] mt-0.5">{session.student?.full_name}</h4>
                            <p className="text-xs text-[#7A7067]">{session.student?.email}</p>
                          </div>

                          <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB]/70 space-y-1">
                            <p className="text-xs font-bold text-[#2C2621] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#A36B40]" /> {parsed.topic}
                            </p>
                            {parsed.venue && (
                              <p className="text-xs text-[#7A7067] flex items-center gap-1.5 pt-1">
                                {isVirtual ? <Video className="w-3.5 h-3.5 text-blue-600" /> : <MapPin className="w-3.5 h-3.5 text-[#77734B]" />}
                                {isVirtual ? (
                                  <a href={parsed.venue.startsWith('http') ? parsed.venue : `https://${parsed.venue}`} target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium truncate max-w-[200px]">
                                    {parsed.venue}
                                  </a>
                                ) : (
                                  <span className="truncate">{parsed.venue}</span>
                                )}
                              </p>
                            )}
                            {parsed.notes && (
                              <p className="text-xs text-[#7A7067] line-clamp-2 italic pt-1">
                                &quot;{parsed.notes}&quot;
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </div>

                      <div className="p-4 border-t border-[#DFD7CB] bg-white flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(session)}
                          className="text-xs border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] rounded-lg h-8 cursor-pointer"
                        >
                          Reschedule / Edit
                        </Button>

                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => handleCompleteSession(session)}
                            disabled={isPending}
                            className="text-xs bg-[#77734B] hover:bg-[#5F5C3C] text-white rounded-lg h-8 font-semibold px-3 cursor-pointer"
                            title="Mark Completed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSession(session.id)}
                            disabled={isPending}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Cancel Appointment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Preferences */}
        {activeTab === 'schedule' && (
          <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs p-6 md:p-8 space-y-6 max-w-3xl">
            <div>
              <h3 className="text-lg font-bold text-[#2C2621]">Faculty Consultation Office & Window</h3>
              <p className="text-xs text-[#7A7067] mt-0.5">
                These settings are displayed to your assigned advisees when discovering guidance availability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                <p className="text-xs font-semibold text-[#7A7067]">Physical Cabin Office</p>
                <p className="text-sm font-bold text-[#2C2621]">{mentorProfile.cabin || 'Not configured'}</p>
                <p className="text-xs text-[#77734B] mt-1">Open for drop-in and scheduled 1-on-1 consultations</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                <p className="text-xs font-semibold text-[#7A7067]">Weekly Consultation Hours</p>
                <p className="text-sm font-bold text-[#2C2621]">{mentorProfile.consultation_hours || 'Not configured'}</p>
                <p className="text-xs text-[#77734B] mt-1">Guaranteed student advisory slots</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#DFD7CB] bg-white space-y-2">
              <p className="text-xs font-bold text-[#2C2621]">Configured Specialization Domains</p>
              <div className="flex flex-wrap gap-2">
                {mentorProfile.expertise.length > 0 ? (
                  mentorProfile.expertise.map((tag, idx) => (
                    <Badge key={idx} className="bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] text-xs font-semibold rounded-lg px-2.5 py-1">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-[#7A7067]">No specific expertise tags set. Update under Faculty Profile.</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => router.push('/mentor/profile')}
                className="text-xs border-[#A36B40] text-[#A36B40] hover:bg-[#FAF6F0] rounded-xl font-semibold cursor-pointer"
              >
                Modify Hours & Cabin in Profile &rarr;
              </Button>
            </div>
          </Card>
        )}

        {/* Tab 3: Completed Records */}
        {activeTab === 'past' && (
          <div>
            {pastSessions.length === 0 ? (
              <Card className="border-[#DFD7CB] bg-white rounded-2xl p-8 text-center text-xs text-[#7A7067]">
                No archived or past sessions logged yet.
              </Card>
            ) : (
              <div className="border border-[#DFD7CB] rounded-2xl bg-white overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF6F0] border-b border-[#DFD7CB] text-[#7A7067] font-semibold">
                    <tr>
                      <th className="p-3.5">Session Date</th>
                      <th className="p-3.5">Advisee</th>
                      <th className="p-3.5">Topic & Summary</th>
                      <th className="p-3.5">Follow-up Date</th>
                      <th className="p-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFD7CB]">
                    {pastSessions.map(s => {
                      const parsed = parseSummary(s.discussion_summary)
                      return (
                        <tr key={s.id} className="hover:bg-[#FAF6F0]/50 transition-colors">
                          <td className="p-3.5 font-bold text-[#2C2621]">{s.session_date}</td>
                          <td className="p-3.5 font-medium text-[#2C2621]">{s.student?.full_name}</td>
                          <td className="p-3.5 text-[#7A7067] max-w-xs truncate">{parsed.topic || parsed.notes || 'Routine consultation'}</td>
                          <td className="p-3.5 text-[#7A7067]">{s.follow_up_date || 'None'}</td>
                          <td className="p-3.5 text-right">
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

      {/* Schedule / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-in fade-in-50 zoom-in-95 font-sans space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#2C2621]">
                  {selectedSession ? 'Reschedule Advisee Appointment' : 'Schedule Mentorship Appointment'}
                </h3>
                <p className="text-xs text-[#7A7067] mt-0.5">
                  Assign an advising time slot, consultation format, and agenda for your active advisee.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Select Assigned Advisee *</Label>
                <select
                  value={studentId}
                  onChange={e => setStudentId(e.target.value)}
                  className="w-full border border-[#DFD7CB] rounded-xl text-xs bg-white h-10 px-3 text-[#2C2621] focus:outline-hidden focus:border-[#A36B40]"
                  required
                >
                  <option value="" disabled>Select an advisee...</option>
                  {advisees.map(std => (
                    <option key={std.id} value={std.id}>
                      {std.full_name} {std.student_profile?.prn ? `(${std.student_profile.prn})` : ''} - {std.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2C2621]">Session Date *</Label>
                  <Input
                    type="date"
                    value={sessionDate}
                    onChange={e => setSessionDate(e.target.value)}
                    className="border-[#DFD7CB] rounded-xl text-xs h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2C2621]">Time Slot *</Label>
                  <select
                    value={timeSlot}
                    onChange={e => setTimeSlot(e.target.value)}
                    className="w-full border border-[#DFD7CB] rounded-xl text-xs bg-white h-10 px-3 text-[#2C2621] focus:outline-hidden focus:border-[#A36B40]"
                    required
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2C2621]">Meeting Mode *</Label>
                  <select
                    value={meetingMode}
                    onChange={(e: any) => setMeetingMode(e.target.value)}
                    className="w-full border border-[#DFD7CB] rounded-xl text-xs bg-white h-10 px-3 text-[#2C2621] focus:outline-hidden focus:border-[#A36B40]"
                    required
                  >
                    <option value="IN_PERSON">Cabin In-Person</option>
                    <option value="GOOGLE_MEET">Google Meet (Virtual)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2C2621]">
                    {meetingMode === 'GOOGLE_MEET' ? 'Google Meet URL' : 'Cabin Office Location'}
                  </Label>
                  <Input
                    value={locationOrLink}
                    onChange={e => setLocationOrLink(e.target.value)}
                    placeholder={meetingMode === 'GOOGLE_MEET' ? 'https://meet.google.com/xxx-xxxx-xxx' : 'Cabin 304, Academic Block'}
                    className="border-[#DFD7CB] rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Focus Topic / Agenda *</Label>
                <Input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. Cognitive Profile Review & Specialization Guidance"
                  className="border-[#DFD7CB] rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Preparation / Advisory Notes (Optional)</Label>
                <Textarea
                  value={initialNotes}
                  onChange={e => setInitialNotes(e.target.value)}
                  placeholder="Optional notes or tasks for the student before attending..."
                  rows={3}
                  className="border-[#DFD7CB] rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#DFD7CB]/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-[#DFD7CB] text-[#2C2621] rounded-xl text-xs h-10 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold h-10 px-5 cursor-pointer"
                >
                  {isPending ? 'Confirming...' : selectedSession ? 'Save Changes' : 'Confirm & Notify Advisee'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
