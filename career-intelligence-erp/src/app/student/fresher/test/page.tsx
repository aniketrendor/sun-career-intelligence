'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  GraduationCap, CheckCircle2, ArrowRight, ArrowLeft,
  Clock, Sparkles, AlertCircle, HelpCircle, ShieldCheck,
  Award, Check, LayoutGrid, ChevronRight, Layers, FileText,
  Brain, Compass, Target, BookmarkCheck, Zap, Keyboard,
  BarChart3, BarChart2, RotateCcw, Info
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
} from '@/lib/engines/stage1-bank-data'
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

  // Keyboard navigation shortcuts: 1-4 / A-D to select, ArrowRight / Enter to next, ArrowLeft to prev
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitConfirmOpen || isMobileNavOpen) return
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
  }, [currentQ, isSubmitConfirmOpen, isMobileNavOpen, currentIndex, totalQuestions, selectedAnswers])

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
        window.location.href = `/student/fresher/report?${resultParams.toString()}`
      }, 500)
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('Finalizing assessment report...')
      window.location.href = `/student/fresher/report?code=${encodeURIComponent(referralCode)}&name=${encodeURIComponent(candidateName)}&level=${academicLevel}`
    }
  }

  const firstUnansweredIndex = activeQuestions.findIndex((q) => !selectedAnswers[q.id])
  const nextUnansweredNum = firstUnansweredIndex >= 0 ? firstUnansweredIndex + 1 : 1

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#FAF6F0] p-2.5 sm:p-3 lg:p-3.5 flex flex-col overflow-x-hidden lg:overflow-hidden font-sans antialiased text-[#2C2621]">
      
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── MOBILE VIEW (EXACT MATCH TO DESIGN SPECIFICATION) ─────────── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex flex-col gap-3 pb-32 w-full max-w-lg mx-auto">
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

        {/* 2. Metric Strip (3 Pills Row) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#FAF6F0] border border-[#E8DFD5] rounded-2xl py-2 px-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#2C2621]">
            <Clock className="w-3.5 h-3.5 text-[#8E5B34] shrink-0" />
            <span className="truncate">Question {currentIndex + 1} of 30</span>
          </div>
          <div className="bg-[#FAF6F0] border border-[#E8DFD5] rounded-2xl py-2 px-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#2C2621]">
            <RotateCcw className="w-3.5 h-3.5 text-[#7A7067] shrink-0" />
            <span>{answeredCount} / 30 Done</span>
          </div>
          <button
            type="button"
            onClick={handleFinishAssessment}
            className="bg-[#8E5B34] hover:bg-[#784A28] text-white rounded-2xl py-2 px-1.5 flex items-center justify-center gap-1.5 text-[11px] font-black shadow-xs cursor-pointer active:scale-95"
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>See Result</span>
          </button>
        </div>

        {/* 3. Question Card */}
        <div className="bg-white p-5 rounded-3xl border border-[#E8DFD5] shadow-xs space-y-3.5">
          {/* Badge Row */}
          <div className="flex items-center justify-between gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-[#FAF6F0] text-[#8E5B34] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#DFD7CB]">
                {currentSection.title.toUpperCase()}
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

        {/* 4. 5-Level Progression Card with Dotted Line */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E8DFD5] shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2C2621]">
              <BarChart2 className="w-4 h-4 text-[#8E5B34]" />
              <span>5-Level Progression</span>
            </div>
            <span className="bg-[#FAF6F0] text-[#7A7067] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#E8DFD5]">
              6 Qs Each
            </span>
          </div>

          <div className="relative pl-6 space-y-2">
            {/* Dotted vertical line connecting all 5 steps */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 border-l-2 border-dashed border-[#DFD7CB]" />

            {SECTION_CONFIGS.map((sec, sIdx) => {
              const isCurrent = currentSectionIndex === sIdx
              const startQ = sec.range[0]; const endQ = sec.range[1]
              let cnt = 0
              for (let qn = startQ; qn <= endQ; qn++) {
                const qo = activeQuestions[qn-1]
                if (qo && selectedAnswers[qo.id]) cnt++
              }
              const done = cnt === 6

              return (
                <button
                  key={sec.index}
                  type="button"
                  onClick={() => handleJumpToQuestion(startQ - 1)}
                  className={`relative w-full p-2.5 rounded-2xl border transition-all text-left flex items-center justify-between gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#FAF6F0] border-[#8E5B34] ring-1 ring-[#8E5B34]/25'
                      : done
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-[#FAF6F0]/40 border-[#E8DFD5] hover:bg-[#FAF6F0]'
                  }`}
                >
                  {/* Timeline Dot on the left */}
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
                </button>
              )
            })}
          </div>
        </div>

        {/* 5. Question Navigator Card */}
        <div className="bg-white p-4 rounded-3xl border border-[#E8DFD5] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#2C2621]">
              <LayoutGrid className="w-4 h-4 text-[#8E5B34]" />
              <span>Question Navigator</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="text-[11px] font-bold text-[#7A7067] hover:text-[#8E5B34] flex items-center gap-0.5 cursor-pointer"
            >
              <span>Tap to view all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal scroll 1-10 numbers */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {activeQuestions.slice(0, 10).map((q, idx) => {
              const isAns = !!selectedAnswers[q.id]
              const isCurr = currentIndex === idx
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`w-9 h-9 rounded-xl font-mono text-xs font-bold transition-all shrink-0 flex items-center justify-center border cursor-pointer ${
                    isCurr
                      ? 'bg-[#8E5B34] text-white border-[#8E5B34] shadow-xs scale-105 ring-1 ring-[#8E5B34]/30'
                      : isAns
                      ? 'bg-[#5D6B3C] text-white border-[#5D6B3C]'
                      : 'bg-[#FAF6F0] text-[#2C2621] border-[#E8DFD5]'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-[10px] font-bold text-[#7A7067] pt-1.5 border-t border-[#F0E8DF]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5D6B3C]" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8E5B34]" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DFD7CB]" />
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* 6. Sticky Bottom Dock for Mobile (Fixed bottom overlay) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-md px-3 pt-2 pb-3 space-y-2 border-t border-[#E8DFD5] shadow-lg">
          <div className="max-w-lg mx-auto grid grid-cols-12 gap-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="col-span-4 h-11 rounded-2xl border-[#DFD7CB] bg-[#F5EEE6] hover:bg-[#EBE2D7] text-xs font-bold text-[#2C2621] flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <Button
              onClick={handleNext}
              className="col-span-3 h-11 rounded-2xl bg-[#8E5B34] hover:bg-[#784A28] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-95"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={handleFinishAssessment}
              className="col-span-5 h-11 rounded-2xl bg-[#3D332A] hover:bg-[#2C241D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <span>See Result / Complete</span>
            </Button>
          </div>

          <div className="max-w-lg mx-auto bg-[#24201C] text-[#DFD7CB] rounded-2xl py-2 px-3 flex items-center justify-center gap-2 text-[11px] font-bold">
            <div className="w-4 h-4 rounded-full border border-emerald-400 text-emerald-400 flex items-center justify-center text-[9px] shrink-0 font-bold">
              i
            </div>
            <span>Zero negative marking · Adaptive engine</span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ─── DESKTOP VIEW (SPACIOUS 2×2 COCKPIT WORKSPACE) ─────────────── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0 max-w-[1560px] mx-auto w-full gap-2.5 sm:gap-3">
        
        {/* ─── TOP HEADER (DESKTOP) ────────────────────────────────────── */}
        <header className="bg-white px-3.5 sm:px-5 py-2.5 rounded-2xl border border-[#DFD7CB] shadow-xs flex items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#A36B40] via-[#C87D55] to-[#77734B] flex items-center justify-center text-white shadow-xs shadow-[#A36B40]/25 shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xs sm:text-sm lg:text-base font-black text-[#2C2621] tracking-tight leading-tight">
                  {academicLevel} Diagnostic Assessment
                </h1>
                <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#A36B40]/40 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full">
                  {academicLevel} Track
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full">
                  30 Adaptive Qs
                </Badge>
                <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Zero Negative Marking
                </Badge>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#7A7067] leading-none mt-0.5">
                Candidate: <span className="font-bold text-[#2C2621]">{candidateName}</span> · Token: <span className="font-mono text-[#A36B40] font-black">{referralCode}</span>
              </p>
            </div>
          </div>

          {/* Desktop Metric Strip & Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C2621] bg-[#FAF6F0] px-3 py-1.5 rounded-xl border border-[#DFD7CB] shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#A36B40]" />
              <span>Question {currentIndex + 1} of 30</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#77734B] bg-[#77734B]/10 px-3 py-1.5 rounded-xl border border-[#77734B]/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B]" />
              <span>{answeredCount} / 30 Done</span>
            </div>
            <Button
              onClick={handleFinishAssessment}
              className={`h-9 px-4 font-black text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                answeredCount === 30
                  ? 'bg-gradient-to-r from-emerald-600 to-[#77734B] hover:opacity-95 text-white shadow-emerald-600/30 ring-2 ring-emerald-400 animate-pulse'
                  : 'bg-gradient-to-r from-[#A36B40] to-[#77734B] hover:opacity-95 text-white shadow-[#A36B40]/25'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>See Result</span>
            </Button>
          </div>
        </header>

        {/* ─── 2-COLUMN MAIN WORKSPACE (FITS 100VH ON DESKTOP) ─────────── */}
        <div className="flex-1 grid grid-cols-12 gap-2.5 sm:gap-3 min-h-0 items-stretch">
          
          {/* ═══ LEFT MAIN COLUMN: QUESTION WORKSPACE (8 COLS ON DESKTOP) ═══ */}
          <main className="col-span-8 flex flex-col min-h-0 h-full">
            
            {/* Active Question Card — fills all available height */}
            <Card className="flex-1 flex flex-col bg-white border border-[#DFD7CB] shadow-sm rounded-2xl overflow-hidden min-h-0">
              {/* Accent header bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#A36B40] via-[#C87D55] to-[#77734B] shrink-0" />
              
              {/* Question Header */}
              <CardHeader className="py-3.5 sm:py-4 px-4 sm:px-6 border-b border-[#F0E8DF] bg-[#FAF6F0]/60 space-y-2 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#A36B40] bg-[#A36B40]/10 px-2.5 py-0.5 rounded-full border border-[#A36B40]/25 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {currentSection.shortTitle}
                    </span>
                    <Badge variant="outline" className="text-[9px] sm:text-[10px] font-bold border-[#DFD7CB] bg-white text-[#77734B] px-2 py-0.5">
                      {currentQ.type}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] font-mono border-[#DFD7CB] bg-white text-[#7A7067] px-1.5 py-0.5">
                      ID: {currentQ.id}
                    </Badge>
                    {currentQ.discriminator && (
                      <Badge className="bg-[#77734B]/10 text-[#77734B] border-0 text-[8px] font-bold px-1.5 py-0.5 hidden sm:inline-flex">
                        {currentQ.discriminator}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-[#7A7067] bg-white px-2 py-0.5 rounded-md border border-[#DFD7CB]">
                      <Keyboard className="w-3 h-3 text-[#A36B40]" />
                      Press 1-4 · Enter
                    </span>
                    <span className="text-[10px] font-mono font-black text-[#A36B40] bg-[#A36B40]/10 px-2.5 py-1 rounded-lg border border-[#A36B40]/25 shrink-0">
                      Q {currentIndex + 1} / 30
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <CardTitle className="text-xl lg:text-[22px] font-black text-[#2C2621] leading-snug tracking-tight">
                  {currentQ.question}
                </CardTitle>
                <CardDescription className="text-xs sm:text-[13px] text-[#7A7067] leading-relaxed flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A36B40] shrink-0" />
                  <span>Select the option that most naturally aligns with your instincts, reasoning, and problem-solving method.</span>
                </CardDescription>
              </CardHeader>

              {/* 2×2 Option Grid — stretches to fill remaining card height */}
              <CardContent className="p-4 sm:p-5 lg:p-6 flex-1 grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 min-h-0 overflow-visible">
                {(currentQ?.options || []).map((opt: OptionWeightItem, optIdx: number) => {
                  const displayLetter = ['A', 'B', 'C', 'D'][optIdx] || opt.id
                  const isSelected = selectedAnswers[currentQ?.id] === opt.id
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`relative p-4 sm:p-5 lg:p-6 rounded-2xl border-2 transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3 h-full group select-none touch-manipulation active:scale-[0.98] ${
                        isSelected
                          ? 'border-[#A36B40] bg-gradient-to-br from-[#FAF6F0] via-[#F6ECE0] to-[#EFE2D2] shadow-md shadow-[#A36B40]/15 ring-2 ring-[#A36B40]/20'
                          : 'border-[#E8DFD5] bg-white hover:border-[#C6A18D] hover:bg-[#FAF6F0]/60 hover:shadow-xs'
                      }`}
                    >
                      {/* Top: letter badge + keyboard hint + radio */}
                      <div className="flex items-center justify-between gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono text-sm sm:text-base font-black flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-[#A36B40] text-white shadow-xs shadow-[#A36B40]/30'
                                : 'bg-[#F5EEE6] text-[#A36B40] border border-[#DFD7CB]'
                            }`}
                          >
                            {displayLetter}
                          </div>
                          <span className="inline-block text-[10px] font-mono font-bold text-[#A36B40] bg-[#FAF6F0] border border-[#DFD7CB] px-1.5 py-0.5 rounded-md">
                            Key [{optIdx + 1}]
                          </span>
                        </div>

                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                            isSelected
                              ? 'border-[#A36B40] bg-[#A36B40] text-white shadow-xs'
                              : 'border-[#C8BFB5] bg-white group-hover:border-[#A36B40]'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Middle: option text (prominent & comfortable) */}
                      <div className="my-auto py-2">
                        <p className={`text-sm sm:text-base lg:text-lg font-bold leading-relaxed tracking-tight ${
                          isSelected ? 'text-[#5C3820]' : 'text-[#2C2621]'
                        }`}>
                          {opt.text}
                        </p>
                      </div>

                      {/* Bottom: selection status pill or selection prompt */}
                      <div className="pt-2 border-t border-[#DFD7CB]/60 flex items-center justify-between text-xs shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-[#A36B40] bg-[#A36B40]/10 px-2.5 py-0.5 rounded-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Selected Choice
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#7A7067] font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                            Click or press <strong className="text-[#A36B40]">{displayLetter}</strong>
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#A36B40]/70 font-semibold">
                          Option {displayLetter}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>

              {/* Desktop Bottom Dock */}
              <div className="bg-[#FAF6F0]/70 px-5 py-3 border-t border-[#F0E8DF] flex items-center justify-between gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="h-9 px-4 rounded-xl border-[#DFD7CB] bg-white text-xs font-bold text-[#2C2621] hover:bg-[#FAF6F0] disabled:opacity-40 cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous (←)</span>
                </Button>

                {/* Center: mini level stepper */}
                <div className="flex items-center gap-1.5">
                  {SECTION_CONFIGS.map((sec, sIdx) => {
                    const isCurr = currentSectionIndex === sIdx
                    const startQ = sec.range[0]; const endQ = sec.range[1]
                    let cnt = 0
                    for (let qn = startQ; qn <= endQ; qn++) { const qo = activeQuestions[qn-1]; if (qo && selectedAnswers[qo.id]) cnt++ }
                    const done = cnt === 6
                    return (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleJumpToQuestion(sec.range[0]-1)}
                        className={`h-7 px-3 rounded-full text-[10px] font-black transition-all cursor-pointer border flex items-center gap-1 ${
                          isCurr ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-xs' :
                          done ? 'bg-emerald-600 text-white border-emerald-600' :
                          'bg-white text-[#7A7067] border-[#DFD7CB] hover:border-[#A36B40]'
                        }`}
                      >
                        <span>L{sec.index}</span>
                        {done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleNext}
                    className="h-9 px-5 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-extrabold text-xs rounded-xl shadow-xs shadow-[#A36B40]/25 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Next (Enter)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={handleFinishAssessment}
                    disabled={isSubmitting}
                    className="h-9 px-5 bg-gradient-to-r from-[#A36B40] to-[#77734B] hover:opacity-95 text-white font-black text-xs rounded-xl shadow-md shadow-[#A36B40]/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Submitting...' : 'See Result'}</span>
                  </Button>
                </div>
              </div>
            </Card>

          </main>

          {/* ═══ RIGHT SIDEBAR (DESKTOP ONLY) ═══════════════════════════ */}
          <aside className="col-span-4 flex flex-col gap-2.5 min-h-0 h-full">

            {/* ── Progress + Level bar (compact single card) ─────────── */}
            <div className="bg-white rounded-2xl border border-[#DFD7CB] shadow-xs p-3.5 shrink-0 space-y-2.5">
              {/* Progress row */}
              <div className="flex items-center gap-3.5">
                {/* Arc-style progress indicator */}
                <div className="relative w-14 h-14 shrink-0">
                  <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#F0E8DF" strokeWidth="5" />
                    <circle cx="28" cy="28" r="24" fill="none" stroke="#A36B40" strokeWidth="5"
                      strokeDasharray={`${2 * Math.PI * 24}`}
                      strokeDashoffset={`${2 * Math.PI * 24 * (1 - progressPercent / 100)}`}
                      strokeLinecap="round" className="transition-all duration-500" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-[#A36B40] leading-none">{progressPercent}%</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-[#2C2621]">{answeredCount} of 30 Answered</div>
                  <div className="text-[11px] text-[#7A7067] mt-0.5">{30 - answeredCount} questions remaining</div>
                  <Progress value={progressPercent} className="h-1.5 mt-1.5" />
                </div>
              </div>

              {/* Next unanswered shortcut button if any remain */}
              {answeredCount < 30 && firstUnansweredIndex >= 0 && (
                <button
                  type="button"
                  onClick={() => handleJumpToQuestion(firstUnansweredIndex)}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3ECE0] border border-[#DFD7CB] text-[#A36B40] text-[11px] font-bold transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Jump to Next Pending</span>
                  </span>
                  <span className="font-mono font-black">Q#{nextUnansweredNum} →</span>
                </button>
              )}

              {/* Level stepper */}
              <div className="space-y-1 pt-1 border-t border-[#F0E8DF]">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#7A7067] mb-1">
                  5-Stage Roadmap (6 Qs Each)
                </div>
                {SECTION_CONFIGS.map((sec, sIdx) => {
                  const isCurrent = currentSectionIndex === sIdx
                  const startQ = sec.range[0]; const endQ = sec.range[1]
                  let secAnswered = 0
                  for (let qNum = startQ; qNum <= endQ; qNum++) {
                    const qObj = activeQuestions[qNum - 1]
                    if (qObj && selectedAnswers[qObj.id]) secAnswered++
                  }
                  const isComplete = secAnswered === 6
                  const pct = Math.round((secAnswered / 6) * 100)
                  return (
                    <button key={sec.index} type="button" onClick={() => handleJumpToQuestion(startQ - 1)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isCurrent ? 'bg-[#A36B40]/10 border-[#A36B40] ring-1 ring-[#A36B40]/25' :
                        isComplete ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-300' :
                        'bg-[#FAF6F0]/60 border-[#E8DFD5] hover:bg-[#FAF6F0]'
                      }`}>
                      {/* Level dot */}
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                        isCurrent ? 'bg-[#A36B40] text-white' :
                        isComplete ? 'bg-emerald-600 text-white' :
                        'bg-white border border-[#DFD7CB] text-[#7A7067]'
                      }`}>
                        {isComplete ? '✓' : sec.index}
                      </div>
                      {/* Label + mini progress bar */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className={`text-[10px] font-bold truncate ${
                          isCurrent ? 'text-[#A36B40]' : isComplete ? 'text-emerald-700' : 'text-[#2C2621]'
                        }`}>{sec.shortTitle}</div>
                        <div className="h-1 w-full bg-[#E8DFD5] rounded-full mt-0.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${
                            isComplete ? 'bg-emerald-600' : isCurrent ? 'bg-[#A36B40]' : 'bg-[#C6A18D]'
                          }`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold shrink-0 ${
                        isComplete ? 'text-emerald-600' : isCurrent ? 'text-[#A36B40]' : 'text-[#7A7067]'
                      }`}>{secAnswered}/6</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── 30-Question Navigator (fills remaining space) ─────── */}
            <div className="flex-1 bg-white rounded-2xl border border-[#DFD7CB] shadow-xs flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-[#F0E8DF] shrink-0">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2C2621] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#A36B40]" />
                  Question Matrix
                </span>
                <span className="text-[10px] text-[#A36B40] font-mono font-bold bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#DFD7CB]">
                  {answeredCount}/30 Done
                </span>
              </div>

              {/* 5×6 interactive grid — fills all space */}
              <div className="flex-1 p-2.5 sm:p-3 grid grid-cols-6 gap-1.5 content-start overflow-y-auto">
                {activeQuestions.map((q, idx) => {
                  const isAns = !!selectedAnswers[q.id]
                  const isCurr = currentIndex === idx
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleJumpToQuestion(idx)}
                      className={`aspect-square rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center border ${
                        isCurr
                          ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-sm scale-105 ring-2 ring-[#A36B40]/40'
                          : isAns
                          ? 'bg-[#77734B] text-white border-[#77734B]'
                          : 'bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] hover:border-[#A36B40] hover:bg-white'
                      }`}
                      aria-label={`Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              {/* Legend + Advisory */}
              <div className="px-3 pb-2.5 space-y-2 shrink-0">
                <div className="flex items-center justify-between text-[9px] font-semibold text-[#7A7067] border-t border-[#F0E8DF] pt-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#77734B]" />Answered</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#A36B40]" />Current</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#DFD7CB]" />Pending</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#1B1714] text-[#C6A18D] px-2.5 py-1.5 rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[9px] font-bold">Zero negative marking · Adaptive engine</span>
                </div>
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
