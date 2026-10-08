'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  GraduationCap, CheckCircle2, ArrowRight, ArrowLeft,
  Clock, Sparkles, AlertCircle, HelpCircle, ShieldCheck,
  Award, Check, ChevronRight, Layers, FileText,
  Brain, Compass, Target, BookmarkCheck, Zap, Keyboard,
  BarChart3, BarChart2, RotateCcw, Info, Activity, Flame,
  LogOut, X
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

export interface AdaptiveAssessmentCockpitProps {
  referralCode?: string
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  academicLevel: 'UG' | 'PG'
  qualification?: string
  college?: string
  mentorName?: string
  onExit?: () => void
}

export function AdaptiveAssessmentCockpit({
  referralCode = 'SUN-FRESHERS-2026',
  candidateName,
  candidateEmail,
  candidatePhone = '',
  academicLevel,
  qualification = '',
  college = '',
  mentorName = 'Admissions & Advisory Council',
  onExit,
}: AdaptiveAssessmentCockpitProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Dynamic Adaptive Question Stack (starts with Question 1, expands up to 30)
  const [activeQuestions, setActiveQuestions] = useState<Stage1Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)

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

  // Real-time Psychometric Context computation
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
    }
  }

  // Dynamic Next Question Progression
  const handleNext = () => {
    if (!currentQ?.id || !selectedAnswers[currentQ.id]) {
      toast.warning('Please select an option before moving to the next question.')
      return
    }

    if (currentIndex >= 29) {
      handleFinishAssessment()
      return
    }

    const nextIndex = currentIndex + 1

    if (nextIndex < activeQuestions.length) {
      setCurrentIndex(nextIndex)
      return
    }

    // Dynamically select next adaptive question
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
  }

  // Keyboard navigation shortcuts: 1-4 / A-D to select, Enter to next, ArrowLeft to prev
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitConfirmOpen || isExitConfirmOpen) return
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
  }, [mounted, currentQ, isSubmitConfirmOpen, isExitConfirmOpen, currentIndex, selectedAnswers, activeQuestions.length])

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
    toast.success('Analyzing responses through the Career Intelligence Engine...')

    try {
      const responseRecords: ResponseRecord[] = activeQuestions.map((q) => {
        const selectedOptId = selectedAnswers[q.id] || (q.options[0]?.id || 'A')
        const optIndex = q.options.findIndex((o) => o.id === selectedOptId)
        return {
          questionId: q.id,
          selectedOptionId: selectedOptId,
          responseValue: optIndex >= 0 ? optIndex + 1 : 1,
        }
      })

      const processedAssessment = processAssessmentResponses(
        responseRecords,
        undefined,
        academicLevel
      )

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

      // Persist lead into database
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
        portal: 'student',
      })

      setTimeout(() => {
        window.location.href = `/student/fresher/report?${resultParams.toString()}`
      }, 500)
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('Finalizing assessment report...')
      window.location.href = `/student/fresher/report?code=${encodeURIComponent(referralCode)}&name=${encodeURIComponent(candidateName)}&level=${academicLevel}&portal=student`
    }
  }

  const handleExitClick = () => {
    if (answeredCount > 0) {
      setIsExitConfirmOpen(true)
    } else {
      if (onExit) onExit()
      else router.push('/student/assessment')
    }
  }

  if (!mounted || activeQuestions.length === 0) {
    return (
      <div className="py-16 flex items-center justify-center font-sans">
        <div className="bg-white p-8 rounded-3xl border border-[#DFD7CB] shadow-sm text-center max-w-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#A36B40] text-white flex items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-base font-bold text-[#2C2621]">Initializing Adaptive Test...</h2>
          <p className="text-xs text-[#7A7067]">Loading your personalized 30-question diagnostic pathway.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-sans antialiased text-[#2C2621]">
      
      {/* ─── TOP COCKPIT META BAR ────────────────────────────────────── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-[#DFD7CB] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#A36B40] via-[#C87D55] to-[#77734B] flex items-center justify-center text-white shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-extrabold text-[#2C2621] tracking-tight leading-tight">
                {academicLevel === 'PG' ? 'Postgraduate' : 'Undergraduate'} Diagnostic Assessment
              </h1>
              <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#A36B40]/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {academicLevel} Track
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                30 Adaptive Questions
              </Badge>
            </div>
            <p className="text-xs text-[#7A7067] mt-0.5">
              Evaluating candidate: <strong className="text-[#2C2621]">{candidateName}</strong> · Real-time cognitive engine active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center gap-2 bg-[#FAF6F0] px-3 py-1.5 rounded-2xl border border-[#DFD7CB]">
            <Clock className="w-3.5 h-3.5 text-[#A36B40]" />
            <span className="text-xs font-bold text-[#2C2621]">Question {currentIndex + 1} of 30</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExitClick}
            className="h-9 px-3.5 rounded-2xl border-[#DFD7CB] text-[#7A7067] hover:text-[#2C2621] hover:bg-[#FAF6F0] text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Test</span>
          </Button>
        </div>
      </div>

      {/* ─── MAIN 2-COLUMN COCKPIT WORKSPACE ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ─── LEFT COLUMN: QUESTION COCKPIT (8 COLS) ──────────────────── */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Stage & Question Meta Header */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-[#DFD7CB]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#FAF6F0] text-[#A36B40] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-[#DFD7CB]">
                  {currentSection.shortTitle.toUpperCase()} · QUESTION {qNumInCurrentSection} OF 6
                </span>
                <span className="bg-[#FAF6F0] text-[#77734B] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#DFD7CB]">
                  {currentQ.type || 'Cognitive Analysis'}
                </span>
                <span className="text-[10px] font-mono text-[#7A7067]">
                  ID: {currentQ.id}
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#7A7067] bg-[#FAF6F0] px-2.5 py-1 rounded-xl border border-[#DFD7CB]">
                <Keyboard className="w-3 h-3 text-[#A36B40]" />
                <span>Press 1-4 / Enter</span>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#2C2621] tracking-tight leading-snug">
                {currentQ.question}
              </h2>
              <p className="text-xs text-[#7A7067] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#A36B40]" />
                <span>Select the option that most naturally aligns with your instincts, reasoning, and problem-solving method.</span>
              </p>
            </div>

            {/* 2×2 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {currentQ.options.map((option, oIdx) => {
                const optLetter = String.fromCharCode(65 + oIdx)
                const isSelected = selectedAnswers[currentQ.id] === option.id

                return (
                  <div
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group relative select-none ${
                      isSelected
                        ? 'bg-[#FAF6F0] border-[#A36B40] ring-2 ring-[#A36B40]/25 shadow-md shadow-[#A36B40]/10'
                        : 'bg-white border-[#DFD7CB] hover:border-[#A36B40]/60 hover:bg-[#FAF6F0]/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#A36B40] text-white shadow-xs'
                          : 'bg-[#FAF6F0] text-[#7A7067] border border-[#DFD7CB] group-hover:text-[#2C2621]'
                      }`}>
                        {optLetter}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className={`text-xs sm:text-sm font-bold leading-relaxed transition-colors ${
                          isSelected ? 'text-[#2C2621]' : 'text-[#443E38] group-hover:text-[#2C2621]'
                        }`}>
                          {option.text}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#DFD7CB]/60 flex items-center justify-between text-[11px]">
                      <span className="text-[#7A7067]">
                        Click or press <strong className="text-[#2C2621]">{oIdx + 1}</strong>
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-[#A36B40] bg-[#A36B40] text-white'
                          : 'border-[#DFD7CB] bg-white'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bottom Actions Row */}
            <div className="pt-4 border-t border-[#DFD7CB] flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-full sm:w-auto h-11 px-5 rounded-2xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] text-xs font-bold gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {/* 5-Stage Mini Dot Stepper */}
              <div className="hidden sm:flex items-center gap-1.5 bg-[#FAF6F0] px-3 py-1.5 rounded-full border border-[#DFD7CB]">
                {SECTION_CONFIGS.map((sec, sIdx) => {
                  const isCurr = currentSectionIndex === sIdx
                  const isPast = currentSectionIndex > sIdx
                  return (
                    <div
                      key={sec.index}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                        isCurr
                          ? 'bg-[#A36B40] text-white'
                          : isPast
                          ? 'bg-[#77734B]/20 text-[#77734B]'
                          : 'text-[#7A7067]'
                      }`}
                    >
                      Stage {sec.index}
                    </div>
                  )
                })}
              </div>

              {currentIndex < 29 ? (
                <Button
                  onClick={handleNext}
                  className="w-full sm:w-auto h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer gap-2"
                >
                  <span>Next Question (Enter)</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleFinishAssessment}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-emerald-600 to-[#77734B] hover:opacity-95 text-white font-black text-xs rounded-2xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>{isSubmitting ? 'Analyzing Responses...' : 'Complete & View Report'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: TELEMETRY SIDEBAR (4 COLS) ────────────────── */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Progress Card */}
          <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-sm">
            <CardHeader className="pb-3 border-b border-[#DFD7CB]/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#2C2621]">Assessment Progress</CardTitle>
                <span className="text-xs font-mono font-extrabold text-[#A36B40]">
                  {progressPercent}% Complete
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <Progress value={progressPercent} className="h-2.5" />
              <div className="flex items-center justify-between text-xs text-[#7A7067]">
                <span>{answeredCount} of 30 questions answered</span>
                <span>{30 - answeredCount} remaining</span>
              </div>

              {/* 5-Stage Breakdown List */}
              <div className="space-y-1.5 pt-2 border-t border-[#DFD7CB]">
                {SECTION_CONFIGS.map((sec, sIdx) => {
                  const isCurrent = currentSectionIndex === sIdx
                  const cnt = Object.keys(selectedAnswers).filter((qId) => {
                    const qIndex = activeQuestions.findIndex((q) => q.id === qId)
                    return qIndex >= sec.range[0] - 1 && qIndex <= sec.range[1] - 1
                  }).length
                  const done = cnt === 6

                  return (
                    <div
                      key={sec.index}
                      className={`p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-[#FAF6F0] border border-[#A36B40]/40 font-bold text-[#2C2621]'
                          : done
                          ? 'bg-emerald-50/60 text-emerald-800'
                          : 'text-[#7A7067]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                          done ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-[#A36B40] text-white' : 'bg-[#FAF6F0] border border-[#DFD7CB]'
                        }`}>
                          {done ? '✓' : sec.index}
                        </span>
                        <span className="text-[11px] truncate max-w-[170px]">{sec.shortTitle}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold">
                        {cnt}/6
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Adaptive Cognitive Context Card */}
          <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-sm">
            <CardHeader className="pb-3 border-b border-[#DFD7CB]/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-[#2C2621] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#A36B40]" />
                  Adaptive Cognitive Context
                </CardTitle>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] font-bold">
                  Live Vector
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                <p className="text-[10px] uppercase font-bold text-[#A36B40] tracking-wider">
                  Emerging Vocational Profile
                </p>
                <p className="text-xs font-bold text-[#2C2621] leading-snug">
                  {psychometricContext.primaryLeaning}
                </p>
                <p className="text-[11px] text-[#7A7067]">
                  Calibrated across {answeredCount} answered responses.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB] space-y-1 text-xs text-[#7A7067]">
                <p className="font-semibold text-[#2C2621] text-[11px] flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#A36B40]" /> Dynamic Alignment
                </p>
                <p className="text-[11px] leading-relaxed">
                  Questions dynamically adapt to evaluate cognitive ceiling, technical affinity, and vocational orientation.
                </p>
              </div>

              <div className="pt-2 text-[10px] font-bold text-[#77734B] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#77734B]" />
                <span>Zero negative marking · Institutional diagnostic</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── EXIT CONFIRMATION MODAL ─────────────────────────────────── */}
      {isExitConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#DFD7CB] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C2621]">Exit Assessment Session?</h3>
              <p className="text-xs text-[#7A7067] mt-1 leading-relaxed">
                You have answered {answeredCount} of 30 questions. You can return to take the assessment anytime.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExitConfirmOpen(false)}
                className="rounded-xl border-[#DFD7CB] text-xs font-semibold cursor-pointer"
              >
                Continue Assessment
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setIsExitConfirmOpen(false)
                  if (onExit) onExit()
                  else router.push('/student/assessment')
                }}
                className="rounded-xl bg-[#A36B40] hover:bg-[#8E5B34] text-white text-xs font-bold cursor-pointer"
              >
                Exit to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── EARLY SUBMIT CONFIRMATION MODAL ─────────────────────────── */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#DFD7CB] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2C2621]">Incomplete Assessment ({answeredCount}/30)</h3>
              <p className="text-xs text-[#7A7067] mt-1 leading-relaxed">
                You have {30 - answeredCount} unanswered questions remaining. For the most accurate career and degree recommendations, completing all 30 questions is recommended.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="rounded-xl border-[#DFD7CB] text-xs font-semibold cursor-pointer"
              >
                Keep Answering
              </Button>
              <Button
                size="sm"
                onClick={executeFinalSubmission}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-[#77734B] text-white text-xs font-bold cursor-pointer"
              >
                Submit Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
