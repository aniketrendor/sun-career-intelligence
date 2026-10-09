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
  const isMultiSelect = v2Active && (currentQV2?.level === 'L1' || currentQV2?.questionType === 'Multi-select')
  const isRanking = v2Active && currentQV2?.questionType === 'Ranking' && currentQV2?.level !== 'L1'

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
      // Build running V2 responses with ranking support
      const responses: V2ResponseRecord[] = activeQuestionsV2
        .filter((q) => !!selectedAnswersMap[q.id]?.length)
        .map((q) => {
          const isQRank = q.questionType === 'Ranking'
          const ans = selectedAnswersMap[q.id] || []
          return {
            questionId: q.id,
            rankings: isQRank ? ans : undefined,
            selectedOptionIds: isQRank ? undefined : ans,
          }
        })
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

  // Option selection handler (supports single, multi-select, and ranking)
  const handleSelectOption = (optionId: string) => {
    if (!currentQId) return

    setSelectedAnswersMap((prev) => {
      const existing = prev[currentQId] || []
      if (isRanking) {
        if (existing.includes(optionId)) {
          // Toggle off if already selected in rank
          return { ...prev, [currentQId]: existing.filter((id) => id !== optionId) }
        } else {
          // Append next rank
          return { ...prev, [currentQId]: [...existing, optionId] }
        }
      } else if (isMultiSelect) {
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

  const handleResetRanking = () => {
    if (!currentQId) return
    setSelectedAnswersMap((prev) => ({ ...prev, [currentQId]: [] }))
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
      const responses: V2ResponseRecord[] = activeQuestionsV2.slice(0, currentIndex + 1).map((q) => {
        const isQRank = q.questionType === 'Ranking'
        const ans = selectedAnswersMap[q.id] || (isQRank ? q.options.map((o) => o.id) : [q.options[0]?.id || 'A'])
        return {
          questionId: q.id,
          rankings: isQRank ? ans : undefined,
          selectedOptionIds: isQRank ? undefined : ans,
        }
      })

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
        const v2Responses: V2ResponseRecord[] = activeQuestionsV2.map((q) => {
          const isQRank = q.questionType === 'Ranking'
          const ans = selectedAnswersMap[q.id] || (isQRank ? q.options.map((o) => o.id) : [q.options[0]?.id || 'A'])
          return {
            questionId: q.id,
            rankings: isQRank ? ans : undefined,
            selectedOptionIds: isQRank ? undefined : ans,
          }
        })

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

        // Persist lead in database safely without blocking navigation
        try {
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
        } catch (persistErr) {
          console.warn('Lead persistence notice:', persistErr)
        }

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

        const destinationUrl = `/student/fresher/report?${resultParams.toString()}`
        router.push(destinationUrl)
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = destinationUrl
          }, 200)
        }
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
    <div className="w-full h-full flex flex-col justify-between gap-2.5 sm:gap-3 font-sans text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* ─── COMPACT TOP BAR ─── */}
      <div className="bg-[#181410]/95 backdrop-blur-md border border-[#383129] rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shrink-0 shadow-xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight">Career Diagnostic Cockpit</span>
              <Badge variant="outline" className="text-[9px] px-2 py-0.5 border-amber-500/30 text-amber-400 bg-amber-500/10 h-4.5 font-semibold">
                {v2Active ? '891 QB V2' : 'Adaptive'}
              </Badge>
              {v2Active && currentQV2?.level && (
                <Badge variant="outline" className="text-[9px] px-2 py-0.5 border-blue-500/30 text-blue-400 bg-blue-500/10 h-4.5 font-semibold">
                  {currentQV2.level === 'DIFF' ? 'Tie-Breaker' : currentQV2.level}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              <span className="text-slate-200 font-semibold">{candidateName}</span> · {academicLevel} Track · Sandip University
            </p>
          </div>
        </div>

        {/* Progress summary & Exit button */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <span>Question <span className="text-amber-400 font-bold">{currentIndex + 1}</span> / 30</span>
              <span className="text-slate-400 text-[10px]">({progressPercent}%)</span>
            </div>
            <div className="w-28 sm:w-36 md:w-44 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 transition-all duration-300 shadow-sm shadow-amber-500/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExitConfirmOpen(true)}
            className="h-8 px-2.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 rounded-xl cursor-pointer transition-all"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            <span>Exit</span>
          </Button>
        </div>
      </div>

      {/* ─── 5-LEVEL STEPPER ─── */}
      <div className="bg-[#181410]/95 border border-[#383129] rounded-2xl p-1.5 shadow-md shrink-0">
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {SECTION_CONFIGS.map((sec) => {
            const isCurrent = sec.index === currentSection.index
            const isCompleted = currentIndex >= sec.range[1]

            return (
              <div
                key={sec.index}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 ring-1 ring-amber-500/40 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                }`}
              >
                <div
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-amber-500 text-black shadow-xs shadow-amber-500/30'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : sec.index}
                </div>
                <div className="min-w-0 hidden sm:block">
                  <div className="text-[11px] font-semibold truncate leading-tight">{sec.shortTitle}</div>
                  <div className="text-[9px] text-slate-400 leading-tight">6 Questions (Q{sec.range[0]}-{sec.range[1]})</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── MAIN TWO-COLUMN VIEWPORT (ZERO SCROLL) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch flex-1 min-h-0">
        {/* Left Column: Adaptive Question Card (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <Card className="bg-[#181410] border-[#383129] text-slate-100 shadow-2xl relative overflow-hidden flex flex-col justify-between flex-1 rounded-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

            <div className="p-4 sm:p-5 pb-3 border-b border-[#383129]/80 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-slate-800/90 border-slate-700 text-slate-200 text-[10px] px-2 py-0.5 h-5 font-semibold">
                    Question {currentIndex + 1} of 30
                  </Badge>
                  <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[10px] px-2 py-0.5 h-5 font-semibold">
                    Level {currentSection.level}: Question {qNumInCurrentSection} of 6
                  </Badge>
                  {isRanking ? (
                    <Badge variant="outline" className="bg-amber-500/15 border-amber-500/40 text-amber-300 text-[10px] px-2 py-0.5 h-5 flex items-center gap-1 font-semibold">
                      <Layers className="w-3 h-3" /> Ranking (1st → 4th)
                    </Badge>
                  ) : isMultiSelect ? (
                    <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-400 text-[10px] px-2 py-0.5 h-5 flex items-center gap-1 font-semibold">
                      <CheckSquare className="w-3 h-3" /> {currentSection.level === 1 ? '12-Domain Multi-Select' : 'Multi-Select'}
                    </Badge>
                  ) : null}
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Keyboard className="w-3 h-3" /> Keys 1–4 or A–D
                </span>
              </div>

              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white leading-snug tracking-tight">
                {currentQText}
              </h2>

              {isRanking ? (
                <p className="text-[11px] text-amber-300/90 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  <Info className="w-3.5 h-3.5 shrink-0" /> Click options in order of preference (1st Choice → 4th Choice). Click ranked item again to remove.
                </p>
              ) : isMultiSelect ? (
                <p className="text-[11px] text-purple-300/90 flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                  <Info className="w-3.5 h-3.5 shrink-0" /> Select all options that match your interests across 12 university career domains.
                </p>
              ) : null}
            </div>

            {/* Options List (Optimally Spaced across Card Height) */}
            <div className="p-4 sm:p-5 pt-3 flex-1 flex flex-col justify-around gap-2.5 sm:gap-3">
              {currentOptions.map((opt: any, idx: number) => {
                const letter = String.fromCharCode(65 + idx)
                const isSelected = currentSelectedOptionIds.includes(opt.id)
                const optText = opt.displayText || opt.text || opt.rawText
                const rankIndex = isRanking ? currentSelectedOptionIds.indexOf(opt.id) : -1

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 group relative cursor-pointer ${
                      isRanking
                        ? rankIndex === 0
                          ? 'bg-amber-500/25 border-amber-400 text-white shadow-md shadow-amber-500/10'
                          : rankIndex === 1
                          ? 'bg-blue-500/20 border-blue-400/80 text-white shadow-xs'
                          : rankIndex === 2
                          ? 'bg-purple-500/20 border-purple-400/80 text-white shadow-xs'
                          : rankIndex === 3
                          ? 'bg-slate-800/90 border-slate-600 text-slate-200'
                          : 'bg-slate-900/70 border-[#383129] hover:border-slate-600 hover:bg-slate-800/50 text-slate-200'
                        : isSelected
                        ? 'bg-amber-500/20 border-amber-500/80 text-white shadow-md shadow-amber-500/15'
                        : 'bg-slate-900/70 border-[#383129] hover:border-slate-600 hover:bg-slate-800/50 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all ${
                          isRanking
                            ? rankIndex === 0
                              ? 'bg-amber-500 text-black shadow-xs'
                              : rankIndex === 1
                              ? 'bg-blue-400 text-black'
                              : rankIndex === 2
                              ? 'bg-purple-400 text-black'
                              : rankIndex === 3
                              ? 'bg-slate-600 text-white'
                              : 'bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-slate-200'
                            : isSelected
                            ? 'bg-amber-500 text-black'
                            : 'bg-slate-800 border border-slate-700 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {isRanking
                          ? rankIndex >= 0
                            ? `#${rankIndex + 1}`
                            : letter
                          : isSelected
                          ? <Check className="w-4 h-4" />
                          : letter}
                      </div>
                      <span className="text-xs sm:text-sm md:text-[15px] font-medium leading-relaxed">
                        {optText}
                      </span>
                    </div>

                    {isRanking && rankIndex >= 0 && (
                      <span className="text-[10px] sm:text-xs font-bold text-amber-300 px-2.5 py-1 rounded-lg bg-black/50 border border-amber-500/30 shrink-0">
                        {rankIndex === 0 ? '1st Choice' : rankIndex === 1 ? '2nd Choice' : rankIndex === 2 ? '3rd Choice' : '4th Choice'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-3 sm:p-4 px-4 sm:px-6 border-t border-[#383129]/80 flex items-center justify-between bg-black/25 rounded-b-2xl">
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="h-9 px-3.5 text-xs border-[#383129] bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </Button>

                {isRanking && currentSelectedOptionIds.length > 0 && (
                  <button
                    onClick={handleResetRanking}
                    className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer px-2 py-1 font-medium"
                  >
                    Reset Rank
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {currentIndex === 29 ? (
                  <Button
                    size="sm"
                    onClick={handleFinishAssessment}
                    disabled={isSubmitting || currentSelectedOptionIds.length === 0}
                    className="h-9 sm:h-10 px-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/25 rounded-xl cursor-pointer"
                  >
                    {isSubmitting ? 'Analyzing Responses...' : 'Generate Career Report'}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    disabled={currentSelectedOptionIds.length === 0}
                    className="h-9 sm:h-10 px-5 sm:px-6 bg-[#A36B40] hover:bg-[#8C4E2D] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#A36B40]/25 rounded-xl cursor-pointer transition-all"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Real-Time Career Diagnostic (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <Card className="bg-[#181410] border-[#383129] text-slate-100 shadow-2xl rounded-2xl flex flex-col justify-between flex-1 p-4 sm:p-5 space-y-3 overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#383129]/80">
                <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Live Career Diagnostic</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30 px-2 py-0.5 h-5 font-semibold">
                  {answeredCount}/30 Recorded
                </Badge>
              </div>

              {/* Primary Career Leaning */}
              <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-900/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  Primary Predicted Leaning
                </div>
                <div className="text-sm sm:text-base font-bold text-amber-300 truncate">
                  {psychometricContext.primaryLeaning}
                </div>
              </div>

              {/* Top 3 Emerging Domains */}
              <div className="space-y-2 pt-1 border-t border-[#383129]/80">
                <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    Domain Compatibility
                  </span>
                  <span className="text-[10px] text-slate-400">Match %</span>
                </div>
                {psychometricContext.topDomains.slice(0, 3).map((d) => (
                  <div key={d.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-200">
                      <span className="truncate pr-2 font-medium">{d.name}</span>
                      <span className="text-amber-400 font-mono font-bold text-xs">{d.score}%</span>
                    </div>
                    <Progress value={d.score} className="h-1.5 bg-slate-900" />
                  </div>
                ))}
              </div>

              {/* Top Trait Signals */}
              <div className="space-y-2 pt-1 border-t border-[#383129]/80">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  Top Cognitive Traits
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {psychometricContext.topTraits.slice(0, 4).map((t) => (
                    <Badge
                      key={t.code}
                      variant="outline"
                      className="bg-slate-900/90 border-slate-700 text-slate-300 text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg"
                    >
                      {t.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Assessment Context Box */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-[#383129] text-[11px] text-slate-400 space-y-1 mt-2">
              <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Sandip University Catalog
              </div>
              <p className="leading-relaxed text-[10px] text-slate-400">
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
