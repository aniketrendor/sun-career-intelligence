'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, User, Mail, Phone, Calendar, BookOpen, Target,
  Award, MessageSquare, Clock, CheckCircle2, AlertCircle,
  ChevronRight, BarChart2, GraduationCap, Plus, Compass,
  CheckSquare, X, ExternalLink, ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'
import { saveCounselingSession, CounselingSessionInput } from '@/lib/actions/mentor.actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Student360ClientProps {
  student: {
    id: string
    full_name: string
    email: string
    phone: string | null
    created_at: string
    student_profile?: {
      prn?: string
      current_program?: string
      current_semester?: number
      academic_year?: string
      school?: string
    } | null
    enrollments?: Array<{
      academic_year?: string
      status?: string
      program?: { name: string; code: string }
      class?: { name: string; semester: number }
    }>
  }
  assignmentNotes: string | null
  completedAttempt: {
    id: string
    completed_at: string | null
  } | null
  domainScores: Array<{
    id: string
    rank: number
    normalized_score: number
    raw_score: number
    alignment_label?: string
    domain?: { name: string; description: string }
  }>
  traitScores: Array<{
    id: string
    normalized_score: number
    trait?: { name: string; category: string }
  }>
  careerProfile: {
    profile_label?: string
    profile_description?: string
    primary_domain?: { name: string } | null
    secondary_domain?: { name: string } | null
  } | null
  sessions: Array<{
    id: string
    session_date: string
    discussion_summary: string | null
    identified_concerns: string | null
    recommended_actions: string | null
    follow_up_date: string | null
    status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED'
    counselor?: { full_name: string }
  }>
}

