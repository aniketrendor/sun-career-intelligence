import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users, MessageSquare, BookOpen, TrendingUp,
  ArrowRight, CheckCircle2, Clock, Target, Calendar,
  QrCode, Sparkles, Plus, Award, UserCheck, Ticket,
  ChevronRight, ArrowUpRight, Check, Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function formatLeadStatus(status?: string) {
  if (!status) return { label: 'Test Completed', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
  switch (status.toUpperCase()) {
    case 'TEST_COMPLETED':
      return { label: 'Test Completed', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
    case 'ADMISSION_CONFIRMED':
    case 'ADMISSION_FORM_SENT':
      return { label: 'Admissions Form Sent', badgeClass: 'bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB]' }
    case 'APPROVED_BY_MENTOR':
      return { label: 'Approved by Mentor', badgeClass: 'bg-[#F1F1EB] text-[#77734B] border-[#DFD7CB]' }
    case 'PENDING':
      return { label: 'In Progress', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' }
    default:
      return { label: status.replace(/_/g, ' '), badgeClass: 'bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB]' }
  }
}

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

  const [
    { data: myAssignments },
    { count: totalCompletedAssessments },
    { data: mySessions },
    { count: totalReferrals },
    { data: assignedFresherLeads },
    { data: fitScoreRecords },
  ] = await Promise.all([
    supabase.from('student_counselor_assignments').select(`
      id,
      assigned_at,
      status,
      student:users!student_id(
        id,
        full_name,
        email,
        student_profile:student_profiles(prn, current_program, current_semester, academic_year, school)
      )
    `).eq('counselor_id', profile.id).eq('status', 'ACTIVE'),
    supabase.from('assessment_attempts').select('id', { count: 'exact' }).eq('status', 'COMPLETED'),
    supabase.from('counseling_sessions').select(`
      id,
      session_date,
      status,
      discussion_summary,
      student:users!student_id(full_name)
    `).eq('counselor_id', profile.id).order('session_date', { ascending: false }).limit(6),
    supabase.from('referral_codes').select('id', { count: 'exact' }),
    supabase.from('fresher_leads').select('*').or(`assigned_mentor_id.eq.${profile.id},assigned_mentor_id.is.null`).order('created_at', { ascending: false }).limit(6),
    supabase.from('fresher_leads').select('fit_score').not('fit_score', 'is', null),
  ])

  const assignedStudents = (myAssignments || []).map((a: any) => a.student)

  // Real average calculation
  const avgFitScore = (fitScoreRecords && fitScoreRecords.length > 0)
    ? `${Math.round(fitScoreRecords.reduce((acc, curr) => acc + (curr.fit_score || 0), 0) / fitScoreRecords.length)}%`
    : 'N/A'

  const stats = [
    {
      label: 'My Assigned Students',
      value: assignedStudents.length,
      subtext: 'Active undergraduate caseload',
      icon: Users,
      iconBg: 'bg-[#F7EFEA] text-[#A36B40] border-[#A36B40]/30',
      href: '/mentor/students'
    },
    {
      label: 'Total Tests Taken',
      value: totalCompletedAssessments || 0,
      subtext: 'Diagnostic & benchmark evaluations',
      icon: BookOpen,
      iconBg: 'bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30',
      href: '/mentor/assessments'
    },
    {
      label: 'Average Specialization Fit',
      value: avgFitScore,
      subtext: avgFitScore !== 'N/A' ? 'Real domain alignment average' : 'Awaiting diagnostic completions',
      icon: Target,
      iconBg: 'bg-[#FAF6F0] text-[#C6A18D] border-[#C6A18D]/40',
      href: '/mentor/analytics'
    },
    {
      label: 'Active Referral Keys',
      value: totalReferrals || 0,
      subtext: 'Fresher & batch codes issued',
      icon: QrCode,
      iconBg: 'bg-[#FAF5EC] text-[#A36B40] border-[#A36B40]/30',
      href: '/mentor/referral-codes'
    },
  ]

  const fresherList = assignedFresherLeads || []

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
            Oversee fresher referrals, generate admission keys, monitor student test performance, and guide career paths.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/mentor/referral-codes">
            <Button size="sm" className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs h-10 px-4 rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Generate Key
            </Button>
          </Link>
          <Link href="/mentor/students">
            <Button size="sm" variant="outline" className="gap-2 text-xs font-bold border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] hover:bg-[#F2EAE0] h-10 px-4 rounded-2xl transition-all cursor-pointer">
              <Users className="w-3.5 h-3.5 text-[#A36B40]" /> View Advisees
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

      {/* Fresher Admissions & Referral Evaluation Pipeline */}
      <Card className="bg-white border-[#DFD7CB] shadow-sm rounded-3xl overflow-hidden">
        <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#A36B40]" />
              <span>Fresher Referral Tests & Admission Pipeline</span>
            </CardTitle>
            <CardDescription className="text-xs text-[#7A7067] mt-0.5">
              Candidates who tested via your referral keys and are assigned for Sandip University admission guidance
            </CardDescription>
          </div>
          <Link href="/mentor/referral-codes">
            <Button variant="outline" size="sm" className="text-xs font-semibold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-white gap-1 h-9">
              Referral Manager <ArrowRight className="w-3.5 h-3.5 text-[#A36B40]" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {fresherList.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-2.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] flex items-center justify-center mx-auto shadow-xs">
                <Ticket className="w-6 h-6" />
              </div>
              <p className="font-bold text-[#2C2621] text-sm">No Fresher Candidates Registered Yet</p>
              <p className="text-xs text-[#7A7067] max-w-md mx-auto">
                When aspiring freshers complete their diagnostic assessment using your referral keys, their evaluation scores, fit percentages, and recommended degree programs will appear here.
              </p>
              <div className="pt-2">
                <Link href="/mentor/referral-codes">
                  <Button size="sm" className="bg-[#A36B40] hover:bg-[#8E5B34] text-white text-xs font-bold rounded-xl h-8 px-4 shadow-sm cursor-pointer">
                    View Active Referral Keys
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#DFD7CB]/60">
              {fresherList.map((fresher: any) => {
                const statusInfo = formatLeadStatus(fresher.status)
                const initials = (fresher.candidate_name || 'ST')
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)

                const reportUrl = `/student/fresher/report?code=${encodeURIComponent(fresher.referral_code || 'SUN-FRESHERS-2026')}&name=${encodeURIComponent(fresher.candidate_name || 'Candidate')}&fitScore=${fresher.fit_score || 0}&topDomain=${encodeURIComponent(fresher.recommended_spec || fresher.top_domain || 'AI & Data Engineering')}`

                return (
                  <div key={fresher.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-[#2C2621] text-sm">
                            {fresher.candidate_name}
                          </h4>
                          <span className="font-mono text-[10px] font-bold text-[#A36B40] bg-[#FAF5EC] px-2 py-0.5 rounded-lg border border-[#DFD7CB]">
                            {fresher.referral_code}
                          </span>
                        </div>
                        <p className="text-xs text-[#7A7067] mt-1">
                          Recommended: <strong className="text-[#2C2621] font-semibold">{fresher.recommended_spec || fresher.top_domain || 'Pending Evaluation'}</strong>
                          {fresher.created_at ? ` · ${formatDate(fresher.created_at)}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#7A7067] uppercase font-bold tracking-wider block">
                          Aptitude Fit
                        </span>
                        <span className="font-mono font-black text-[#77734B] text-base">
                          {fresher.fit_score ? `${fresher.fit_score}%` : 'N/A'}
                        </span>
                      </div>

                      <Badge className={`text-xs font-semibold px-2.5 py-1 ${statusInfo.badgeClass}`}>
                        {statusInfo.label}
                      </Badge>

                      <Link href={reportUrl} target="_blank">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-semibold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] hover:border-[#A36B40] gap-1.5 h-8 px-3"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#A36B40]" />
                          <span>Report</span>
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

      {/* Existing Students Roster & Recent Guidance Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Existing Students with PRN */}
        <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm">
          <CardHeader className="pb-3 border-b border-[#DFD7CB] flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621]">Assigned Student Advisees</CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Active students with registered PRNs & specializations
              </CardDescription>
            </div>
            <Link href="/mentor/students">
              <Button variant="ghost" size="sm" className="gap-1 text-xs font-semibold text-[#A36B40] hover:text-[#8E5B34] hover:bg-[#FAF6F0] rounded-xl">
                All Advisees <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-3">
            {assignedStudents.map((s: any) => (
              <div key={s.id} className="p-3.5 rounded-2xl border border-[#DFD7CB] hover:border-[#A36B40] flex items-center justify-between bg-[#FAF6F0]/40 hover:bg-[#FAF6F0] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF5EC] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center font-bold text-xs">
                    {s.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'ST'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#2C2621] text-xs">{s.full_name}</h4>
                      {s.student_profile?.prn && (
                        <span className="text-[10px] font-mono text-[#7A7067] bg-white px-1.5 py-0.5 rounded border border-[#DFD7CB]">
                          {s.student_profile.prn}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A7067]">
                      {s.student_profile?.current_program || s.email}
                    </p>
                  </div>
                </div>

                <Link href={`/mentor/students/${s.id}`}>
                  <Button size="sm" variant="outline" className="text-xs font-semibold gap-1 border-[#DFD7CB] hover:bg-[#A36B40] hover:text-white rounded-xl h-8">
                    Student 360 <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
            {assignedStudents.length === 0 && (
              <div className="text-center py-8 text-[#7A7067] text-xs">
                No students currently assigned. Use the Admin portal to allocate cohorts.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Guidance Sessions */}
        <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm">
          <CardHeader className="pb-3 border-b border-[#DFD7CB] flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621]">Recent Mentorship Sessions</CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                1-on-1 advisory notes & action plans
              </CardDescription>
            </div>
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
                No counseling sessions logged yet.
              </div>
            )}
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
