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

  let profile: any = null
  try {
    const { data } = await supabase.from('users').select('*').eq('auth_user_id', user.id).maybeSingle()
    profile = data
  } catch (e) {
    console.error('Error loading user profile in assessment page:', e)
  }

  const activeProfile = profile || {
    id: user.id,
    role: 'STUDENT',
    full_name: (user.user_metadata as any)?.full_name || user.email?.split('@')[0] || 'Student',
    email: user.email || '',
  }

  // Concurrently fetch profile and enrollment with resilient fallbacks
  let studentProfile: any = null
  let enrollment: any = null

  try {
    const [spRes, enRes] = await Promise.all([
      supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', activeProfile.id)
        .maybeSingle(),
      supabase
        .from('enrollments')
        .select('*, program:programs(id, name, code), class:classes(id, name, semester)')
        .eq('student_id', activeProfile.id)
        .eq('status', 'ACTIVE')
        .maybeSingle()
    ])
    studentProfile = spRes.data
    enrollment = enRes.data
  } catch (e) {
    console.error('Error loading student profile or enrollment:', e)
  }

  const defaultTrack = (studentProfile?.current_program?.toUpperCase().includes('M.') ||
                        studentProfile?.current_program?.toUpperCase().includes('MBA') ||
                        studentProfile?.current_program?.toUpperCase().includes('MASTER')) ? 'PG' : 'UG'

  const selectedTrack: 'UG' | 'PG' = searchParams?.track === 'PG' ? 'PG' : (searchParams?.track === 'UG' ? 'UG' : defaultTrack)

  // If start is requested, launch the assessment cockpit directly
  if (isStartRequested) {
    const progName = studentProfile?.current_program ||
      (Array.isArray(enrollment?.program) ? enrollment?.program?.[0]?.name : enrollment?.program?.name) ||
      (selectedTrack === 'UG' ? 'Undergraduate Program' : 'Postgraduate Program')

    return (
      <div className="-m-4 md:-m-8 lg:-m-10 min-h-[calc(100vh-4rem)] p-4 sm:p-6 md:p-8 bg-[#FAF6F0] overflow-y-auto flex flex-col">
        <AdaptiveAssessmentCockpit
          candidateName={activeProfile.full_name || 'Student'}
          candidateEmail={activeProfile.email || ''}
          candidatePhone={studentProfile?.phone || activeProfile.phone || ''}
          academicLevel={selectedTrack}
          college={studentProfile?.institution || 'Sandip University'}
          qualification={progName}
          referralCode="SUN-FRESHERS-2026"
        />
      </div>
    )
  }

  // Concurrently fetch assessment attempts, fresher diagnostic tests, career profiles, domain scores, and counselor assignment
  let adminAttempts: any[] = []
  let fresherLeads: any[] = []
  let careerProfile: any = null
  let domainScores: any = null
  let counselorAssignment: any = null

  try {
    const [
      attemptsRes,
      fresherRes,
      careerProfileRes,
      domainScoresRes,
      counselorRes
    ] = await Promise.all([
      supabase
        .from('assessment_attempts')
        .select(`
          id, started_at, completed_at, status, time_spent_seconds,
          version:assessment_versions(
            id, version_number,
            template:assessment_templates(id, name, assessment_type)
          )
        `)
        .eq('student_id', activeProfile.id)
        .order('started_at', { ascending: false }),
      supabase
        .from('fresher_leads')
        .select('*')
        .ilike('candidate_email', activeProfile.email || '')
        .order('created_at', { ascending: false }),
      supabase
        .from('career_profiles')
        .select('*, primary_domain:career_domains!primary_domain_id(name), secondary_domain:career_domains!secondary_domain_id(name)')
        .eq('student_id', activeProfile.id)
        .maybeSingle(),
      supabase
        .from('domain_scores')
        .select('domain_id, raw_score, normalized_score, rank, domain:career_domains(name)')
        .eq('student_id', activeProfile.id)
        .order('rank', { ascending: true }),
      supabase
        .from('student_counselor_assignments')
        .select('*, counselor:users!counselor_id(full_name)')
        .eq('student_id', activeProfile.id)
        .eq('status', 'ACTIVE')
        .maybeSingle(),
    ])
    adminAttempts = attemptsRes.data || []
    fresherLeads = fresherRes.data || []
    careerProfile = careerProfileRes.data
    domainScores = domainScoresRes.data
    counselorAssignment = counselorRes.data
  } catch (err) {
    console.error('Error fetching student assessment logs:', err)
  }

  // Fallback to service role admin client if either list is empty
  if (adminAttempts.length === 0 || fresherLeads.length === 0) {
    try {
      const adminClient = await createAdminClient()
      if (adminAttempts.length === 0) {
        const { data: fallbackAtts } = await adminClient
          .from('assessment_attempts')
          .select(`
            id, started_at, completed_at, status, time_spent_seconds,
            version:assessment_versions(
              id, version_number,
              template:assessment_templates(id, name, assessment_type)
            )
          `)
          .eq('student_id', activeProfile.id)
          .order('started_at', { ascending: false })
        if (fallbackAtts && fallbackAtts.length > 0) adminAttempts = fallbackAtts
      }
      if (fresherLeads.length === 0) {
        const { data: fallbackLeads } = await adminClient
          .from('fresher_leads')
          .select('*')
          .ilike('candidate_email', activeProfile.email || '')
          .order('created_at', { ascending: false })
        if (fallbackLeads && fallbackLeads.length > 0) fresherLeads = fallbackLeads
      }
    } catch {
      // Safe fallback
    }
  }

  // 1. Normalize official attempts
  const officialTests = (adminAttempts || []).map((item: any) => {
    const isCompleted = item.status === 'COMPLETED'
    const firstDomain = (domainScores as any)?.[0]?.domain
    const topScoreDomainName = Array.isArray(firstDomain) ? firstDomain[0]?.name : firstDomain?.name
    const primaryDomainName = (careerProfile as any)?.primary_domain?.name || topScoreDomainName || 'Data Analytics'
    const overallScore = domainScores?.[0]?.normalized_score
      ? Math.round(Number(domainScores[0].normalized_score))
      : 75
    const counselorName = (counselorAssignment as any)?.counselor?.full_name
    const title = (item.version as any)?.template?.name ||
                  (item.version as any)?.template?.title ||
                  (defaultTrack === 'PG' ? 'Postgraduate (PG) Career Diagnostic' : 'Undergraduate (UG) Career Diagnostic')
    const completedDate = item.completed_at || item.started_at

    return {
      id: item.id,
      title,
      badgeText: 'Official Assessment',
      status: item.status || 'COMPLETED',
      isCompleted,
      date: completedDate,
      score: overallScore,
      topDomain: primaryDomainName,
      specialization: studentProfile?.current_program || enrollment?.program?.name || 'Business Analytics',
      counselorAdvisory: counselorName ? `Assigned to ${counselorName}` : 'Automated Diagnostic Verified',
      reportUrl: '/student/career-profile',
      source: 'official' as const,
    }
  })

  // 2. Normalize adaptive/diagnostic tests taken via cockpit / free test
  const diagnosticTests = (fresherLeads || []).map((lead: any) => {
    const isCompleted = lead.status === 'TEST_COMPLETED' || lead.status === 'COMPLETED' || !!lead.test_score || !!lead.fit_score
    const fitScore = Math.round(Number(lead.fit_score || lead.test_score || 70))
    const leadDate = lead.created_at
    const trackLabel = lead.target_level === 'PG' ? 'Postgraduate (PG)' : 'Undergraduate (UG)'
    const title = `${trackLabel} Career Diagnostic`
    const counselorName = (counselorAssignment as any)?.counselor?.full_name

    const rawSpec = lead.recommended_spec || lead.highest_qualification || studentProfile?.current_program || 'General Track'
    const domainLower = (lead.top_domain || '').toLowerCase()
    const specLower = (lead.recommended_spec || '').toLowerCase()
    
    // Reconcile if older database log contained obsolete cross-mapping
    let displaySpec = rawSpec
    if (domainLower.includes('analytics') && (specLower.includes('human resource') || !lead.recommended_spec)) {
      displaySpec = lead.target_level === 'PG' ? 'Business Analytics' : 'Data Analytics'
    } else if (domainLower.includes('technology') && (specLower.includes('human resource') || specLower.includes('general'))) {
      displaySpec = lead.target_level === 'PG' ? 'Computer Science & Engineering (AI & ML)' : 'Computer Science & Engineering'
    }

    const params = new URLSearchParams({
      code: lead.referral_code || 'SUN-FRESHERS-2026',
      name: lead.candidate_name || activeProfile.full_name || 'Student',
      email: lead.candidate_email || activeProfile.email || '',
      phone: lead.candidate_phone || activeProfile.phone || '',
      level: lead.target_level || defaultTrack,
      qualification: lead.highest_qualification || studentProfile?.current_program || '',
      college: lead.last_attempted_college || studentProfile?.institution || 'Sandip University',
      topDomain: lead.top_domain || 'Career Alignment',
      recommendedSpec: displaySpec,
      fitScore: String(fitScore),
      portal: 'student',
    })

    return {
      id: lead.id,
      title,
      badgeText: `${lead.target_level || 'UG'} Diagnostic`,
      status: isCompleted ? 'COMPLETED' : lead.status,
      isCompleted,
      date: leadDate,
      score: fitScore,
      topDomain: lead.top_domain || 'Career Alignment',
      specialization: displaySpec,
      counselorAdvisory: counselorName ? `Assigned to ${counselorName}` : 'Automated Diagnostic Verified',
      reportUrl: `/student/fresher/report?${params.toString()}`,
      source: 'diagnostic' as const,
    }
  })

  // 3. Unify and sort chronologically (most recent first)
  const allTests = [...officialTests, ...diagnosticTests].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0
    const timeB = b.date ? new Date(b.date).getTime() : 0
    return timeB - timeA
  })

  const completedTests = allTests.filter(t => t.isCompleted)

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
            <History className="w-3.5 h-3.5 text-[#A36B40]" /> Longitudinal Trajectory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">My Assessment & History</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Review past career tests, score progression across semesters, and domain recommendations.
          </p>
        </div>

        <TakeFreeTestModal
          candidateName={activeProfile.full_name || 'Student'}
          candidateEmail={activeProfile.email || ''}
          candidatePhone={studentProfile?.phone || activeProfile.phone || ''}
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
              {completedTests.length} Completed
            </span>
          </div>
        </div>
      </div>

      {/* Test History List */}
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
                {allTests.length} Evaluations
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {allTests && allTests.length > 0 ? (
              allTests.map((item: any, idx: number) => {
                const isCompleted = item.isCompleted

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
                            {item.title}
                          </h3>
                          <Badge className={isCompleted ? "bg-[#77734B]/15 text-[#77734B] border-0 text-[10px] font-bold rounded-full px-2 py-0.5" : "bg-[#C6A18D]/20 text-[#A36B40] border-0 text-[10px] font-bold rounded-full px-2 py-0.5"}>
                            {item.status}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-semibold bg-white text-[#7A7067] border-[#DFD7CB] rounded-full px-2 py-0.5">
                            {item.badgeText}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#7A7067] flex items-center gap-3 pl-8 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#7A7067]" />
                            {item.date
                              ? `Completed on ${new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                              : 'Evaluation Finished'
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
                            <span className="text-lg font-extrabold text-[#A36B40]">{item.score}%</span>
                          </div>
                        )}
                        {isCompleted ? (
                          <Link href={item.reportUrl}>
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
                          {item.topDomain}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7A7067] block text-[10px] uppercase font-bold">Recommended Specialization / Track</span>
                        <span className="text-[#2C2621] font-semibold flex items-center gap-1.5 mt-0.5 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-[#77734B]" />
                          {item.specialization}
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