export function Student360Client({
  student,
  assignmentNotes,
  completedAttempt,
  domainScores,
  traitScores,
  careerProfile,
  sessions
}: Student360ClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form states for Logging Session
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0])
  const [followUpDate, setFollowUpDate] = useState('')
  const [status, setStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'CLOSED'>('OPEN')
  const [topic, setTopic] = useState('Career Diagnostic & Academic Progress Review')
  const [discussionSummary, setDiscussionSummary] = useState('')
  const [identifiedConcerns, setIdentifiedConcerns] = useState('')
  const [recommendedActions, setRecommendedActions] = useState('')

  // Title case the student's name
  const formattedName = (student.full_name || 'Advisee Student')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')

  const initials = formattedName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)

  const enrollment = student.enrollments?.[0]
  const programName =
    enrollment?.program?.name ||
    student.student_profile?.current_program ||
    'Undergraduate Degree Program'

  const semesterNumber =
    enrollment?.class?.semester ||
    student.student_profile?.current_semester ||
    1

  const prn = student.student_profile?.prn

  // Parse faculty endorsement note
  let endorsementData = null
  if (assignmentNotes?.startsWith('[ENDORSED:')) {
    const lines = assignmentNotes.split('\n')
    endorsementData = {
      header: lines[0]?.replace('[', '').replace(']', '') || '',
      track: lines.find(l => l.startsWith('Target Track:'))?.replace('Target Track:', '').trim() || '',
      note: lines.find(l => l.startsWith('Faculty Note:'))?.replace('Faculty Note:', '').trim() || ''
    }
  }

  function handleSaveSession(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const payload: CounselingSessionInput = {
        student_id: student.id,
        session_date: sessionDate,
        topic: topic,
        discussion_summary: discussionSummary,
        identified_concerns: identifiedConcerns || undefined,
        recommended_actions: recommendedActions || undefined,
        follow_up_date: followUpDate || null,
        status: status
      }

      const res = await saveCounselingSession(payload)
      if (res.success) {
        toast.success('Advisory session logged and added to student file')
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to save session')
      }
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Top Dossier Header Card */}
      <Card className="bg-white border-[#DFD7CB] rounded-3xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Link href="/mentor/students">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs font-bold border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] hover:bg-[#F2EAE0] h-10 px-4 rounded-2xl transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-[#A36B40]" /> Student Roster
              </Button>
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center font-extrabold text-xl shrink-0 shadow-xs">
                {initials}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-[#2C2621] tracking-tight">
                    {formattedName}
                  </h1>
                  {prn ? (
                    <Badge variant="outline" className="font-mono text-xs font-bold text-[#7A7067] bg-[#FAF5EC] px-2.5 py-0.5 rounded-lg border-[#DFD7CB]">
                      {prn}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-semibold text-[#8C8276] bg-[#FAF6F0] px-2.5 py-0.5 rounded-lg border-[#DFD7CB]">
                      PRN Pending
                    </Badge>
                  )}
                  <Badge className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full px-2.5 py-0.5">
                    Active Advisee
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A7067] pt-0.5">
                  <span className="font-medium text-[#2C2621]">{programName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#A36B40]" /> {student.email}
                  </span>
                  {student.phone && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#77734B]" /> {student.phone}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <Link href="/mentor/availability">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs font-bold border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] hover:bg-[#F2EAE0] h-10 px-4 rounded-2xl cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#A36B40]" /> Schedule Slot
              </Button>
            </Link>

            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs h-10 px-5 rounded-2xl shadow-md shadow-[#A36B40]/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Log Advisory Session
            </Button>
          </div>
        </div>
      </Card>

      {/* Official Faculty Endorsement Banner (if present) */}
      {endorsementData && (
        <Card className="border-emerald-200 bg-emerald-50/90 rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-700 text-white border-0 text-xs font-bold rounded-full px-2.5 py-0.5">
                  Official Faculty Endorsement Granted
                </Badge>
                <span className="text-xs text-emerald-800 font-semibold">{endorsementData.header}</span>
              </div>
              <h3 className="text-base font-extrabold text-[#2C2621]">
                Specialization Track: {endorsementData.track}
              </h3>
              <p className="text-xs text-emerald-950 leading-relaxed italic">
                &quot;{endorsementData.note}&quot;
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </Card>
      )}

      {/* Overview 3-column stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-white border-[#DFD7CB] rounded-3xl p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#7A7067] uppercase tracking-wider">Program & Enrollment</p>
              <h3 className="text-base font-extrabold text-[#2C2621] mt-1 leading-snug">
                {programName}
              </h3>
              <div className="pt-2 text-xs text-[#7A7067] space-y-1">
                <p>Semester: <span className="font-bold text-[#2C2621]">Semester {semesterNumber}</span></p>
                <p>Academic Year: <span className="font-bold text-[#2C2621]">{enrollment?.academic_year || '2026-27'}</span></p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-3xl p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#7A7067] uppercase tracking-wider">Assessment Status</p>
              <div className="pt-1 flex items-center gap-2">
                {completedAttempt ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full px-2.5 py-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Assessment Verified
                  </Badge>
                ) : (
                  <Badge className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full px-2.5 py-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Diagnostic Pending
                  </Badge>
                )}
              </div>
              <div className="pt-3 text-xs text-[#7A7067] space-y-1">
                <p>
                  Completed:{' '}
                  <span className="font-semibold text-[#2C2621]">
                    {completedAttempt?.completed_at ? formatDate(completedAttempt.completed_at) : 'Awaiting Submission'}
                  </span>
                </p>
                <p>
                  Top Domain:{' '}
                  <span className="font-bold text-[#A36B40]">
                    {careerProfile?.primary_domain?.name || (domainScores[0]?.domain?.name ?? 'Calibrating...')}
                  </span>
                </p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#77734B] flex items-center justify-center shrink-0">
              <Target className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-3xl p-6 shadow-xs">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-[#7A7067] uppercase tracking-wider">Counseling Interventions</p>
              <h3 className="text-2xl font-black text-[#A36B40] mt-1">
                {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'} Logged
              </h3>
              <div className="pt-2 text-xs text-[#7A7067] space-y-1">
                <p>
                  Latest Session:{' '}
                  <span className="font-bold text-[#2C2621]">
                    {sessions[0] ? formatDate(sessions[0].session_date) : 'None yet'}
                  </span>
                </p>
                <p>
                  Action Status:{' '}
                  <span className="font-bold text-[#77734B]">
                    {sessions[0]?.status || 'Open for Guidance'}
                  </span>
                </p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Middle 2-Column: Domain Scores & Psychometric Traits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Compatibility */}
        <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#A36B40]" /> Career Domain Compatibility
                  </CardTitle>
                  <CardDescription className="text-xs text-[#7A7067] mt-0.5">
                    Algorithmic alignment ranks calculated from student psychometric attempts
                  </CardDescription>
                </div>
                <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-xs font-bold">
                  20-D Vectors
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              {domainScores.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] flex items-center justify-center mx-auto shadow-xs">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#2C2621]">Diagnostic Assessment Incomplete</h4>
                  <p className="text-xs text-[#7A7067] max-w-sm mx-auto leading-relaxed">
                    This advisee has not completed their initial career diagnostic test. Algorithmic domain compatibility ranks (Software, Data, Fintech, etc.) will calibrate once submitted.
                  </p>
                  <Link href="/mentor/evaluations">
                    <Button variant="outline" size="sm" className="mt-2 text-xs border-[#DFD7CB] rounded-xl text-[#A36B40] hover:bg-[#FAF6F0] font-semibold cursor-pointer">
                      Review Cohort Evaluations &rarr;
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {domainScores.slice(0, 5).map((d) => {
                    const score = Math.min(100, Math.round(Number(d.normalized_score ?? d.raw_score ?? 0)))
                    return (
                      <div key={d.id} className="space-y-1.5 p-3 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/30">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2C2621] flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-md bg-white border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center font-mono text-[10px] font-bold">
                              #{d.rank}
                            </span>
                            {d.domain?.name}
                          </span>
                          <span className="font-mono font-bold text-[#A36B40]">{score}%</span>
                        </div>
                        <Progress value={score} className="h-1.5 bg-white" />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Psychometric Trait Profile */}
        <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#77734B]" /> Psychometric Trait Profile
                  </CardTitle>
                  <CardDescription className="text-xs text-[#7A7067] mt-0.5">
                    Normalized cognitive and behavioral dimension strength scores (0 - 100)
                  </CardDescription>
                </div>
                <Badge className="bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] text-xs font-semibold">
                  Aptitude Scale
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              {traitScores.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#77734B] border border-[#DFD7CB] flex items-center justify-center mx-auto shadow-xs">
                    <BarChart2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[#2C2621]">Trait Metrics Locked</h4>
                  <p className="text-xs text-[#7A7067] max-w-sm mx-auto leading-relaxed">
                    Cognitive analytical reasoning, quantitative problem solving, and behavioral dimensions will populate here once the student finishes testing.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {traitScores.slice(0, 6).map((t) => {
                    const norm = Math.round(Number(t.normalized_score) || 0)
                    return (
                      <div key={t.id} className="p-3 rounded-2xl border border-[#DFD7CB] bg-white space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2C2621]">{t.trait?.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#7A7067] uppercase font-semibold">{t.trait?.category || 'General'}</span>
                            <span className="font-mono font-bold text-[#A36B40]">{norm}%</span>
                          </div>
                        </div>
                        <Progress value={norm} className="h-1 bg-[#FAF6F0]" />
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Counseling History & Action Items */}
      <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-xs overflow-hidden">
        <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#A36B40]" /> Mentorship Guidance History & Action Logs
            </CardTitle>
            <CardDescription className="text-xs text-[#7A7067] mt-0.5">
              Official records of 1-on-1 consultations, documented bottlenecks, and student milestones
            </CardDescription>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="text-xs font-semibold rounded-xl bg-[#A36B40] hover:bg-[#8E5B34] text-white gap-1.5 h-9 px-4 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Log New Session
          </Button>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] flex items-center justify-center mx-auto shadow-xs">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#2C2621]">No Counseling Sessions Recorded Yet</h4>
              <p className="text-xs text-[#7A7067] max-w-sm mx-auto leading-relaxed">
                Start logging 1-on-1 consultations with {formattedName}. Your session notes and recommended action plans will be recorded here and synced with the advisee&apos;s portal.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-xl text-xs font-semibold px-4 cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Record First Session
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => {
                const isClosed = s.status === 'CLOSED'
                const isInProgress = s.status === 'IN_PROGRESS'

                return (
                  <div
                    key={s.id}
                    className="p-5 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/30 hover:border-[#A36B40] transition-colors space-y-3.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFD7CB]/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-sm text-[#2C2621] flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#A36B40]" /> Session Date: {formatDate(s.session_date)}
                        </span>
                        <Badge
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold border-0 ${
                            isClosed
                              ? 'bg-[#77734B]/15 text-[#77734B]'
                              : isInProgress
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-[#A36B40]/15 text-[#A36B40]'
                          }`}
                        >
                          {s.status}
                        </Badge>
                      </div>

                      {s.follow_up_date && (
                        <div className="flex items-center gap-1.5 text-xs text-[#77734B] font-bold">
                          <Clock className="w-3.5 h-3.5" /> Next Follow-up: {formatDate(s.follow_up_date)}
                        </div>
                      )}
                    </div>

                    {s.discussion_summary && (
                      <div className="text-xs text-[#2C2621] bg-white p-4 rounded-xl border border-[#DFD7CB] leading-relaxed">
                        <span className="font-bold text-[#7A7067] uppercase tracking-wider block mb-1">
                          Advisory Notes:
                        </span>
                        <p className="whitespace-pre-wrap">{s.discussion_summary}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {s.identified_concerns && (
                        <div className="p-3.5 rounded-xl bg-white border border-red-100 text-xs space-y-1">
                          <div className="font-bold text-red-800 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Academic / Career Concerns:
                          </div>
                          <p className="text-[#2C2621] leading-relaxed">{s.identified_concerns}</p>
                        </div>
                      )}

                      {s.recommended_actions && (
                        <div className="p-3.5 rounded-xl bg-white border border-[#77734B]/30 text-xs space-y-1">
                          <div className="font-bold text-[#77734B] flex items-center gap-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-[#77734B]" /> Recommended Action Items:
                          </div>
                          <p className="text-[#2C2621] leading-relaxed font-medium">{s.recommended_actions}</p>
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

      {/* Log Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in-50 zoom-in-95 font-sans space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#2C2621]">Log Advisee Guidance Session</h3>
                <p className="text-xs text-[#7A7067] mt-0.5">
                  Advisee: {formattedName} • {student.email}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-4 pt-2">
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
                  <Label className="text-xs font-semibold text-[#2C2621]">Follow-Up Date</Label>
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
                    className="w-full border border-[#DFD7CB] rounded-xl text-xs bg-white h-10 px-3 text-[#2C2621] focus:outline-hidden focus:border-[#A36B40] cursor-pointer"
                    required
                  >
                    <option value="OPEN">Open / Action Required</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="CLOSED">Closed / Resolved</option>
                  </select>
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
                <Label className="text-xs font-semibold text-[#2C2621]">Discussion Summary & Guidance Notes *</Label>
                <Textarea
                  value={discussionSummary}
                  onChange={e => setDiscussionSummary(e.target.value)}
                  placeholder="Comprehensive summary of conversation points, career advice, and strategic guidance..."
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
                  placeholder="e.g. Coding interview anxiety, lack of portfolio projects, core subject backlogs..."
                  rows={2}
                  className="border-[#DFD7CB] rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2C2621]">Recommended Actions & Student Next Steps</Label>
                <Textarea
                  value={recommendedActions}
                  onChange={e => setRecommendedActions(e.target.value)}
                  placeholder="e.g. 1. Complete Cloud certification module; 2. Submit revised resume for faculty review..."
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
                  {isPending ? 'Saving...' : 'Save Advisory Session'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
