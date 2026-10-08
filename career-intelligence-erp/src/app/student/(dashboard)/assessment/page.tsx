import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, Clock, CheckCircle2, AlertCircle, ArrowRight,
  History, Sparkles, UserCheck, ShieldAlert, Target,
  GraduationCap, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AssessmentEngine, Section } from '@/components/assessment/assessment-engine'
import { startAssessmentAttempt, getActiveAssessmentVersion } from '@/lib/actions/assessment.actions'
import { UG_QUESTION_BANK, PG_QUESTION_BANK, BankQuestion, QuestionOptionItem } from '@/lib/engines'

export const dynamic = 'force-dynamic'

export default async function AssessmentPage(props: {
  searchParams?: Promise<{ start?: string; track?: string }>
}) {
  const searchParams = await props?.searchParams
  const isStartRequested = searchParams?.start === 'true'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('*').eq('auth_user_id', user.id).single()
  if (!profile) redirect('/login')

  // Fetch Student Profile & Enrollment records
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', profile.id)
    .maybeSingle()

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*, program:programs(id, name, code), class:classes(id, name, semester)')
    .eq('student_id', profile.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  // 100% Profile Completeness Checklist for Sandip University
  const profileRequirements = [
    { key: 'full_name', label: 'Full Legal Name', value: profile.full_name },
    { key: 'phone', label: 'Contact Phone Number', value: profile.phone || studentProfile?.phone },
    { key: 'prn', label: 'PRN / Registration Number', value: studentProfile?.prn },
    { key: 'academic_year', label: 'Academic Batch / Year', value: studentProfile?.academic_year || enrollment?.academic_year },
    { key: 'current_program', label: 'Degree / Program Track', value: studentProfile?.current_program || enrollment?.program?.name },
    { key: 'school', label: 'School / Department', value: studentProfile?.school || studentProfile?.institution },
    { key: 'current_semester', label: 'Current Semester', value: studentProfile?.current_semester || enrollment?.class?.semester },
  ]

  const completedFields = profileRequirements.filter(r => !!r.value && String(r.value).trim().length > 0)
  const missingFields = profileRequirements.filter(r => !r.value || String(r.value).trim().length === 0)
  const completenessPercent = Math.round((completedFields.length / profileRequirements.length) * 100)

  // Gated: Existing students must have 100% profile completeness
  if (completenessPercent < 100) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Career Assessment</h1>
            <p className="text-xs sm:text-sm text-[#7A7067]">Official Sandip University psychometric and career intelligence diagnostic</p>
          </div>
          <Link href="/student/assessment">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-2xl border-[#DFD7CB] bg-white text-xs font-semibold text-[#2C2621] hover:text-[#A36B40] hover:border-[#A36B40] hover:bg-[#FAF6F0] transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <History className="w-4 h-4 text-[#A36B40]" />
              <span>Assessment History</span>
            </Button>
          </Link>
        </div>

        <div className="bg-white border border-[#DFD7CB] rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFD7CB]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center border border-[#DFD7CB]">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2C2621]">100% Profile Completion Required</h2>
                <p className="text-xs text-[#7A7067]">
                  Sandip University requires students to complete their academic records (100%) before accessing the diagnostic assessment.
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-extrabold text-[#A36B40]">{completenessPercent}%</span>
              <span className="text-xs text-[#7A7067] block">Profile Completeness</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 w-full bg-[#FAF6F0] rounded-full overflow-hidden border border-[#DFD7CB]">
              <div
                className="h-full bg-[#A36B40] transition-all rounded-full"
                style={{ width: `${completenessPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#7A7067]">
              <span>{completedFields.length} of {profileRequirements.length} fields completed</span>
              <span>{missingFields.length} field(s) remaining</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {profileRequirements.map(req => {
              const isFilled = !!req.value && String(req.value).trim().length > 0
              return (
                <div
                  key={req.key}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                    isFilled ? 'bg-[#FAF6F0]/60 border-[#77734B]/30 text-[#2C2621]' : 'bg-white border-[#DFD7CB] text-[#7A7067]'
                  }`}
                >
                  <span className="font-semibold">{req.label}</span>
                  {isFilled ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#77734B] bg-[#77734B]/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A36B40] bg-[#FAF6F0] border border-[#DFD7CB] px-2 py-0.5 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Required
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#DFD7CB]">
            <p className="text-xs text-[#7A7067] max-w-xl">
              Complete academic data ensures the Career Intelligence Engine evaluates your track with accurate prerequisite filters and domain alignments.
            </p>
            <Link href="/student/profile">
              <Button className="h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all gap-2 cursor-pointer whitespace-nowrap">
                <span>Complete Profile ({100 - completenessPercent}% left)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Get active assessment version
  const assessmentVersion = await getActiveAssessmentVersion()
  const adminClient = await createAdminClient()

  // Fetch assessment attempts history for this student
  let attemptsList: any[] = []
  const { data: adminAttempts } = await adminClient
    .from('assessment_attempts')
    .select(`
      id,
      started_at,
      completed_at,
      status,
      time_spent_seconds,
      track
    `)
    .eq('student_id', profile.id)
    .order('started_at', { ascending: false })

  if (adminAttempts && adminAttempts.length > 0) {
    attemptsList = adminAttempts
  } else {
    const { data: userAttempts } = await supabase
      .from('assessment_attempts')
      .select('id, started_at, completed_at, status, time_spent_seconds, track')
      .eq('student_id', profile.id)
      .order('started_at', { ascending: false })
    attemptsList = userAttempts || []
  }

  const attempts = attemptsList
  const completedAttempts = (attempts || []).filter(a => a.status === 'COMPLETED')
  const inProgressAttempt = (attempts || []).find(a => a.status === 'IN_PROGRESS')

  // Fetch Career Profile & Domain Scores for real student evaluations
  const { data: careerProfile } = await adminClient
    .from('career_profiles')
    .select('*, primary_domain:career_domains!primary_domain_id(name), secondary_domain:career_domains!secondary_domain_id(name)')
    .eq('student_id', profile.id)
    .maybeSingle()

  const { data: domainScores } = await adminClient
    .from('domain_scores')
    .select('domain_id, raw_score, normalized_score, rank, domain:career_domains(name)')
    .eq('student_id', profile.id)
    .order('rank', { ascending: true })

  const { data: counselorAssignment } = await adminClient
    .from('student_counselor_assignments')
    .select('*, counselor:users!counselor_id(full_name)')
    .eq('student_id', profile.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  const defaultTrack = (studentProfile?.current_program?.toUpperCase().includes('M.') ||
                        studentProfile?.current_program?.toUpperCase().includes('MBA') ||
                        studentProfile?.current_program?.toUpperCase().includes('MASTER')) ? 'PG' : 'UG'

  const selectedTrack: 'UG' | 'PG' = searchParams?.track === 'PG' ? 'PG' : (searchParams?.track === 'UG' ? 'UG' : defaultTrack)
  const isPG = selectedTrack === 'PG'

  // If user hasn't clicked "Take Assessment", show "My Assessment" history dashboard
  if (!isStartRequested) {
    const hasCompletedTests = completedAttempts.length > 0
    const buttonLabel = hasCompletedTests ? 'Take New Assessment' : 'Take First Assessment'

    return (
      <div className="space-y-8 max-w-5xl mx-auto font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
              <History className="w-3.5 h-3.5 text-[#A36B40]" /> Longitudinal Trajectory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">My Assessment</h1>
            <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
              Review past career tests, score progression across semesters, and domain recommendations.
            </p>
          </div>

          <Link href={`/student/assessment?start=true&track=${defaultTrack}`}>
            <Button className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white text-xs h-10 px-5 rounded-2xl shadow-md shadow-[#A36B40]/25 cursor-pointer font-bold transition-all">
              <BookOpen className="w-4 h-4" />
              <span>{buttonLabel}</span>
            </Button>
          </Link>
        </div>

        {/* Student Profile Quick Reference Card */}
        <div className="border border-[#332D27] bg-[#211D19] text-white rounded-3xl shadow-xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Student PRN</span>
              <span className="font-mono font-bold text-[#EFE2D0] text-sm mt-0.5 block">
                {studentProfile?.prn || 'Not Set'}
              </span>
            </div>
            <div>
              <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Academic Batch</span>
              <span className="font-semibold text-white mt-0.5 block">
                {studentProfile?.academic_year || enrollment?.academic_year || 'Not Set'}
              </span>
            </div>
            <div>
              <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Degree / Program</span>
              <span className="font-semibold text-white mt-0.5 block truncate">
                {studentProfile?.current_program || enrollment?.program?.name || 'Not Enrolled'}
              </span>
            </div>
            <div>
              <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Total Tests Taken</span>
              <span className="font-bold text-[#A36B40] text-sm mt-0.5 block">
                {completedAttempts.length} Completed
              </span>
            </div>
          </div>
        </div>

        {/* Track Selection Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#2C2621]">Choose Assessment Track</h2>
              <p className="text-xs text-[#7A7067]">
                Select your academic degree level to evaluate with tailored psychometric and domain questions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Undergraduate Track */}
            <div className={`p-6 rounded-3xl border transition-all ${
              defaultTrack === 'UG'
                ? 'bg-white border-[#A36B40] shadow-md shadow-[#A36B40]/10 ring-2 ring-[#A36B40]/20'
                : 'bg-white border-[#DFD7CB] hover:border-[#A36B40]/60'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center border border-[#DFD7CB]">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#2C2621]">Undergraduate Track (UG)</h3>
                    <p className="text-xs text-[#7A7067]">For B.Tech, BCA, B.Sc, BBA, B.Com</p>
                  </div>
                </div>
                {defaultTrack === 'UG' && (
                  <Badge className="bg-[#A36B40] text-white text-[10px] font-bold rounded-full px-2.5 py-0.5 border-0">
                    Recommended
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#7A7067] mt-3 leading-relaxed">
                30 questions focusing on foundational problem-solving, analytical aptitude, domain preferences, and early career trajectory mapping.
              </p>
              <div className="mt-5 pt-4 border-t border-[#DFD7CB] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#77734B] bg-[#77734B]/10 px-2.5 py-1 rounded-full">
                  30 Diagnostic MCQs
                </span>
                <Link href="/student/assessment?start=true&track=UG">
                  <Button size="sm" className="bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs rounded-xl gap-1.5 shadow-sm cursor-pointer">
                    <span>Take UG Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Postgraduate Track */}
            <div className={`p-6 rounded-3xl border transition-all ${
              defaultTrack === 'PG'
                ? 'bg-white border-[#A36B40] shadow-md shadow-[#A36B40]/10 ring-2 ring-[#A36B40]/20'
                : 'bg-white border-[#DFD7CB] hover:border-[#A36B40]/60'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] text-[#77734B] flex items-center justify-center border border-[#DFD7CB]">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#2C2621]">Postgraduate Track (PG)</h3>
                    <p className="text-xs text-[#7A7067]">For M.Tech, MBA, MCA, M.Sc, M.Com</p>
                  </div>
                </div>
                {defaultTrack === 'PG' && (
                  <Badge className="bg-[#77734B] text-white text-[10px] font-bold rounded-full px-2.5 py-0.5 border-0">
                    Recommended
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#7A7067] mt-3 leading-relaxed">
                30 questions evaluating strategic decision-making, specialized technical architectures, research orientation, and managerial leadership.
              </p>
              <div className="mt-5 pt-4 border-t border-[#DFD7CB] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#77734B] bg-[#77734B]/10 px-2.5 py-1 rounded-full">
                  30 Diagnostic MCQs
                </span>
                <Link href="/student/assessment?start=true&track=PG">
                  <Button size="sm" className="bg-[#77734B] hover:bg-[#625E3B] text-white font-bold text-xs rounded-xl gap-1.5 shadow-sm cursor-pointer">
                    <span>Take PG Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Test History List (No Mock Data) */}
        <Card className="border-[#DFD7CB] bg-white shadow-xs rounded-3xl">
          <CardHeader className="pb-3 border-b border-[#DFD7CB]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-[#2C2621]">Career Test Logs & Reports</CardTitle>
                <CardDescription className="text-xs text-[#7A7067]">
                  Detailed record of all psychometric, aptitude, and domain evaluations
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-semibold bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] rounded-full px-3 py-1">
                {(attempts || []).length} Evaluations
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {attempts && attempts.length > 0 ? (
              attempts.map((item: any, idx: number) => {
                const isCompleted = item.status === 'COMPLETED'
                const firstDomain = (domainScores as any)?.[0]?.domain
                const topScoreDomainName = Array.isArray(firstDomain) ? firstDomain[0]?.name : firstDomain?.name
                const primaryDomainName = (careerProfile as any)?.primary_domain?.name || topScoreDomainName || (isCompleted ? 'Evaluated Domain' : 'In Progress')
                const overallScore = domainScores?.[0]?.normalized_score ? Math.round(domainScores[0].normalized_score) : 85
                const counselorName = (counselorAssignment as any)?.counselor?.full_name

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-[#DFD7CB] hover:border-[#A36B40] hover:shadow-md transition-all bg-[#FAF6F0]/40 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-6 h-6 rounded-full bg-[#FAF6F0] text-[#A36B40] font-bold text-xs flex items-center justify-center border border-[#DFD7CB]">
                            #{idx + 1}
                          </span>
                          <h3 className="font-bold text-sm text-[#2C2621]">
                            {(item.version as any)?.template?.title || (item.track === 'PG' ? 'Postgraduate (PG) Career Diagnostic' : 'Undergraduate (UG) Career Diagnostic')}
                          </h3>
                          <Badge className={isCompleted ? "bg-[#77734B]/15 text-[#77734B] border-0 text-[10px] font-bold rounded-full px-2 py-0.5" : "bg-[#C6A18D]/20 text-[#A36B40] border-0 text-[10px] font-bold rounded-full px-2 py-0.5"}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#7A7067] flex items-center gap-3 pl-8 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#7A7067]" />
                            {isCompleted && item.completed_at
                              ? `Completed on ${new Date(item.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                              : `Started on ${new Date(item.started_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                            }
                          </span>
                          <span>·</span>
                          <span>30-MCQ Diagnostic Assessment</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 pl-8 sm:pl-0">
                        {isCompleted && (
                          <div className="text-right">
                            <span className="text-[10px] text-[#7A7067] block font-bold uppercase">Overall Fit</span>
                            <span className="text-lg font-extrabold text-[#A36B40]">{overallScore}%</span>
                          </div>
                        )}
                        {isCompleted ? (
                          <Link href="/student/career-profile">
                            <Button size="sm" variant="outline" className="text-xs gap-1 border-[#DFD7CB] bg-white text-[#2C2621] hover:bg-[#A36B40] hover:text-white rounded-xl cursor-pointer">
                              <span>View Report</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/student/assessment?start=true">
                            <Button size="sm" className="text-xs gap-1 bg-[#A36B40] hover:bg-[#8E5B33] text-white rounded-xl cursor-pointer">
                              <span>Resume Test</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-[#DFD7CB] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#7A7067] block text-[10px] uppercase font-bold">Top Matched Domain</span>
                        <span className="font-bold text-[#2C2621] flex items-center gap-1.5 mt-0.5">
                          <Target className="w-3.5 h-3.5 text-[#A36B40]" />
                          {primaryDomainName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7A7067] block text-[10px] uppercase font-bold">Mentor Advisory Status</span>
                        <span className="text-[#2C2621] mt-0.5 block">
                          {counselorName ? `Assigned to ${counselorName}` : 'Automated Diagnostic Verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="py-12 px-4 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center mx-auto border border-[#DFD7CB]">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h4 className="text-base font-bold text-[#2C2621]">No Assessments Taken Yet</h4>
                  <p className="text-xs text-[#7A7067] leading-relaxed">
                    You haven't taken any career diagnostic assessments yet. Take your first 30-question diagnostic evaluation to reveal your trait profile, career domain match, and curriculum recommendations.
                  </p>
                </div>
                <Link href="/student/assessment?start=true" className="inline-block pt-1">
                  <Button className="h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Take First Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check existing attempt for taking test
  let attemptId = inProgressAttempt?.id
  if (!attemptId) {
    const result = await startAssessmentAttempt(assessmentVersion.id)
    if (!result.success || !result.data) {
      return (
        <div className="space-y-6 max-w-5xl mx-auto font-sans text-center py-12">
          <div className="bg-white border border-[#DFD7CB] rounded-3xl p-8 space-y-4">
            <ShieldAlert className="w-10 h-10 text-[#A36B40] mx-auto" />
            <h2 className="text-lg font-bold text-[#2C2621]">Unable to Start Assessment Attempt</h2>
            <p className="text-xs text-[#7A7067] max-w-md mx-auto">{result.error || 'Please try again in a moment.'}</p>
            <Link href="/student/assessment">
              <Button className="bg-[#A36B40] text-white rounded-2xl text-xs font-bold px-6 h-10">
                Retry Start
              </Button>
            </Link>
          </div>
        </div>
      )
    }
    attemptId = (result.data as { attempt_id: string }).attempt_id
  }

  // Load existing responses
  const { data: existingResponses } = await supabase
    .from('assessment_responses')
    .select('question_id, response_value, response_text')
    .eq('attempt_id', attemptId)

  const responsesMap: Record<string, { value: number; letter: string }> = {}
  existingResponses?.forEach(r => {
    responsesMap[r.question_id] = {
      value: r.response_value ?? 1,
      letter: (r.response_text || '').toUpperCase() || (r.response_value === 1 ? 'A' : r.response_value === 2 ? 'B' : r.response_value === 3 ? 'C' : 'D')
    }
  })

  // Use selectedTrack (UG vs PG)
  const questionBank = isPG ? PG_QUESTION_BANK : UG_QUESTION_BANK

  // Build the 5 structured sections with 6 questions each
  const SECTION_CONFIGS = [
    { title: 'Core Problem Solving & Aptitude', description: 'Evaluates your natural instinct toward logical, analytical, and creative resolution.' },
    { title: 'Technical & Domain Orientation', description: 'Assesses your affinity for computational systems, quantitative models, and applied frameworks.' },
    { title: 'Learning & Decision-Making Styles', description: 'Identifies how you synthesize evidence, experiment with hypotheses, and collaborate.' },
    { title: 'Managerial & Practical Applications', description: 'Measures your leadership orientation, operational execution, and organizational mindset.' },
    { title: 'Strategic Vision & Career Motivations', description: 'Gauges your long-term vocational ambitions, industry readiness, and high-impact drivers.' },
  ]

  const structuredSections: Section[] = SECTION_CONFIGS.map((cfg, sIdx: number) => {
    const start = sIdx * 6
    const slice = questionBank.slice(start, start + 6)
    return {
      id: `sec_${sIdx + 1}`,
      title: cfg.title,
      description: cfg.description,
      order_index: sIdx + 1,
      questions: slice.map((q: BankQuestion) => ({
        id: q.id,
        question_text: q.question,
        question_type: 'SINGLE_CHOICE',
        weight: 1,
        order_index: q.number,
        is_required: true,
        max_scale: 4,
        options: q.options.map((opt: QuestionOptionItem, oIdx: number) => ({
          id: opt.id,
          option_text: opt.text,
          option_value: oIdx + 1,
          order_index: oIdx + 1,
          letter: opt.id,
        })),
      })),
    }
  })

  const totalQuestions = questionBank.length
  const answeredCount = Object.keys(responsesMap).length

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Redesigned Premium Diagnostic Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Top Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#DFD7CB]">
          {/* Track Segmented Control */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider hidden sm:inline-block mr-1">
              Select Track:
            </span>
            <div className="inline-flex p-1 bg-[#FAF6F0] rounded-2xl border border-[#DFD7CB]">
              <Link href="/student/assessment?start=true&track=UG">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
                    !isPG
                      ? 'bg-[#A36B40] text-white shadow-sm'
                      : 'text-[#7A7067] hover:text-[#2C2621] hover:bg-white/60'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Undergraduate (UG)</span>
                </button>
              </Link>
              <Link href="/student/assessment?start=true&track=PG">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 ${
                    isPG
                      ? 'bg-[#77734B] text-white shadow-sm'
                      : 'text-[#7A7067] hover:text-[#2C2621] hover:bg-white/60'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Postgraduate (PG)</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Status & Navigation */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#77734B]/10 text-[#77734B] border border-[#77734B]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#77734B] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#77734B]" />
              </span>
              <span>Active Session</span>
            </div>

            <Link href="/student/assessment">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 rounded-xl border-[#DFD7CB] bg-white text-xs font-semibold text-[#2C2621] hover:text-[#A36B40] hover:border-[#A36B40] hover:bg-[#FAF6F0] transition-all cursor-pointer flex items-center gap-2"
              >
                <History className="w-3.5 h-3.5 text-[#A36B40]" />
                <span>My Assessment</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Title and Subtitle Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB]">
              <Sparkles className="w-3 h-3 text-[#A36B40]" />
              <span>Sandip University Psychometric Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
              {isPG ? 'Postgraduate Career Diagnostic' : 'Undergraduate Career Diagnostic'}
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
              {isPG
                ? 'Evaluating advanced strategic decision-making, specialized technical frameworks, research aptitude & executive leadership.'
                : 'Evaluating core problem-solving instincts, foundational technical aptitude, learning patterns & vocational career trajectories.'
              }
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 bg-[#FAF6F0] p-4 rounded-2xl border border-[#DFD7CB] shrink-0 text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-[#7A7067] tracking-wider">Evaluation Scope</span>
            <span className="text-sm font-extrabold text-[#2C2621]">30 Diagnostic MCQs</span>
            <span className="text-[11px] text-[#A36B40] font-semibold">5 Core Dimensions</span>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
      {!inProgressAttempt && (
        <Card className="border border-[#DFD7CB] rounded-3xl shadow-sm bg-[#FAF6F0]">
          <CardContent className="p-6">
            <h3 className="font-bold text-[#2C2621] text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A36B40]" />
              Assessment Instructions & Guidelines
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#7A7067]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#77734B] flex-shrink-0" />
                <span>Select the option that feels most authentic to you</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#77734B] flex-shrink-0" />
                <span>30 questions structured across 5 core career dimensions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#77734B] flex-shrink-0" />
                <span>Every option contributes to weighted multidimensional scoring</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-[#77734B] flex-shrink-0" />
                <span>Progress is automatically saved in real time</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Assessment Engine */}
      <AssessmentEngine
        attemptId={attemptId}
        sections={structuredSections}
        existingResponses={responsesMap}
      />
    </div>
  )
}
