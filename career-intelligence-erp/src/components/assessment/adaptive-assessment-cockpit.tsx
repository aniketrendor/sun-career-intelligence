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
  LogOut, X, CheckSquare, Square, Star, Radio
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { submitFresherLead } from '@/lib/actions/key.actions'
import {
  getQuestionsForAssessment,
  ASSESSMENT_LEVEL_CONFIGS,
  processAssessmentResponses,
  validateAnswerForQuestion,
} from '@/lib/engines/index'
import type {
  AssessmentQuestion,
  AnswerOption,
  DimensionScore,
  StudentAnswer,
  StudentProfileContext,
  AcademicDegreeLevel,
} from '@/lib/types/assessment-v3.types'

export interface AdaptiveAssessmentCockpitProps {
  referralCode?: string
  candidateName: string
  candidateEmail: string
  candidatePhone?: string
  academicLevel: 'UG' | 'PG' | 'Diploma' | 'PhD'
  qualification?: string
  college?: string
  mentorName?: string
  onExit?: () => void
}

const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly Disagree', short: '1' },
  { value: 2, label: 'Disagree', short: '2' },
  { value: 3, label: 'Neutral', short: '3' },
  { value: 4, label: 'Agree', short: '4' },
  { value: 5, label: 'Strongly Agree', short: '5' },
]

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answersMap, setAnswersMap] = useState<Record<string, StudentAnswer>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false)
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)

  const questions: AssessmentQuestion[] = useMemo(
    () => getQuestionsForAssessment(academicLevel as AcademicDegreeLevel),
    [academicLevel]
  )
  const totalQuestions = questions.length

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentQuestion = questions[currentIndex] || questions[0]
  const currentAnswer = answersMap[currentQuestion?.question_id]

  const levelConfig = useMemo(() => {
    return (
      ASSESSMENT_LEVEL_CONFIGS.find((c: { level: string }) => c.level === currentQuestion?.level) ||
      ASSESSMENT_LEVEL_CONFIGS[0]
    )
  }, [currentQuestion?.level])

  // Count answered questions
  const answeredCount = useMemo(() => {
    return Object.values(answersMap).filter((ans) => {
      if (typeof ans.rating_value === 'number') return true
      if (ans.option_id) return true
      if (ans.option_ids && ans.option_ids.length > 0) return true
      return false
    }).length
  }, [answersMap])

  const progressPercent = Math.round((answeredCount / totalQuestions) * 100)

  // Real-time live profile evaluation
  const liveResult = useMemo(() => {
    const validAnswers = Object.values(answersMap)
    const profile: StudentProfileContext = {
      fullName: candidateName,
      email: candidateEmail,
      phone: candidatePhone,
      academicLevel: academicLevel as AcademicDegreeLevel,
      stream: qualification,
      referralCode,
      mentorName,
    }
    return processAssessmentResponses(validAnswers, profile)
  }, [answersMap, candidateName, candidateEmail, candidatePhone, academicLevel, qualification, referralCode, mentorName])

  // Answer handlers
  const handleSelectRating = (val: number) => {
    if (!currentQuestion) return
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.question_id]: {
        question_id: currentQuestion.question_id,
        rating_value: val,
      },
    }))
  }

  const handleSelectSingle = (optId: string) => {
    if (!currentQuestion) return
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.question_id]: {
        question_id: currentQuestion.question_id,
        option_id: optId,
      },
    }))
  }

  const handleSelectMulti = (optId: string) => {
    if (!currentQuestion) return
    const existing = currentAnswer?.option_ids || []
    const isAlreadySelected = existing.includes(optId)

    const opt = currentQuestion.options.find((o: AnswerOption) => o.option_id === optId)
    const isMutuallyExclusive = opt?.is_mutually_exclusive

    let updated: string[] = []
    if (isMutuallyExclusive) {
      updated = isAlreadySelected ? [] : [optId]
    } else {
      const filtered = existing.filter((id: string) => {
        const o = currentQuestion.options.find((item: AnswerOption) => item.option_id === id)
        return !o?.is_mutually_exclusive
      })
      if (isAlreadySelected) {
        updated = filtered.filter((id: string) => id !== optId)
      } else {
        const max = currentQuestion.max_selections ?? 4
        if (filtered.length >= max) {
          toast.info(`Maximum ${max} options allowed for this question.`)
          return
        }
        updated = [...filtered, optId]
      }
    }

    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.question_id]: {
        question_id: currentQuestion.question_id,
        option_ids: updated,
      },
    }))
  }

  // Navigation handlers
  const validation = validateAnswerForQuestion(currentQuestion, currentAnswer)

  const handleNext = () => {
    if (!validation.isValid) {
      toast.error(validation.errorMessage || 'Please answer the question before continuing.')
      return
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      handleFinishAssessment()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  // Final Submission
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
    toast.success('Analyzing responses through the Sandip University Career Intelligence Engine...')

    try {
      const validAnswers = Object.values(answersMap)
      const profile: StudentProfileContext = {
        fullName: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        academicLevel: academicLevel as AcademicDegreeLevel,
        stream: qualification,
        referralCode,
        mentorName,
      }

      const finalResult = processAssessmentResponses(validAnswers, profile)
      const primary = finalResult.primary_course || {
        program_id: 'SUN-023',
        course: 'B.Tech',
        specialization: 'Artificial Intelligence & Machine Learning',
        match_score: 92,
      }

      const d1 = finalResult.top_dimensions[0] || { name: 'Technology & computing', normalized_score: 94, dimension_id: 'TECHNOLOGY' }
      const d2 = finalResult.top_dimensions[1] || { name: 'Engineering & applied technology', normalized_score: 86, dimension_id: 'ENGINEERING' }
      const d3 = finalResult.top_dimensions[2] || { name: 'Business & management', normalized_score: 78, dimension_id: 'BUSINESS' }

      // Persist lead
      try {
        await submitFresherLead({
          referralCode,
          candidateName,
          candidateEmail: candidateEmail || undefined,
          candidatePhone: candidatePhone || undefined,
          targetLevel: (academicLevel === 'PG' ? 'PG' : 'UG') as 'UG' | 'PG',
          highestQualification: qualification || undefined,
          lastAttemptedCollege: college || undefined,
          testScore: primary.match_score,
          fitScore: primary.match_score,
          topDomain: d1.name,
          recommendedSpec: primary.specialization,
        })
      } catch (err) {
        console.warn('Lead persistence notice:', err)
      }

      // Build Result Params
      const resultParams = new URLSearchParams({
        code: referralCode,
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        level: academicLevel,
        qualification,
        college,
        mentor: mentorName,
        topDomain: d1.name,
        recommendedSpec: primary.specialization,
        progId: primary.program_id,
        fitScore: String(primary.match_score),
        d1Name: d1.name,
        d1Score: String(d1.normalized_score),
        d1Code: d1.dimension_id,
        d2Name: d2.name,
        d2Score: String(d2.normalized_score),
        d2Code: d2.dimension_id,
        d3Name: d3.name,
        d3Score: String(d3.normalized_score),
        d3Code: d3.dimension_id,
        portal: 'student',
      })

      const dest = `/student/fresher/report?${resultParams.toString()}`
      router.push(dest)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = dest
        }, 200)
      }
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('Finalizing career intelligence report...')
      window.location.href = `/student/fresher/report?code=${encodeURIComponent(referralCode)}&name=${encodeURIComponent(candidateName)}&level=${academicLevel}&portal=student`
    }
  }

  // Keyboard Navigation
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitConfirmOpen || isExitConfirmOpen) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      const key = e.key.toLowerCase()

      if (currentQuestion.question_type === 'rating_scale') {
        if (['1', '2', '3', '4', '5'].includes(key)) {
          handleSelectRating(parseInt(key, 10))
        }
      } else if (currentQuestion.question_type === 'single_select') {
        const idx = ['a', 'b', 'c', 'd', 'e'].indexOf(key)
        if (idx >= 0 && currentQuestion.options[idx]) {
          handleSelectSingle(currentQuestion.options[idx].option_id)
        }
      } else if (currentQuestion.question_type === 'multi_select') {
        const idx = ['a', 'b', 'c', 'd', 'e'].indexOf(key)
        if (idx >= 0 && currentQuestion.options[idx]) {
          handleSelectMulti(currentQuestion.options[idx].option_id)
        }
      }

      if (key === 'arrowright' || key === 'enter') {
        e.preventDefault()
        handleNext()
      } else if (key === 'arrowleft') {
        e.preventDefault()
        handlePrev()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, currentQuestion, answersMap, isSubmitConfirmOpen, isExitConfirmOpen, currentIndex])

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#A36B40]/15 text-[#A36B40] flex items-center justify-center animate-pulse">
          <Brain className="w-6 h-6 text-[#A36B40]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#2C2621]">Loading Career Assessment Cockpit...</h3>
          <p className="text-xs text-[#7A7067]">
            Calibrating 5-Level Adaptive Assessment for {candidateName} ({academicLevel} Track)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 font-sans pb-10">
      {/* ─── HEADER: APPLICANT CONTEXT & METRICS BAR ─── */}
      <div className="bg-white border border-[#DFD7CB] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center font-bold text-base shadow-xs shrink-0">
            {candidateName.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-[#2C2621] leading-tight">
                {candidateName}
              </h1>
              <Badge variant="outline" className="text-[11px] font-semibold bg-[#FAF6F0] border-[#DFD7CB] text-[#A36B40] px-2 py-0.5">
                {academicLevel} Track
              </Badge>
              {referralCode && (
                <Badge variant="secondary" className="text-[11px] font-medium bg-[#FAF6F0] border border-[#DFD7CB] text-[#6A5E54] px-2 py-0.5">
                  Ref: {referralCode}
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#7A7067] flex items-center gap-2 mt-0.5">
              <span>{qualification || 'Standard High School / Academic Background'}</span>
              <span>•</span>
              <span className="text-[#A36B40] font-medium">Sandip University Career Intelligence</span>
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:w-80">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#2C2621]">Assessment Progress</span>
              <span className="font-bold text-[#A36B40]">{answeredCount} of {totalQuestions} ({progressPercent}%)</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-[#FAF6F0] border border-[#DFD7CB]" />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExitConfirmOpen(true)}
            className="h-8 px-3 text-xs border-[#DFD7CB] text-[#7A7067] hover:text-[#2C2621] hover:bg-[#FAF6F0] shrink-0 cursor-pointer rounded-xl"
          >
            <LogOut className="w-3.5 h-3.5 mr-1 text-[#7A7067]" /> Exit
          </Button>
        </div>
      </div>

      {/* ─── 5-LEVEL PROGRESS STEPPER ─── */}
      <div className="bg-white border border-[#DFD7CB] rounded-2xl p-3 sm:p-4 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {ASSESSMENT_LEVEL_CONFIGS.map((sec: { level: string; levelNumber: number; title: string; subtitle: string; description: string }) => {
            const isCurrent = sec.level === currentQuestion.level
            const isCompleted = ASSESSMENT_LEVEL_CONFIGS.findIndex((c: { level: string }) => c.level === currentQuestion.level) > ASSESSMENT_LEVEL_CONFIGS.findIndex((c: { level: string }) => c.level === sec.level)

            return (
              <div
                key={sec.level}
                className={`flex-1 flex items-center gap-2.5 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-[#FAF6F0] border border-[#A36B40]/40 text-[#2C2621] shadow-xs'
                    : isCompleted
                    ? 'bg-[#FAF6F0]/40 border border-[#DFD7CB]/60 text-[#7A7067]'
                    : 'opacity-50 text-[#8C7E72]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-[#A36B40] text-white'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FAF6F0] border border-[#DFD7CB] text-[#8C7E72]'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : `L${sec.levelNumber}`}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold truncate leading-tight">{sec.title}</div>
                  <div className="text-[10px] text-[#7A7067] truncate">{sec.subtitle}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── MAIN TWO-COLUMN VIEWPORT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
        {/* Left Column: Question Card (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="bg-white border-[#DFD7CB] text-[#2C2621] shadow-xs relative overflow-hidden flex flex-col rounded-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#A36B40]" />

            <div className="p-4 sm:p-5 pb-3 border-b border-[#DFD7CB] space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-[10px] px-2 py-0.5 h-5 font-semibold">
                    Question {currentIndex + 1} of {totalQuestions}
                  </Badge>
                  <Badge variant="outline" className="bg-[#FAF6F0] border-[#DFD7CB] text-[#A36B40] text-[10px] px-2 py-0.5 h-5 font-semibold">
                    {levelConfig.title}
                  </Badge>
                  <Badge variant="outline" className="bg-[#FAF6F0] border-[#DFD7CB] text-[#77734B] text-[10px] px-2 py-0.5 h-5 font-semibold">
                    {currentQuestion.question_type === 'rating_scale' ? 'Rating Scale (1–5)' : currentQuestion.question_type === 'multi_select' ? 'Multi-Select (Choose 1 or more)' : 'Single-Select'}
                  </Badge>
                  {['L3', 'L4', 'L5'].includes(currentQuestion.level) && (liveResult.primary_course || liveResult.top_dimensions[0]) && (
                    <Badge variant="outline" className="bg-[#FAF6F0] border-[#A36B40]/30 text-[#A36B40] text-[10px] px-2 py-0.5 h-5 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#A36B40]" />
                      <span>Focus: {liveResult.primary_course ? `${liveResult.primary_course.course} in ${liveResult.primary_course.specialization}` : liveResult.top_dimensions[0]?.name}</span>
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-[#8C7E72] flex items-center gap-1">
                  <Keyboard className="w-3 h-3" /> Keys {currentQuestion.question_type === 'rating_scale' ? '1–5' : 'A–D'} or Enter
                </span>
              </div>

              <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#2C2621] leading-snug tracking-tight">
                {currentQuestion.question_text}
              </h2>

              {currentQuestion.note && (
                <p className="text-[11px] text-[#6A5E54] flex items-center gap-1.5 bg-[#FAF6F0] border border-[#DFD7CB] px-2.5 py-1 rounded-lg">
                  <Info className="w-3.5 h-3.5 text-[#A36B40] shrink-0" /> {currentQuestion.note}
                </p>
              )}
            </div>

            {/* ─── Question Body by Type ─── */}
            <div className="p-4 sm:p-5 pt-3.5 flex flex-col gap-3">
              {/* Type 1: Rating Scale (1 to 5 Likert) */}
              {currentQuestion.question_type === 'rating_scale' && (
                <div className="space-y-3 py-2">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                    {LIKERT_OPTIONS.map((item) => {
                      const isSelected = currentAnswer?.rating_value === item.value
                      return (
                        <button
                          key={item.value}
                          onClick={() => handleSelectRating(item.value)}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-center text-center space-y-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-[#A36B40] text-white border-[#8E5B34] shadow-sm ring-2 ring-[#A36B40]/25'
                              : 'bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:bg-[#FAF6F0]/60 text-[#2C2621]'
                          }`}
                        >
                          <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                            isSelected ? 'bg-white text-[#A36B40]' : 'bg-[#FAF6F0] border border-[#DFD7CB] text-[#6A5E54]'
                          }`}>
                            {item.short}
                          </span>
                          <span className="text-xs font-bold leading-tight">{item.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Type 2: Multi-Select Options */}
              {currentQuestion.question_type === 'multi_select' && (
                <div className="flex flex-col gap-2.5">
                  {currentQuestion.options.map((opt: AnswerOption, idx: number) => {
                    const letter = String.fromCharCode(65 + idx)
                    const isSelected = (currentAnswer?.option_ids || []).includes(opt.option_id)

                    return (
                      <button
                        key={opt.option_id}
                        onClick={() => handleSelectMulti(opt.option_id)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 group relative cursor-pointer ${
                          isSelected
                            ? 'bg-[#FAF6F0] border-[#A36B40] text-[#2C2621] ring-2 ring-[#A36B40]/25 shadow-xs'
                            : 'bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:bg-[#FAF6F0]/60 text-[#2C2621]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all ${
                              isSelected
                                ? 'bg-[#A36B40] text-white'
                                : 'bg-[#FAF6F0] border border-[#DFD7CB] text-[#6A5E54] group-hover:text-[#A36B40] group-hover:border-[#A36B40]'
                            }`}
                          >
                            {isSelected ? <Check className="w-4 h-4" /> : letter}
                          </div>
                          <span className="text-xs sm:text-sm md:text-[15px] font-medium leading-relaxed text-[#2C2621]">
                            {opt.option_label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Type 3: Single-Select Options */}
              {currentQuestion.question_type === 'single_select' && (
                <div className="flex flex-col gap-2.5">
                  {currentQuestion.options.map((opt: AnswerOption, idx: number) => {
                    const letter = String.fromCharCode(65 + idx)
                    const isSelected = currentAnswer?.option_id === opt.option_id

                    return (
                      <button
                        key={opt.option_id}
                        onClick={() => handleSelectSingle(opt.option_id)}
                        className={`w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between gap-3 group relative cursor-pointer ${
                          isSelected
                            ? 'bg-[#FAF6F0] border-[#A36B40] text-[#2C2621] ring-2 ring-[#A36B40]/25 shadow-xs'
                            : 'bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:bg-[#FAF6F0]/60 text-[#2C2621]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-all ${
                              isSelected
                                ? 'bg-[#A36B40] text-white'
                                : 'bg-[#FAF6F0] border border-[#DFD7CB] text-[#6A5E54] group-hover:text-[#A36B40] group-hover:border-[#A36B40]'
                            }`}
                          >
                            {isSelected ? <Check className="w-4 h-4" /> : letter}
                          </div>
                          <span className="text-xs sm:text-sm md:text-[15px] font-medium leading-relaxed text-[#2C2621]">
                            {opt.option_label}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-3.5 sm:p-4 px-4 sm:px-6 border-t border-[#DFD7CB] flex items-center justify-between bg-[#FAF6F0]/80 rounded-b-2xl mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="h-9 px-3.5 text-xs border-[#DFD7CB] bg-white text-[#6A5E54] hover:text-[#2C2621] hover:bg-[#FAF6F0] rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </Button>

              <div className="flex items-center gap-2.5">
                {currentIndex === totalQuestions - 1 ? (
                  <Button
                    size="sm"
                    onClick={handleFinishAssessment}
                    disabled={isSubmitting || !validation.isValid}
                    className="h-9 sm:h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm rounded-xl cursor-pointer"
                  >
                    {isSubmitting ? 'Analyzing Responses...' : 'Generate Career Intelligence Report'}
                    <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleNext}
                    disabled={!validation.isValid}
                    className="h-9 sm:h-10 px-5 sm:px-6 bg-[#A36B40] hover:bg-[#8C4E2D] text-white text-xs sm:text-sm font-bold shadow-sm rounded-xl cursor-pointer transition-all"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Diagnostic Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 lg:sticky lg:top-4">
          <Card className="bg-white border-[#DFD7CB] text-[#2C2621] shadow-xs rounded-2xl flex flex-col p-4 sm:p-5 space-y-3.5 overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#DFD7CB]">
                <div className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-[#2C2621]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Activity className="w-4 h-4 text-[#A36B40]" />
                  <span>Live Career Diagnostic</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-[#A36B40] bg-[#FAF6F0] border-[#DFD7CB] px-2 py-0.5 h-5 font-semibold">
                  {answeredCount}/{totalQuestions} Recorded
                </Badge>
              </div>

              {/* Primary Emerging Domain */}
              <div className="bg-[#FAF6F0] border border-[#DFD7CB] rounded-xl p-3.5 space-y-1">
                <div className="text-[10px] text-[#8C7E72] uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#A36B40]" />
                  Primary Emerging Domain
                </div>
                <div className="text-sm sm:text-base font-bold text-[#A36B40] truncate">
                  {answeredCount === 0
                    ? 'Awaiting First Response'
                    : liveResult.top_dimensions[0]?.name || 'Analyzing signals...'}
                </div>
                {answeredCount === 0 && (
                  <p className="text-[11px] text-[#8C7E72]">
                    Select an answer to begin real-time psychometric mapping.
                  </p>
                )}
              </div>

              {/* Top Emerging Dimensions */}
              <div className="space-y-2 pt-1 border-t border-[#DFD7CB]">
                <div className="text-xs font-semibold text-[#2C2621] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#A36B40]" />
                    Dimension Compatibility
                  </span>
                  <span className="text-[10px] text-[#8C7E72]">Live %</span>
                </div>

                {answeredCount === 0 || liveResult.top_dimensions.length === 0 ? (
                  <div className="p-3 bg-[#FAF6F0]/50 rounded-xl border border-dashed border-[#DFD7CB] text-center space-y-1">
                    <p className="text-xs text-[#8C7E72]">No responses recorded yet</p>
                    <p className="text-[10px] text-[#A89D91]">Telemetry calibrates live across 12 university domains as you progress.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {liveResult.top_dimensions.slice(0, 3).map((dom: DimensionScore, i: number) => (
                      <div key={dom.dimension_id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#6A5E54] truncate max-w-[180px]">
                            {i + 1}. {dom.name}
                          </span>
                          <span className="font-mono font-bold text-[#A36B40]">{dom.normalized_score}%</span>
                        </div>
                        <Progress value={dom.normalized_score} className="h-1.5 bg-[#FAF6F0]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Emerging Primary Course Match */}
              {answeredCount > 0 && liveResult.primary_course && (
                <div className="pt-2 border-t border-[#DFD7CB] space-y-1.5">
                  <div className="text-[10px] text-[#8C7E72] uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#77734B]" />
                    Emerging Course Match
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                    <div className="text-xs font-bold text-[#2C2621] leading-tight">
                      {liveResult.primary_course.course} in {liveResult.primary_course.specialization}
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#7A7067]">{liveResult.primary_course.school}</span>
                      <span className="font-mono font-bold text-emerald-700">{liveResult.primary_course.match_score}% Match</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
