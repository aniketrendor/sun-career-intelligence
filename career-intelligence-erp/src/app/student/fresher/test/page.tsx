'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  GraduationCap, CheckCircle2, ArrowRight, ArrowLeft,
  Clock, Sparkles, AlertCircle, HelpCircle, ShieldCheck,
  Award, Check, LayoutGrid, ChevronRight, Layers, FileText,
  Brain, Compass, Target, BookmarkCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { submitFresherLead } from '@/lib/actions/key.actions'
import {
  getStage1Questions,
  Stage1Question,
  UG_STAGE1_QUESTIONS,
  STAGE1_DIMENSION_DEFS,
  OptionWeightItem,
  processAssessmentResponses,
  runRecommendationEngine,
  ResponseRecord,
} from '@/lib/engines'

// ─── 5 STAGE 1 LEVEL CONFIGURATIONS (6 QUESTIONS PER LEVEL = 30 TOTAL) ───
const SECTION_CONFIGS = [
  {
    index: 1,
    level: 1,
    title: 'Level 1: Academic & Professional Orientation',
    shortTitle: 'Level 1: Orientation',
    range: [1, 6],
    description: 'Evaluates your natural interests, vocational drive, and learning preferences.',
  },
  {
    index: 2,
    level: 2,
    title: 'Level 2: Basic & Logical Reasoning',
    shortTitle: 'Level 2: Reasoning',
    range: [7, 12],
    description: 'Measures deductive reasoning, mathematical patterns, and problem decomposition.',
  },
  {
    index: 3,
    level: 3,
    title: 'Level 3: Applied Problem Solving & Domain Practice',
    shortTitle: 'Level 3: Applied Practice',
    range: [13, 18],
    description: 'Assesses practical scenario analysis, debugging instincts, and hands-on domain execution.',
  },
  {
    index: 4,
    level: 4,
    title: 'Level 4: Course & Specialization Differentiation',
    shortTitle: 'Level 4: Differentiation',
    range: [19, 24],
    description: 'Discriminates suitability across engineering, computing, management, healthcare, law, and design tracks.',
  },
  {
    index: 5,
    level: 5,
    title: 'Level 5: Advanced Validation & Strategic Depth',
    shortTitle: 'Level 5: Validation',
    range: [25, 30],
    description: 'Validates cognitive ceiling, complex decision trade-offs, and career trajectory resilience.',
  },
]

function FresherTestContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const referralCode = searchParams?.get('code') || 'SUN-FRESHERS-2026'
  const candidateName = searchParams?.get('name') || 'Prospective Candidate'
  const candidateEmail = searchParams?.get('email') || ''
  const candidatePhone = searchParams?.get('phone') || ''
  const academicLevel = (searchParams?.get('level') === 'PG' ? 'PG' : 'UG') as 'UG' | 'PG'
  const qualification = searchParams?.get('qualification') || ''
  const college = searchParams?.get('college') || ''
  const mentorName = searchParams?.get('mentor') || 'Admissions & Advisory Council'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load 30 questions selected adaptively across 5 levels from the authoritative question pool
  const activeQuestions: Stage1Question[] = useMemo(() => {
    try {
      const qList = getStage1Questions(academicLevel)
      if (qList && Array.isArray(qList) && qList.length >= 30) return qList
      return (UG_STAGE1_QUESTIONS || []).slice(0, 30)
    } catch (err) {
      console.error('Error fetching stage 1 questions:', err)
      return (UG_STAGE1_QUESTIONS || []).slice(0, 30)
    }
  }, [academicLevel])

  const totalQuestions = activeQuestions?.length || 30

  // State: selected answers mapped by Question ID (e.g. 'UG001' -> 'UG001_OPT_A')
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentQ: Stage1Question = activeQuestions[currentIndex] || activeQuestions[0] || (UG_STAGE1_QUESTIONS && UG_STAGE1_QUESTIONS[0]) || {
    id: 'UG001',
    number: 1,
    track: 'UG',
    level: 1,
    type: 'Preference',
    question: 'How do you approach a new problem?',
    options: [
      { id: 'UG001_OPT_A', key: 'A', text: 'Analyze logically', weights: { AR: 5 } },
      { id: 'UG001_OPT_B', key: 'B', text: 'Collaborate with people', weights: { SO: 5 } }
    ]
  }
  const currentSectionIndex = Math.min(4, Math.max(0, Math.floor(currentIndex / 6)))
  const currentSection = SECTION_CONFIGS[currentSectionIndex] || SECTION_CONFIGS[0]

  const answeredCount = Object.keys(selectedAnswers).length
  const progressPercent = Math.round((answeredCount / (totalQuestions || 30)) * 100)

  // Mobile Drawer & Submission Confirmation Modal state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-[#DFD7CB] shadow-xs text-center max-w-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#A36B40] text-white flex items-center justify-center mx-auto shadow-xs">
            <GraduationCap className="w-5 h-5 animate-pulse" />
          </div>
          <h2 className="text-sm font-bold text-[#2C2621]">Initializing Diagnostic Assessment...</h2>
          <p className="text-xs text-[#7A7067]">Loading your 30 adaptive career evaluation questions.</p>
        </div>
      </div>
    )
  }

  const handleSelectOption = (optionId: string) => {
    if (!currentQ?.id) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }))
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleFinishAssessment()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentIndex(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFinishAssessment = () => {
    if (answeredCount < totalQuestions) {
      setIsSubmitConfirmOpen(true)
      return
    }

    executeFinalSubmission()
  }

  const executeFinalSubmission = async () => {
    setIsSubmitConfirmOpen(false)
    setIsSubmitting(true)
    toast.success('Analyzing all 30 responses through the Sandip Career Intelligence Engine...')

    try {
      // 1. Prepare deterministic ResponseRecord array for Engine 1 & 2
      const responseRecords: ResponseRecord[] = activeQuestions.map((q) => {
        const selectedOptId = selectedAnswers[q.id] || (q.options[0]?.id || 'A')
        const optIndex = q.options.findIndex((o) => o.id === selectedOptId)
        return {
          questionId: q.id,
          selectedOptionId: selectedOptId,
          responseValue: optIndex >= 0 ? optIndex + 1 : 1,
        }
      })

      // 2. Run Engine 1: Trait Scoring & Quality Metrics
      const processedAssessment = processAssessmentResponses(
        responseRecords,
        undefined,
        academicLevel
      )

      // 3. Run Engine 2: Recommendation Engine
      const recommendationOutput = runRecommendationEngine(
        processedAssessment.traitScores,
        processedAssessment.qualityMetrics,
        {
          level: academicLevel,
          previousDegree: qualification,
        }
      )

      const sortedDomains = [...recommendationOutput.domainScores].sort(
        (a, b) => b.compatibilityScore - a.compatibilityScore
      )
      const domain1 = sortedDomains[0] || { name: 'Computer Science & Information Technology', code: 'CS_IT', compatibilityScore: 94, alignmentLabel: 'Strong Alignment' }
      const domain2 = sortedDomains[1] || { name: 'Engineering & Advanced Technology', code: 'ENG_TECH', compatibilityScore: 86, alignmentLabel: 'High Compatibility' }
      const domain3 = sortedDomains[2] || { name: 'Business & Management', code: 'BUS_MGMT', compatibilityScore: 78, alignmentLabel: 'Moderate Alignment' }

      const primaryPathway = recommendationOutput.primaryPathway
      const topDomainName = domain1.name
      const overallFit = domain1.compatibilityScore

      // Recommended specialization
      const recommendedSpec =
        primaryPathway?.specializationMatches?.[0]?.name ||
        primaryPathway?.courseName ||
        (academicLevel === 'UG'
          ? 'B.Tech CSE (Artificial Intelligence & Machine Learning)'
          : 'M.Tech Computer Science (AI & Data Engineering)')

      // Persist lead into Supabase fresher_leads table
      await submitFresherLead({
        referralCode,
        candidateName,
        candidateEmail: candidateEmail || undefined,
        candidatePhone: candidatePhone || undefined,
        targetLevel: academicLevel,
        highestQualification: qualification || undefined,
        lastAttemptedCollege: college || undefined,
        testScore: Math.round(overallFit),
        fitScore: Math.round(overallFit),
        topDomain: topDomainName,
        recommendedSpec,
      })

      const resultParams = new URLSearchParams({
        code: referralCode,
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        level: academicLevel,
        qualification,
        college,
        mentor: mentorName,
        topDomain: topDomainName,
        recommendedSpec,
        fitScore: String(Math.round(overallFit)),
        // Top 3 Recommended Domains with Exact Scores
        d1Name: domain1.name,
        d1Score: String(domain1.compatibilityScore),
        d1Code: domain1.code,
        d1Label: domain1.alignmentLabel,
        d2Name: domain2.name,
        d2Score: String(domain2.compatibilityScore),
        d2Code: domain2.code,
        d2Label: domain2.alignmentLabel,
        d3Name: domain3.name,
        d3Score: String(domain3.compatibilityScore),
        d3Code: domain3.code,
        d3Label: domain3.alignmentLabel,
        // Legacy score compatibility
        aiScore: String(Math.round(domain1.compatibilityScore)),
        cloudScore: String(Math.round(domain2.compatibilityScore)),
        fsScore: String(Math.round(domain3.compatibilityScore)),
        bizScore: String(Math.round(sortedDomains[3]?.compatibilityScore || 70)),
      })

      setTimeout(() => {
        router.push(`/student/fresher/report?${resultParams.toString()}`)
      }, 700)
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('Failed to finalize assessment. Redirecting to report...')
      router.push(`/student/fresher/report?code=${referralCode}&name=${encodeURIComponent(candidateName)}&level=${academicLevel}`)
    }
  }

  const firstUnansweredIndex = activeQuestions.findIndex((q) => !selectedAnswers[q.id])
  const nextUnansweredNum = firstUnansweredIndex >= 0 ? firstUnansweredIndex + 1 : 1

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#FAF6F0] p-2.5 sm:p-4 lg:p-4 flex flex-col justify-between overflow-x-hidden lg:overflow-hidden font-sans antialiased">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 gap-2.5 sm:gap-3 min-h-0">
        
        {/* ─── TOP HEADER (RESPONSIVE: MOBILE & DESKTOP) ────────────────── */}
        <header className="bg-white px-3 sm:px-5 py-2.5 rounded-2xl border border-[#DFD7CB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#A36B40] via-[#C87D55] to-[#77734B] flex items-center justify-center text-white shadow-xs shadow-[#A36B40]/20 shrink-0">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h1 className="text-xs sm:text-sm lg:text-base font-black text-[#2C2621] tracking-tight leading-tight">
                    {academicLevel} Diagnostic Assessment
                  </h1>
                  <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#A36B40]/40 text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.2 rounded-full">
                    {academicLevel} Track
                  </Badge>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] sm:text-[10px] font-bold px-2 py-0.2 rounded-full hidden sm:inline-flex">
                    30 Adaptive Qs
                  </Badge>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#7A7067] leading-none mt-0.5">
                  Candidate: <span className="font-bold text-[#2C2621]">{candidateName}</span> · Token: <span className="font-mono text-[#A36B40] font-extrabold">{referralCode}</span>
                </p>
              </div>
            </div>

            {/* Mobile Header Actions */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#DFD7CB] text-[#2C2621] text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                aria-label="Open Question Navigator"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#A36B40]" />
                <span className="text-[11px] font-mono">{currentIndex + 1}/30</span>
              </button>

              <button
                type="button"
                onClick={handleFinishAssessment}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#A36B40] to-[#77734B] text-white text-[11px] font-black shadow-xs cursor-pointer active:scale-95"
              >
                <Award className="w-3.5 h-3.5" />
                <span>See Result</span>
              </button>
            </div>
          </div>

          {/* Desktop Metric Strip & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {/* Mobile inline micro progress */}
            <div className="w-full sm:hidden flex items-center gap-2">
              <Progress value={progressPercent} className="h-1.5 flex-1" />
              <span className="text-[10px] font-mono font-bold text-[#A36B40] shrink-0">{progressPercent}%</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 self-start md:self-center">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#2C2621] bg-[#FAF6F0] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-[#DFD7CB] shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#A36B40]" />
                <span>Question {currentIndex + 1} of 30</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#77734B] bg-[#77734B]/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-[#77734B]/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B]" />
                <span>{answeredCount} / 30 Done</span>
              </div>
              <Button
                onClick={handleFinishAssessment}
                className="h-8 sm:h-8.5 px-3.5 bg-gradient-to-r from-[#A36B40] to-[#77734B] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-xs shadow-[#A36B40]/25 cursor-pointer flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>See Result</span>
              </Button>
            </div>
          </div>
        </header>

        {/* ─── 2-COLUMN MAIN WORKSPACE (FITS 100VH ON DESKTOP) ─────────── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 min-h-0 items-stretch pb-20 lg:pb-0">
          
          {/* ═══ LEFT MAIN COLUMN: QUESTION WORKSPACE (8 COLS ON DESKTOP) ═══ */}
          <main className="lg:col-span-8 flex flex-col justify-between gap-2 sm:gap-2.5 min-h-0 h-full">
            
            {/* Active Question Card */}
            <Card className="flex-1 flex flex-col bg-white border border-[#DFD7CB] shadow-xs rounded-2xl overflow-hidden min-h-0">
              <div className="h-1.5 w-full bg-gradient-to-r from-[#A36B40] via-[#C87D55] to-[#77734B] shrink-0" />
              
              <CardHeader className="py-2.5 sm:py-3.5 px-3.5 sm:px-6 border-b border-[#DFD7CB] bg-[#FAF6F0]/40 space-y-1.5 shrink-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#A36B40] bg-[#FAF6F0] px-2 sm:px-2.5 py-0.5 rounded-full border border-[#A36B40]/30 shadow-2xs">
                      {currentSection.title}
                    </span>
                    <Badge variant="outline" className="text-[8px] sm:text-[9px] font-bold border-[#DFD7CB] bg-white text-[#77734B] px-1.5 py-0">
                      {currentQ.type}
                    </Badge>
                    {currentQ.discriminator && (
                      <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-[8px] sm:text-[9px] font-bold px-1.5 py-0 hidden xs:inline-flex">
                        Target: {currentQ.discriminator}
                      </Badge>
                    )}
                  </div>
                  
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#7A7067] bg-white px-2 py-0.5 rounded-lg border border-[#DFD7CB]">
                    ID: {currentQ.id}
                  </span>
                </div>

                <CardTitle className="text-sm sm:text-base lg:text-lg font-black text-[#2C2621] leading-snug pt-1">
                  {currentQ.question}
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-[11px] text-[#7A7067] leading-tight">
                  Select the option that most naturally aligns with your instincts, reasoning, and problem-solving method.
                </CardDescription>
              </CardHeader>

              {/* 4 Interactive Option Cards */}
              <CardContent className="p-2.5 sm:p-4 flex-1 flex flex-col justify-evenly gap-2 min-h-0 overflow-y-auto lg:overflow-visible">
                {(currentQ?.options || []).map((opt: OptionWeightItem, optIdx: number) => {
                  const displayLetter = ['A', 'B', 'C', 'D'][optIdx] || opt.id
                  const isSelected = selectedAnswers[currentQ?.id] === opt.id
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex items-center gap-3 active:scale-[0.99] touch-manipulation ${
                        isSelected
                          ? 'border-[#A36B40] bg-[#FAF6F0] ring-2 ring-[#A36B40]/40 shadow-xs scale-[1.005]'
                          : 'border-[#DFD7CB] bg-white hover:border-[#C6A18D] hover:bg-[#FAF6F0]/40'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-mono text-xs sm:text-sm font-black flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[#A36B40] text-white shadow-xs'
                            : 'bg-[#FAF6F0] text-[#7A7067] border border-[#DFD7CB]'
                        }`}
                      >
                        {displayLetter}
                      </div>

                      <div className="flex-1 text-xs sm:text-sm font-semibold text-[#2C2621] leading-snug">
                        {opt.text}
                      </div>

                      <div className="shrink-0">
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-[#A36B40] bg-[#A36B40] text-white'
                              : 'border-[#DFD7CB] bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Desktop-only Bottom Control Dock */}
            <div className="hidden lg:flex bg-white px-4 py-2 rounded-2xl border border-[#DFD7CB] shadow-xs items-center justify-between gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="h-9 px-4 rounded-xl border-[#DFD7CB] bg-white text-xs font-bold text-[#2C2621] hover:bg-[#FAF6F0] disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleNext}
                  className="h-9 px-5 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-extrabold text-xs rounded-xl shadow-xs shadow-[#A36B40]/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>

                <Button
                  onClick={handleFinishAssessment}
                  disabled={isSubmitting}
                  className="h-9 px-5 bg-gradient-to-r from-[#A36B40] to-[#77734B] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md shadow-[#A36B40]/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'See Result / Complete'}</span>
                </Button>
              </div>
            </div>

          </main>

          {/* ═══ RIGHT SIDEBAR: PROGRESS, LEVELS & NAVIGATOR (DESKTOP ONLY) ══ */}
          <aside className="hidden lg:flex lg:col-span-4 flex-col justify-between gap-2 min-h-0 h-full">
            
            {/* Overall Progress Widget */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#DFD7CB] shadow-xs space-y-1.5 shrink-0">
              <div className="flex justify-between items-center text-[11px] sm:text-xs font-bold">
                <span className="text-[#2C2621] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A36B40]" />
                  Overall Progress
                </span>
                <span className="text-[#A36B40] font-mono font-extrabold text-[11px] sm:text-xs">
                  {answeredCount} / 30 ({progressPercent}%)
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* 5-Level Progression (Compact List) */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#DFD7CB] shadow-xs space-y-1 shrink-0">
              <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-1">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#2C2621] flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-[#A36B40]" />
                  5-Level Progression
                </span>
                <span className="text-[9px] font-bold text-[#77734B] bg-[#77734B]/10 px-1.5 py-0.5 rounded-full">
                  6 Qs Each
                </span>
              </div>

              <div className="space-y-1 pt-0.5">
                {SECTION_CONFIGS.map((sec, sIdx) => {
                  const isCurrent = currentSectionIndex === sIdx
                  const startQ = sec.range[0]
                  const endQ = sec.range[1]
                  let secAnswered = 0
                  for (let qNum = startQ; qNum <= endQ; qNum++) {
                    const qObj = activeQuestions[qNum - 1]
                    if (qObj && selectedAnswers[qObj.id]) secAnswered++
                  }
                  const isComplete = secAnswered === 6

                  return (
                    <button
                      key={sec.index}
                      type="button"
                      onClick={() => handleJumpToQuestion(startQ - 1)}
                      className={`w-full py-1 px-2 rounded-lg text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-[#FAF6F0] border-[#A36B40] ring-1 ring-[#A36B40]/30 shadow-2xs'
                          : isComplete
                          ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
                          : 'bg-[#FAF6F0]/40 border-[#DFD7CB] hover:bg-[#FAF6F0]'
                      }`}
                    >
                      <div className="space-y-0 min-w-0">
                        <div className="text-[8px] font-extrabold uppercase tracking-wider text-[#A36B40] leading-none">
                          Stage 0{sec.index}
                        </div>
                        <div className="text-[10px] sm:text-[11px] font-bold text-[#2C2621] truncate leading-tight">
                          {sec.shortTitle}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        {isComplete ? (
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-[#7A7067] bg-white px-1.5 py-0.2 rounded-md border border-[#DFD7CB]">
                            {secAnswered}/6
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 30-Question Interactive Navigator Grid */}
            <div className="flex-1 bg-white p-2.5 sm:p-3 rounded-2xl border border-[#DFD7CB] shadow-xs flex flex-col justify-between min-h-0 space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#FAF6F0] pb-1 shrink-0">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#2C2621] flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-[#A36B40]" />
                  Question Navigator
                </span>
                <span className="text-[9px] text-[#7A7067]">
                  Tap to jump
                </span>
              </div>

              {/* 6 columns x 5 rows grid */}
              <div className="grid grid-cols-6 gap-1 sm:gap-1.5 flex-1 items-center py-0.5">
                {activeQuestions.map((q, idx) => {
                  const isAns = !!selectedAnswers[q.id]
                  const isCurr = currentIndex === idx
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`h-6 sm:h-7 rounded-lg font-mono text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center border ${
                        isCurr
                          ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-xs scale-105 ring-1.5 ring-[#A36B40]/30'
                          : isAns
                          ? 'bg-[#77734B] text-white border-[#77734B]'
                          : 'bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] hover:border-[#A36B40]'
                      }`}
                      aria-label={`Jump to Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              {/* Navigator Legend */}
              <div className="flex items-center justify-between pt-0.5 text-[9px] font-semibold text-[#7A7067] shrink-0 border-t border-[#FAF6F0]">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#77734B]" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#A36B40]" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#DFD7CB]" />
                  <span>Pending</span>
                </div>
              </div>
            </div>

            {/* Advisory Info Capsule */}
            <div className="bg-gradient-to-br from-[#211D19] to-[#2C2621] text-[#FAF6F0] p-2 sm:p-2.5 rounded-xl border border-[#3E362F] shadow-xs flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#C6A18D]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero negative marking · Adaptive engine</span>
              </div>
            </div>

          </aside>

        </div>

      </div>

      {/* ─── MOBILE STICKY BOTTOM DOCK (FIXED AT BOTTOM OF SCREEN) ────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DFD7CB] px-3 py-2.5 shadow-lg flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="h-10 px-3 rounded-xl border-[#DFD7CB] bg-white text-xs font-bold text-[#2C2621] hover:bg-[#FAF6F0] disabled:opacity-30 cursor-pointer flex items-center gap-1 shadow-2xs shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Prev</span>
        </Button>

        {/* Center Question Navigator Trigger */}
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 px-2 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#2C2621] cursor-pointer active:scale-98"
        >
          <span className="text-[11px] font-black text-[#A36B40] leading-none">
            Q {currentIndex + 1} of 30
          </span>
          <span className="text-[9px] text-[#7A7067] font-semibold leading-none mt-0.5">
            {answeredCount}/30 Done · Matrix
          </span>
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            onClick={handleNext}
            className="h-10 px-3.5 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-extrabold text-xs rounded-xl shadow-xs shadow-[#A36B40]/25 transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>

          <Button
            onClick={handleFinishAssessment}
            disabled={isSubmitting}
            className="h-10 px-3 bg-gradient-to-r from-[#A36B40] to-[#77734B] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md shadow-[#A36B40]/30 transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Result</span>
          </Button>
        </div>
      </div>

      {/* ─── MOBILE QUESTION NAVIGATOR BOTTOM SHEET / MODAL ──────────── */}
      {isMobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-0 animate-in fade-in duration-200">
          {/* Backdrop dismiss */}
          <div className="flex-1 w-full" onClick={() => setIsMobileNavOpen(false)} />

          <div className="bg-white rounded-t-3xl border-t border-[#DFD7CB] shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
            {/* Drawer Drag Bar & Header */}
            <div className="pt-3 pb-2.5 px-4 border-b border-[#DFD7CB] bg-[#FAF6F0]/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#A36B40] text-white flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#2C2621]">
                    Question Matrix & Levels
                  </h3>
                  <p className="text-[10px] text-[#7A7067]">
                    Tap any question number to jump directly
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-[#A36B40] text-white text-[10px] font-bold px-2 py-0.5">
                  {answeredCount}/30 Done
                </Badge>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="w-7 h-7 rounded-full bg-white border border-[#DFD7CB] text-[#2C2621] font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs hover:bg-[#FAF6F0]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto">
              {/* Progress Summary & Quick Submit */}
              <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#DFD7CB] space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#2C2621] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#A36B40]" />
                    Assessment Completion
                  </span>
                  <span className="text-[#A36B40] font-mono font-black">
                    {progressPercent}%
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />

                <Button
                  onClick={() => {
                    setIsMobileNavOpen(false)
                    handleFinishAssessment()
                  }}
                  className="w-full h-9 bg-gradient-to-r from-[#A36B40] to-[#77734B] text-white font-black text-xs rounded-xl shadow-xs mt-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>See Result & Complete Assessment</span>
                </Button>
              </div>

              {/* 30-Question Grid */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#2C2621]">
                    All 30 Questions
                  </span>
                  <div className="flex items-center gap-2 text-[9px] font-semibold text-[#7A7067]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#77734B]" /> Answered
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#A36B40]" /> Current
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {activeQuestions.map((q, idx) => {
                    const isAns = !!selectedAnswers[q.id]
                    const isCurr = currentIndex === idx
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          handleJumpToQuestion(idx)
                          setIsMobileNavOpen(false)
                        }}
                        className={`h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                          isCurr
                            ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-xs scale-105 ring-2 ring-[#A36B40]/30'
                            : isAns
                            ? 'bg-[#77734B] text-white border-[#77734B]'
                            : 'bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] hover:border-[#A36B40]'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 5 Stages List in Mobile Drawer */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2C2621] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#A36B40]" />
                  Stages & Levels Overview
                </span>

                <div className="space-y-1.5">
                  {SECTION_CONFIGS.map((sec, sIdx) => {
                    const isCurrent = currentSectionIndex === sIdx
                    const startQ = sec.range[0]
                    const endQ = sec.range[1]
                    let secAnswered = 0
                    for (let qNum = startQ; qNum <= endQ; qNum++) {
                      const qObj = activeQuestions[qNum - 1]
                      if (qObj && selectedAnswers[qObj.id]) secAnswered++
                    }
                    const isComplete = secAnswered === 6

                    return (
                      <button
                        key={sec.index}
                        type="button"
                        onClick={() => {
                          handleJumpToQuestion(startQ - 1)
                          setIsMobileNavOpen(false)
                        }}
                        className={`w-full p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'bg-[#FAF6F0] border-[#A36B40] ring-1 ring-[#A36B40]/30'
                            : isComplete
                            ? 'bg-emerald-50/80 border-emerald-200'
                            : 'bg-white border-[#DFD7CB]'
                        }`}
                      >
                        <div>
                          <div className="text-[9px] font-extrabold uppercase text-[#A36B40]">
                            Stage 0{sec.index} · Questions {sec.range[0]}-{sec.range[1]}
                          </div>
                          <div className="text-xs font-bold text-[#2C2621]">
                            {sec.title}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isComplete ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold text-[#7A7067] bg-[#FAF6F0] px-2 py-0.5 rounded-lg border border-[#DFD7CB]">
                              {secAnswered}/6
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Close footer button */}
            <div className="p-3 border-t border-[#DFD7CB] bg-white">
              <Button
                onClick={() => setIsMobileNavOpen(false)}
                className="w-full h-10 bg-[#2C2621] hover:bg-[#1B1714] text-white text-xs font-bold rounded-xl"
              >
                Close & Resume Question {currentIndex + 1}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 30-QUESTIONS REQUIREMENT & SEE RESULT MODAL ─────────────── */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#A36B40] text-white flex items-center justify-center shadow-sm shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#2C2621]">
                  Complete All 30 Questions to View Result
                </h3>
                <p className="text-xs text-[#7A7067]">
                  {answeredCount} of 30 completed · <strong className="text-[#A36B40]">{totalQuestions - answeredCount} questions remaining</strong>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-2 text-xs text-[#5C544D]">
              <div className="flex justify-between items-center font-bold text-[#2C2621]">
                <span>Assessment Progress</span>
                <span className="font-mono text-[#A36B40] font-extrabold">{answeredCount}/30 Questions ({progressPercent}%)</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-[11px] text-[#7A7067] leading-relaxed pt-0.5">
                The Sandip Career Intelligence Diagnostic Engine evaluates all 5 progressive stages (Orientation, Reasoning, Applied Practice, Differentiation & Validation) to recommend your best-fit degree specialization. Please answer all 30 questions to generate your official report.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                onClick={() => {
                  setIsSubmitConfirmOpen(false)
                  if (firstUnansweredIndex >= 0) {
                    setCurrentIndex(firstUnansweredIndex)
                  }
                }}
                className="w-full h-11 bg-gradient-to-r from-[#A36B40] to-[#77734B] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md shadow-[#A36B40]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Answer Question #{nextUnansweredNum} ({totalQuestions - answeredCount} Qs left)</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmitConfirmOpen(false)
                  setIsMobileNavOpen(true)
                }}
                className="w-full h-10 border-[#DFD7CB] bg-[#FAF6F0] hover:bg-[#F2EAE0] text-[#2C2621] font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-[#A36B40]" />
                <span>Open 30-Question Grid</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FresherTestPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[#7A7067]">Loading 30-Question Assessment...</div>}>
      <FresherTestContent />
    </Suspense>
  )
}
