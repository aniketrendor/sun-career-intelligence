import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, Target, CheckCircle2, AlertCircle,
  TrendingUp, Clock, ArrowRight, GraduationCap, Award,
  Sparkles, Compass, MessageSquare,
  ChevronRight, Bookmark, BrainCircuit, UserCheck,
  BarChart3, FileText, Layers, Calendar, UserX, Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

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

  const { data: attempt } = await supabase
    .from('assessment_attempts')
    .select('*')
    .eq('student_id', profile.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: careerProfile } = await supabase
    .from('career_profiles')
    .select('*, primary_domain:career_domains!primary_domain_id(id, name, description, code), secondary_domain:career_domains!secondary_domain_id(id, name, description, code)')
    .eq('student_id', profile.id)
    .maybeSingle()

  // Domain scores (from attempt or student)
  let domainScores: Array<{ domain: { id: string; name: string; code?: string; description?: string }; score: number; rank: number }> = []
  if (attempt?.id) {
    const { data: dScores } = await supabase
      .from('domain_scores')
      .select('score, rank, domain:career_domains(id, name, code, description)')
      .eq('attempt_id', attempt.id)
      .order('rank', { ascending: true })
      .limit(3)

    if (dScores && dScores.length > 0) {
      domainScores = dScores.map((d: any) => ({
        domain: d.domain,
        score: d.score,
        rank: d.rank,
      }))
    }
  }

  if (domainScores.length === 0) {
    const { data: dScores } = await supabase
      .from('domain_scores')
      .select('score, rank, domain:career_domains(id, name, code, description)')
      .eq('student_id', profile.id)
      .order('rank', { ascending: true })
      .limit(3)

    if (dScores && dScores.length > 0) {
      domainScores = dScores.map((d: any) => ({
        domain: d.domain,
        score: d.score,
        rank: d.rank,
      }))
    }
  }

  const { data: counselorAssignment } = await supabase
    .from('student_counselor_assignments')
    .select('*, counselor:users!counselor_id(id, full_name, email, phone)')
    .eq('student_id', profile.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  const hasCompletedAssessment = attempt?.status === 'COMPLETED' || !!careerProfile
  const hasStartedAssessment = !!attempt && attempt.status !== 'COMPLETED'

  // Real academic profile fields
  const displayPrn = studentProfile?.prn || null
  const displayBatch = studentProfile?.academic_year || studentProfile?.batch || enrollment?.academic_year || null
  const displayCourse = studentProfile?.current_program || enrollment?.program?.name || null
  const displayCourseCode = enrollment?.program?.code || null
  const displaySpec = studentProfile?.school || studentProfile?.institution || studentProfile?.current_specialization || careerProfile?.primary_domain?.name || null
  const displaySemester = studentProfile?.current_semester 
    ? `Semester ${studentProfile.current_semester}` 
    : (enrollment?.class?.semester ? `Semester ${enrollment.class.semester}` : null)
  
  const mentor = counselorAssignment?.counselor
  const mentorName = mentor?.full_name || null
  const mentorEmail = mentor?.email || null

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
      
      {/* 1. Header Hero Banner: Personalized Greeting + Integrated Status Capsule */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A36B40] bg-[#F7EFEA] px-3 py-1 rounded-full border border-[#A36B40]/30">
              <GraduationCap className="w-3.5 h-3.5 text-[#A36B40]" />
              Sandip University Portal
            </span>
            {enrollment ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77734B] bg-[#F1F1EB] px-3 py-1 rounded-full border border-[#77734B]/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B]" />
                {displaySemester || 'Active Enrollment'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C6A18D] bg-[#F9F4F0] px-3 py-1 rounded-full border border-[#C6A18D]/40">
                <Clock className="w-3.5 h-3.5 text-[#C6A18D]" />
                Pending Enrollment
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#2C2621] tracking-tight leading-tight">
              Welcome back, <span className="text-[#A36B40]">{profile.full_name?.split(' ')[0] || profile.email?.split('@')[0] || 'Student'}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7067] mt-1 leading-relaxed">
              Institutional career intelligence, curriculum alignment, and faculty mentoring workspace.
            </p>
          </div>
        </div>

        {/* Right Status Capsule */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center gap-4 min-w-[260px] justify-between">
            <div className="space-y-1">
              <p className="text-[10px] text-[#7A7067] font-bold uppercase tracking-wider">
                {hasCompletedAssessment ? 'Career Alignment' : 'Diagnostic Assessment'}
              </p>
              <p className="text-sm font-bold text-[#2C2621] truncate max-w-[150px]">
                {hasCompletedAssessment 
                  ? (careerProfile?.primary_domain?.name || 'Evaluated')
                  : hasStartedAssessment 
                  ? 'In Progress' 
                  : '30-MCQ Test Ready'}
              </p>
            </div>
            
            {hasCompletedAssessment ? (
              <div className="w-10 h-10 rounded-xl bg-[#F1F1EB] text-[#77734B] flex items-center justify-center shrink-0 border border-[#77734B]/30 shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <Link href="/student/assessment">
                <Button size="sm" className="h-9 px-4 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 transition-all flex items-center gap-1.5 cursor-pointer">
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white border border-[#DFD7CB] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#F7EFEA] text-[#A36B40] flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#7A7067] font-bold uppercase tracking-wider">Career Alignment</p>
            <p className="text-sm font-extrabold text-[#2C2621] truncate">
              {careerProfile?.primary_domain?.name || domainScores[0]?.domain?.name || (hasCompletedAssessment ? 'Evaluated' : 'Pending Test')}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#DFD7CB] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#F6EFEA] text-[#C6A18D] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#7A7067] font-bold uppercase tracking-wider">Specialization</p>
            <p className="text-sm font-extrabold text-[#2C2621] truncate">
              {displaySpec || 'Not Assigned'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#DFD7CB] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#F1F1EB] text-[#77734B] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#7A7067] font-bold uppercase tracking-wider">Faculty Mentor</p>
            <p className="text-sm font-extrabold text-[#2C2621] truncate">
              {mentorName || 'Not Assigned'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-[#DFD7CB] shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#F7EFEA] text-[#A36B40] flex items-center justify-center shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-[#7A7067] font-bold uppercase tracking-wider">Assessment Status</p>
            <p className="text-sm font-extrabold text-[#2C2621] truncate">
              {hasCompletedAssessment ? `${attempt?.normalized_score || attempt?.score || 0}% Score` : hasStartedAssessment ? 'In Progress' : '30-MCQ Diagnostic Ready'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Diagnostic Assessment CTA + Academic Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Diagnostic Assessment Card (2 cols) */}
        <Card className="lg:col-span-2 border-[#DFD7CB] bg-white rounded-3xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A36B40] bg-[#F7EFEA] px-3 py-1 rounded-full border border-[#A36B40]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#A36B40]" />
                Career Diagnostic Engine
              </span>
              {hasCompletedAssessment ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77734B] bg-[#F1F1EB] px-3 py-1 rounded-full border border-[#77734B]/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B]" />
                  Assessment Completed
                </span>
              ) : hasStartedAssessment ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C6A18D] bg-[#F9F4F0] px-3 py-1 rounded-full border border-[#C6A18D]/40">
                  <Clock className="w-3.5 h-3.5 text-[#C6A18D]" />
                  Assessment In Progress
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A36B40] bg-[#F7EFEA] px-3 py-1 rounded-full border border-[#A36B40]/30">
                  <Clock className="w-3.5 h-3.5 text-[#A36B40]" />
                  30-MCQ Diagnostic Ready
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#2C2621] tracking-tight">
                {hasCompletedAssessment
                  ? 'Your Career Alignment Profile is Active'
                  : 'Discover Your Career Alignment & Specialization Fit'}
              </h2>
              <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed max-w-2xl">
                {hasCompletedAssessment
                  ? 'Your psychometric and aptitude evaluation has been processed. Review your matched career tracks, suggested domain courses, and faculty guidance notes.'
                  : 'Take your comprehensive 30-question diagnostic evaluation to reveal recommended career domains, matched curriculum courses, and personalized mentor advice.'}
              </p>
            </div>

            {/* Assessment State Info Box or 3-Feature Step Grid */}
            {hasCompletedAssessment ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#A36B40]">Primary Recommended Track</p>
                  {(attempt?.normalized_score || attempt?.score) && (
                    <span className="text-xs font-bold text-[#77734B] bg-[#F1F1EB] px-2.5 py-0.5 rounded-full border border-[#77734B]/30">
                      Score: {attempt.normalized_score || attempt.score}%
                    </span>
                  )}
                </div>
                <p className="text-lg font-bold text-[#2C2621]">
                  {careerProfile?.primary_domain?.name || domainScores[0]?.domain?.name || 'Evaluation Complete'}
                </p>
                {attempt?.completed_at && (
                  <p className="text-xs text-[#7A7067]">
                    Evaluated on {formatDate(attempt.completed_at)}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#A36B40] text-white text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                    <p className="text-xs font-bold text-[#2C2621]">30 Questions</p>
                  </div>
                  <p className="text-[11px] text-[#7A7067] pl-7 leading-snug">
                    Multidimensional psychometric & aptitude evaluation
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#C6A18D] text-white text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                    <p className="text-xs font-bold text-[#2C2621]">Domain Mapping</p>
                  </div>
                  <p className="text-[11px] text-[#7A7067] pl-7 leading-snug">
                    Real-time match across 8 career domains
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#77734B] text-white text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                    <p className="text-xs font-bold text-[#2C2621]">Specialization Fit</p>
                  </div>
                  <p className="text-[11px] text-[#7A7067] pl-7 leading-snug">
                    Sandip University curriculum and track integration
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 sm:px-8 sm:pb-8 pt-0 flex items-center">
            <Link href="/student/assessment">
              <Button className="h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{hasCompletedAssessment ? 'Retake Career Assessment' : hasStartedAssessment ? 'Resume Assessment' : 'Start Diagnostic Assessment'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Your Academic Profile Card (1 col) */}
        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-[#DFD7CB]/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#A36B40]" />
                Your Academic Profile
              </CardTitle>
              {displaySemester && (
                <Badge className="bg-[#F7EFEA] text-[#A36B40] border-[#A36B40]/30 text-[10px] font-bold rounded-full">
                  {displaySemester}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-[#7A7067]">
              Institutional enrollment & specialization track
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7067]">Degree & Program</p>
              <p className="text-xs font-bold text-[#2C2621] leading-snug">
                {displayCourse ? `${displayCourse}${displayCourseCode ? ` (${displayCourseCode})` : ''}` : 'Not Enrolled in Program'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#FAF6F0]/80 border border-[#DFD7CB] space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A36B40]">PRN</p>
                <p className="text-xs font-bold text-[#2C2621] truncate">{displayPrn || 'Not Set'}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF6F0]/80 border border-[#DFD7CB] space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#C6A18D]">Batch</p>
                <p className="text-xs font-bold text-[#2C2621] truncate">{displayBatch || 'Not Set'}</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F1F1EB] border border-[#77734B]/30 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#77734B]">Specialization Track</p>
                <p className="text-xs font-bold text-[#2C2621] truncate">
                  {displaySpec || 'Not Selected'}
                </p>
              </div>
              {displaySpec && <CheckCircle2 className="w-4 h-4 text-[#77734B] shrink-0" />}
            </div>

            <Link href="/student/profile" className="block pt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 rounded-2xl border-[#DFD7CB] text-xs font-semibold text-[#2C2621] hover:text-[#A36B40] hover:border-[#A36B40] hover:bg-[#F7EFEA] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Manage Academic Profile</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 4. Two-Column Intelligence Section: Domain Suggestions + Faculty Mentor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Domain Suggestions & Course Reference Mapping */}
        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-[#DFD7CB]/60 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#A36B40]" />
                Top Domain Suggestions
              </CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Psychometric curriculum fit
              </CardDescription>
            </div>
            <Link href="/student/career-profile">
              <span className="text-xs font-bold text-[#A36B40] hover:underline cursor-pointer">
                All Domains &rarr;
              </span>
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {domainScores.length > 0 ? (
              domainScores.map((ds, index) => {
                const rankBadgeColors = [
                  'bg-[#A36B40] text-white',
                  'bg-[#C6A18D] text-white',
                  'bg-[#77734B] text-white',
                ]
                return (
                  <div key={ds.domain?.id || index} className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-5 h-5 rounded-full ${rankBadgeColors[index] || 'bg-[#7A7067] text-white'} text-[11px] font-bold flex items-center justify-center shrink-0`}>
                          {ds.rank || index + 1}
                        </span>
                        <span className="text-xs font-bold text-[#2C2621] truncate">{ds.domain?.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-[#77734B] bg-[#F1F1EB] px-2 py-0.5 rounded-full border border-[#77734B]/30 shrink-0">
                        {ds.score}% Match
                      </span>
                    </div>
                    {ds.domain?.description && (
                      <p className="text-[11px] text-[#7A7067] pl-7 line-clamp-1">
                        {ds.domain.description}
                      </p>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F7EFEA] text-[#A36B40] flex items-center justify-center mx-auto">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#2C2621]">No Assessment Scores Yet</p>
                  <p className="text-[11px] text-[#7A7067] max-w-[280px] mx-auto">
                    Take the 30-question diagnostic test to generate your personalized domain rankings.
                  </p>
                </div>
                <Link href="/student/assessment" className="inline-block pt-1">
                  <Button size="sm" className="h-8 text-xs bg-[#A36B40] hover:bg-[#8E5B33] text-white rounded-xl">
                    Take Diagnostic Test
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Faculty Mentor & Guidance Card */}
        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-[#DFD7CB]/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#77734B]" />
                Assigned Mentor
              </CardTitle>
              <Badge className={mentor ? "bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 text-[10px] font-bold rounded-full" : "bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-[10px] font-bold rounded-full"}>
                {mentor ? 'Active Advisor' : 'Unassigned'}
              </Badge>
            </div>
            <CardDescription className="text-xs text-[#7A7067]">
              Direct 1-on-1 career guidance & academic advising
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {mentor ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A36B40] to-[#77734B] flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-[#A36B40]/20 shrink-0">
                    {mentorName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'FM'}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-bold text-[#2C2621] truncate">{mentorName}</p>
                    <p className="text-xs text-[#C6A18D] font-semibold truncate">Faculty Career Advisor</p>
                    <p className="text-xs text-[#7A7067] truncate">{mentorEmail || 'No email on file'}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-0.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#2C2621]">Advisory Office Hours</span>
                    <span className="text-[#77734B] font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B]" />
                      Available for Counseling
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A7067]">
                    Reach out for personalized curriculum review and guidance.
                  </p>
                </div>

                <Link href="/student/counselor" className="block pt-1">
                  <Button
                    className="w-full h-10 rounded-2xl bg-[#211D19] hover:bg-black text-white text-xs font-semibold shadow-sm active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 text-[#77734B]" />
                    <span>Message Mentor</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="py-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F1F1EB] text-[#77734B] flex items-center justify-center mx-auto">
                  <UserX className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#2C2621]">No Mentor Assigned</p>
                  <p className="text-[11px] text-[#7A7067] max-w-[280px] mx-auto">
                    You have not been assigned a faculty mentor yet. Contact the department or request guidance.
                  </p>
                </div>
                <Link href="/student/counselor" className="inline-block pt-1">
                  <Button variant="outline" size="sm" className="h-8 text-xs border-[#DFD7CB] rounded-xl text-[#2C2621] hover:text-[#A36B40] hover:border-[#A36B40]">
                    Request Guidance
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* 5. Quick Tools & Resources Hub */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#2C2621] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A36B40]" />
              Quick Academic & Career Resources
            </h3>
            <p className="text-xs text-[#7A7067]">Direct access to career intelligence tools and institution services</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/student/career-profile" className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] hover:border-[#A36B40] hover:bg-[#F7EFEA]/60 transition-all group cursor-pointer">
            <Compass className="w-4 h-4 text-[#A36B40] mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-[#2C2621]">Domain Explorer</p>
            <p className="text-[10px] text-[#7A7067]">Explore career domains & curriculum tracks</p>
          </Link>

          <Link href="/student/test-history" className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] hover:border-[#77734B] hover:bg-[#F1F1EB]/60 transition-all group cursor-pointer">
            <FileText className="w-4 h-4 text-[#77734B] mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-[#2C2621]">Test History & Logs</p>
            <p className="text-[10px] text-[#7A7067]">Past psychometric & aptitude attempts</p>
          </Link>

          <Link href="/student/counselor" className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] hover:border-[#C6A18D] hover:bg-[#F9F4F0]/60 transition-all group cursor-pointer">
            <UserCheck className="w-4 h-4 text-[#C6A18D] mb-1.5 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-bold text-[#2C2621]">Advisory Booking</p>
            <p className="text-[10px] text-[#7A7067]">Schedule 1-on-1 mentor guidance</p>
          </Link>
        </div>
      </div>

    </div>
  )
}
