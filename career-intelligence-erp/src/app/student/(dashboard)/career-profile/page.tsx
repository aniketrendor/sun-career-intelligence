import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Compass, TrendingUp, Award, Target, BookOpen, AlertCircle,
  ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Sparkles,
  Layers, Check, HelpCircle, UserCheck, MessageSquare, Lightbulb,
  GraduationCap, History, Clock, Brain, Flame, Activity, Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { processAssessmentResponses, formatProgramTitle } from '@/lib/engines/index'
import type {
  StudentAnswer,
  StudentProfileContext,
  AcademicDegreeLevel,
  CourseRecommendation,
  DimensionScore,
} from '@/lib/types/assessment-v3.types'

export const dynamic = 'force-dynamic'

export default async function StudentCareerProfilePage(props: {
  searchParams?: Promise<{ attemptId?: string }>
}) {
  const searchParams = await props?.searchParams
  const specificAttemptId = searchParams?.attemptId

  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await adminClient
    .from('users')
    .select('id, full_name, email, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'STUDENT') redirect('/login')

  // Check student profile, active enrollment, and completed attempts concurrently
  const [
    { data: studentProfile },
    { data: enrollment },
    { data: completedAttempts }
  ] = await Promise.all([
    adminClient
      .from('student_profiles')
      .select('prn, current_program, academic_year, school, institution')
      .eq('user_id', profile.id)
      .maybeSingle(),
    adminClient
      .from('enrollments')
      .select('academic_year, program:programs(name, code), class:classes(semester)')
      .eq('student_id', profile.id)
      .eq('status', 'ACTIVE')
      .maybeSingle(),
    adminClient
      .from('assessment_attempts')
      .select('id, status, completed_at, started_at')
      .eq('student_id', profile.id)
      .order('completed_at', { ascending: false })
  ])

  const hasCompletedAttempt = (completedAttempts && completedAttempts.length > 0)
  
  let targetAttempt: any = null
  if (specificAttemptId) {
    targetAttempt = completedAttempts?.find((a: any) => a.id === specificAttemptId)
    if (!targetAttempt) {
      const { data: specificAtt } = await adminClient
        .from('assessment_attempts')
        .select('id, status, completed_at, started_at')
        .eq('id', specificAttemptId)
        .maybeSingle()
      targetAttempt = specificAtt
    }
  }

  if (!targetAttempt && hasCompletedAttempt) {
    targetAttempt = completedAttempts[0]
  }

  const defaultTrack = studentProfile?.current_program?.toUpperCase().includes('M.') ||
                       studentProfile?.current_program?.toUpperCase().includes('MBA') ||
                       studentProfile?.current_program?.toUpperCase().includes('MASTER') ? 'PG' : 'UG'

  if (!targetAttempt) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto font-sans">
        <div>
          <h1 className="text-2xl font-bold text-[#2C2621]">Career Diagnostic Profile</h1>
          <p className="text-sm text-[#7A7067]">
            Complete your 5-level adaptive assessment to generate your personalized career intelligence profile.
          </p>
        </div>

        <Card className="border-[#DFD7CB] bg-white rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center mx-auto border border-[#DFD7CB]">
            <Compass className="w-8 h-8 text-[#A36B40]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-lg font-bold text-[#2C2621]">No Assessment Completed Yet</h2>
            <p className="text-xs text-[#7A7067]">
              Take the official Sandip University Career Intelligence Assessment to unlock your dimension breakdown, course matches, and mentor advisory notes.
            </p>
          </div>
          <div className="pt-2">
            <Link href={`/student/assessment?start=true&track=${defaultTrack}`}>
              <Button className="bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-2xl px-6 h-11 font-bold shadow-md shadow-[#A36B40]/25 cursor-pointer">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Begin Assessment ({defaultTrack} Track)</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  // Fetch responses for target attempt using adminClient to ensure 100% data access
  const { data: responses } = await adminClient
    .from('assessment_responses')
    .select('question_id, response_value, response_text')
    .eq('attempt_id', targetAttempt.id)

  const isPG = defaultTrack === 'PG'

  const formattedResponses: StudentAnswer[] = (responses || []).map((r) => {
    let optIds: string[] | undefined
    let singleOpt: string | undefined
    if (r.response_text) {
      try {
        const p = JSON.parse(r.response_text)
        if (Array.isArray(p)) optIds = p
        else if (typeof p === 'string') singleOpt = p
      } catch {
        singleOpt = r.response_text
      }
    }
    return {
      question_id: r.question_id,
      rating_value: typeof r.response_value === 'number' ? r.response_value : undefined,
      option_id: singleOpt,
      option_ids: optIds,
    }
  })

  // Process through V3 Career Intelligence Engine
  const studentContext: StudentProfileContext = {
    fullName: profile.full_name || 'Student',
    email: profile.email || undefined,
    academicLevel: isPG ? 'PG' : 'UG',
    stream: studentProfile?.current_program || undefined,
  }

  const result = processAssessmentResponses(formattedResponses, studentContext)
  const primaryCourse = result.primary_course || result.recommended_courses[0]
  const topDimensions = result.top_dimensions.slice(0, 3)

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* ─── TOP HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
            <Compass className="w-3.5 h-3.5 text-[#A36B40]" /> Sandip University Official Diagnostic Result
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Career Diagnostic Profile</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Official cognitive aptitude, 20-domain synergy, and university program pathway analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/student/assessment?start=true&track=${defaultTrack}`}>
            <Button className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white text-xs h-10 px-5 rounded-2xl shadow-md shadow-[#A36B40]/25 cursor-pointer font-bold transition-all">
              <BookOpen className="w-4 h-4" />
              <span>Retake Assessment</span>
            </Button>
          </Link>
          <Link href="/student/assessment">
            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-2xl border-[#DFD7CB] bg-white text-xs font-semibold text-[#2C2621] hover:text-[#A36B40] hover:border-[#A36B40] hover:bg-[#FAF6F0] transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <History className="w-4 h-4 text-[#A36B40]" />
              <span>History</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── STUDENT SUMMARY CARD ─────────────────────────────────────────────── */}
      <div className="border border-[#332D27] bg-[#211D19] text-white rounded-3xl shadow-xl p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Candidate Name</span>
            <span className="font-bold text-[#EFE2D0] text-sm mt-0.5 block truncate">
              {profile.full_name || 'Student'}
            </span>
          </div>
          <div>
            <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Target Level</span>
            <span className="font-semibold text-white mt-0.5 block">
              {isPG ? 'Postgraduate (PG)' : 'Undergraduate (UG)'}
            </span>
          </div>
          <div>
            <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Primary Aligned Domain</span>
            <span className="font-semibold text-white mt-0.5 block truncate">
              {topDimensions[0]?.name || 'Computing & Software Development'}
            </span>
          </div>
          <div>
            <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Optimal Program Match</span>
            <span className="font-bold text-[#A36B40] text-sm mt-0.5 block truncate">
              {primaryCourse ? `${formatProgramTitle(primaryCourse.course, primaryCourse.specialization)} (${primaryCourse.match_score}%)` : 'Evaluating...'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: PRIMARY DEGREE MATCH & ALTERNATIVES ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {primaryCourse && (
          <Card className="lg:col-span-2 border-[#DFD7CB] bg-white rounded-3xl shadow-xs overflow-hidden">
            <div className="h-3.5 w-full bg-[#A36B40]" />
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <Badge className="bg-[#A36B40]/15 text-[#A36B40] border-0 text-xs font-bold rounded-full px-3 py-1">
                  Optimal Degree Recommendation
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-[#A36B40]">
                    {primaryCourse.match_score}%
                  </span>
                  <Badge className="bg-[#A36B40] text-white border-0 text-xs font-bold rounded-lg px-2 py-0.5">
                    A+
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-extrabold text-[#2C2621]">
                {formatProgramTitle(primaryCourse.course, primaryCourse.specialization)}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-[#7A7067]">
                {primaryCourse.school} {primaryCourse.program_id ? `· Program Code: ${primaryCourse.program_id}` : ''}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#FAF6F0] rounded-2xl border border-[#DFD7CB] text-xs">
                <div>
                  <span className="text-[#7A7067] block text-[10px] font-bold uppercase">Prerequisite Qualification</span>
                  <span className="font-semibold text-[#2C2621] mt-0.5 block">{primaryCourse.eligibility.required_stream}</span>
                </div>
                <div>
                  <span className="text-[#7A7067] block text-[10px] font-bold uppercase">Eligibility Status</span>
                  <span className="font-semibold text-[#77734B] mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {primaryCourse.eligibility.status === 'VERIFIED_ELIGIBLE' ? 'Verified Eligible' : 'Eligible for Direct Evaluation'}
                  </span>
                </div>
              </div>

              {/* Rationale and reasons */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7A7067] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B]" /> Key Evidence Rationale
                </h4>
                <div className="space-y-1.5 text-xs text-[#2C2621]">
                  {primaryCourse.reasons_for_match.map((r: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 bg-[#FAF6F0] p-2.5 rounded-xl border border-[#DFD7CB]">
                      <span className="text-[#A36B40] font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alternative Programs */}
        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#77734B] border border-[#DFD7CB] mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-[#77734B]" /> Alternative Options
            </div>
            <CardTitle className="text-lg font-bold text-[#2C2621]">Complementary Degrees</CardTitle>
            <CardDescription className="text-xs text-[#7A7067]">
              Viable complementary programs to consider
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {result.alternative_courses.slice(0, 3).map((alt: CourseRecommendation, idx: number) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2C2621]">{formatProgramTitle(alt.course, alt.specialization)}</span>
                  <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-xs font-bold rounded-full px-2 py-0.5">
                    {alt.match_score}%
                  </Badge>
                </div>
                <Progress value={alt.match_score} className="h-1.5 bg-[#DFD7CB]" />
                <p className="text-[11px] text-[#7A7067] truncate">{alt.school}</p>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t border-[#DFD7CB] bg-[#FAF6F0]/40 rounded-b-3xl text-center">
            <Link href="/student/career-domains" className="text-xs font-bold text-[#A36B40] hover:text-[#8E5B34] inline-flex items-center gap-1">
              Explore all career domains <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* ─── SECTION 2: TOP 3 RECOMMENDED CAREER DOMAINS ─────────────────────── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#2C2621]">Top 3 Recommended Career Domains</h2>
          <p className="text-xs text-[#7A7067]">
            Ranked by multi-dimensional cognitive aptitude, reasoning, and domain compatibility scoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topDimensions.map((d: DimensionScore, idx: number) => {
            const rankLabels = ['Rank #1 · Primary Alignment', 'Rank #2 · High Synergy', 'Rank #3 · Complementary Strengths']
            const badgeStyles = [
              'bg-[#77734B]/15 text-[#77734B] border-[#77734B]/30',
              'bg-[#A36B40]/15 text-[#A36B40] border-[#A36B40]/30',
              'bg-amber-100 text-amber-800 border-amber-300'
            ]

            return (
              <Card key={d.dimension_id} className="border-[#DFD7CB] bg-white rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] font-bold rounded-full px-2.5 py-0.5 ${badgeStyles[idx] || badgeStyles[0]}`}>
                      {rankLabels[idx]}
                    </Badge>
                    <span className="text-sm font-black text-[#A36B40]">{d.normalized_score}%</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#2C2621]">{d.name}</h3>
                    <p className="text-xs text-[#7A7067] mt-1 line-clamp-3">{d.definition}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Progress value={d.normalized_score} className="h-2 bg-[#FAF6F0]" />
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ─── SECTION 3: 20-DIMENSION CAREER APTITUDE MATRIX ─────────────────── */}
      <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-[#2C2621]">20 Master Career Domain Scores</CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Multi-dimensional scores across all 20 university master career domains (0–100 scale)
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] rounded-full px-3 py-1">
              20 Domains Evaluated
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.dimension_scores.map((dim: DimensionScore) => (
            <div key={dim.dimension_id} className="p-3.5 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/30 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-bold text-[#2C2621]">{dim.name}</span>
                <span className="font-mono font-bold text-[#A36B40]">{dim.normalized_score}%</span>
              </div>
              <Progress value={dim.normalized_score} className="h-2 bg-[#FAF6F0]" />
              <p className="text-[11px] text-[#7A7067] leading-relaxed">{dim.definition}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
