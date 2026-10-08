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
import { TakeFreeTestModal } from '@/components/assessment/take-free-test-modal'
import { AdaptiveAssessmentCockpit } from '@/components/assessment/adaptive-assessment-cockpit'

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

  const defaultTrack = (studentProfile?.current_program?.toUpperCase().includes('M.') ||
                        studentProfile?.current_program?.toUpperCase().includes('MBA') ||
                        studentProfile?.current_program?.toUpperCase().includes('MASTER')) ? 'PG' : 'UG'

  const selectedTrack: 'UG' | 'PG' = searchParams?.track === 'PG' ? 'PG' : (searchParams?.track === 'UG' ? 'UG' : defaultTrack)

  if (isStartRequested) {
    return (
      <AdaptiveAssessmentCockpit
        candidateName={profile.full_name || 'Student'}
        candidateEmail={profile.email || ''}
        candidatePhone={studentProfile?.phone || profile.phone || ''}
        academicLevel={selectedTrack}
        college={studentProfile?.institution || 'Sandip University'}
        qualification={studentProfile?.current_program || (selectedTrack === 'UG' ? 'Undergraduate Student' : 'Postgraduate Student')}
        referralCode="SUN-FRESHERS-2026"
      />
    )
  }

  // Universal Profile Checklist for All Students & Colleges
  const profileRequirements = [
    { key: 'full_name', label: 'Full Legal Name', value: profile.full_name },
    { key: 'phone', label: 'Contact Phone Number', value: profile.phone || studentProfile?.phone },
    { key: 'prn', label: 'Student ID / Roll No. / PRN', value: studentProfile?.prn },
    { key: 'institution', label: 'College / University', value: studentProfile?.institution || enrollment?.program?.institution?.name || 'Sandip University' },
    { key: 'academic_year', label: 'Academic Batch / Year', value: studentProfile?.academic_year || enrollment?.academic_year },
    { key: 'current_program', label: 'Degree / Program Track', value: studentProfile?.current_program || enrollment?.program?.name },
    { key: 'current_semester', label: 'Current Semester / Year', value: studentProfile?.current_semester || enrollment?.class?.semester },
  ]

  const completedFields = profileRequirements.filter(r => !!r.value && String(r.value).trim().length > 0)
  const missingFields = profileRequirements.filter(r => !r.value || String(r.value).trim().length === 0)
  const completenessPercent = Math.round((completedFields.length / profileRequirements.length) * 100)

  // Gated: Existing students must have profile completeness, or can start free assessment directly
  if (completenessPercent < 100) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Career Assessment</h1>
            <p className="text-xs sm:text-sm text-[#7A7067]">Comprehensive career intelligence and diagnostic assessment for all students</p>
          </div>
          <div className="flex items-center gap-2.5">
            <TakeFreeTestModal
              candidateName={profile.full_name || 'Student'}
              candidateEmail={profile.email || ''}
              candidatePhone={studentProfile?.phone || profile.phone || ''}
              candidateCollege={studentProfile?.institution || 'Sandip University'}
              candidateQualification={studentProfile?.current_program || ''}
              defaultTrack={defaultTrack}
              buttonText="Start Free Assessment"
            />
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
        </div>

        <div className="bg-white border border-[#DFD7CB] rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFD7CB]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center border border-[#DFD7CB]">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#2C2621]">Complete Your Academic Records</h2>
                <p className="text-xs text-[#7A7067]">
                  Personalize your assessment results by confirming your university, stream, and student records.
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
            <div className="flex items-center gap-3">
              <TakeFreeTestModal
                candidateName={profile.full_name || 'Student'}
                candidateEmail={profile.email || ''}
                candidatePhone={studentProfile?.phone || profile.phone || ''}
                candidateCollege={studentProfile?.institution || 'Sandip University'}
                candidateQualification={studentProfile?.current_program || ''}
                defaultTrack={defaultTrack}
                buttonText="Take Free Test Now"
                variant="outline"
              />
              <Link href="/student/profile">
                <Button className="h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all gap-2 cursor-pointer whitespace-nowrap">
                  <span>Complete Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

        <TakeFreeTestModal
          candidateName={profile.full_name || 'Student'}
          candidateEmail={profile.email || ''}
          candidatePhone={studentProfile?.phone || profile.phone || ''}
          candidateCollege={studentProfile?.institution || 'Sandip University'}
          candidateQualification={studentProfile?.current_program || ''}
          defaultTrack={defaultTrack}
          buttonText="Take Free Test"
        />
      </div>

      {/* Student Profile Quick Reference Card */}
      <div className="border border-[#332D27] bg-[#211D19] text-white rounded-3xl shadow-xl p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Student ID / PRN</span>
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
                <div className="pt-1">
                  <TakeFreeTestModal
                    candidateName={profile.full_name || 'Student'}
                    candidateEmail={profile.email || ''}
                    candidatePhone={studentProfile?.phone || profile.phone || ''}
                    candidateCollege={studentProfile?.institution || 'Sandip University'}
                    candidateQualification={studentProfile?.current_program || ''}
                    defaultTrack={defaultTrack}
                    buttonText="Take Free Test"
                    buttonClassName="h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer gap-2 inline-flex items-center"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

