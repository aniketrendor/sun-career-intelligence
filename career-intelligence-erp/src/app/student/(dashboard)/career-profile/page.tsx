import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Compass, TrendingUp, Award, Target, BookOpen, AlertCircle,
  ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Sparkles,
  Layers, Check, HelpCircle, UserCheck, MessageSquare, Lightbulb,
  GraduationCap, History, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  processAssessmentResponses,
  type StudentAnswer,
  type StudentProfileContext,
  type AcademicDegreeLevel,
} from '@/lib/engines'

export const dynamic = 'force-dynamic'

export default async function StudentCareerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'STUDENT') redirect('/login')

  // Check student profile, active enrollment, and completed attempts concurrently
  const [
    { data: studentProfile },
    { data: enrollment },
    { data: completedAttempts }
  ] = await Promise.all([
    supabase
      .from('student_profiles')
      .select('prn, current_program, academic_year, school, institution')
      .eq('user_id', profile.id)
      .maybeSingle(),
    supabase
      .from('enrollments')
      .select('academic_year, program:programs(name, code), class:classes(semester)')
      .eq('student_id', profile.id)
      .eq('status', 'ACTIVE')
      .maybeSingle(),
    supabase
      .from('assessment_attempts')
      .select('id, status, completed_at, started_at')
      .eq('student_id', profile.id)
      .eq('status', 'COMPLETED')
      .order('completed_at', { ascending: false })
  ])

  const hasCompletedAttempt = (completedAttempts && completedAttempts.length > 0)
  const latestAttempt = hasCompletedAttempt ? completedAttempts[0] : null
  const defaultTrack = studentProfile?.current_program?.toUpperCase().includes('M.') ||
                       studentProfile?.current_program?.toUpperCase().includes('MBA') ||
                       studentProfile?.current_program?.toUpperCase().includes('MASTER') ? 'PG' : 'UG'

  if (!hasCompletedAttempt || !latestAttempt) {
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

  // Fetch responses for latest attempt
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select('question_id, response_value, response_text')
    .eq('attempt_id', latestAttempt.id)

  const isPG = defaultTrack === 'PG'

  const formattedResponses: StudentAnswer[] = (responses || []).map((r) => {
    return {
      question_id: r.question_id,
      rating_value: r.response_value || 3,
      option_id: r.response_text || undefined,
    }
  })

  // Process through V3 Career Intelligence Engine
  const studentContext: StudentProfileContext = {
    fullName: profile.full_name || 'Student',
    academicLevel: isPG ? 'PG' : 'UG',
    stream: studentProfile?.current_program || undefined,
  }

  const result = processAssessmentResponses(formattedResponses, studentContext)
  const primaryCourse = result.primary_course || result.recommended_courses[0]

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* ─── TOP HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
            <Compass className="w-3.5 h-3.5 text-[#A36B40]" /> Sandip University Career Trajectory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Career Diagnostic Profile</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Review your aptitude metrics across 12 university career dimensions, matched courses, and specialization pathways.
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
            <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Top Aligned Domain</span>
            <span className="font-semibold text-white mt-0.5 block truncate">
              {result.top_dimensions[0]?.name || 'Technology'}
            </span>
          </div>
          <div>
            <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Optimal Program Match</span>
            <span className="font-bold text-[#A36B40] text-sm mt-0.5 block truncate">
              {primaryCourse ? `${primaryCourse.course} ${primaryCourse.specialization} (${primaryCourse.match_score}%)` : 'Evaluating...'}
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
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge className="bg-[#A36B40]/15 text-[#A36B40] border-0 text-xs font-bold rounded-full px-3 py-1">
                  Primary Recommendation
                </Badge>
                <span className="text-2xl font-black text-[#A36B40]">
                  {primaryCourse.match_score}% Match
                </span>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-extrabold text-[#2C2621]">
                {primaryCourse.course} in {primaryCourse.specialization}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-[#7A7067]">
                {primaryCourse.school} · Prerequisite Stream: <strong>{primaryCourse.eligibility.required_stream}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 pt-0">
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#7A7067] mb-1.5">
                  <span>Domain Fit Score</span>
                  <span className="text-[#2C2621] font-bold">{primaryCourse.match_score}/100</span>
                </div>
                <Progress value={primaryCourse.match_score} className="h-2.5 bg-[#FAF6F0]" />
              </div>

              {/* Rationale and reasons */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7A7067] uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Evidence Rationale
                </h4>
                <div className="space-y-1.5 text-xs text-[#2C2621]">
                  {primaryCourse.reasons_for_match.map((r, i) => (
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
            <CardTitle className="text-lg font-bold text-[#2C2621]">Alternative Pathways</CardTitle>
            <CardDescription className="text-xs text-[#7A7067]">
              Viable complementary programs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {result.alternative_courses.slice(0, 3).map((alt, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2C2621]">{alt.course} in {alt.specialization}</span>
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

      {/* ─── SECTION 2: 12-DIMENSION CAREER APTITUDE SCORES ─────────────────── */}
      <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-lg font-bold text-[#2C2621]">12 Career Dimension Scores</CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Multi-dimensional scores across all 12 university academic domains (0–100 scale)
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] rounded-full px-3 py-1">
              12 Dimensions Evaluated
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.dimension_scores.map((dim) => (
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
