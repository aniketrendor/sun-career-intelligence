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
  runRecommendationEngine,
  generateCareerIntelligenceReport,
  type TraitScoreResult,
  CAREER_DIMENSIONS,
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

  const latestAttempt = completedAttempts && completedAttempts.length > 0 ? completedAttempts[0] : null
  const totalCompleted = completedAttempts?.length || 0

  const defaultTrack = (studentProfile?.current_program?.toUpperCase().includes('M.') ||
                        studentProfile?.current_program?.toUpperCase().includes('MBA') ||
                        studentProfile?.current_program?.toUpperCase().includes('MASTER')) ? 'PG' : 'UG'

  // Empty state: No assessments completed yet
  if (!latestAttempt) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
              <Compass className="w-3.5 h-3.5 text-[#A36B40]" /> AI Career Trajectory & Suggestions
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Domain Suggestions</h1>
            <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
              Review AI-driven career domain matches, compatibility ranking across disciplines, and curated specializations.
            </p>
          </div>

          <Link href={`/student/assessment?start=true&track=${defaultTrack}`}>
            <Button className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white text-xs h-10 px-5 rounded-2xl shadow-md shadow-[#A36B40]/25 cursor-pointer font-bold transition-all">
              <BookOpen className="w-4 h-4" />
              <span>Take First Assessment</span>
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
                {studentProfile?.current_program || (enrollment as any)?.program?.name || 'Not Enrolled'}
              </span>
            </div>
            <div>
              <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Evaluation Status</span>
              <span className="font-bold text-[#A36B40] text-sm mt-0.5 block">
                Awaiting Diagnostic
              </span>
            </div>
          </div>
        </div>

        {/* Empty State Banner Card */}
        <Card className="border-[#DFD7CB] bg-white shadow-xs rounded-3xl">
          <CardContent className="py-12 px-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center mx-auto border border-[#DFD7CB]">
              <Compass className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#2C2621]">No Domain Suggestions Generated Yet</h3>
              <p className="text-xs text-[#7A7067] leading-relaxed">
                Your personalized domain rankings, course recommendations, and specialization matches will be computed by our 3-Tier Intelligence engine as soon as you complete your first diagnostic test.
              </p>
            </div>
            <Link href={`/student/assessment?start=true&track=${defaultTrack}`} className="inline-block pt-2">
              <Button className="h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Take First Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Load responses for attempt to feed through 3-tier Engines
  const { data: responses } = await supabase
    .from('assessment_responses')
    .select('question_id, response_value, response_text')
    .eq('attempt_id', latestAttempt.id)

  const isPG = studentProfile?.current_program?.toUpperCase().includes('M.') ||
               studentProfile?.current_program?.toUpperCase().includes('MBA') ||
               studentProfile?.current_program?.toUpperCase().includes('MASTER')

  const formattedResponses = (responses || []).map((r) => {
    let letter = (r.response_text || '').toUpperCase()
    if (!['A', 'B', 'C', 'D'].includes(letter)) {
      letter = r.response_value === 1 ? 'A' : r.response_value === 2 ? 'B' : r.response_value === 3 ? 'C' : r.response_value === 4 ? 'D' : 'A'
    }
    return {
      questionId: r.question_id,
      selectedOptionId: letter,
      responseValue: r.response_value || 1,
    }
  })

  // 1. Assessment Engine
  const processedAssessment = processAssessmentResponses(
    formattedResponses,
    undefined,
    isPG ? 'PG' : 'UG'
  )

  // 2. Recommendation Engine
  const recommendation = runRecommendationEngine(
    processedAssessment.traitScores,
    processedAssessment.qualityMetrics,
    { level: isPG ? 'PG' : 'UG' }
  )

  // 3. Report & Explainability Engine
  const report = generateCareerIntelligenceReport(
    processedAssessment,
    recommendation,
    profile.full_name
  )

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* ─── TOP HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
            <Compass className="w-3.5 h-3.5 text-[#A36B40]" /> AI Career Trajectory & Suggestions
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Domain Suggestions</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Review AI-driven career domain matches, compatibility ranking across disciplines, and curated specializations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/student/assessment?start=true&track=${defaultTrack}`}>
            <Button className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white text-xs h-10 px-5 rounded-2xl shadow-md shadow-[#A36B40]/25 cursor-pointer font-bold transition-all">
              <BookOpen className="w-4 h-4" />
              <span>Take New Assessment</span>
            </Button>
          </Link>
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

      {/* ─── STUDENT PRN QUICK REFERENCE CARD ─────────────────────────────────── */}
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
              {studentProfile?.current_program || (enrollment as any)?.program?.name || 'Not Enrolled'}
            </span>
          </div>
          <div>
            <span className="text-[#C6A18D] block text-[10px] uppercase font-bold tracking-wider">Primary Match Domain</span>
            <span className="font-bold text-[#A36B40] text-sm mt-0.5 block truncate">
              {report.recommendations.primaryPathway.domainName} ({report.recommendations.primaryPathway.compatibilityScore}%)
            </span>
          </div>
        </div>
      </div>

      {/* ─── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="bg-[#211D19] border border-[#332D27] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#A36B40]/25 text-[#C6A18D] border border-[#A36B40]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#C6A18D]" /> Official Career Intelligence Diagnostic
            </div>
            <Badge className="bg-[#77734B]/25 text-[#EFE2D0] border border-[#77734B]/40 text-xs rounded-full px-3 py-0.5 font-bold">
              {isPG ? 'Postgraduate (PG)' : 'Undergraduate (UG)'} Track
            </Badge>
            <Badge className="bg-white/10 text-[#C6A18D] border border-white/20 text-xs rounded-full px-3 py-0.5 font-semibold">
              Mentor Review: {report.mentorBrief.studentStatus.replace('_', ' ')}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#FAF6F0] leading-tight drop-shadow-xs">
            {report.profileSummary.primaryArchetype}
          </h1>
          <p className="text-[#C6A18D]/90 text-xs sm:text-sm mt-2 leading-relaxed">
            Multi-dimensional diagnostic completed on{' '}
            {latestAttempt.completed_at ? new Date(latestAttempt.completed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'recently'}.
            Evaluated across 10 core psychometric, aptitude, and career dimensions.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/student/career-domains">
              <Button size="sm" className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-2xl h-10 px-5 cursor-pointer font-semibold shadow-md shadow-[#A36B40]/20">
                <Compass className="w-4 h-4" /> Explore Domains Library
              </Button>
            </Link>
            <Link href="/student/counselor">
              <Button variant="outline" size="sm" className="bg-[#FAF6F0]/10 hover:bg-[#FAF6F0]/20 text-[#EFE2D0] border-[#DFD7CB]/30 rounded-2xl h-10 px-5 gap-2 cursor-pointer font-medium">
                <MessageSquare className="w-4 h-4" /> Discuss with Mentor
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: PRIMARY PATHWAY & SPECIALIZATIONS ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Pathway Match Card */}
        <Card className="lg:col-span-2 border-[#DFD7CB] bg-white rounded-3xl shadow-xs overflow-hidden">
          <div className="h-3.5 w-full bg-[#A36B40]" />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <Badge className="bg-[#A36B40]/15 text-[#A36B40] border-0 text-xs font-bold rounded-full px-3 py-1">
                Primary Academic Match (Rank #1)
              </Badge>
              <span className="text-2xl font-black text-[#A36B40]">
                {report.recommendations.primaryPathway.compatibilityScore}% Compatibility
              </span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-[#2C2621]">
              {report.recommendations.primaryPathway.courseName}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-[#7A7067]">
              Mapped to <strong>{report.recommendations.primaryPathway.domainName}</strong> · {report.recommendations.primaryPathway.eligibilityNotes}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5 pt-0">
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#7A7067] mb-1.5">
                <span>Overall Program Alignment</span>
                <span className="text-[#2C2621] font-bold">{report.recommendations.primaryPathway.compatibilityScore}/100</span>
              </div>
              <Progress value={report.recommendations.primaryPathway.compatibilityScore} className="h-2.5 bg-[#FAF6F0]" />
            </div>

            {/* Curated Specializations */}
            <div>
              <h4 className="text-xs font-bold text-[#7A7067] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#A36B40]" />
                Recommended Specializations & Elective Concentrations
              </h4>
              <div className="space-y-2.5">
                {report.recommendations.primaryPathway.specializations.map((spec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/40 hover:border-[#A36B40] transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#A36B40] text-white text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <h5 className="font-bold text-xs sm:text-sm text-[#2C2621]">{spec.name}</h5>
                      </div>
                      <p className="text-xs text-[#7A7067] leading-relaxed pl-7">{spec.description}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs font-bold bg-white text-[#A36B40] border-[#DFD7CB] rounded-full px-2.5 py-0.5">
                      {spec.score}% Match
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Pathways Card (Avoiding Winner-Takes-All) */}
        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#77734B] border border-[#DFD7CB] mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-[#77734B]" /> Multi-Pathway Alternatives
            </div>
            <CardTitle className="text-lg font-bold text-[#2C2621]">Alternative Options</CardTitle>
            <CardDescription className="text-xs text-[#7A7067]">
              Viable secondary routes aligning with your complementary strengths
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {report.recommendations.alternativePathways.map((alt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/50 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2C2621]">#{idx + 2} {alt.courseName}</span>
                  <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-xs font-bold rounded-full px-2 py-0.5">
                    {alt.compatibilityScore}%
                  </Badge>
                </div>
                <Progress value={alt.compatibilityScore} className="h-1.5 bg-[#DFD7CB]" />
                <p className="text-[11px] text-[#7A7067]">Domain: {alt.domainName}</p>
              </div>
            ))}
          </CardContent>
          <div className="p-4 border-t border-[#DFD7CB] bg-[#FAF6F0]/40 rounded-b-3xl text-center">
            <Link href="/student/career-domains" className="text-xs font-bold text-[#A36B40] hover:text-[#8E5B34] inline-flex items-center gap-1">
              Compare all institutional programs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* ─── SECTION 2: EXPLAINABILITY & EVIDENCE ───────────────────────────── */}
      <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs overflow-hidden">
        <CardHeader className="bg-[#FAF6F0] border-b border-[#DFD7CB] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-[#A36B40] border border-[#DFD7CB] mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A36B40]" /> Deterministic Evidence Engine
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-[#2C2621]">
                {report.evidence.headline}
              </CardTitle>
            </div>
            <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 font-bold rounded-full px-3 py-1 self-start sm:self-auto">
              Transparent Scoring
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2.5">
            {report.evidence.keyReasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-[#2C2621]">
                <div className="w-5 h-5 rounded-full bg-[#77734B]/15 text-[#77734B] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  ✓
                </div>
                <p className="leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#DFD7CB] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {report.evidence.evidencePoints.map((ep) => (
              <div key={ep.dimensionCode} className="p-3 bg-[#FAF6F0] rounded-2xl border border-[#DFD7CB]">
                <span className="text-[10px] text-[#7A7067] uppercase font-bold block">{ep.dimensionName}</span>
                <span className="text-base font-black text-[#2C2621] mt-0.5 block">{ep.score}/100</span>
                <span className="text-[10px] text-[#77734B] font-semibold block mt-0.5">
                  {ep.impact === 'STRONG_POSITIVE' ? 'Key Catalyst' : 'Supporting Factor'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── SECTION 3: 10-DIMENSION PSYCHOMETRIC & APTITUDE PROFILE ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 10 Dimension Scores */}
        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-[#2C2621]">Career Dimension Scores</CardTitle>
                <CardDescription className="text-xs text-[#7A7067]">
                  Normalized metrics (0–100) separating interest from cognitive aptitude
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] rounded-full px-3 py-1">
                {processedAssessment.sortedTraitScores.length} Evaluated Dimensions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {processedAssessment.sortedTraitScores.map((trait) => (
              <div key={trait.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#A36B40] bg-[#FAF6F0] px-1.5 py-0.5 rounded border border-[#DFD7CB]">
                      {trait.code}
                    </span>
                    <span className="font-semibold text-[#2C2621]">{trait.name}</span>
                  </div>
                  <span className="font-bold text-[#2C2621] text-xs">{trait.normalizedScore}/100</span>
                </div>
                <Progress value={trait.normalizedScore} className="h-2 bg-[#FAF6F0]" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Confidence & Diagnostic Reliability */}
        <div className="space-y-6">
          <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#2C2621]">Assessment Confidence Diagnostics</CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Reliability indicators computed from answer consistency and cross-validation signals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#DFD7CB]">
                  <span className="text-[10px] text-[#7A7067] uppercase font-bold block">Overall Confidence</span>
                  <span className="text-xl font-black text-[#A36B40] mt-0.5 block">{report.confidenceDiagnostics.confidenceLevel}</span>
                  <span className="text-[10px] text-[#7A7067]">{report.confidenceDiagnostics.confidenceScore}% multi-signal score</span>
                </div>
                <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#DFD7CB]">
                  <span className="text-[10px] text-[#7A7067] uppercase font-bold block">Answer Consistency</span>
                  <span className="text-xl font-black text-[#77734B] mt-0.5 block">{report.confidenceDiagnostics.consistencyScore}%</span>
                  <span className="text-[10px] text-[#7A7067]">Cross-validation test</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF6F0] rounded-2xl border border-[#DFD7CB] text-xs space-y-1">
                <span className="font-bold text-[#2C2621] block">Recommendation Gap & Certainty:</span>
                <p className="text-[#7A7067] leading-relaxed">{report.confidenceDiagnostics.gapExplanation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Mentor Action & Discussion Brief */}
          <Card className="border-[#DFD7CB] bg-[#FAF6F0]/60 rounded-3xl shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#A36B40]" />
                  Mentor Advisory Brief
                </CardTitle>
                <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-xs font-bold rounded-full px-2.5 py-0.5">
                  Action Items Ready
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-[#2C2621] block mb-1">Recommended Discussion Prompts:</span>
                <ul className="space-y-1.5 text-[#7A7067]">
                  {report.mentorBrief.discussionPrompts.map((prompt, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#A36B40] font-bold">•</span>
                      <span>{prompt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <Link href="/student/counselor">
                  <Button className="w-full h-10 bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-2xl font-semibold shadow-md shadow-[#A36B40]/25 cursor-pointer gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Schedule Mentor Discussion</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
