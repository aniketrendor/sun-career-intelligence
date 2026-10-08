'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChevronLeft, ChevronRight, Save, CheckCircle2, AlertCircle, BookOpen, Check, Sparkles, Send,
  X, Layers, TrendingUp, BrainCircuit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { saveAssessmentResponse, submitAndScoreAssessment } from '@/lib/actions/assessment.actions'

export interface Option {
  id: string // 'A' | 'B' | 'C' | 'D'
  option_text: string
  option_value: number
  order_index: number
  letter?: string
}

export interface Question {
  id: string
  question_text: string
  question_type: string
  weight: number
  order_index: number
  is_required: boolean
  max_scale: number
  options?: Option[]
}

export interface Section {
  id: string
  title: string
  description?: string
  order_index: number
  questions: Question[]
}

interface AssessmentEngineProps {
  attemptId: string
  sections: Section[]
  existingResponses: Record<string, { value: number; letter: string } | number>
}

export function AssessmentEngine({ attemptId, sections, existingResponses }: AssessmentEngineProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0)

  // Normalize initial responses to { letter: string, value: number }
  const initialMap: Record<string, { letter: string; value: number }> = {}
  Object.entries(existingResponses || {}).forEach(([qId, val]) => {
    if (typeof val === 'number') {
      const letter = val === 1 ? 'A' : val === 2 ? 'B' : val === 3 ? 'C' : 'D'
      initialMap[qId] = { letter, value: val }
    } else if (val && typeof val === 'object') {
      initialMap[qId] = {
        letter: val.letter || 'A',
        value: val.value || 1,
      }
    }
  })

  const [responses, setResponses] = useState<Record<string, { letter: string; value: number }>>(initialMap)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const currentSection = sections[currentSectionIdx] || sections[0]
  const allQuestions = sections.flatMap((s) => s.questions)
  const answeredCount = allQuestions.filter((q) => responses[q.id] !== undefined).length
  const totalQuestions = allQuestions.length
  const overallProgress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  // Auto-save notification
  const autoSave = useCallback(async () => {
    if (Object.keys(responses).length === 0) return
    setIsSaving(true)
    setLastSaved(new Date())
    setIsSaving(false)
  }, [responses])

  useEffect(() => {
    const interval = setInterval(autoSave, 30000)
    return () => clearInterval(interval)
  }, [autoSave])

  const handleSelectOption = async (questionId: string, letter: string, value: number) => {
    const updated = {
      ...responses,
      [questionId]: { letter, value },
    }
    setResponses(updated)

    // Save immediately to database
    setIsSaving(true)
    try {
      await saveAssessmentResponse(attemptId, questionId, value, letter)
      setLastSaved(new Date())
    } catch {
      toast.error('Failed to save response')
    } finally {
      setIsSaving(false)
    }
  }

  const sectionQuestions = currentSection?.questions || []
  const sectionAnswered = sectionQuestions.filter((q) => responses[q.id] !== undefined).length
  const sectionTotal = sectionQuestions.length
  const sectionProgress = sectionTotal > 0 ? Math.round((sectionAnswered / sectionTotal) * 100) : 0

  const requiredUnanswered = sectionQuestions.filter((q) => q.is_required && responses[q.id] === undefined)
  const canAdvance = requiredUnanswered.length === 0

  const handleNext = () => {
    if (!canAdvance) {
      toast.error(`Please answer all questions in this section (${requiredUnanswered.length} remaining)`)
      return
    }
    if (currentSectionIdx < sections.length - 1) {
      setCurrentSectionIdx((prev) => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrev = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleSubmit = () => {
    const allRequired = allQuestions.filter((q) => q.is_required && responses[q.id] === undefined)
    if (allRequired.length > 0) {
      toast.error(`${allRequired.length} question(s) still unanswered. Please complete all questions before submitting.`)
      return
    }

    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true)
    try {
      const result = await submitAndScoreAssessment(attemptId, responses)
      if (result.success) {
        toast.success('Assessment successfully submitted! Generating recommendations...')
        setShowConfirmModal(false)
        router.push('/student/career-profile')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to submit assessment')
      }
    } catch {
      toast.error('An unexpected error occurred during submission')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLastSection = currentSectionIdx === sections.length - 1

  return (
    <div className="assessment-container space-y-6 font-sans">
      {/* Top Header Progress Card */}
      <div className="space-y-4 bg-white p-6 rounded-3xl border border-[#DFD7CB] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center font-bold text-xs">
              {currentSectionIdx + 1}
            </span>
            <div>
              <h2 className="text-base font-bold text-[#2C2621]">
                Section {currentSectionIdx + 1} of {sections.length}: {currentSection.title}
              </h2>
              <p className="text-xs text-[#7A7067]">{currentSection.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[#7A7067] self-end sm:self-auto">
            {isSaving && <span className="text-xs text-[#A36B40] font-medium animate-pulse">Saving...</span>}
            {lastSaved && !isSaving && (
              <span className="text-[11px] text-[#7A7067]">Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
            <span className="px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#DFD7CB] text-xs font-bold text-[#2C2621]">
              {answeredCount}/{totalQuestions} Completed
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress value={overallProgress} className="h-2 bg-[#FAF6F0]" />
          <div className="flex gap-1.5 pt-1">
            {sections.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (i <= currentSectionIdx || canAdvance) {
                    setCurrentSectionIdx(i)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                  i < currentSectionIdx
                    ? 'bg-[#77734B]'
                    : i === currentSectionIdx
                    ? 'bg-[#A36B40]'
                    : 'bg-[#EFE2D0] hover:bg-[#DFD7CB]'
                }`}
                title={`Jump to Section ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {sectionQuestions.map((q, qIdx) => {
          const isAnswered = responses[q.id] !== undefined
          const selectedChoice = responses[q.id]

          return (
            <Card
              key={q.id}
              className={`border rounded-3xl transition-all ${
                isAnswered
                  ? 'border-[#77734B]/40 bg-[#FAF6F0]/40 shadow-xs'
                  : 'border-[#DFD7CB] bg-white shadow-xs'
              }`}
            >
              <CardContent className="p-6 sm:p-7 space-y-5">
                <div className="flex items-start gap-3.5">
                  <span
                    className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border transition-colors ${
                      isAnswered
                        ? 'bg-[#77734B] text-white border-[#77734B]'
                        : 'bg-[#FAF6F0] text-[#2C2621] border-[#DFD7CB]'
                    }`}
                  >
                    Q{q.order_index || qIdx + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-base font-bold text-[#2C2621] leading-snug">
                      {q.question_text}
                      {q.is_required && <span className="text-[#A36B40] ml-1">*</span>}
                    </p>
                    <p className="text-xs text-[#7A7067]">
                      Choose the single option that best aligns with your natural inclination.
                    </p>
                  </div>
                </div>

                {/* 4 Multi-Choice Option Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {q.options && q.options.length > 0 ? (
                    q.options.map((opt) => {
                      const letter = (opt.letter || opt.id || 'A').toUpperCase()
                      const isSelected = selectedChoice?.letter === letter || selectedChoice?.value === opt.option_value

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(q.id, letter, opt.option_value)}
                          className={`
                            group relative text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3
                            ${
                              isSelected
                                ? 'border-[#A36B40] bg-[#FAF6F0] text-[#2C2621] shadow-xs ring-1 ring-[#A36B40]/30'
                                : 'border-[#DFD7CB] bg-white hover:border-[#A36B40]/60 hover:bg-[#FAF6F0]/50 text-[#2C2621]'
                            }
                          `}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0 border transition-all ${
                              isSelected
                                ? 'bg-[#A36B40] text-white border-[#A36B40]'
                                : 'bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] group-hover:border-[#A36B40]/50 group-hover:text-[#A36B40]'
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : letter}
                          </span>
                          <span className={`text-xs sm:text-sm leading-relaxed flex-1 pt-0.5 ${isSelected ? 'font-bold text-[#2C2621]' : 'font-medium text-[#2C2621]'}`}>
                            {opt.option_text}
                          </span>
                        </button>
                      )
                    })
                  ) : (
                    // Fallback Likert scale if no options passed
                    <div className="col-span-2 grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSelectOption(q.id, String.fromCharCode(64 + val), val)}
                          className={`p-3 rounded-2xl border text-center font-bold text-xs ${
                            selectedChoice?.value === val ? 'bg-[#A36B40] text-white border-[#A36B40]' : 'border-[#DFD7CB] bg-white text-[#2C2621]'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Answered confirmation indicator */}
                {isAnswered && (
                  <div className="flex items-center gap-1.5 text-[#77734B] text-xs font-semibold pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Response recorded (Option {selectedChoice?.letter})</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Required warning message */}
      {requiredUnanswered.length > 0 && (
        <div className="flex items-center gap-2 text-[#A36B40] bg-[#FAF6F0] p-4 rounded-2xl border border-[#DFD7CB] text-xs sm:text-sm font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{requiredUnanswered.length} question(s) remaining in this section to proceed</span>
        </div>
      )}

      {/* Navigation Bar */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentSectionIdx === 0}
          className="gap-2 h-11 px-5 rounded-2xl border-[#DFD7CB] bg-white text-[#2C2621] hover:bg-[#FAF6F0] hover:border-[#A36B40] cursor-pointer text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Section</span>
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#7A7067]">
            Section {currentSectionIdx + 1} Progress: {sectionAnswered}/{sectionTotal}
          </span>
        </div>

        {isLastSection ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !canAdvance}
            isLoading={isSubmitting}
            className="gap-2 h-11 px-6 bg-[#77734B] hover:bg-[#63603E] text-white rounded-2xl shadow-md shadow-[#77734B]/25 cursor-pointer text-xs font-bold"
          >
            {!isSubmitting && <Send className="w-4 h-4" />}
            <span>Submit Assessment</span>
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="gap-2 h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-2xl shadow-md shadow-[#A36B40]/25 cursor-pointer text-xs font-bold"
            disabled={!canAdvance}
          >
            <span>Next Section</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Beautiful Sandip University Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !isSubmitting && setShowConfirmModal(false)}
              disabled={isSubmitting}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAF6F0] hover:bg-[#EFE2D0] border border-[#DFD7CB] text-[#7A7067] hover:text-[#2C2621] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1 pr-6">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A36B40] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#DFD7CB]">
                  Sandip University Diagnostic
                </span>
                <h3 className="text-xl font-extrabold text-[#2C2621] tracking-tight">
                  Submit Career Assessment?
                </h3>
                <p className="text-xs text-[#7A7067] leading-relaxed">
                  You have completed all <strong className="text-[#2C2621]">30 questions</strong> across all 5 evaluation sections.
                </p>
              </div>
            </div>

            {/* What happens next preview */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-[#FAF6F0]/70 border border-[#DFD7CB]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#A36B40]">
                Processing via 3-Tier Intelligence Engine:
              </p>
              <div className="space-y-2 text-xs text-[#2C2621]">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#77734B] shrink-0" />
                  <span>Calculates 10-dimension psychometric & aptitude score matrix</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-[#A36B40] shrink-0" />
                  <span>Ranks top 8 industry domains and curriculum specialization matches</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#C6A18D] shrink-0" />
                  <span>Generates your personalized Career Profile & Mentor advisory</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="h-11 px-5 rounded-2xl border-[#DFD7CB] bg-white text-xs font-semibold text-[#2C2621] hover:bg-[#FAF6F0] hover:border-[#A36B40] cursor-pointer"
              >
                Review Answers
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
                className="h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B33] text-white text-xs font-bold rounded-2xl shadow-md shadow-[#A36B40]/25 gap-2 cursor-pointer transition-all"
              >
                {!isSubmitting && <Send className="w-4 h-4" />}
                <span>Confirm & Submit Diagnostic</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
