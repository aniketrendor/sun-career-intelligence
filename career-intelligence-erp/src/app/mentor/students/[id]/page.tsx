import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  User, Mail, Phone, Calendar, BookOpen, Target,
  Award, MessageSquare, Clock, ArrowLeft, CheckCircle2,
  AlertCircle, ChevronRight, BarChart2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatDate, formatDateTime } from '@/lib/utils'
import { CounselingSessionModal } from '@/components/counselor/counseling-session-modal'

export const dynamic = 'force-dynamic'

export default async function Student360Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: studentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Fetch student user & profile
  const { data: student } = await supabase
    .from('users')
    .select(`
      *,
      student_profile:student_profiles(*),
      enrollments:enrollments(
        *,
        program:programs(name, code, academic_year),
        class:classes(name, semester)
      )
    `)
    .eq('id', studentId)
    .single()

  if (!student) notFound()

  // Fetch assessment attempts, scores, and sessions
  const [
    { data: attempts },
    { data: traitScores },
    { data: domainScores },
    { data: careerProfile },
    { data: sessions },
  ] = await Promise.all([
    supabase.from('assessment_attempts').select('*').eq('student_id', studentId).order('started_at', { ascending: false }),
    supabase.from('trait_scores').select('*, trait:traits(name, category)').eq('student_id', studentId).order('normalized_score', { ascending: false }),
    supabase.from('domain_scores').select('*, domain:career_domains(name, description)').eq('student_id', studentId).order('rank', { ascending: true }),
    supabase.from('career_profiles').select('*, primary_domain:career_domains!primary_domain_id(name), secondary_domain:career_domains!secondary_domain_id(name)').eq('student_id', studentId).single(),
    supabase.from('counseling_sessions').select('*, counselor:users!counselor_id(full_name)').eq('student_id', studentId).order('session_date', { ascending: false }),
  ])

  const enrollment = student.enrollments?.[0]
  const completedAttempt = attempts?.find((a: any) => a.status === 'COMPLETED')

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/mentor/students">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="w-4 h-4" /> Student Roster
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{student.full_name}</h1>
              <Badge variant="outline" className="text-xs bg-slate-50">
                {student.student_profile?.prn || 'No PRN'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {enrollment?.program?.name || student.student_profile?.current_program || 'Program'} · {student.email}
            </p>
          </div>
        </div>

        <CounselingSessionModal
          studentId={student.id}
          studentName={student.full_name}
        />
      </div>

      {/* Overview 3-column stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Program & Enrollment</CardDescription>
            <CardTitle className="text-base font-bold text-slate-900">
              {enrollment?.program?.name || 'Not Enrolled'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-1">
            <p>Class: {enrollment?.class?.name || 'N/A'} (Sem {enrollment?.class?.semester || 1})</p>
            <p>Academic Year: {enrollment?.academic_year || '2026-27'}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Assessment Status</CardDescription>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              {completedAttempt ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-500" /> Pending Assessment
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-1">
            <p>Completed: {completedAttempt?.completed_at ? formatDate(completedAttempt.completed_at) : 'Not completed'}</p>
            <p>Top Domain: {careerProfile?.primary_domain?.name || 'Pending'}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-500">Counseling Interventions</CardDescription>
            <CardTitle className="text-base font-bold text-indigo-700">
              {sessions?.length || 0} Sessions Logged
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-1">
            <p>Latest Session: {sessions?.[0] ? formatDate(sessions[0].session_date) : 'None'}</p>
            <p>Status: {sessions?.[0]?.status || 'Open'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Domain Scores & Trait Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Domain Alignment */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Career Domain Compatibility</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Calculated alignment ranks based on weighted question traits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!domainScores || domainScores.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Assessment not completed yet.</p>
            ) : (
              domainScores.slice(0, 5).map((d: any) => {
                const score = Math.min(100, Math.round(d.score))
                return (
                  <div key={d.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">
                        #{d.rank} {d.domain?.name}
                      </span>
                      <span className="font-bold text-slate-900">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Trait breakdown */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Psychometric Trait Profile</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Normalized cognitive and behavioral trait scores (0 - 100)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!traitScores || traitScores.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Assessment not completed yet.</p>
            ) : (
              traitScores.slice(0, 7).map((t: any) => {
                const norm = Math.round(t.normalized_score)
                return (
                  <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <span className="font-medium text-slate-700">{t.trait?.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">({t.trait?.category || 'General'})</span>
                      <span className="font-bold text-slate-900 w-8 text-right">{norm}</span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Counseling History */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Counseling History & Notes</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Chronological records of advisor meetings and action items
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sessions || sessions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No counseling records found for this student.</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((s: any) => (
                <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Session Date: {formatDate(s.session_date)}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {s.status}
                    </Badge>
                  </div>
                  {s.discussion_summary && (
                    <p className="text-xs text-slate-700">{s.discussion_summary}</p>
                  )}
                  {s.recommended_actions && (
                    <p className="text-xs text-emerald-800 font-medium">Actions: {s.recommended_actions}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
