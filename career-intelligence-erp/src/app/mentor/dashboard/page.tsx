import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users, BookOpen, Target, Calendar,
  ArrowRight, CheckCircle2, Clock, Sparkles,
  Building2, GraduationCap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CounselorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Query strictly this mentor's assigned students
  const { data: myAssignments } = await supabase
    .from('student_counselor_assignments')
    .select(`
      id,
      assigned_at,
      status,
      student:users!student_id(
        id,
        full_name,
        email,
        student_profile:student_profiles(prn, current_program, current_semester, academic_year, school)
      )
    `)
    .eq('counselor_id', profile.id)
    .eq('status', 'ACTIVE')

  const assignedStudents = (myAssignments || []).map((a: any) => a.student).filter(Boolean)
  const assignedStudentIds = assignedStudents.map((s: any) => s.id)

  // Query advisee assessment attempts, career profiles, and sessions
  let completedAttemptsCount = 0
  let studentCareerProfiles: Record<string, any> = {}
  let studentAttempts: Record<string, any> = {}

  if (assignedStudentIds.length > 0) {
    const [
      { count: attemptsCount },
      { data: profiles },
      { data: attempts }
    ] = await Promise.all([
      supabase
        .from('assessment_attempts')
        .select('id', { count: 'exact' })
        .in('student_id', assignedStudentIds)
        .eq('status', 'COMPLETED'),
      supabase
        .from('career_profiles')
        .select(`
          student_id,
          primary_domain:career_domains!primary_domain_id(name),
          secondary_domain:career_domains!secondary_domain_id(name)
        `)
        .in('student_id', assignedStudentIds),
      supabase
        .from('assessment_attempts')
        .select('student_id, status, completed_at')
        .in('student_id', assignedStudentIds)
        .eq('status', 'COMPLETED')
    ])

    completedAttemptsCount = attemptsCount || 0
    profiles?.forEach((p: any) => {
      studentCareerProfiles[p.student_id] = p
    })
    attempts?.forEach((att: any) => {
      studentAttempts[att.student_id] = att
    })
  }

  // Mentor's logged sessions
  const { data: mySessions } = await supabase
    .from('counseling_sessions')
    .select(`
      id,
      session_date,
      status,
      discussion_summary,
      student:users!student_id(full_name)
    `)
    .eq('counselor_id', profile.id)
    .order('session_date', { ascending: false })
    .limit(6)

  // Real count of programs
  const { count: programsCount } = await supabase
    .from('programs')
    .select('id', { count: 'exact', head: true })

  const stats = [
    {
      label: 'My Assigned Advisees',
      value: assignedStudents.length,
      subtext: 'Active undergraduate caseload',
      icon: Users,
      iconBg: 'bg-[#F7EFEA] text-[#A36B40] border-[#A36B40]/30',
      href: '/mentor/students'
    },
    {
      label: 'Completed Diagnostics',
      value: completedAttemptsCount,
      subtext: 'Assessments evaluated',
      icon: BookOpen,
      iconBg: 'bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30',
      href: '/mentor/evaluations'
    },
    {
      label: 'Mentorship Sessions',
      value: mySessions?.length || 0,
      subtext: '1-on-1 guidance notes logged',
      icon: Calendar,
      iconBg: 'bg-[#FAF6F0] text-[#C6A18D] border-[#C6A18D]/40',
      href: '/mentor/sessions'
    },
    {
      label: 'Degree Programs Directory',
      value: programsCount || 0,
      subtext: 'University curricula & syllabi',
      icon: Building2,
      iconBg: 'bg-[#FAF5EC] text-[#A36B40] border-[#A36B40]/30',
      href: '/mentor/programs'
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] mb-2 gap-1.5 font-bold text-xs px-3 py-1">
            <Sparkles className="w-3.5 h-3.5" /> Mentor & Advisory Workspace
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Mentor Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Monitor your assigned students, evaluate career diagnostic results, review university curricula, and guide academic journeys.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/mentor/availability">
            <Button size="sm" variant="outline" className="gap-2 text-xs font-bold border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] hover:bg-[#F2EAE0] h-10 px-4 rounded-2xl transition-all cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-[#A36B40]" /> Available Slots
            </Button>
          </Link>
          <Link href="/mentor/sessions">
            <Button size="sm" variant="outline" className="gap-2 text-xs font-bold border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] hover:bg-[#F2EAE0] h-10 px-4 rounded-2xl transition-all cursor-pointer">
              <Clock className="w-3.5 h-3.5 text-[#77734B]" /> Guidance Sessions
            </Button>
          </Link>
          <Link href="/mentor/students">
            <Button size="sm" className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs h-10 px-4 rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer">
              <Users className="w-3.5 h-3.5" /> View My Advisees
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <Card className="bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:shadow-md transition-all duration-200 cursor-pointer group rounded-2xl">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#7A7067]">{s.label}</span>
                    <p className="text-2xl font-black text-[#2C2621] group-hover:text-[#A36B40] transition-colors">
                      {s.value}
                    </p>
                    <span className="text-[11px] text-[#8C8276] block">{s.subtext}</span>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${s.iconBg}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Assigned Advisee Caseload Table */}
      <Card className="bg-white border-[#DFD7CB] shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#A36B40]" />
              <span>My Assigned Advisee Caseload</span>
            </CardTitle>
            <CardDescription className="text-xs text-[#7A7067] mt-0.5">
              Active students assigned to your guidance panel for academic progress and career direction
            </CardDescription>
          </div>
          <Link href="/mentor/students">
            <Button variant="outline" size="sm" className="text-xs font-semibold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-white gap-1 h-9 cursor-pointer">
              All Advisees <ArrowRight className="w-3.5 h-3.5 text-[#A36B40]" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {assignedStudents.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] flex items-center justify-center mx-auto shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <p className="font-bold text-[#2C2621] text-sm">No Students Assigned Yet</p>
              <p className="text-xs text-[#7A7067] max-w-md mx-auto">
                You are only able to see students assigned directly to you. When students choose you as their faculty mentor or are allocated via the administration, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#DFD7CB]/60">
              {assignedStudents.map((student: any) => {
                const initials = (student.full_name || 'ST')
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)

                const careerProfile = studentCareerProfiles[student.id]
                const completedAttempt = studentAttempts[student.id]

                return (
                  <div key={student.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-[#2C2621] text-sm">
                            {(student.full_name || 'Advisee')
                              .split(' ')
                              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                              .join(' ')}
                          </h4>
                          {student.student_profile?.prn && (
                            <span className="font-mono text-[10px] font-bold text-[#7A7067] bg-[#FAF5EC] px-2 py-0.5 rounded-lg border border-[#DFD7CB]">
                              {student.student_profile.prn}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7A7067] mt-0.5">
                          {student.student_profile?.current_program || 'Program pending'}
                          {student.student_profile?.current_semester ? ` · Semester ${student.student_profile.current_semester}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs shrink-0">
                      {careerProfile?.primary_domain && (
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-[#7A7067] uppercase font-bold tracking-wider block">
                            Top Match
                          </span>
                          <Badge variant="outline" className="text-[11px] font-semibold bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB]">
                            {careerProfile.primary_domain.name}
                          </Badge>
                        </div>
                      )}

                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-[#7A7067] uppercase font-bold tracking-wider block">
                          Diagnostic
                        </span>
                        {completedAttempt ? (
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-800 bg-amber-50 border-amber-200 text-[11px] gap-1 font-semibold">
                            <Clock className="w-3 h-3" /> Pending
                          </Badge>
                        )}
                      </div>

                      <Link href={`/mentor/students/${student.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-semibold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] hover:border-[#A36B40] gap-1.5 h-8 px-3 cursor-pointer"
                        >
                          <span>Student 360</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#A36B40]" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Mentorship Sessions */}
      <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm">
        <CardHeader className="pb-3 border-b border-[#DFD7CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-[#2C2621]">Recent Mentorship Sessions</CardTitle>
            <CardDescription className="text-xs text-[#7A7067]">
              1-on-1 advisory notes & guidance action plans
            </CardDescription>
          </div>
          <Link href="/mentor/sessions">
            <Button variant="outline" size="sm" className="text-xs font-semibold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] gap-1 h-9 cursor-pointer">
              All Sessions & Action Plans <ArrowRight className="w-3.5 h-3.5 text-[#A36B40]" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-3">
          {(mySessions || []).map((sess: any) => (
            <div key={sess.id} className="p-3.5 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2C2621] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#A36B40]" />
                  {sess.student?.full_name}
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold border-[#DFD7CB] bg-white text-[#7A7067]">
                  {sess.status}
                </Badge>
              </div>
              <p className="text-[11px] text-[#7A7067] line-clamp-2">
                {sess.discussion_summary || 'Mentorship notes recorded.'}
              </p>
              <span className="text-[10px] text-[#8C8276] block">
                Date: {formatDate(sess.session_date)}
              </span>
            </div>
          ))}
          {(!mySessions || mySessions.length === 0) && (
            <div className="text-center py-8 text-[#7A7067] text-xs">
              No mentorship sessions logged yet.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
