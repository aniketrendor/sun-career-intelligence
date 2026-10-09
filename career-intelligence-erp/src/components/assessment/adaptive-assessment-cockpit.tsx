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
  LogOut, X, CheckSquare, Square
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
import {
  selectNextHierarchicalQuestion,
  processV2Assessment,
  isV2Enabled,
  MASTER_QB_V2,
} from '@/lib/engines'
import type {
  QBQuestionV2,
  V2ResponseRecord,
} from '@/lib/types/qb-v2.types'

// ─── 5 HIERARCHICAL LEVEL CONFIGURATIONS (6 QUESTIONS PER LEVEL = 30 TOTAL) ───
const SECTION_CONFIGS = [
  {
    index: 1,
    level: 1,
    title: 'Level 1: Broad Career Domain Exploration',
    shortTitle: 'Level 1: Broad Domain',
    range: [1, 6],
    description: 'Identifies broad career interests across Technology, Engineering, Business, Design, Science, Law, and Healthcare.',
  },
  {
    index: 2,
    level: 2,
    title: 'Level 2: Program Family Routing',
    shortTitle: 'Level 2: Program Family',
    range: [7, 12],
    description: 'Narrows down candidate degree clusters and vocational pathways based on emerging preferences.',
  },
  {
    index: 3,
    level: 3,
    title: 'Level 3: Degree & Course Differentiation',
    shortTitle: 'Level 3: Course Architecture',
    range: [13, 18],
    description: 'Compares specific degree structures (e.g. B.Tech vs BCA vs B.Sc, BBA vs B.Com, LLB vs BA LLB).',
  },
  {
    index: 4,
    level: 4,
    title: 'Level 4: Specialization Identification',
    shortTitle: 'Level 4: Specialization',
    range: [19, 24],
    description: 'Evaluates focus areas such as AI/ML, Cloud Security, FinTech, Media Design, Biotechnology, and Operations.',
  },
  {
    index: 5,
    level: 5,
    title: 'Level 5: Deep Specialization & Differentiators',
    shortTitle: 'Level 5: Final Differentiation',
    range: [25, 30],
    description: 'Applies targeted tie-breaker differentiator questions to distinguish closely competing programs.',
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
  const v2Active = useMemo(() => isV2Enabled(), [])

  // Dynamic Adaptive Question Stack (starts with Question 1, expands up to 30)
  const [activeQuestionsV2, setActiveQuestionsV2] = useState<QBQuestionV2[]>(() => {
    const step1 = selectNextHierarchicalQuestion({
      responses: [],
      profile: { academicLevel, stream: qualification },
    })
    return step1.nextQuestion ? [step1.nextQuestion] : [MASTER_QB_V2.questions[0]]
  })
  const [activeQuestionsV1, setActiveQuestionsV1] = useState<Stage1Question[]>(() => {
    return [UG_STAGE1_QUESTIONS[0]]
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Selected answers: map of questionId -> array of option IDs
  const [selectedAnswersMap, setSelectedAnswersMap] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)

  // Initialize first question on mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Current Question accessor
  const currentQV2: QBQuestionV2 | undefined = activeQuestionsV2[currentIndex] || activeQuestionsV2[0]
  const currentQV1: Stage1Question | undefined = activeQuestionsV1[currentIndex] || activeQuestionsV1[0] || (UG_STAGE1_QUESTIONS[0])

  const currentQId = v2Active ? currentQV2?.id : currentQV1?.id
  const currentQText = v2Active ? currentQV2?.questionText : currentQV1?.question
  const isMultiSelect = v2Active && currentQV2?.questionType === 'Multi-select'

  const currentSectionIndex = Math.min(4, Math.max(0, Math.floor(currentIndex / 6)))
  const currentSection = SECTION_CONFIGS[currentSectionIndex] || SECTION_CONFIGS[0]
  const qNumInCurrentSection = (currentIndex % 6) + 1

  const answeredCount = Object.keys(selectedAnswersMap).filter((k) => (selectedAnswersMap[k]?.length || 0) > 0).length
  const progressPercent = Math.round((answeredCount / 30) * 100)

  // Current selected option IDs for this question
  const currentSelectedOptionIds = useMemo(() => {
    if (!currentQId) return []
    return selectedAnswersMap[currentQId] || []
  }, [currentQId, selectedAnswersMap])

  // Real-time Psychometric Context / Evidence Computation
  const psychometricContext: StudentPsychometricContext = useMemo(() => {
    if (v2Active) {
      // Build running V2 responses
      const responses: V2ResponseRecord[] = activeQuestionsV2
        .filter((q) => !!selectedAnswersMap[q.id]?.length)
        .map((q) => ({
          questionId: q.id,
          selectedOptionIds: selectedAnswersMap[q.id],
        }))
      const v2Res = processV2Assessment(responses, { academicLevel, stream: qualification })
      
      const traits: Record<string, number> = {}
      const topTraits: { code: string; name: string; score: number }[] = []
      Object.entries(v2Res.traitScores).forEach(([code, t]) => {
        traits[code] = t.normalizedScore
        topTraits.push({ code, name: t.name, score: t.normalizedScore })
      })
      topTraits.sort((a, b) => b.score - a.score)

      const topDomains = v2Res.topDomains.map((d) => ({
        id: d.code,
        name: d.name,
        score: d.score,
      }))

      return {
        traits,
        totalWeight: 100,
        topTraits,
        topDomains,
        primaryLeaning: topDomains[0]?.name || 'Technology & Computing',
        answeredCount,
      }
    } else {
      const history: AnswerHistoryItem[] = activeQuestionsV1
        .filter((q) => !!selectedAnswersMap[q.id]?.[0])
        .map((q) => ({
          question: q,
          selectedOptionId: selectedAnswersMap[q.id]![0],
        }))
      return computeStudentContext(history)
    }
  }, [activeQuestionsV2, activeQuestionsV1, selectedAnswersMap, v2Active, academicLevel, qualification, answeredCount])

  // Option selection handler (supports single and multi-select)
  const handleSelectOption = (optionId: string) => {
    if (!currentQId) return

    setSelectedAnswersMap((prev) => {
      const existing = prev[currentQId] || []
      if (isMultiSelect) {
        if (existing.includes(optionId)) {
          return { ...prev, [currentQId]: existing.filter((id) => id !== optionId) }
        } else {
          return { ...prev, [currentQId]: [...existing, optionId] }
        }
      } else {
        return { ...prev, [currentQId]: [optionId] }
      }
    })
  }

  // Previous Question
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Dynamic Next Question Progression
  const handleNext = () => {
    if (!currentQId || !selectedAnswersMap[currentQId]?.length) {
      toast.warning('Please select an option before moving to the next question.')
      return
    }

    if (currentIndex >= 29) {
      handleFinishAssessment()
      return
    }

    const nextIndex = currentIndex + 1

    if (v2Active) {
      if (nextIndex < activeQuestionsV2.length) {
        setCurrentIndex(nextIndex)
        return
      }

      // Dynamically select next hierarchical question
      const responses: V2ResponseRecord[] = activeQuestionsV2.slice(0, currentIndex + 1).map((q) => ({
        questionId: q.id,
        selectedOptionIds: selectedAnswersMap[q.id] || [q.options[0]?.id || 'A'],
      }))

      const step = selectNextHierarchicalQuestion({
        responses,
        profile: { academicLevel, stream: qualification },
      })

      if (step.nextQuestion) {
        setActiveQuestionsV2((prev) => [...prev, step.nextQuestion!])
        setCurrentIndex(nextIndex)
      } else {
        handleFinishAssessment()
      }
    } else {
      if (nextIndex < activeQuestionsV1.length) {
        setCurrentIndex(nextIndex)
        return
      }

      const history: AnswerHistoryItem[] = activeQuestionsV1.slice(0, currentIndex + 1).map((q) => ({
        question: q,
        selectedOptionId: selectedAnswersMap[q.id]?.[0] || (q.options[0]?.id || 'A'),
      }))

      const nextQuestion = selectNextAdaptiveQuestion({
        track: academicLevel,
        targetIndex: nextIndex,
        history,
        askedQuestionIds: activeQuestionsV1.map((q) => q.id),
        seed: 2026,
      })

      setActiveQuestionsV1((prev) => [...prev, nextQuestion])
      setCurrentIndex(nextIndex)
    }
  }

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitConfirmOpen || isExitConfirmOpen) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      const key = e.key.toLowerCase()
      const options = v2Active ? currentQV2?.options : currentQV1?.options

      if (key === '1' || key === 'a') {
        if (options?.[0]) handleSelectOption(options[0].id)
      } else if (key === '2' || key === 'b') {
        if (options?.[1]) handleSelectOption(options[1].id)
      } else if (key === '3' || key === 'c') {
        if (options?.[2]) handleSelectOption(options[2].id)
      } else if (key === '4' || key === 'd') {
        if (options?.[3]) handleSelectOption(options[3].id)
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
  }, [mounted, currentQV2, currentQV1, isSubmitConfirmOpen, isExitConfirmOpen, currentIndex, selectedAnswersMap, v2Active])

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
    toast.success('Analyzing responses through the Sandip University Career Intelligence Engine...')

    try {
      if (v2Active) {
        // ─── V2 ASSESSMENT EVALUATION ──────────────────────────────────────────
        const v2Responses: V2ResponseRecord[] = activeQuestionsV2.map((q) => ({
          questionId: q.id,
          selectedOptionIds: selectedAnswersMap[q.id] || [q.options[0]?.id || 'A'],
        }))

        const v2Result = processV2Assessment(v2Responses, {
          academicLevel,
          stream: qualification,
        })

        const primaryProg = v2Result.primaryProgram || {
          programId: 'SUN-023',
          name: 'B.Tech CSE in Artificial Intelligence & Machine Learning',
          specialization: 'Artificial Intelligence & Machine Learning',
          finalCompositeScore: 92,
        }

        const domain1 = v2Result.topDomains[0] || { name: 'Technology & Computing', code: 'TECH', score: 94 }
        const domain2 = v2Result.topDomains[1] || { name: 'Engineering & Architecture', code: 'ENG', score: 86 }
        const domain3 = v2Result.topDomains[2] || { name: 'Management & Commerce', code: 'BUS', score: 78 }

        const topDomainName = domain1.name
        const overallFit = primaryProg.finalCompositeScore
        const recommendedSpec = primaryProg.specialization || primaryProg.name

        // Persist lead in database
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
          progId: primaryProg.programId,
          fitScore: String(Math.round(overallFit)),
          d1Name: domain1.name,
          d1Score: String(domain1.score),
          d1Code: domain1.code,
          d1Label: domain1.score >= 80 ? 'Strong Alignment' : 'Moderate Alignment',
          d2Name: domain2.name,
          d2Score: String(domain2.score),
          d2Code: domain2.code,
          d2Label: domain2.score >= 80 ? 'Strong Alignment' : 'Moderate Alignment',
          d3Name: domain3.name,
          d3Score: String(domain3.score),
          d3Code: domain3.code,
          d3Label: domain3.score >= 80 ? 'Strong Alignment' : 'Moderate Alignment',
          portal: 'student',
        })

        setTimeout(() => {
          window.location.href = `/student/fresher/report?${resultParams.toString()}`
        }, 500)
      } else {
        // ─── LEGACY V1 EVALUATION (Fallback) ──────────────────────────────────
        const responseRecords: ResponseRecord[] = activeQuestionsV1.map((q) => {
          const selectedOptId = selectedAnswersMap[q.id]?.[0] || (q.options[0]?.id || 'A')
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
          portal: 'student',
        })

        setTimeout(() => {
          window.location.href = `/student/fresher/report?${resultParams.toString()}`
        }, 500)
      }
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('Finalizing assessment report...')
      window.location.href = `/student/fresher/report?code=${encodeURIComponent(referralCode)}&name=${encodeURIComponent(candidateName)}&level=${academicLevel}&portal=student`
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#A36B40]/15 text-[#A36B40] flex items-center justify-center animate-pulse">
          <Brain className="w-6 h-6 text-[#A36B40]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#2C2621]">Loading Career Assessment Cockpit...</h3>
          <p className="text-xs text-[#7A7067]">
            Calibrating 891-Question Bank and psychometric dimensions for {candidateName} ({academicLevel} Track)
          </p>
        </div>
      </div>
    )
  }

  const currentOptions = v2Active ? currentQV2?.options || [] : currentQV1?.options || []

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-2 font-sans text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* ─── COMPACT TOP BAR ─── */}
      <div className="bg-[#1C1814] border border-[#383129] rounded-xl px-3.5 py-1.5 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-[13px] font-bold text-white tracking-tight leading-tight">Career Diagnostic Cockpit</span>
              <Badge variant="outline" className="text-[8.5px] px-1.5 py-0 border-amber-500/30 text-amber-400 bg-amber-500/10 h-4">
                {v2Active ? '891 QB V2' : 'Adaptive'}
              </Badge>
              {v2Active && currentQV2?.level && (
                <Badge variant="outline" className="text-[8.5px] px-1.5 py-0 border-blue-500/30 text-blue-400 bg-blue-500/10 h-4">
                  {currentQV2.level === 'DIFF' ? 'Tie-Breaker' : currentQV2.level}
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              <span className="text-slate-200 font-medium">{candidateName}</span> · {academicLevel} Track
            </p>
          </div>
        </div>

        {/* Progress summary & Exit button */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1 text-[11px] text-slate-300 font-medium">
              <span>Question <span className="text-amber-400 font-bold">{currentIndex + 1}</span>/30</span>
              <span className="text-slate-400 text-[9px]">({progressPercent}%)</span>
            </div>
            <div className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExitConfirmOpen(true)}
            className="h-7 px-2 text-[11px] text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 rounded-lg cursor-pointer"
          >
            <LogOut className="w-3 h-3 mr-1" />
            <span>Exit</span>
          </Button>
        </div>
      </div>

      {/* ─── SLIM 5-LEVEL STEPPER ─── */}
      <div className="bg-[#1C1814]/90 border border-[#383129] rounded-xl px-2.5 py-1 shadow-xs shrink-0 overflow-x-auto">
        <div className="flex items-center justify-between gap-1.5 min-w-[500px]">
          {SECTION_CONFIGS.map((sec) => {
            const isCurrent = sec.index === currentSection.index
            const isCompleted = currentIndex >= sec.range[1]

            return (
              <div
                key={sec.index}
                className={`flex-1 flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-amber-500 text-black'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-2.5 h-2.5" /> : sec.index}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold truncate leading-tight">{sec.shortTitle}</div>
                  <div className="text-[8.5px] text-slate-400 leading-tight">6 Questions</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── MAIN TWO-COLUMN VIEWPORT (ZERO SCROLL) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch flex-1">
        {/* Left Column: Adaptive Question Card (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="bg-[#1C1814] border-[#383129] text-slate-100 shadow-xl relative overflow-hidden flex flex-col justify-between flex-1 rounded-xl">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

            <div className="p-3 sm:p-3.5 pb-2 border-b border-[#383129]/80 space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-300 text-[9.5px] px-1.5 py-0 h-4.5">
                    Question {currentIndex + 1} of 30
                  </Badge>
                  <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[9.5px] px-1.5 py-0 h-4.5">
                    Level {currentSection.level}: {qNumInCurrentSection} of 6
                  </Badge>
                  {isMultiSelect && (
                    <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-400 text-[9.5px] px-1.5 py-0 h-4.5 flex items-center gap-1">
                      <CheckSquare className="w-2.5 h-2.5" /> Multi-Select
                    </Badge>
                  )}
                </div>
                <span className="text-[9.5px] text-slate-400 flex items-center gap-1">
                  <Keyboard className="w-2.5 h-2.5" /> Keys 1–4 or A–D
                </span>
              </div>

              <h2 className="text-[13px] sm:text-[15px] font-bold text-white leading-snug">
                {currentQText}
              </h2>

              {isMultiSelect && (
                <p className="text-[10px] text-purple-300/90 flex items-center gap-1">
                  <Info className="w-2.5 h-2.5" /> Select all options that match your interests or background.
                </p>
              )}
            </div>

            {/* Options List (Compact & Touch-Friendly) */}
            <div className="p-3 sm:p-3.5 pt-2 space-y-1.5 flex-1 flex flex-col justify-center">
              {currentOptions.map((opt: any, idx: number) => {
                const letter = String.fromCharCode(65 + idx)
                const isSelected = currentSelectedOptionIds.includes(opt.id)
                const optText = opt.displayText || opt.text || opt.rawText

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-2 sm:p-2.5 rounded-xl border transition-all flex items-start gap-2.5 group relative cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/80 text-white shadow-xs shadow-amber-500/10'
                        : 'bg-slate-900/70 border-[#383129] hover:border-slate-600 hover:bg-slate-800/40 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-amber-500 text-black'
                          : 'bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3" /> : letter}
                    </div>
                    <div className="flex-1 text-xs sm:text-[12.5px] leading-tight pt-0.5">
                      {optText}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-2.5 sm:p-3 pt-2 border-t border-[#383129]/80 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="h-8 px-2.5 text-xs border-[#383129] bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Previous
              </Button>

              <div className="flex items-center gap-2">
                {currentIndex === 29 ? (
                  <Button
                    size="sm"
                    onClick={handleFinishAssessment}
                    disabled={isSubmitting || currentSelectedOptionIds.length === 0}
                    className="h-8 px-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black text-xs font-bold shadow-sm shadow-emerald-500/20 rounded-lg cursor-pointer"
                  >
                    {isSubmitting ? 'Analyzing...' : 'Generate Career Report'}
                    <Sparkles className="w-3 h-3 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    disabled={currentSelectedOptionIds.length === 0}
                    className="h-8 px-4 bg-[#A36B40] hover:bg-[#8C4E2D] text-white text-xs font-bold shadow-sm shadow-[#A36B40]/25 rounded-lg cursor-pointer transition-all"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Real-Time Career Diagnostic (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <Card className="bg-[#1C1814] border-[#383129] text-slate-100 shadow-xl rounded-xl flex flex-col justify-between flex-1 p-3 sm:p-3.5 space-y-2">
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-[#383129]/80">
                <div className="flex items-center gap-1 text-[11.5px] font-bold text-white">
                  <Activity className="w-3 h-3 text-amber-400" />
                  <span>Live Career Diagnostic</span>
                </div>
                <Badge variant="outline" className="text-[8.5px] text-amber-400 border-amber-500/30 px-1 py-0 h-4">
                  {answeredCount}/30 Recorded
                </Badge>
              </div>

              {/* Primary Career Leaning */}
              <div className="pt-1.5 pb-1">
                <div className="text-[10px] text-slate-400 font-medium flex items-center justify-between">
                  <span>Primary Leaning:</span>
                  <span className="text-amber-400 font-bold truncate max-w-[130px] text-[10.5px]">{psychometricContext.primaryLeaning}</span>
                </div>
              </div>

              {/* Top 3 Emerging Domains */}
              <div className="space-y-1 pt-1.5 border-t border-[#383129]/80">
                <div className="text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                  <Target className="w-2.5 h-2.5 text-amber-400" />
                  Domain Compatibility
                </div>
                {psychometricContext.topDomains.slice(0, 3).map((d) => (
                  <div key={d.id} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <span className="truncate pr-1">{d.name}</span>
                      <span className="text-amber-400 font-mono font-bold text-[9.5px]">{d.score}%</span>
                    </div>
                    <Progress value={d.score} className="h-1 bg-slate-800" />
                  </div>
                ))}
              </div>

              {/* Top Trait Signals */}
              <div className="space-y-1 pt-1.5 border-t border-[#383129]/80">
                <div className="text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5 text-orange-400" />
                  Top Cognitive Traits
                </div>
                <div className="flex flex-wrap gap-1">
                  {psychometricContext.topTraits.slice(0, 4).map((t) => (
                    <Badge
                      key={t.code}
                      variant="outline"
                      className="bg-slate-800/80 border-slate-700 text-slate-300 text-[9px] px-1.5 py-0 h-4 leading-none"
                    >
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Assessment Context Box */}
            <div className="bg-slate-950/60 rounded-lg p-2 border border-[#383129] text-[9.5px] text-slate-400 space-y-0.5">
              <div className="flex items-center gap-1 text-slate-300 font-bold">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                Sandip University Catalog
              </div>
              <p className="leading-tight text-[9px]">
                Responses mapped across 114 degree programs in 8 university schools.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* ─── EXIT CONFIRMATION MODAL ─── */}
      {isExitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-[#1C1814] border-[#383129] text-slate-100 max-w-md w-full shadow-2xl rounded-2xl">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Exit Assessment?
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                You have answered {answeredCount} of 30 questions. Your progress will not be saved if you exit now.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExitConfirmOpen(false)}
                className="h-8 text-xs border-[#383129] text-slate-300 rounded-xl"
              >
                Continue Test
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (onExit) onExit()
                  else router.push('/student/assessment')
                }}
                className="h-8 text-xs rounded-xl"
              >
                Exit
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── SUBMISSION CONFIRMATION MODAL ─── */}
      {isSubmitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-[#1C1814] border-[#383129] text-slate-100 max-w-md w-full shadow-2xl rounded-2xl">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Ready to Generate Report?
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                You have completed {answeredCount} questions. Click submit to process your official Career Intelligence Report.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="h-8 text-xs border-[#383129] text-slate-300 rounded-xl"
              >
                Review Answers
              </Button>
              <Button
                size="sm"
                onClick={executeFinalSubmission}
                disabled={isSubmitting}
                className="h-8 text-xs bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl"
              >
                {isSubmitting ? 'Processing...' : 'Submit & View Report'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
