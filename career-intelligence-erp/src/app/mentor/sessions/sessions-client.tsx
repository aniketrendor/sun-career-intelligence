'use client'

import { useState, useTransition } from 'react'
import {
  MessageSquare, Calendar, User, Clock, CheckCircle2,
  AlertCircle, Plus, Search, Trash2, Edit3, CheckSquare,
  ChevronDown, ChevronUp, X
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
  created_at: string
  student: {
    id: string
    full_name: string
    email: string
    student_profile?: {
      prn?: string
      current_program?: string
      current_semester?: number
    } | null
  }
}

interface SessionsClientProps {
  advisees: Advisee[]
  sessions: SessionRecord[]
}

export function SessionsClient({ advisees, sessions }: SessionsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(sessions[0]?.id || null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionRecord | null>(null)

  // Form State
  const [studentId, setStudentId] = useState<string>(advisees[0]?.id || '')
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [followUpDate, setFollowUpDate] = useState<string>('')
  const [status, setStatus] = useState<'OPEN' | 'FOLLOW_UP' | 'RESOLVED'>('OPEN')
  const [discussionSummary, setDiscussionSummary] = useState('')
  const [identifiedConcerns, setIdentifiedConcerns] = useState('')
  const [recommendedActions, setRecommendedActions] = useState('')

  // Statistics
  const totalSessions = sessions.length
  const openSessions = sessions.filter(s => s.status === 'OPEN').length
  const followUpSessions = sessions.filter(s => s.status === 'FOLLOW_UP' || s.status === 'IN_PROGRESS').length
  const closedSessions = sessions.filter(s => s.status === 'RESOLVED' || s.status === 'CLOSED').length
  const todayStr = new Date().toISOString().split('T')[0]
  const pendingFollowups = sessions.filter(s => s.follow_up_date && s.follow_up_date >= todayStr).length

  // Filtered Sessions
  const filteredSessions = sessions.filter(s => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter
    const nameMatch = s.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const prnMatch = s.student?.student_profile?.prn?.toLowerCase().includes(searchQuery.toLowerCase())
    const summaryMatch = s.discussion_summary?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && (nameMatch || prnMatch || summaryMatch)
  })

  function handleOpenCreateModal() {
    setEditingSession(null)
    setStudentId(advisees[0]?.id || '')
    setSessionDate(new Date().toISOString().split('T')[0])
    setFollowUpDate('')
    setStatus('OPEN')
    setDiscussionSummary('')
    setIdentifiedConcerns('')
    setRecommendedActions('')
    setIsModalOpen(true)
  }

  function handleOpenEditModal(session: SessionRecord) {
    setEditingSession(session)
    setStudentId(session.student?.id || '')
    setSessionDate(session.session_date)
    setFollowUpDate(session.follow_up_date || '')
    const mappedStatus = session.status === 'CLOSED' || session.status === 'RESOLVED'
      ? 'RESOLVED'
      : session.status === 'IN_PROGRESS' || session.status === 'FOLLOW_UP'
      ? 'FOLLOW_UP'
      : 'OPEN'
    setStatus(mappedStatus)
    setDiscussionSummary(session.discussion_summary || '')
    setIdentifiedConcerns(session.identified_concerns || '')
    setRecommendedActions(session.recommended_actions || '')
    setIsModalOpen(true)
  }

  function handleSaveSession(e: React.FormEvent) {
    e.preventDefault()
    if (!studentId) {
      toast.error('Please select an advisee')
      return
    }

    startTransition(async () => {
      const payload: CounselingSessionInput = {
        sessionId: editingSession?.id,
        student_id: studentId,
        session_date: sessionDate,
        discussion_summary: discussionSummary,
        identified_concerns: identifiedConcerns || undefined,
        recommended_actions: recommendedActions || undefined,
        follow_up_date: followUpDate || null,
        status: status
      }

      const res = await saveCounselingSession(payload)
      if (res.success) {
        toast.success(editingSession ? 'Session log updated' : 'New guidance session logged')
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save session log')
      }
    })
  }

  function handleToggleStatus(session: SessionRecord) {
    const nextStatus: 'OPEN' | 'FOLLOW_UP' | 'RESOLVED' =
      session.status === 'OPEN' ? 'FOLLOW_UP' : session.status === 'FOLLOW_UP' ? 'RESOLVED' : 'OPEN'

    startTransition(async () => {
      const res = await saveCounselingSession({
        sessionId: session.id,
        student_id: session.student.id,
        session_date: session.session_date,
        discussion_summary: session.discussion_summary || '',
        identified_concerns: session.identified_concerns || undefined,
        recommended_actions: session.recommended_actions || undefined,
        follow_up_date: session.follow_up_date || null,
        status: nextStatus
      })
      if (res.success) {
        toast.success(`Session status updated to ${nextStatus === 'RESOLVED' ? 'Resolved' : nextStatus === 'FOLLOW_UP' ? 'Follow Up' : 'Open'}`)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update status')
      }
    })
  }

  function handleDelete(sessionId: string) {
    if (!confirm('Are you sure you want to remove this counseling session log?')) return
    startTransition(async () => {
      const res = await deleteCounselingSession(sessionId)
      if (res.success) {
        toast.success('Session record removed')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to remove session')
      }
    })
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-[#A36B40]" /> Advisee Advisory Log
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Guidance Sessions & Action Plans</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Log 1-on-1 mentoring discussions, track academic impediments, and monitor student action items.
          </p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl shadow-xs px-5 font-semibold text-xs h-10 gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log New Session
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Total Sessions</p>
              <h3 className="text-2xl font-bold text-[#2C2621]">{totalSessions}</h3>
              <p className="text-xs text-[#7A7067]">Logged mentorship meetings</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#A36B40]">
              <MessageSquare className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">In Progress / Open</p>
              <h3 className="text-2xl font-bold text-[#A36B40]">{openSessions}</h3>
              <p className="text-xs text-[#7A7067]">Pending action plans</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#A36B40]">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Resolved / Closed</p>
              <h3 className="text-2xl font-bold text-[#77734B]">{closedSessions}</h3>
              <p className="text-xs text-[#77734B] font-medium">Completed guidance</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#77734B]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#7A7067] uppercase tracking-wider">Follow-ups Due</p>
              <h3 className="text-2xl font-bold text-[#2C2621]">{pendingFollowups}</h3>
              <p className="text-xs text-[#7A7067]">Upcoming check-in dates</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#77734B]">
              <Calendar className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#DFD7CB] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7A7067] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by advisee name, PRN, or discussion notes..."
            className="pl-9 border-[#DFD7CB] rounded-xl text-xs h-10 bg-[#FAF6F0]/40"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#7A7067] px-1">Status:</span>
          <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#DFD7CB]">
            {(['ALL', 'OPEN', 'FOLLOW_UP', 'RESOLVED'] as const).map(st => (
              <Button
                key={st}
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter(st)}
                className={`text-xs h-7 px-2.5 rounded-lg cursor-pointer ${statusFilter === st ? 'bg-white font-bold text-[#2C2621] shadow-xs' : 'text-[#7A7067]'}`}
              >
                {st === 'ALL' ? 'All' : st === 'FOLLOW_UP' ? 'Follow Up' : st === 'OPEN' ? 'Open' : 'Resolved'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card className="border-[#DFD7CB] bg-white rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#FAF6F0] text-[#A36B40] mx-auto flex items-center justify-center mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#2C2621]">No guidance sessions found</h3>
          <p className="text-xs text-[#7A7067] mt-1 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try modifying your search query or status filter.'
              : 'You have not logged any 1-on-1 guidance sessions yet. Click "Log New Session" to start recording advisory progress.'}
          </p>
          <Button
            onClick={handleOpenCreateModal}
            className="mt-5 bg-[#A36B40] hover:bg-[#8B5A33] text-white rounded-xl text-xs font-semibold px-4 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Log First Session
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map(session => {
            const isExpanded = expandedSessionId === session.id
            const isResolved = session.status === 'RESOLVED' || session.status === 'CLOSED'
            const isFollowUp = session.status === 'FOLLOW_UP' || session.status === 'IN_PROGRESS'

            return (
              <Card
                key={session.id}
                className="border-[#DFD7CB] bg-white rounded-2xl shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF6F0]/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-center text-[#A36B40] font-bold text-sm shrink-0">
                      {session.student?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'ST'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-[#2C2621]">{session.student?.full_name}</h4>
                        {session.student?.student_profile?.prn && (
                          <span className="text-xs text-[#7A7067] font-mono bg-[#FAF6F0] px-2 py-0.5 rounded border border-[#DFD7CB]">
                            {session.student.student_profile.prn}
                          </span>
                        )}
                        <Badge
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border-0 ${
                            isResolved
                              ? 'bg-[#77734B]/15 text-[#77734B]'
                              : isFollowUp
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#A36B40]/15 text-[#A36B40]'
                          }`}
                        >
                          {isResolved ? 'Resolved' : isFollowUp ? 'Follow Up' : 'Open'}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#7A7067] mt-0.5">
                        {session.student?.email} • {session.student?.student_profile?.current_program || 'Sandip University'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#2C2621] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#A36B40]" /> {session.session_date}
                      </p>
                      {session.follow_up_date ? (
                        <p className="text-xs text-[#77734B] font-semibold mt-0.5">
                          Follow-up: {session.follow_up_date}
                        </p>
                      ) : (
                        <p className="text-xs text-[#7A7067] mt-0.5">No follow-up set</p>
                      )}
                    </div>
                    <div className="text-[#7A7067]">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#DFD7CB] p-5 sm:p-6 bg-[#FAF6F0]/20 space-y-5">
                    {/* Discussion Summary */}
                    <div>
                      <Label className="text-xs font-bold text-[#7A7067] uppercase tracking-wider">
                        Discussion Summary & Guidance Notes
                      </Label>
                      <div className="mt-1.5 p-4 rounded-xl bg-white border border-[#DFD7CB] text-xs text-[#2C2621] leading-relaxed whitespace-pre-wrap">
                        {session.discussion_summary || 'No detailed summary provided.'}
                      </div>
                    </div>

                    {/* 2-Column: Concerns & Action Items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white border border-red-100 space-y-1.5 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                          <AlertCircle className="w-4 h-4 text-red-600" /> Identified Academic & Career Concerns
                        </div>
                        <p className="text-xs text-[#2C2621] leading-relaxed whitespace-pre-wrap">
                          {session.identified_concerns || 'None flagged during this advisory session.'}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-[#77734B]/30 space-y-1.5 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#77734B]">
                          <CheckSquare className="w-4 h-4 text-[#77734B]" /> Recommended Action Items & Milestones
                        </div>
                        <p className="text-xs text-[#2C2621] leading-relaxed whitespace-pre-wrap font-medium">
                          {session.recommended_actions || 'Routine progress review; no specific pending action items.'}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#DFD7CB]/60">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(session)}
                          disabled={isPending}
                          className="text-xs border-[#DFD7CB] rounded-lg h-8 font-semibold text-[#2C2621] hover:bg-white cursor-pointer"
                        >
                          Mark as {session.status === 'OPEN' ? 'Follow Up' : session.status === 'FOLLOW_UP' ? 'Resolved' : 'Open'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(session)}
                          className="text-xs border-[#DFD7CB] rounded-lg h-8 font-semibold text-[#2C2621] hover:bg-white cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Notes
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(session.id)}
                        disabled={isPending}
                        className="text-xs text-red-600 hover:bg-red-50 rounded-lg h-8 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Log
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal: Log / Edit Guidance Session */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in-50 zoom-in-95 font-sans space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#2C2621]">
                  {editingSession ? 'Edit Advisory Session Log' : 'Log Advisee Guidance Session'}
                </h3>
                <p className="text-xs text-[#7A7067] mt-0.5">
                  Document meeting takeaways, student concerns, and actionable milestones for career progression.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Select Advisee *</Label>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <Label className="text-xs font-semibold text-[#2C2621]">Follow-Up Date (Optional)</Label>
                  <Input
                    type="date"
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                    className="border-[#DFD7CB] rounded-xl text-xs h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#2C2621]">Session Status *</Label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full border border-[#DFD7CB] rounded-xl text-xs bg-white h-10 px-3 text-[#2C2621] focus:outline-hidden focus:border-[#A36B40]"
                    required
                  >
                    <option value="OPEN">Open / Action Required</option>
                    <option value="FOLLOW_UP">Follow Up Required</option>
                    <option value="RESOLVED">Resolved / Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Discussion Summary & Advisory Guidance *</Label>
                <Textarea
                  value={discussionSummary}
                  onChange={e => setDiscussionSummary(e.target.value)}
                  placeholder="Comprehensive summary of topics discussed, student questions, and strategic advice given..."
                  rows={4}
                  className="border-[#DFD7CB] rounded-xl text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Identified Academic or Career Concerns</Label>
                <Textarea
                  value={identifiedConcerns}
                  onChange={e => setIdentifiedConcerns(e.target.value)}
                  placeholder="e.g. Weakness in Data Structures, anxiety about internship interviews, curriculum credit overload..."
                  rows={2}
                  className="border-[#DFD7CB] rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Recommended Actions & Student Next Steps</Label>
                <Textarea
                  value={recommendedActions}
                  onChange={e => setRecommendedActions(e.target.value)}
                  placeholder="e.g. 1. Complete Cloud foundations module by Nov 10; 2. Meet with Prof. Sharma for capstone project review..."
                  rows={3}
                  className="border-[#DFD7CB] rounded-xl text-xs font-medium"
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
                  {isPending ? 'Saving...' : editingSession ? 'Update Log' : 'Save Session Log'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
