'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  GraduationCap, CheckCircle2, ArrowRight, ArrowLeft,
  Clock, Sparkles, AlertCircle, HelpCircle, ShieldCheck,
  Award, Check, ChevronRight, Layers, FileText,
  Brain, Compass, Target, BookmarkCheck, Zap, Keyboard,
  BarChart3, BarChart2, RotateCcw, Info, Activity, Flame
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { submitFresherLead } from '@/lib/actions/key.actions'
import {
  Stage1Question,
  UG_STAGE1_QUESTIONS,
  STAGE1_DIMENSION_DEFS,
  OptionWeightItem,
} from '@/lib/engines/stage1-bank-data'
import {
  selectNextAdaptiveQuestion,
  computeStudentContext,
  AnswerHistoryItem,
  StudentPsychometricContext,
} from '@/lib/engines/adaptive-question-selector'
import {
  processAssessmentResponses,
  ResponseRecord,
} from '@/lib/engines/assessment-engine'
import {
  runRecommendationEngine,
} from '@/lib/engines/recommendation-engine'
import {
  resolveOptimalSpecialization,
} from '@/lib/engines/stage1-domain-pathway-mapper'

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

  // Dynamic Adaptive Question Stack (starts with Question 1, expands up to 30)
  const [activeQuestions, setActiveQuestions] = useState<Stage1Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)

  // Initialize first question on mount
  useEffect(() => {
    setMounted(true)
    if (activeQuestions.length === 0) {
      const q1 = selectNextAdaptiveQuestion({
        track: academicLevel,
        targetIndex: 0,
        history: [],
        askedQuestionIds: [],
        seed: 2026,
      })
      setActiveQuestions([q1])
    }
  }, [academicLevel, activeQuestions.length])

  // Current Question accessor
  const currentQ: Stage1Question = activeQuestions[currentIndex] || activeQuestions[0] || (UG_STAGE1_QUESTIONS[0])
  const currentSectionIndex = Math.min(4, Math.max(0, Math.floor(currentIndex / 6)))
  const currentSection = SECTION_CONFIGS[currentSectionIndex] || SECTION_CONFIGS[0]
  const qNumInCurrentSection = (currentIndex % 6) + 1

  const answeredCount = Object.keys(selectedAnswers).length
  const progressPercent = Math.round((answeredCount / 30) * 100)

  // Real-time Psychometric Context computation (like an LLM context window)
  const psychometricContext: StudentPsychometricContext = useMemo(() => {
    const history: AnswerHistoryItem[] = activeQuestions
      .filter((q) => !!selectedAnswers[q.id])
      .map((q) => ({
        question: q,
        selectedOptionId: selectedAnswers[q.id]!,
      }))
    return computeStudentContext(history)
  }, [activeQuestions, selectedAnswers])

  // Option selection
  const handleSelectOption = (optionId: string) => {
    if (!currentQ?.id) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }))
  }

  // Previous Question
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Dynamic Next Question Progression
  const handleNext = () => {
    if (!currentQ?.id || !selectedAnswers[currentQ.id]) {
      toast.warning('Please select an option before moving to the next question.')
      return
    }

    // If on the final question (Question 30)
    if (currentIndex >= 29) {
      handleFinishAssessment()
      return
    }

    const nextIndex = currentIndex + 1

    // If next question already exists in active stack, step forward
    if (nextIndex < activeQuestions.length) {
      setCurrentIndex(nextIndex)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Dynamically select the next question based on current psychometric context
    const history: AnswerHistoryItem[] = activeQuestions.slice(0, currentIndex + 1).map((q) => ({
      question: q,
      selectedOptionId: selectedAnswers[q.id] || (q.options[0]?.id || 'A'),
    }))

    const nextQuestion = selectNextAdaptiveQuestion({
      track: academicLevel,
      targetIndex: nextIndex,
      history,
      askedQuestionIds: activeQuestions.map((q) => q.id),
      seed: 2026,
    })

    setActiveQuestions((prev) => [...prev, nextQuestion])
    setCurrentIndex(nextIndex)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Keyboard navigation shortcuts: 1-4 / A-D to select, ArrowRight / Enter to next, ArrowLeft to prev
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitConfirmOpen) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      const key = e.key.toLowerCase()
      if (key === '1' || key === 'a') {
        if (currentQ?.options[0]) handleSelectOption(currentQ.options[0].id)
      } else if (key === '2' || key === 'b') {
        if (currentQ?.options[1]) handleSelectOption(currentQ.options[1].id)
      } else if (key === '3' || key === 'c') {
        if (currentQ?.options[2]) handleSelectOption(currentQ.options[2].id)
      } else if (key === '4' || key === 'd') {
        if (currentQ?.options[3]) handleSelectOption(currentQ.options[3].id)
      } else if (key === 'arrowright' || key === 'enter') {
        e.preventDefault()
        handleNext()
      } else if (key === 'arrowleft') {
        e.preventDefault()
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, currentQ, isSubmitConfirmOpen, currentIndex, selectedAnswers, activeQuestions.length])

  // Final Assessment Submission
  const handleFinishAssessment = () => {
    if (answeredCount < 30) {
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

      const topDomainName = domain1.name
      const overallFit = domain1.compatibilityScore

      const optimalSpec = resolveOptimalSpecialization(
        domain1.code || domain1.id,
        domain2.code || domain2.id,
        domain3.code || domain3.id,
        academicLevel
      )
      const recommendedSpec = optimalSpec.specialization

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
        aiScore: String(Math.round(domain1.compatibilityScore)),
        cloudScore: String(Math.round(domain2.compatibilityScore)),
        fsScore: String(Math.round(domain3.compatibilityScore)),
        bizScore: String(Math.round(sortedDomains[3]?.compatibilityScore || 70)),
      })

      setTimeout(() => {
        window.location.href = `/student/fresher/report?${resultParams.toString()}`
      }, 500)
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('Finalizing assessment report...')
      window.location.href = `/student/fresher/report?code=${encodeURIComponent(referralCode)}&name=${encodeURIComponent(candidateName)}&level=${academicLevel}`
    }
  }

  // Hydration safety check after all hooks have executed
  if (!mounted || activeQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-6 rounded-2xl border border-[#DFD7CB] shadow-xs text-center max-w-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#A36B40] text-white flex items-center justify-center mx-auto shadow-xs">
            <GraduationCap className="w-5 h-5 animate-pulse" />
          </div>
          <h2 className="text-sm font-bold text-[#2C2621]">Initializing Adaptive Assessment...</h2>
          <p className="text-xs text-[#7A7067]">Configuring your dynamic 30-question diagnostic pathway.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-[#FAF6F0] py-2 px-3 sm:px-6 lg:py-2 lg:px-6 xl:px-10 2xl:px-16 flex flex-col font-sans antialiased text-[#2C2621]">
      
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── MOBILE VIEW (DYNAMIC CONTEXTUAL STEPPER) ──────────────────── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col gap-3 pb-28 w-full max-w-lg mx-auto">
        
        {/* 1. Header Card */}
        <div className="bg-white p-4 rounded-3xl border border-[#E8DFD5] shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#8E5B34] text-white flex items-center justify-center shrink-0 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-[#2C2621] leading-tight">
              {academicLevel} Diagnostic Assessment
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="bg-[#FAF6F0] text-[#8E5B34] border border-[#E8DFD5] text-[10px] font-black px-2 py-0.5 rounded-full">
                {academicLevel} Track
              </span>
              <span className="bg-[#EBF7F0] text-[#1E7E4E] border border-[#CDE9DA] text-[10px] font-black px-2 py-0.5 rounded-full">
                30 Adaptive Qs
              </span>
            </div>
            <p className="text-[11px] text-[#7A7067] mt-1 truncate">
              Candidate: <strong className="text-[#2C2621]">{candidateName}</strong> · Token: <span className="font-mono text-[#8E5B34] font-bold">{referralCode}</span>
            </p>
          </div>
        </div>

        {/* 2. Dynamic Progress Strip (Question Counter + Stage Tracker) */}
        <div className="bg-white p-3.5 rounded-3xl border border-[#E8DFD5] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#2C2621] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8E5B34]" />
              Question {currentIndex + 1} of 30
            </span>
            <span className="text-[#8E5B34] font-mono font-black">
              {progressPercent}% Complete
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />

          {/* Linear 5-Stage Mini Dot Stepper */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {SECTION_CONFIGS.map((sec, sIdx) => {
              const isCurr = currentSectionIndex === sIdx
              const isPast = currentSectionIndex > sIdx
              return (
                <div key={sec.index} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`h-1.5 w-full rounded-full transition-all ${
                    isCurr ? 'bg-[#8E5B34]' : isPast ? 'bg-[#5D6B3C]' : 'bg-[#E8DFD5]'
                  }`} />
                  <span className={`text-[8px] font-extrabold uppercase ${
                    isCurr ? 'text-[#8E5B34]' : isPast ? 'text-[#5D6B3C]' : 'text-[#7A7067]'
                  }`}>
                    L{sec.index}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 3. Live Psychometric Context Pill */}
        <div className="bg-[#FAF6F0] border border-[#DFD7CB] rounded-2xl p-2.5 flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-lg bg-[#8E5B34]/15 text-[#8E5B34] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#8E5B34]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-wider text-[#8E5B34]">
              Adaptive Psychometric Context
            </div>
            <div className="text-[11px] font-bold text-[#2C2621] truncate">
              {psychometricContext.primaryLeaning}
            </div>
          </div>
        </div>

        {/* 4. Active Question Card */}
        <div className="bg-white p-5 rounded-3xl border border-[#E8DFD5] shadow-xs space-y-3.5">
          {/* Badge Row */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-[#FAF6F0] text-[#8E5B34] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#DFD7CB]">
                {currentSection.shortTitle.toUpperCase()} · Q{qNumInCurrentSection}/6
              </span>
              <span className="bg-[#FAF6F0] text-[#77734B] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#DFD7CB]">
                {currentQ.type}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#7A7067] border border-[#E8DFD5] px-2 py-0.5 rounded-lg">
              ID: {currentQ.id}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-black text-[#2C2621] leading-snug">
            {currentQ.question}
          </h2>
          <p className="text-xs text-[#7A7067] leading-relaxed">
            Select the option that most naturally aligns with your instincts, reasoning, and problem-solving method.
          </p>

          {/* 4 Options Vertical Stack */}
          <div className="space-y-2.5 pt-1">
            {(currentQ?.options || []).map((opt, optIdx) => {
              const displayLetter = ['A', 'B', 'C', 'D'][optIdx] || opt.id
              const isSelected = selectedAnswers[currentQ?.id] === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? 'border-[#8E5B34] bg-[#FAF6F0] shadow-xs ring-1 ring-[#8E5B34]/30'
                      : 'border-[#E8DFD5] bg-white hover:bg-[#FAF6F0]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl font-mono text-sm font-black flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#8E5B34] text-white' : 'bg-[#FAF6F0] text-[#8E5B34] border border-[#DFD7CB]'
                    }`}>
                      {displayLetter}
                    </div>
                    <span className={`text-sm font-bold leading-snug ${isSelected ? 'text-[#5C3820]' : 'text-[#2C2621]'}`}>
                      {opt.text}
                    </span>
                  </div>

                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-[#8E5B34] bg-[#8E5B34] text-white' : 'border-[#C8BFB5] bg-white'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 5. 5-Level Progression Roadmap */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8DFD5] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2C2621]">
              <BarChart2 className="w-4 h-4 text-[#8E5B34]" />
              <span>5-Level Adaptive Roadmap</span>
            </div>
            <span className="bg-[#FAF6F0] text-[#7A7067] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#E8DFD5]">
              6 Qs Each
            </span>
          </div>

          <div className="relative pl-6 space-y-2">
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 border-l-2 border-dashed border-[#DFD7CB]" />

            {SECTION_CONFIGS.map((sec, sIdx) => {
              const isCurrent = currentSectionIndex === sIdx
              const startQ = sec.range[0]; const endQ = sec.range[1]
              let cnt = 0
              for (let qn = startQ; qn <= endQ; qn++) {
                const qo = activeQuestions[qn - 1]
                if (qo && selectedAnswers[qo.id]) cnt++
              }
              const done = cnt === 6

              return (
                <div
                  key={sec.index}
                  className={`relative w-full p-2.5 rounded-2xl border transition-all text-left flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-[#FAF6F0] border-[#8E5B34] ring-1 ring-[#8E5B34]/25'
                      : done
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-[#FAF6F0]/40 border-[#E8DFD5]'
                  }`}
                >
                  <div className={`absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 flex items-center justify-center z-10 ${
                    isCurrent
                      ? 'border-[#8E5B34] bg-white ring-2 ring-[#8E5B34]/30'
                      : done
                      ? 'border-emerald-600 bg-emerald-600 text-white text-[8px]'
                      : 'border-[#C8BFB5] bg-white'
                  }`}>
                    {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-[#8E5B34]" />}
                    {done && '✓'}
                  </div>

                  <div>
                    <div className="text-[9px] font-extrabold uppercase text-[#8E5B34] tracking-wider">
                      STAGE 0{sec.index}
                    </div>
                    <div className="text-xs font-bold text-[#2C2621]">
                      {sec.shortTitle}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      done ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      isCurrent ? 'bg-white text-[#8E5B34] border-[#8E5B34]/40' :
                      'bg-white text-[#7A7067] border-[#DFD7CB]'
                    }`}>
                      {cnt} / 6
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 6. Sticky Bottom Dock for Mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-md px-3 pt-2 pb-3 space-y-2 border-t border-[#E8DFD5] shadow-lg">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 h-11 rounded-2xl border-[#DFD7CB] bg-[#F5EEE6] hover:bg-[#EBE2D7] text-xs font-bold text-[#2C2621] flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentIndex < 29 ? (
              <Button
                onClick={handleNext}
                className="flex-2 h-11 rounded-2xl bg-[#8E5B34] hover:bg-[#784A28] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinishAssessment}
                className="flex-2 h-11 rounded-2xl bg-gradient-to-r from-emerald-600 to-[#77734B] hover:opacity-95 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95"
              >
                <Award className="w-4 h-4" />
                <span>Complete & View Report</span>
              </Button>
            )}
          </div>
        </div>

      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── DESKTOP VIEW (CONTEXTUAL 2×2 COCKPIT WORKSPACE) ───────────── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── DESKTOP VIEW (CONTEXTUAL 2×2 COCKPIT WORKSPACE) ───────────── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0 max-w-[1440px] mx-auto w-full gap-2">
        
        {/* ─── TOP HEADER (DESKTOP) ────────────────────────────────────── */}
        <header className="bg-white px-3.5 sm:px-4 py-2 rounded-xl border border-[#DFD7CB] shadow-2xs flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A36B40] via-[#C87D55] to-[#77734B] flex items-center justify-center text-white shadow-2xs shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xs sm:text-sm font-black text-[#2C2621] tracking-tight leading-tight">
                  {academicLevel} Diagnostic Assessment
                </h1>
                <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#A36B40]/40 text-[9px] font-black px-1.5 py-0 rounded-full">
                  {academicLevel} Track
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold px-1.5 py-0 rounded-full">
                  30 Adaptive Questions
                </Badge>
                <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[9px] font-bold px-1.5 py-0 rounded-full">
                  Contextual Engine Active
                </Badge>
              </div>
              <p className="text-[10px] text-[#7A7067] leading-none mt-0.5">
                Candidate: <span className="font-bold text-[#2C2621]">{candidateName}</span> · Token: <span className="font-mono text-[#A36B40] font-black">{referralCode}</span>
              </p>
            </div>
          </div>

          {/* Desktop Metric Strip & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C2621] bg-[#FAF6F0] px-2.5 py-1 rounded-lg border border-[#DFD7CB] shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#A36B40]" />
              <span>Question {currentIndex + 1} of 30</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#77734B] bg-[#77734B]/10 px-2.5 py-1 rounded-lg border border-[#77734B]/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B]" />
              <span>{answeredCount} / 30 Answered</span>
            </div>
            {currentIndex === 29 ? (
              <Button
                onClick={handleFinishAssessment}
                className="h-8 px-3.5 bg-gradient-to-r from-emerald-600 to-[#77734B] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 animate-pulse"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Complete Assessment</span>
              </Button>
            ) : null}
          </div>
        </header>

        {/* ─── 2-COLUMN MAIN WORKSPACE (FITS 100VH ON DESKTOP) ─────────── */}
        <div className="flex-1 grid grid-cols-12 gap-2 sm:gap-2.5 min-h-0 items-stretch">
          
          {/* ═══ LEFT MAIN COLUMN: QUESTION WORKSPACE (8 COLS ON DESKTOP) ═══ */}
          <main className="col-span-8 flex flex-col min-h-0 h-full">
            
            {/* Active Question Card — fills all available height */}
            <Card className="flex-1 flex flex-col bg-white border border-[#DFD7CB] shadow-xs rounded-2xl overflow-hidden min-h-0">
              <div className="h-1 w-full bg-gradient-to-r from-[#A36B40] via-[#C87D55] to-[#77734B] shrink-0" />
              
              {/* Question Header */}
              <CardHeader className="py-2.5 px-4 sm:px-5 border-b border-[#F0E8DF] bg-[#FAF6F0]/60 space-y-1 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A36B40] bg-[#A36B40]/10 px-2 py-0.5 rounded-full border border-[#A36B40]/25 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {currentSection.shortTitle} · Question {qNumInCurrentSection} of 6
                    </span>
                    <Badge variant="outline" className="text-[9px] font-bold border-[#DFD7CB] bg-white text-[#77734B] px-1.5 py-0">
                      {currentQ.type}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] font-mono border-[#DFD7CB] bg-white text-[#7A7067] px-1 py-0">
                      ID: {currentQ.id}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#7A7067] bg-white px-1.5 py-0.5 rounded-md border border-[#DFD7CB]">
                      <Keyboard className="w-3 h-3 text-[#A36B40]" />
                      Press 1-4 · Enter
                    </span>
                    <span className="text-[10px] font-mono font-black text-[#A36B40] bg-[#A36B40]/10 px-2 py-0.5 rounded-lg border border-[#A36B40]/25 shrink-0">
                      Q {currentIndex + 1} / 30
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <CardTitle className="text-base sm:text-lg lg:text-xl font-black text-[#2C2621] leading-snug tracking-tight">
                  {currentQ.question}
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs text-[#7A7067] leading-tight flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#A36B40] shrink-0" />
                  <span className="truncate">Select the option that most naturally aligns with your instincts, reasoning, and problem-solving method.</span>
                </CardDescription>
              </CardHeader>

              {/* 2×2 Option Grid — stretches to fill remaining card height */}
              <CardContent className="p-3 sm:p-3.5 flex-1 grid grid-cols-2 grid-rows-2 gap-2 sm:gap-2.5 min-h-0 overflow-hidden">
                {(currentQ?.options || []).map((opt: OptionWeightItem, optIdx: number) => {
                  const displayLetter = ['A', 'B', 'C', 'D'][optIdx] || opt.id
                  const isSelected = selectedAnswers[currentQ?.id] === opt.id
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-150 cursor-pointer flex flex-col justify-between gap-1.5 h-full group select-none touch-manipulation active:scale-[0.99] min-h-0 overflow-hidden ${
                        isSelected
                          ? 'border-[#A36B40] bg-gradient-to-br from-[#FAF6F0] via-[#F6ECE0] to-[#EFE2D2] shadow-sm shadow-[#A36B40]/15 ring-2 ring-[#A36B40]/20'
                          : 'border-[#E8DFD5] bg-white hover:border-[#C6A18D] hover:bg-[#FAF6F0]/60 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 shrink-0">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-mono text-xs sm:text-sm font-black flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-[#A36B40] text-white shadow-2xs shadow-[#A36B40]/30'
                              : 'bg-[#F5EEE6] text-[#A36B40] border border-[#DFD7CB]'
                          }`}
                        >
                          {displayLetter}
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? 'border-[#A36B40] bg-[#A36B40] text-white'
                              : 'border-[#C8BFB5] bg-white group-hover:border-[#A36B40]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="my-auto py-1 min-h-0 overflow-y-auto">
                        <p className={`text-xs sm:text-sm lg:text-[14px] font-bold leading-snug tracking-tight ${
                          isSelected ? 'text-[#5C3820]' : 'text-[#2C2621]'
                        }`}>
                          {opt.text}
                        </p>
                      </div>

                      <div className="pt-1.5 border-t border-[#DFD7CB]/60 flex items-center justify-between text-[10px] sm:text-[11px] shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#A36B40] bg-[#A36B40]/10 px-2 py-0.5 rounded-md">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            Selected Choice
                          </span>
                        ) : (
                          <span className="text-[#7A7067] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                            Click or press <strong className="text-[#A36B40]">{displayLetter}</strong>
                          </span>
                        )}
                        <span className="font-mono text-[#A36B40]/70 font-semibold">
                          Option {displayLetter}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>

              {/* Desktop Bottom Dock */}
              <div className="bg-[#FAF6F0]/80 px-4 py-2 border-t border-[#F0E8DF] flex items-center justify-between gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="h-8 px-3 rounded-lg border-[#DFD7CB] bg-white text-xs font-bold text-[#2C2621] hover:bg-[#FAF6F0] disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous (←)</span>
                </Button>

                {/* Center: Stage Step Pills */}
                <div className="flex items-center gap-1.5">
                  {SECTION_CONFIGS.map((sec, sIdx) => {
                    const isCurr = currentSectionIndex === sIdx
                    const isPast = currentSectionIndex > sIdx
                    return (
                      <div
                        key={sIdx}
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-black transition-all border flex items-center gap-1 ${
                          isCurr ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-2xs' :
                          isPast ? 'bg-emerald-600 text-white border-emerald-600' :
                          'bg-white text-[#7A7067] border-[#DFD7CB]'
                        }`}
                      >
                        <span>Stage {sec.index}</span>
                        {isPast && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2">
                  {currentIndex < 29 ? (
                    <Button
                      onClick={handleNext}
                      className="h-8 px-4 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-extrabold text-xs rounded-lg shadow-2xs shadow-[#A36B40]/25 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Next Question (Enter)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinishAssessment}
                      disabled={isSubmitting}
                      className="h-8 px-4 bg-gradient-to-r from-emerald-600 to-[#77734B] hover:opacity-95 text-white font-black text-xs rounded-lg shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5 animate-pulse"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Evaluating...' : 'Complete & View Report'}</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>

          </main>

          {/* ═══ RIGHT SIDEBAR (DYNAMIC PSYCHOMETRIC CONTEXT TELEMETRY) ══ */}
          <aside className="col-span-4 flex flex-col gap-2 min-h-0 h-full">

            {/* 1. Progress Overview Card */}
            <div className="bg-white rounded-xl border border-[#DFD7CB] shadow-2xs p-2.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 shrink-0">
                  <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#F0E8DF" strokeWidth="5" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#A36B40" strokeWidth="5"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - progressPercent / 100)}`}
                      strokeLinecap="round" className="transition-all duration-500" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-[#A36B40] leading-none">{progressPercent}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-[#2C2621]">
                    Question {currentIndex + 1} of 30
                  </div>
                  <div className="text-[10px] text-[#7A7067]">
                    {30 - answeredCount} questions remaining
                  </div>
                  <Progress value={progressPercent} className="h-1.5 mt-1" />
                </div>
              </div>
            </div>

            {/* 2. Real-Time Psychometric Context Card */}
            <div className="flex-1 bg-white rounded-xl border border-[#DFD7CB] shadow-2xs flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#F0E8DF] bg-[#FAF6F0]/60 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2C2621] flex items-center gap-1.5">
                  <Brain className="w-3 h-3 text-[#A36B40]" />
                  Adaptive Cognitive Context
                </span>
                <Badge className="bg-[#A36B40] text-white text-[8px] font-bold px-1.5 py-0 border-0">
                  Live Vector
                </Badge>
              </div>

              <div className="flex-1 p-2.5 space-y-2 overflow-y-auto">
                {/* Emerging Leaning Badge */}
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#FAF6F0] via-[#F8EFE4] to-[#F3E7D8] border border-[#DFD7CB] space-y-0.5 shadow-2xs">
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#A36B40] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Emerging Vocational Profile
                  </div>
                  <div className="text-xs font-black text-[#2C2621] leading-tight">
                    {psychometricContext.primaryLeaning}
                  </div>
                  <p className="text-[10px] text-[#7A7067] leading-snug pt-0.5">
                    Real-time psychometric context calibrated from {answeredCount} answered responses.
                  </p>
                </div>

                {/* Top Emerging Dimensions */}
                <div className="space-y-1.5">
                  <div className="text-[9px] font-black uppercase tracking-wider text-[#7A7067]">
                    Top Evaluated Dimensions
                  </div>

                  {psychometricContext.topTraits.length > 0 ? (
                    psychometricContext.topTraits.slice(0, 3).map((t, i) => (
                      <div
                        key={t.code}
                        className="p-1.5 rounded-lg bg-[#FAF6F0]/80 border border-[#DFD7CB] flex items-center justify-between gap-1.5 shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-[#A36B40]/15 text-[#A36B40] font-mono text-[9px] font-black flex items-center justify-center shrink-0">
                            #{i + 1}
                          </span>
                          <span className="text-[11px] font-bold text-[#2C2621] truncate">
                            {t.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-black text-[#A36B40] bg-white px-2 py-0.5 rounded border border-[#DFD7CB] shrink-0">
                          +{t.score} pts
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5 text-center rounded-xl bg-[#FAF6F0]/60 border border-dashed border-[#DFD7CB] text-[11px] text-[#7A7067]">
                      Answer Question 1 to establish your initial psychometric context.
                    </div>
                  )}
                </div>

                {/* Adaptive Pacing Note */}
                <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[10.5px] text-amber-900 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    Questions dynamically adapt to your preferences, logical reasoning, and career attitude.
                  </p>
                </div>
              </div>
            </div>

          </aside>

        </div>

      </div>

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
                  {answeredCount} of 30 completed · <strong className="text-[#A36B40]">{30 - answeredCount} questions remaining</strong>
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
                The Sandip Career Intelligence Diagnostic Engine evaluates all 5 progressive stages (Orientation, Reasoning, Applied Practice, Differentiation & Validation) to recommend your best-fit degree specialization. Please answer each question in order to generate your official report.
              </p>
            </div>

            <div className="pt-1">
              <Button
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="w-full h-11 bg-gradient-to-r from-[#A36B40] to-[#77734B] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md shadow-[#A36B40]/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Continue Assessment (Question #{currentIndex + 1})</span>
                <ArrowRight className="w-4 h-4" />
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
