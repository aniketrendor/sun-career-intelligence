'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Compass, Award, Target, BookOpen, AlertCircle,
  ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, ChevronRight, Sparkles,
  Layers, MessageSquare, Lightbulb, Info,
  GraduationCap, Clock, Download, Printer, RotateCcw,
  Search, Check, Filter, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DIMENSIONS,
  DOMAINS,
  PROGRAMS,
  STAGE1,
  SECTORS,
  STAGE1_LEVEL_NAMES,
  OPT_OUT_ID,
  OPTION_LIMIT,
  CareerDomain,
  SandipMasterProgram
} from '@/lib/data/su-career-data'
import {
  computeDimensionProfile,
  scoreAllDomains,
  chooseCandidates,
  buildStage2Items,
  computeFinalDomainScores,
  getProgramMatches,
  StudentContextProfile,
  DimensionProfileResult,
  ScoredDomain,
  Stage2Question,
  MatchedProgram,
  countSubstantive,
  selectDiverseRecommendedPrograms
} from '@/lib/services/career-scoring-engine'

const STORAGE_KEY = 'su_career_intelligence_erp_v1'

interface TwoStageAssessmentViewProps {
  initialStudentName?: string
  initialPathway?: 'UG' | 'PG'
  initialStream?: string
  initialProgram?: string
  initialSituation?: string
  initialPreviousField?: string
  initialHighestQualification?: string
  onSaveAttempt?: (attemptData: any) => Promise<void>
}

export function TwoStageAssessmentView({
  initialStudentName = '',
  initialPathway = 'UG',
  initialStream = '',
  initialProgram = '',
  initialSituation = '',
  initialPreviousField = '',
  initialHighestQualification = '',
  onSaveAttempt
}: TwoStageAssessmentViewProps) {
  // Navigation / View State
  const [view, setView] = useState<'home' | 'stage1' | 'stage1Results' | 'stage2' | 'results' | 'domains' | 'programs'>('home')

  // Applicant Profile (loaded from profile/student session)
  const [pathway, setPathway] = useState<'UG' | 'PG'>(initialPathway)
  const [applicantName, setApplicantName] = useState(initialStudentName)
  const [situation, setSituation] = useState(
    initialSituation || (initialPathway === 'UG' ? 'Class 12 completed' : "Bachelor's completed")
  )
  const [stream, setStream] = useState(initialStream || 'ALL')
  const [previousField, setPreviousField] = useState(initialPreviousField || 'General / Multi-Disciplinary')
  const [priorProgramme, setPriorProgramme] = useState(initialProgram || '')
  const [highestQualification, setHighestQualification] = useState(
    initialHighestQualification || (initialPathway === 'UG' ? "Class 12" : "Bachelor's degree")
  )
  const [reportSchoolFilter, setReportSchoolFilter] = useState<string>('ALL')

  const handleSelectPathway = (p: 'UG' | 'PG') => {
    setPathway(p)
    if (p === 'UG') {
      if (!initialSituation) setSituation('Class 12 completed')
      if (!initialHighestQualification) setHighestQualification('Class 12')
    } else {
      if (!initialSituation) setSituation("Bachelor's completed")
      if (!initialHighestQualification) setHighestQualification("Bachelor's degree")
    }
  }

  // Stage 1 State
  const [s1Index, setS1Index] = useState(0)
  const [s1Answers, setS1Answers] = useState<Record<string, string[]>>({})
  const [s1Dimensions, setS1Dimensions] = useState<DimensionProfileResult | null>(null)
  const [s1Domains, setS1Domains] = useState<ScoredDomain[] | null>(null)
  const [candidateIds, setCandidateIds] = useState<string[]>([])
  const [pinnedDomainIds, setPinnedDomainIds] = useState<string[]>([])

  // Stage 2 State
  const [s2Index, setS2Index] = useState(0)
  const [s2Answers, setS2Answers] = useState<Record<string, string[]>>({})
  const [s2Items, setS2Items] = useState<Stage2Question[]>([])
  const [finalDomains, setFinalDomains] = useState<ScoredDomain[] | null>(null)
  const [completed, setCompleted] = useState(false)

  // Catalog Browser Filters
  const [domainSearch, setDomainSearch] = useState('')
  const [domainSectorFilter, setDomainSectorFilter] = useState('all')
  const [domainSort, setDomainSort] = useState<'fit' | 'name' | 'programmes'>('fit')
  const [programSearch, setProgramSearch] = useState('')
  const [programLevelFilter, setProgramLevelFilter] = useState('all')
  const [programDomainFilter, setProgramDomainFilter] = useState('all')

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Restore State from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.pathway) setPathway(parsed.pathway)
        if (parsed.applicantName) setApplicantName(parsed.applicantName)
        if (parsed.situation) setSituation(parsed.situation)
        if (parsed.stream) setStream(parsed.stream)
        if (parsed.previousField) setPreviousField(parsed.previousField)
        if (parsed.s1Answers) setS1Answers(parsed.s1Answers)
        if (parsed.s1Dimensions) setS1Dimensions(parsed.s1Dimensions)
        if (parsed.s1Domains) setS1Domains(parsed.s1Domains)
        if (parsed.candidateIds) setCandidateIds(parsed.candidateIds)
        if (parsed.pinnedDomainIds) setPinnedDomainIds(parsed.pinnedDomainIds)
        if (parsed.s2Items) setS2Items(parsed.s2Items)
        if (parsed.s2Answers) setS2Answers(parsed.s2Answers)
        if (parsed.finalDomains) setFinalDomains(parsed.finalDomains)
        if (parsed.completed) setCompleted(parsed.completed)
        if (parsed.view) setView(parsed.view)
      }
    } catch (e) {
      console.warn('Could not restore local assessment session:', e)
    }
  }, [])

  // Auto-Save State to LocalStorage
  const saveState = () => {
    try {
      const payload = {
        pathway,
        applicantName,
        situation,
        stream,
        previousField,
        priorProgramme,
        highestQualification,
        s1Index,
        s1Answers,
        s1Dimensions,
        s1Domains,
        candidateIds,
        pinnedDomainIds,
        s2Index,
        s2Answers,
        s2Items,
        finalDomains,
        completed,
        view,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (e) {
      console.warn('LocalStorage save failed:', e)
    }
  }

  useEffect(() => {
    saveState()
  }, [
    pathway, applicantName, situation, stream, previousField, s1Index,
    s1Answers, s1Dimensions, s1Domains, candidateIds, pinnedDomainIds,
    s2Index, s2Answers, s2Items, finalDomains, completed, view
  ])

  // Current Profile Object for Scoring Engine
  const studentProfile: StudentContextProfile = useMemo(() => ({
    name: applicantName,
    pathway,
    situation,
    stream,
    previousField,
    priorProgramme,
    highestQualification
  }), [applicantName, pathway, situation, stream, previousField, priorProgramme, highestQualification])

  // Reset / Clear Assessment
  const handleRestart = () => {
    if (!confirm('Start a new assessment? Your current answers will be cleared.')) return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {}
    setS1Index(0)
    setS1Answers({})
    setS1Dimensions(null)
    setS1Domains(null)
    setCandidateIds([])
    setPinnedDomainIds([])
    setS2Index(0)
    setS2Answers({})
    setS2Items([])
    setFinalDomains(null)
    setCompleted(false)
    setView('home')
    showToast('A fresh assessment session has been started.')
  }

  // Answer handler for Stage 1 & Stage 2
  const handleSelectOption = (stage: 's1' | 's2', qid: string, oid: string) => {
    if (stage === 's1') {
      const current = s1Answers[qid] || []
      let updated: string[] = []

      if (oid === OPT_OUT_ID) {
        updated = [OPT_OUT_ID]
      } else {
        const withoutOptOut = current.filter((x) => x !== OPT_OUT_ID)
        if (withoutOptOut.includes(oid)) {
          updated = withoutOptOut.filter((x) => x !== oid)
        } else if (withoutOptOut.length < OPTION_LIMIT) {
          updated = [...withoutOptOut, oid]
        } else {
          showToast(`You can choose up to ${OPTION_LIMIT} options. Deselect one first.`)
          return
        }
      }
      setS1Answers((prev) => ({ ...prev, [qid]: updated }))
    } else {
      const current = s2Answers[qid] || []
      let updated: string[] = []

      if (oid === OPT_OUT_ID) {
        updated = [OPT_OUT_ID]
      } else {
        const withoutOptOut = current.filter((x) => x !== OPT_OUT_ID)
        if (withoutOptOut.includes(oid)) {
          updated = withoutOptOut.filter((x) => x !== oid)
        } else if (withoutOptOut.length < OPTION_LIMIT) {
          updated = [...withoutOptOut, oid]
        } else {
          showToast(`You can choose up to ${OPTION_LIMIT} activities. Deselect one first.`)
          return
        }
      }
      setS2Answers((prev) => ({ ...prev, [qid]: updated }))
    }
  }

  // Finish Stage 1 & Generate Shortlist
  const handleFinishStage1 = () => {
    const substantive = countSubstantive(s1Answers)
    if (substantive < 10) {
      showToast(`Please answer at least 10 cases with choices before proceeding. You currently have ${substantive}.`)
      return
    }

    const dims = computeDimensionProfile(s1Answers)
    const scoredDoms = scoreAllDomains(dims.scores)
    const initialCandidates = chooseCandidates(scoredDoms)

    setS1Dimensions(dims)
    setS1Domains(scoredDoms)
    setCandidateIds(initialCandidates)
    setPinnedDomainIds([])
    setView('stage1Results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Candidate Shortlist Customization
  const handleAddCandidate = (id: string) => {
    if (candidateIds.includes(id)) {
      showToast('This domain is already in your Stage 2 shortlist.')
      return
    }

    const target = DOMAINS.find((d) => d.id === id)
    if (!target) return

    const fit = (cid: string) => (s1Domains || []).find((d) => d.id === cid)?.stage1Fit || 0
    const sameSector = candidateIds.filter((cid) => DOMAINS.find((d) => d.id === cid)?.sector === target.sector)

    let updated = [...candidateIds]

    if (sameSector.length >= 3) {
      const drop = sameSector.filter((cid) => !pinnedDomainIds.includes(cid)).sort((a, b) => fit(a) - fit(b))[0]
      if (!drop) {
        showToast('Maximum 3 domains allowed per sector to ensure broad exploration. Unpin or remove one first.')
        return
      }
      updated = updated.filter((cid) => cid !== drop)
      showToast(`Swapped ${DOMAINS.find((d) => d.id === drop)?.name || drop} for ${target.name}.`)
    }

    if (updated.length >= 12) {
      const counts: Record<string, number> = {}
      for (const cid of updated) {
        const d = DOMAINS.find((x) => x.id === cid)
        if (d) counts[d.sector] = (counts[d.sector] || 0) + 1
      }
      const choices = updated
        .filter((cid) => !pinnedDomainIds.includes(cid))
        .map((cid) => DOMAINS.find((d) => d.id === cid))
        .filter((d) => d && counts[d.sector] > 1) as CareerDomain[]

      choices.sort((a, b) => fit(a.id) - fit(b.id))
      const drop = choices[0]
      if (!drop) {
        showToast('Your shortlist is full. Remove a domain first.')
        return
      }
      updated = updated.filter((cid) => cid !== drop.id)
      showToast(`Swapped ${drop.name} for ${target.name}.`)
    }

    updated.push(id)
    setCandidateIds(updated.slice(0, 12))
    if (!pinnedDomainIds.includes(id)) {
      setPinnedDomainIds((prev) => [...prev, id])
    }
  }

  const handleRemoveCandidate = (id: string) => {
    if (candidateIds.length <= 6) {
      showToast('Keep at least 6 domains for a meaningful Stage 2 comparison.')
      return
    }
    setCandidateIds((prev) => prev.filter((x) => x !== id))
    setPinnedDomainIds((prev) => prev.filter((x) => x !== id))
  }

  // Launch Stage 2
  const handleStartStage2 = () => {
    if (!s1Domains || candidateIds.length < 6) {
      showToast('Select at least 6 domains to compare in Stage 2.')
      return
    }

    const items = buildStage2Items(candidateIds, s1Domains)
    setS2Items(items)
    setS2Index(0)
    setS2Answers({})
    setView('stage2')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Finish Stage 2 & Generate Final Report
  const handleFinishStage2 = async () => {
    const substantive = countSubstantive(s2Answers)
    if (substantive < 5) {
      showToast(`Please answer at least 5 cases before viewing the final report. You currently have ${substantive}.`)
      return
    }

    const finalized = computeFinalDomainScores(s1Domains || [], s2Items, s2Answers)
    setFinalDomains(finalized)
    setCompleted(true)
    setView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    if (onSaveAttempt && s1Dimensions) {
      try {
        await onSaveAttempt({
          pathway,
          applicantName,
          situation,
          stream,
          previousField,
          s1Dimensions: s1Dimensions.scores,
          topDomains: finalized.slice(0, 5).map((d) => ({ id: d.id, name: d.name, score: d.finalScore })),
          s1Answers,
          s2Answers,
          completedAt: new Date().toISOString()
        })
      } catch (e) {
        console.warn('Attempt auto-save to server failed:', e)
      }
    }
  }

  // Matched Programs Calculation
  const matchedPrograms: MatchedProgram[] = useMemo(() => {
    if (!s1Dimensions || !finalDomains) return []
    return getProgramMatches(finalDomains, s1Dimensions, studentProfile)
  }, [s1Dimensions, finalDomains, studentProfile])

  // Diverse & School-Filtered Recommended Programs
  const recommendedPrograms = useMemo(() => {
    if (reportSchoolFilter === 'ALL') {
      return selectDiverseRecommendedPrograms(matchedPrograms, 2, 6)
    }
    return matchedPrograms
      .filter((p) => p.school.toLowerCase().includes(reportSchoolFilter.toLowerCase()))
      .slice(0, 6)
  }, [matchedPrograms, reportSchoolFilter])

  // School Breakdown Counts
  const schoolBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    matchedPrograms.forEach((p) => {
      counts[p.school] = (counts[p.school] || 0) + 1
    })
    return counts
  }, [matchedPrograms])

  // Filtered Programs for Program Finder
  const filteredPrograms = useMemo(() => {
    const q = programSearch.toLowerCase().trim()
    return PROGRAMS.filter((p) => {
      if (programLevelFilter !== 'all' && p.level !== programLevelFilter) return false
      if (programDomainFilter !== 'all' && !p.domainIds.includes(programDomainFilter)) return false
      if (!q) return true
      const domainNames = (p.domainIds || []).map((id) => DOMAINS.find((d) => d.id === id)?.name || '').join(' ')
      const text = `${p.name} ${p.school} ${p.id} ${p.careerSource} ${domainNames}`.toLowerCase()
      return text.includes(q)
    })
  }, [programSearch, programLevelFilter, programDomainFilter])

  // Filtered Domains for Domain Explorer
  const filteredDomains = useMemo(() => {
    const q = domainSearch.toLowerCase().trim()
    const scoredMap = Object.fromEntries((finalDomains || s1Domains || []).map((d) => [d.id, d]))
    let list = DOMAINS.map((d) => ({
      ...d,
      scored: scoredMap[d.id]
    }))

    if (q) list = list.filter((d) => `${d.name} ${d.sector} ${d.task}`.toLowerCase().includes(q))
    if (domainSectorFilter !== 'all') list = list.filter((d) => d.sector === domainSectorFilter)

    if (domainSort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else if (domainSort === 'programmes') list.sort((a, b) => b.programmeCount - a.programmeCount)
    else list.sort((a, b) => (b.scored?.finalScore ?? b.scored?.stage1Fit ?? 0) - (a.scored?.finalScore ?? a.scored?.stage1Fit ?? 0))

    return list
  }, [domainSearch, domainSectorFilter, domainSort, finalDomains, s1Domains])

  // Export Downloads
  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const downloadCSV = (rows: string[][], filename: string) => {
    const csvContent = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C2621] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-[#A36B40]/30 animate-in fade-in slide-in-from-bottom-3">
          <Info className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-Navigation Pill Header (Blended seamlessly into the ERP) */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A36B40] bg-[#F7EFEA] px-3.5 py-1.5 rounded-full border border-[#A36B40]/30">
            <Compass className="w-3.5 h-3.5" /> Two-Stage Career Exploration
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77734B] bg-[#F1F1EB] px-3 py-1.5 rounded-full border border-[#77734B]/30">
            20 Dimensions · 79 Career Domains
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={view === 'home' || view === 'stage1' || view === 'stage1Results' || view === 'stage2' ? 'default' : 'outline'}
            size="sm"
            className={`text-xs h-9 font-bold rounded-xl cursor-pointer transition-all ${
              view === 'home' || view === 'stage1' || view === 'stage1Results' || view === 'stage2'
                ? 'bg-[#A36B40] hover:bg-[#8E5B33] text-white shadow-sm'
                : 'border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]'
            }`}
            onClick={() => setView('home')}
          >
            Diagnostic Test
          </Button>

          <Button
            variant={view === 'domains' ? 'default' : 'outline'}
            size="sm"
            className={`text-xs h-9 font-bold rounded-xl cursor-pointer transition-all ${
              view === 'domains'
                ? 'bg-[#A36B40] hover:bg-[#8E5B33] text-white shadow-sm'
                : 'border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]'
            }`}
            onClick={() => setView('domains')}
          >
            Career Domains (79)
          </Button>

          <Button
            variant={view === 'programs' ? 'default' : 'outline'}
            size="sm"
            className={`text-xs h-9 font-bold rounded-xl cursor-pointer transition-all ${
              view === 'programs'
                ? 'bg-[#A36B40] hover:bg-[#8E5B33] text-white shadow-sm'
                : 'border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]'
            }`}
            onClick={() => setView('programs')}
          >
            Programme Finder (114)
          </Button>

          {completed && (
            <Button
              variant={view === 'results' ? 'default' : 'outline'}
              size="sm"
              className={`text-xs h-9 font-bold rounded-xl cursor-pointer transition-all ${
                view === 'results'
                  ? 'bg-[#77734B] text-white shadow-sm'
                  : 'border-[#77734B]/40 text-[#77734B] hover:bg-[#F1F1EB]'
              }`}
              onClick={() => setView('results')}
            >
              My Report
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: HOME & ONBOARDING */}
      {/* ========================================================================= */}
      {view === 'home' && (
        <div className="space-y-6">
          {/* Hero Card - Warm Espresso & Bronze Luxury Banner */}
          <div className="rounded-3xl p-8 sm:p-10 text-white bg-gradient-to-br from-[#2C2621] via-[#352D26] to-[#453A31] border border-[#2C2621] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3 relative z-10">
              <span className="text-[11px] font-extrabold tracking-widest text-amber-200 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Explore · Try · Choose
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-[#FAF6F0]">
                Find fields worth exploring—not a label for your future.
              </h2>
              <p className="text-xs sm:text-sm text-[#DFD7CB] leading-relaxed">
                Work through real-life cases, discover your authentic problem-solving patterns, and explore specific
                career fields. Your results provide actionable guidance on what to investigate next.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 shrink-0 relative z-10">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                <span className="text-2xl font-black block text-amber-100">30</span>
                <span className="text-[11px] text-[#DFD7CB]">Stage 1 case questions</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                <span className="text-2xl font-black block text-amber-100">20</span>
                <span className="text-[11px] text-[#DFD7CB]">Shared dimensions</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                <span className="text-2xl font-black block text-amber-100">20</span>
                <span className="text-[11px] text-[#DFD7CB]">Personalized Stage 2 cases</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                <span className="text-2xl font-black block text-amber-100">79</span>
                <span className="text-[11px] text-[#DFD7CB]">Specific career domains</span>
              </div>
            </div>
          </div>

          {/* Resume Banner (If answers exist) */}
          {(Object.keys(s1Answers).length > 0 || completed) && (
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Continue where you left off</h3>
                <p className="text-xs text-[#7A7067]">
                  {completed
                    ? 'You have completed the full assessment. View your verified report anytime.'
                    : s2Items.length > 0
                    ? `Stage 2 in progress: ${Object.keys(s2Answers).length} of 20 cases completed.`
                    : s1Dimensions
                    ? 'Stage 1 complete: Review candidate domains and begin Stage 2.'
                    : `Stage 1 in progress: ${Object.keys(s1Answers).length} of 30 cases completed.`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 text-xs font-bold border-red-200 text-red-700 hover:bg-red-50 rounded-2xl"
                  onClick={handleRestart}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Restart
                </Button>
                <Button
                  className="h-10 text-xs font-bold bg-[#A36B40] hover:bg-[#8E5B33] text-white px-5 rounded-2xl shadow-md shadow-[#A36B40]/20"
                  onClick={() => {
                    if (completed) setView('results')
                    else if (s2Items.length > 0) setView('stage2')
                    else if (s1Dimensions) setView('stage1Results')
                    else setView('stage1')
                  }}
                >
                  Resume Assessment →
                </Button>
              </div>
            </Card>
          )}

          {/* Redesigned Launch Studio Card */}
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-9 shadow-sm space-y-8 overflow-hidden">
            {/* Header with Pill Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFD7CB]/60 pb-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#F7EFEA] text-[#A36B40] border border-[#A36B40]/25">
                  <Sparkles className="w-3.5 h-3.5" /> Sandip University Career Discovery
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#2C2621] tracking-tight">
                  Launch Your Career Exploration
                </h3>
                <p className="text-xs sm:text-sm text-[#7A7067] max-w-2xl leading-relaxed">
                  Select your academic study level and optional focus area to calibrate problem scenarios and university degree recommendations.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <Badge className="bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] px-3 py-1.5 text-xs font-semibold rounded-xl">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-[#A36B40]" /> ~15-18 mins
                </Badge>
                <Badge className="bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 px-3 py-1.5 text-xs font-semibold rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-[#77734B]" /> Objective & Private
                </Badge>
              </div>
            </div>

            {/* Pathway Selection - Executive Luxury Interactive Cards */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#7A7067] flex items-center justify-between">
                <span>1. Select Academic Goal</span>
                <span className="text-[11px] font-semibold text-[#A36B40] lowercase">calibrates case complexity</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* UG Card */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectPathway('UG')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectPathway('UG') }}
                  className={`p-6 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group ${
                    pathway === 'UG'
                      ? 'border-[#A36B40] bg-[#FAF6F0] shadow-md shadow-[#A36B40]/10 ring-1 ring-[#A36B40]'
                      : 'border-[#DFD7CB] bg-white hover:border-[#A36B40]/40 hover:bg-[#FAF6F0]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#DFD7CB] flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                      🎓
                    </div>
                    {pathway === 'UG' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A36B40] bg-[#F7EFEA] px-3 py-1 rounded-full border border-[#A36B40]/30">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    ) : (
                      <span className="text-xs text-[#7A7067] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to select
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <h4 className="text-base font-extrabold text-[#2C2621] group-hover:text-[#A36B40] transition-colors">
                      Undergraduate (UG) Pathway
                    </h4>
                    <p className="text-xs text-[#7A7067] leading-relaxed">
                      For students currently in or completing Class 12 / Higher Secondary.
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-white border border-[#DFD7CB] text-[#2C2621]">
                        B.Tech · BBA · B.Des
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-white border border-[#DFD7CB] text-[#2C2621]">
                        B.A. LL.B. · B.Pharm · B.Sc
                      </span>
                    </div>
                  </div>
                </div>

                {/* PG Card */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectPathway('PG')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelectPathway('PG') }}
                  className={`p-6 rounded-3xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group ${
                    pathway === 'PG'
                      ? 'border-[#A36B40] bg-[#FAF6F0] shadow-md shadow-[#A36B40]/10 ring-1 ring-[#A36B40]'
                      : 'border-[#DFD7CB] bg-white hover:border-[#A36B40]/40 hover:bg-[#FAF6F0]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#DFD7CB] flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                      📘
                    </div>
                    {pathway === 'PG' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#A36B40] bg-[#F7EFEA] px-3 py-1 rounded-full border border-[#A36B40]/30">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    ) : (
                      <span className="text-xs text-[#7A7067] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to select
                      </span>
                    )}
                  </div>

                  <div className="mt-4 space-y-1.5">
                    <h4 className="text-base font-extrabold text-[#2C2621] group-hover:text-[#A36B40] transition-colors">
                      Postgraduate (PG) Pathway
                    </h4>
                    <p className="text-xs text-[#7A7067] leading-relaxed">
                      For students who have completed or are completing a bachelor's degree.
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-white border border-[#DFD7CB] text-[#2C2621]">
                        MBA · M.Tech · M.Pharm
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-white border border-[#DFD7CB] text-[#2C2621]">
                        LL.M. · M.Sc · Ph.D.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stream Exploration Track */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#7A7067] flex items-center justify-between">
                <span>2. Exploration Focus & Academic Track</span>
                <span className="text-[11px] font-semibold text-[#A36B40] lowercase">explore all or focus on a faculty</span>
              </label>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'ALL', label: '✨ All Disciplines (Multi-Faculty Balanced)' },
                  { id: 'COM', label: '📊 Commerce & Management' },
                  { id: 'ARTS', label: '🎨 Design, Media & Law' },
                  { id: 'PCB', label: '🧬 Health & Life Sciences' },
                  { id: 'PCM', label: '⚙️ Technology & Engineering' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStream(s.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                      stream === s.id
                        ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-sm'
                        : 'bg-[#FAF6F0]/80 text-[#7A7067] hover:text-[#2C2621] hover:bg-[#FAF6F0] border-[#DFD7CB]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Hero Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FAF6F0] via-[#F7EFEA] to-[#FAF6F0] border border-[#DFD7CB] flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#A36B40] block">
                  Ready to discover your best-fit fields?
                </span>
                <h4 className="text-base font-black text-[#2C2621]">
                  Stage 1: 30 Interactive Dual-Narrative Cases
                </h4>
                <p className="text-xs text-[#7A7067]">
                  No preparation required. Pick up to 3 options per case that reflect your natural problem-solving tendencies.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap shrink-0">
                <Button
                  className="h-12 px-7 rounded-2xl bg-[#A36B40] hover:bg-[#8E5B33] text-white font-extrabold text-xs shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    setView('stage1')
                    setS1Index(0)
                  }}
                >
                  <span>Begin Stage 1 Exploration</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-5 rounded-2xl text-xs font-bold border-[#DFD7CB] text-[#2C2621] hover:bg-white"
                  onClick={() => setView('domains')}
                >
                  Explore 79 Domains
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-5 rounded-2xl text-xs font-bold border-[#DFD7CB] text-[#2C2621] hover:bg-white"
                  onClick={() => setView('programs')}
                >
                  Programme Finder
                </Button>
              </div>
            </div>
          </Card>

          {/* Three-Stage Visual Pipeline Stepper */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#7A7067]">
                The Sandip University Assessment Pipeline
              </h4>
              <span className="text-xs font-bold text-[#A36B40]">3 Progressive Milestones</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 */}
              <Card className="p-6 border-[#DFD7CB] bg-white rounded-3xl space-y-3 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-[#F7EFEA] text-[#A36B40] text-xs font-black flex items-center justify-center border border-[#A36B40]/30">
                    01
                  </span>
                  <Badge className="bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-[10px] font-bold">
                    ~10 mins
                  </Badge>
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-[#2C2621] group-hover:text-[#A36B40] transition-colors">
                    Stage 1: Broad Profile Discovery
                  </h5>
                  <p className="text-xs text-[#7A7067] mt-1 leading-relaxed">
                    30 varied-format problem scenarios, role choices, and project sampler stations evaluating 20 foundational dimensions.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#DFD7CB]/60 flex items-center justify-between text-[11px] font-semibold text-[#A36B40]">
                  <span>20 Cognitive Traits</span>
                  <span>Max 3 picks / case</span>
                </div>
              </Card>

              {/* Step 2 */}
              <Card className="p-6 border-[#DFD7CB] bg-white rounded-3xl space-y-3 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-[#F1F1EB] text-[#77734B] text-xs font-black flex items-center justify-center border border-[#77734B]/30">
                    02
                  </span>
                  <Badge className="bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-[10px] font-bold">
                    ~6-8 mins
                  </Badge>
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-[#2C2621] group-hover:text-[#77734B] transition-colors">
                    Stage 2: Targeted Work Simulations
                  </h5>
                  <p className="text-xs text-[#7A7067] mt-1 leading-relaxed">
                    20 personalized work cases comparing authentic day-to-day tasks across your candidate career fields without title bias.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#DFD7CB]/60 flex items-center justify-between text-[11px] font-semibold text-[#77734B]">
                  <span>79 Domain Catalog</span>
                  <span>Bayesian smoothed fit</span>
                </div>
              </Card>

              {/* Step 3 */}
              <Card className="p-6 border-[#DFD7CB] bg-white rounded-3xl space-y-3 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-[#F9F4F0] text-[#C6A18D] text-xs font-black flex items-center justify-center border border-[#C6A18D]/40">
                    03
                  </span>
                  <Badge className="bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-[10px] font-bold">
                    Immediate
                  </Badge>
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-[#2C2621] group-hover:text-[#A36B40] transition-colors">
                    Stage 3: Multi-Faculty Degree Guidance
                  </h5>
                  <p className="text-xs text-[#7A7067] mt-1 leading-relaxed">
                    Full psychometric dossier matching 114 university courses across Management, Design, Law, Sciences, Pharmacy, and Engineering.
                  </p>
                </div>
                <div className="pt-2 border-t border-[#DFD7CB]/60 flex items-center justify-between text-[11px] font-semibold text-[#C6A18D]">
                  <span>114 SUN Programmes</span>
                  <span>Stream eligibility check</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: STAGE 1 ASSESSMENT RUNNER */}
      {/* ========================================================================= */}
      {view === 'stage1' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#F7EFEA] text-[#A36B40] border border-[#A36B40]/30">
                STAGE 1 · BROAD PROFILE EXPLORATION
              </span>
              <h2 className="text-2xl font-extrabold text-[#2C2621] tracking-tight mt-1.5">
                Explore what draws your interest
              </h2>
              <p className="text-xs text-[#7A7067]">
                Every case allows up to three selections. Choose options that genuinely appeal to you—there are no right or wrong answers.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-bold rounded-2xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
              onClick={() => setView('home')}
            >
              Save & Return Home
            </Button>
          </div>

          {/* Layout: Sidebar + Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Sidebar: Progress & Levels */}
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-5 space-y-4 lg:sticky lg:top-20">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#2C2621]">
                  <span>Case {s1Index + 1} of {STAGE1.length}</span>
                  <span className="text-[#A36B40] font-black">{Math.round(((s1Index + 1) / STAGE1.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#DFD7CB]/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#A36B40] to-[#C6A18D] transition-all duration-300 rounded-full"
                    style={{ width: `${((s1Index + 1) / STAGE1.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7067]">Progress Levels</p>
                {STAGE1_LEVEL_NAMES.map((lname, lidx) => {
                  const doneCount = Object.keys(s1Answers).filter((id) => {
                    const idx = STAGE1.findIndex((x) => x.id === id)
                    return idx >= lidx * 6 && idx < (lidx + 1) * 6
                  }).length
                  const isCurrent = Math.floor(s1Index / 6) === lidx
                  const isAllDone = doneCount === 6

                  return (
                    <div
                      key={lname}
                      className={`flex items-center justify-between p-2.5 rounded-2xl text-xs font-medium transition-all ${
                        isCurrent
                          ? 'bg-[#F7EFEA] text-[#A36B40] font-bold border border-[#A36B40]/30'
                          : isAllDone
                          ? 'text-[#77734B] bg-[#F1F1EB]'
                          : 'text-[#7A7067]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                            isCurrent
                              ? 'bg-[#A36B40] text-white'
                              : isAllDone
                              ? 'bg-[#77734B] text-white'
                              : 'bg-[#DFD7CB]/50 text-[#7A7067]'
                          }`}
                        >
                          {isAllDone ? '✓' : lidx + 1}
                        </span>
                        <span>{lname}</span>
                      </div>
                      <span className="text-[10px] text-[#7A7067] font-semibold">({doneCount}/6)</span>
                    </div>
                  )
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[11px] text-[#7A7067] leading-relaxed">
                💡 <strong>Tip:</strong> Choose what you would genuinely like to do, not what sounds most impressive.
              </div>
            </Card>

            {/* Main Question Card (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              {(() => {
                const currentQ = STAGE1[s1Index]
                if (!currentQ) return null
                const selectedIds = s1Answers[currentQ.id] || []
                const caseNarrative = pathway === 'UG' ? currentQ.ugCase : currentQ.pgCase

                return (
                  <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    {/* Meta Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-[#F7EFEA] text-[#A36B40] border-[#A36B40]/30 text-[10px] font-extrabold px-3 py-1">
                        STAGE 1 · CASE {s1Index + 1}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-bold text-[#7A7067] border-[#DFD7CB]">
                        LEVEL {currentQ.level + 1} · {currentQ.levelName}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-bold text-[#7A7067] border-[#DFD7CB]">
                        {currentQ.caseType}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-extrabold text-[#77734B] border-[#77734B]/30 bg-[#F1F1EB]">
                        {pathway} PATHWAY
                      </Badge>
                    </div>

                    {/* Case Scenario Box */}
                    <div className="p-5 rounded-3xl bg-[#FAF6F0] border border-[#DFD7CB] text-sm sm:text-base leading-relaxed text-[#2C2621] font-medium">
                      {caseNarrative}
                    </div>

                    {/* Prompt */}
                    <div>
                      <h3 className="text-xl font-bold text-[#2C2621] tracking-tight">{currentQ.prompt}</h3>
                      <p className="text-xs text-[#7A7067] mt-1">
                        {currentQ.instructions || `Select up to 3 responses that genuinely fit your approach.`} Choose “None of these” if no option applies.
                      </p>
                    </div>

                    {/* Options List */}
                    <div className="space-y-3">
                      {currentQ.options.map((opt, oidx) => {
                        const isSelected = selectedIds.includes(opt.id)
                        const letter = String.fromCharCode(65 + oidx)

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption('s1', currentQ.id, opt.id)}
                            className={`w-full text-left p-4 sm:p-5 rounded-3xl border transition-all flex items-start gap-4 cursor-pointer ${
                              isSelected
                                ? 'border-[#A36B40] bg-[#FAF6F0] ring-2 ring-[#A36B40]/25 shadow-sm'
                                : 'border-[#DFD7CB] bg-white hover:border-[#A36B40]/40 hover:bg-[#FAF6F0]/40'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isSelected ? 'bg-[#A36B40] text-white' : 'bg-[#F1F1EB] text-[#7A7067]'
                              }`}
                            >
                              {letter}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-[#2C2621] leading-relaxed font-medium">
                                {opt.text}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Question Actions */}
                    <div className="pt-4 border-t border-[#DFD7CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-[#7A7067]">
                        {selectedIds.length === 0
                          ? 'Select up to 3 options, or skip.'
                          : selectedIds.includes(OPT_OUT_ID)
                          ? 'You selected the opt-out response.'
                          : `${selectedIds.length} choice${selectedIds.length === 1 ? '' : 's'} selected.`}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={s1Index === 0}
                          className="h-11 text-xs font-bold rounded-2xl border-[#DFD7CB] px-4 text-[#2C2621] hover:bg-[#FAF6F0]"
                          onClick={() => {
                            setS1Index((prev) => Math.max(0, prev - 1))
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-11 text-xs font-bold rounded-2xl text-[#7A7067] hover:bg-[#FAF6F0]"
                          onClick={() => {
                            setS1Answers((prev) => {
                              const copy = { ...prev }
                              delete copy[currentQ.id]
                              return copy
                            })
                            if (s1Index < STAGE1.length - 1) {
                              setS1Index((prev) => prev + 1)
                            } else {
                              handleFinishStage1()
                            }
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          Skip
                        </Button>

                        <Button
                          className="h-11 text-xs font-bold bg-[#A36B40] hover:bg-[#8E5B33] text-white rounded-2xl px-6 shadow-md shadow-[#A36B40]/20"
                          onClick={() => {
                            if (s1Index < STAGE1.length - 1) {
                              setS1Index((prev) => prev + 1)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            } else {
                              handleFinishStage1()
                            }
                          }}
                        >
                          {s1Index === STAGE1.length - 1 ? 'View Stage 1 Results →' : 'Next →'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: STAGE 1 RESULTS & CANDIDATE SHORTLIST CUSTOMIZER */}
      {/* ========================================================================= */}
      {view === 'stage1Results' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#F7EFEA] text-[#A36B40] border border-[#A36B40]/30">
                STAGE 1 COMPLETE · BROAD EXPLORATION PROFILE
              </span>
              <h2 className="text-2xl font-extrabold text-[#2C2621] tracking-tight mt-1.5">
                Your 20-Dimensional Profile & Shortlist
              </h2>
              <p className="text-xs text-[#7A7067]">
                These exploratory signals reflect your response patterns across the 30 cases. Review and customize the domains before Stage 2.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-11 text-xs font-bold rounded-2xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
                onClick={() => setView('domains')}
              >
                Browse All 79 Domains
              </Button>
              <Button
                className="h-11 text-xs font-bold bg-[#A36B40] hover:bg-[#8E5B33] text-white px-6 rounded-2xl shadow-md shadow-[#A36B40]/25"
                onClick={handleStartStage2}
              >
                Continue to Stage 2 · 20 Cases →
              </Button>
            </div>
          </div>

          {/* Two Column Summary: 20 Dimensions & Top Preliminary Domains */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dimensions Card */}
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Your 20 Psychometric Dimensions</h3>
                <p className="text-xs text-[#7A7067]">
                  Relative affinity scores derived from your selections (not ability or grades).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {DIMENSIONS.map((dim) => {
                  const val = Number(s1Dimensions?.scores[dim.id] || 0)
                  const ev = s1Dimensions?.evidence[dim.id] || 0

                  return (
                    <div key={dim.id} className="p-3.5 rounded-2xl bg-[#FAF6F0]/70 border border-[#DFD7CB]/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-black text-[#A36B40] tracking-wider">{dim.id}</span>
                          <p className="font-bold text-[#2C2621] text-xs leading-tight">{dim.name}</p>
                        </div>
                        <span className="text-sm font-black text-[#A36B40]">{val}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#DFD7CB]/50 overflow-hidden">
                        <div className="h-full bg-[#A36B40] rounded-full" style={{ width: `${val}%` }} />
                      </div>
                      <p className="text-[10px] text-[#7A7067] truncate">
                        {dim.desc} · {ev} evidence hits
                      </p>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Preliminary Top Domains */}
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#2C2621]">Preliminary Career Domain Matches</h3>
                  <p className="text-xs text-[#7A7067]">
                    Highest vector similarity against benchmark task profiles. Stage 2 will evaluate these directly.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {(s1Domains || []).slice(0, 8).map((dom, didx) => (
                    <div
                      key={dom.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF6F0]/70 border border-[#DFD7CB]/80"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-7 h-7 rounded-xl bg-[#F1F1EB] text-[#77734B] text-xs font-black flex items-center justify-center shrink-0">
                          {didx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2C2621] truncate">{dom.name}</p>
                          <p className="text-[10px] text-[#7A7067] truncate">{dom.sector}</p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-[#77734B] bg-[#F1F1EB] px-3 py-1 rounded-full shrink-0 border border-[#77734B]/30">
                        {dom.stage1Fit}% match
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7EFEA] border border-[#A36B40]/30 text-xs text-[#8E5B33]">
                💡 <strong>Note:</strong> You can add or swap any career domain below before launching Stage 2.
              </div>
            </Card>
          </div>

          {/* Candidate Shortlist Editor (12 Domains) */}
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Domains Selected for Stage 2 Exploration</h3>
                <p className="text-xs text-[#7A7067]">
                  Includes high-affinity matches and cross-sector alternatives. (Maximum 3 per sector).
                </p>
              </div>
              <Badge className="bg-[#F7EFEA] text-[#A36B40] border-[#A36B40]/30 text-xs font-bold px-3 py-1">
                {candidateIds.length} Domains Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {candidateIds.map((cid, cidx) => {
                const dom = (s1Domains || []).find((d) => d.id === cid) || DOMAINS.find((d) => d.id === cid)
                if (!dom) return null

                return (
                  <div
                    key={cid}
                    className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-black text-[#A36B40] uppercase">{dom.id}</span>
                      <p className="text-xs font-bold text-[#2C2621] truncate">{dom.name}</p>
                      <p className="text-[10px] text-[#7A7067] truncate">{dom.sector}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-[11px] font-bold text-red-700 hover:bg-red-50 rounded-xl shrink-0"
                      onClick={() => handleRemoveCandidate(cid)}
                    >
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>

            <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                className="h-11 text-xs font-bold rounded-2xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
                onClick={() => setView('domains')}
              >
                <Search className="w-3.5 h-3.5 mr-1.5" /> Find & Add Other Domains
              </Button>

              <Button
                className="h-11 px-7 rounded-2xl bg-[#A36B40] hover:bg-[#8E5B33] text-white font-extrabold text-xs shadow-md shadow-[#A36B40]/25 cursor-pointer"
                onClick={handleStartStage2}
              >
                Continue to Stage 2 · 20 Cases →
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: STAGE 2 PERSONALIZED DOMAIN EXPLORATION */}
      {/* ========================================================================= */}
      {view === 'stage2' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#F1F1EB] text-[#77734B] border border-[#77734B]/30">
                STAGE 2 · PERSONALIZED DOMAIN EXPLORATION
              </span>
              <h2 className="text-2xl font-extrabold text-[#2C2621] tracking-tight mt-1.5">
                Which kind of work would you like to try?
              </h2>
              <p className="text-xs text-[#7A7067]">
                These task-based activities test actual day-to-day responsibilities in each field. Choose up to three activities you would enjoy.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-bold rounded-2xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
              onClick={() => setView('home')}
            >
              Save & Return Home
            </Button>
          </div>

          {/* Layout: Sidebar + Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Left Sidebar: Progress */}
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-5 space-y-4 lg:sticky lg:top-20">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#2C2621]">
                  <span>Case {s2Index + 1} of {s2Items.length}</span>
                  <span className="text-[#A36B40] font-black">{Math.round(((s2Index + 1) / s2Items.length) * 100)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#DFD7CB]/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#A36B40] to-[#C6A18D] transition-all duration-300 rounded-full"
                    style={{ width: `${((s2Index + 1) / s2Items.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7067]">Sector Groups</p>
                {[...SECTORS, 'Cross-disciplinary discovery'].map((sec) => {
                  const sectorQuestions = s2Items.filter((q) => q.sector === sec)
                  if (!sectorQuestions.length) return null
                  const doneCount = sectorQuestions.filter((q) => {
                    const ans = s2Answers[q.id]
                    return ans && ans.length > 0
                  }).length
                  const isCurrent = s2Items[s2Index]?.sector === sec

                  return (
                    <div
                      key={sec}
                      className={`p-2.5 rounded-2xl text-xs flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-[#F7EFEA] text-[#A36B40] font-bold border border-[#A36B40]/30'
                          : 'text-[#7A7067]'
                      }`}
                    >
                      <span className="truncate max-w-[170px]">{sec}</span>
                      <span className="text-[10px] font-semibold">({doneCount}/{sectorQuestions.length})</span>
                    </div>
                  )
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[11px] text-[#7A7067] leading-relaxed">
                💡 <strong>Note:</strong> Domain names are deliberately hidden so your choices reflect true work interest rather than preconceptions.
              </div>
            </Card>

            {/* Main Stage 2 Question Canvas (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              {(() => {
                const currentQ = s2Items[s2Index]
                if (!currentQ) return null
                const selectedIds = s2Answers[currentQ.id] || []
                const caseNarrative = pathway === 'UG' ? currentQ.ugCase : currentQ.pgCase

                return (
                  <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    {/* Meta Tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 text-[10px] font-extrabold px-3 py-1">
                        STAGE 2 · CASE {s2Index + 1}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-bold text-[#7A7067] border-[#DFD7CB]">
                        {currentQ.caseType}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-bold text-[#7A7067] border-[#DFD7CB]">
                        {currentQ.sector}
                      </Badge>
                    </div>

                    {/* Scenario */}
                    <div className="p-5 rounded-3xl bg-[#FAF6F0] border border-[#DFD7CB] text-sm sm:text-base leading-relaxed text-[#2C2621] font-medium">
                      {caseNarrative}
                    </div>

                    {/* Prompt */}
                    <div>
                      <h3 className="text-xl font-bold text-[#2C2621] tracking-tight">{currentQ.prompt}</h3>
                      <p className="text-xs text-[#7A7067] mt-1">
                        Select up to 3 activities you would genuinely like to try in this setting. Choose “None of these” if none fit.
                      </p>
                    </div>

                    {/* Activity Option Cards */}
                    <div className="space-y-3">
                      {currentQ.options.map((opt, oidx) => {
                        const isSelected = selectedIds.includes(opt.id)
                        const letter = String.fromCharCode(65 + oidx)

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption('s2', currentQ.id, opt.id)}
                            className={`w-full text-left p-4 sm:p-5 rounded-3xl border transition-all flex items-start gap-4 cursor-pointer ${
                              isSelected
                                ? 'border-[#A36B40] bg-[#FAF6F0] ring-2 ring-[#A36B40]/25 shadow-sm'
                                : 'border-[#DFD7CB] bg-white hover:border-[#A36B40]/40 hover:bg-[#FAF6F0]/40'
                            }`}
                          >
                            <span
                              className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                isSelected ? 'bg-[#A36B40] text-white' : 'bg-[#F1F1EB] text-[#7A7067]'
                              }`}
                            >
                              {letter}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-[#2C2621] leading-relaxed font-medium">
                                {opt.text}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-4 border-t border-[#DFD7CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-[#7A7067]">
                        {selectedIds.length === 0
                          ? 'Choose up to 3 activities, or skip.'
                          : selectedIds.includes(OPT_OUT_ID)
                          ? 'You selected the opt-out response.'
                          : `${selectedIds.length} activit${selectedIds.length === 1 ? 'y' : 'ies'} selected.`}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={s2Index === 0}
                          className="h-11 text-xs font-bold rounded-2xl border-[#DFD7CB] px-4 text-[#2C2621] hover:bg-[#FAF6F0]"
                          onClick={() => {
                            setS2Index((prev) => Math.max(0, prev - 1))
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-11 text-xs font-bold rounded-2xl text-[#7A7067] hover:bg-[#FAF6F0]"
                          onClick={() => {
                            setS2Answers((prev) => {
                              const copy = { ...prev }
                              delete copy[currentQ.id]
                              return copy
                            })
                            if (s2Index < s2Items.length - 1) {
                              setS2Index((prev) => prev + 1)
                            } else {
                              handleFinishStage2()
                            }
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                        >
                          Skip
                        </Button>

                        <Button
                          className="h-11 text-xs font-bold bg-[#A36B40] hover:bg-[#8E5B33] text-white rounded-2xl px-6 shadow-md shadow-[#A36B40]/20"
                          onClick={() => {
                            if (s2Index < s2Items.length - 1) {
                              setS2Index((prev) => prev + 1)
                              window.scrollTo({ top: 0, behavior: 'smooth' })
                            } else {
                              handleFinishStage2()
                            }
                          }}
                        >
                          {s2Index === s2Items.length - 1 ? 'View Final Report →' : 'Next →'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: FINAL COMPREHENSIVE CAREER REPORT */}
      {/* ========================================================================= */}
      {view === 'results' && (
        <div className="space-y-6">
          {/* Report Header Hero */}
          <div className="rounded-3xl p-8 sm:p-10 text-white bg-gradient-to-br from-[#2C2621] via-[#352D26] to-[#453A31] border border-[#2C2621] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-[11px] font-extrabold tracking-widest text-amber-200 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Verified Career Exploration Report
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAF6F0]">
                {applicantName ? `${applicantName}, your career report is ready` : 'Your Career Exploration Report'}
              </h2>
              <p className="text-xs sm:text-sm text-[#DFD7CB] leading-relaxed">
                {pathway} Pathway ({stream || previousField}) · Combines 20-dimensional broad psychometrics with direct Stage 2 work activity choices.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-center">
                <span className="text-xl font-black block text-amber-100">{Object.keys(s1Answers).length}/30</span>
                <span className="text-[10px] text-[#DFD7CB]">Stage 1 answered</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-center">
                <span className="text-xl font-black block text-amber-100">{Object.keys(s2Answers).length}/20</span>
                <span className="text-[10px] text-[#DFD7CB]">Stage 2 answered</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-center">
                <span className="text-xl font-black block text-amber-100">{DOMAINS.length}</span>
                <span className="text-[10px] text-[#DFD7CB]">Domains evaluated</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Print / Download) */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="h-11 text-xs font-bold rounded-2xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-11 text-xs font-bold rounded-2xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
                onClick={() => downloadJSON({
                  studentProfile,
                  s1Dimensions,
                  finalDomains,
                  matchedPrograms: matchedPrograms.slice(0, 10),
                  s1Answers,
                  s2Answers
                }, 'su-career-report.json')}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download Report JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-11 text-xs font-bold rounded-2xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
                onClick={() => {
                  const rows = [
                    ['Domain ID', 'Domain Name', 'Sector', 'Stage 1 Fit', 'Stage 2 Selections', 'Final Score', 'Confidence'],
                    ...(finalDomains || []).map((d) => [d.id, d.name, d.sector, String(d.stage1Fit), `${d.stage2Selections}/${d.stage2Exposures}`, String(d.finalScore), d.confidence])
                  ]
                  downloadCSV(rows, 'su-career-domain-rankings.csv')
                }}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download Domain CSV
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-11 text-xs font-bold text-red-700 hover:bg-red-50 rounded-2xl"
              onClick={handleRestart}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Start New Assessment
            </Button>
          </div>

          {/* 2-Column: 20 Dimensions & Ranked Career Domains */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 20 Dimensions */}
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Your 20-Dimensional Profile</h3>
                <p className="text-xs text-[#7A7067]">Response pattern distribution across all cognitive and behavioral dimensions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
                {DIMENSIONS.map((dim) => {
                  const val = Number(s1Dimensions?.scores[dim.id] || 0)
                  return (
                    <div key={dim.id} className="p-3.5 rounded-2xl bg-[#FAF6F0]/70 border border-[#DFD7CB]/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-black text-[#A36B40]">{dim.id}</span>
                          <p className="font-bold text-[#2C2621] text-xs leading-tight">{dim.name}</p>
                        </div>
                        <span className="text-sm font-black text-[#A36B40]">{val}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#DFD7CB]/50 overflow-hidden">
                        <div className="h-full bg-[#A36B40] rounded-full" style={{ width: `${val}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Career Domains to Explore */}
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Recommended Career Domains</h3>
                <p className="text-xs text-[#7A7067]">
                  Blended index from Stage 1 psychometrics and direct Stage 2 activity selections.
                </p>
              </div>

              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {(finalDomains || []).slice(0, 10).map((dom, didx) => (
                  <div
                    key={dom.id}
                    className="p-4 rounded-2xl bg-[#FAF6F0]/70 border border-[#DFD7CB] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-[#F1F1EB] text-[#77734B] text-xs font-black flex items-center justify-center shrink-0">
                          {didx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#2C2621] truncate">{dom.name}</p>
                          <p className="text-[10px] text-[#7A7067] truncate">{dom.sector}</p>
                        </div>
                      </div>

                      <span className="text-xs font-black text-[#A36B40] bg-[#F7EFEA] px-3 py-1 rounded-full shrink-0 border border-[#A36B40]/30">
                        {dom.finalScore}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#DFD7CB]/50 overflow-hidden">
                      <div className="h-full bg-[#A36B40] rounded-full" style={{ width: `${dom.finalScore}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#7A7067]">
                      <span>Confidence: {dom.confidence}</span>
                      <span>Selected {dom.stage2Selections}/{dom.stage2Exposures} times in Stage 2</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sandip University Programme Recommendations */}
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#2C2621]">Sandip University Programme Guidance</h3>
              <p className="text-xs text-[#7A7067]">
                Programmes matched with your highest-ranked career domains, evaluated against your Class 12 / prior degree qualifications.
              </p>
            </div>

            {/* Matched / Aligned Programmes with Multi-Faculty Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#77734B] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#77734B]" /> Recommended Degree Pathways
                </h4>
                <div className="text-[11px] text-[#7A7067] font-medium">
                  {matchedPrograms.length} programmes evaluated across Sandip University
                </div>
              </div>

              {/* Faculty Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'ALL', label: '✨ All Faculties (Balanced Top 6)' },
                  { id: 'Commerce & Management Studies', label: '💼 Commerce & Management' },
                  { id: 'Design', label: '🎨 Design & Media' },
                  { id: 'Law', label: '⚖️ Law & Justice' },
                  { id: 'Computer Science & Engineering', label: '💻 Computer Science & AI' },
                  { id: 'Science', label: '🔬 Science & Forensics' },
                  { id: 'Pharmaceutical Sciences', label: '💊 Pharmacy & Health' },
                  { id: 'Engineering & Technology', label: '⚙️ Core Engineering' },
                ].map((tab) => {
                  const count = tab.id === 'ALL' ? matchedPrograms.length : schoolBreakdown[tab.id] || 0
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setReportSchoolFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                        reportSchoolFilter === tab.id
                          ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-sm'
                          : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border-[#DFD7CB]'
                      }`}
                    >
                      {tab.label} {count > 0 && `(${count})`}
                    </button>
                  )
                })}
              </div>

              {/* Recommended Program Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {recommendedPrograms.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-3xl bg-[#FAF6F0]/60 border border-[#DFD7CB] space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#A36B40]">{p.id}</span>
                        <div className="flex items-center gap-1">
                          <Badge className="bg-[#FAF6F0] text-[#2C2621] border-[#DFD7CB] text-[10px] font-bold">
                            {p.course}
                          </Badge>
                          <Badge className="bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 text-[10px] font-bold">
                            {p.level}
                          </Badge>
                        </div>
                      </div>
                      <h5 className="text-xs font-bold text-[#2C2621] leading-snug">{p.name}</h5>
                      <p className="text-[11px] text-[#A36B40] font-semibold">{p.school}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-[#7A7067] font-semibold">Programme Fit Index:</span>
                        <span className="text-xs font-black text-[#A36B40]">{p.fit}/100</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#DFD7CB]">
                      <p className={`text-[10px] font-semibold p-2.5 rounded-2xl border ${
                        p.eligibility.code === 'match'
                          ? 'bg-[#F1F1EB] text-[#77734B] border-[#77734B]/20'
                          : 'bg-[#F9F4F0] text-[#C6A18D] border-[#C6A18D]/40'
                      }`}>
                        {p.eligibility.code === 'match' ? '✓' : 'ℹ'} {p.eligibility.reason}
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {p.domains.slice(0, 3).map((dname) => (
                          <span key={dname} className="text-[9px] font-bold bg-[#F7EFEA] text-[#A36B40] px-2 py-0.5 rounded-md border border-[#A36B40]/20">
                            {dname}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review / Subject Check Programmes */}
            {reportSchoolFilter === 'ALL' && matchedPrograms.some((p) => p.eligibility.code === 'review') && (
              <div className="space-y-3 pt-4 border-t border-[#DFD7CB]">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C6A18D] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#C6A18D]" /> Other Specializations for Subject Verification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchedPrograms
                    .filter((p) => p.eligibility.code === 'review' && !recommendedPrograms.some((r) => r.id === p.id))
                    .slice(0, 3)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-5 rounded-3xl bg-[#FAF6F0]/60 border border-[#DFD7CB] space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#C6A18D]">{p.id}</span>
                            <Badge className="bg-[#F9F4F0] text-[#C6A18D] border-[#C6A18D]/40 text-[10px] font-bold">
                              {p.level}
                            </Badge>
                          </div>
                          <h5 className="text-xs font-bold text-[#2C2621] leading-snug">{p.name}</h5>
                          <p className="text-[11px] text-[#7A7067]">{p.school}</p>
                          <p className="text-[10px] text-[#C6A18D] font-semibold pt-1">{p.eligibility.reason}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: 79 CAREER DOMAINS BROWSER */}
      {/* ========================================================================= */}
      {view === 'domains' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#F7EFEA] text-[#A36B40] border border-[#A36B40]/30">
                CATALOGUE BROWSER
              </span>
              <h2 className="text-2xl font-extrabold text-[#2C2621] tracking-tight mt-1.5">
                Explore All 79 Career Domains
              </h2>
              <p className="text-xs text-[#7A7067]">
                Search across 6 industry sectors. Add or swap domains into your Stage 2 exploration shortlist.
              </p>
            </div>

            <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-white border border-[#DFD7CB] text-[#2C2621]">
              {filteredDomains.length} of 79 Domains
            </span>
          </div>

          {/* Filter Bar */}
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#7A7067] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={domainSearch}
                onChange={(e) => setDomainSearch(e.target.value)}
                placeholder="Search domains, e.g. aerospace, ML, fintech..."
                className="pl-10 h-11 rounded-2xl border-[#DFD7CB] text-xs bg-[#FAF6F0]/40 text-[#2C2621]"
              />
            </div>

            <select
              value={domainSectorFilter}
              onChange={(e) => setDomainSectorFilter(e.target.value)}
              className="w-full sm:w-64 h-11 px-3 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/40 text-xs font-medium text-[#2C2621] focus:outline-none"
            >
              <option value="all">All Sectors</option>
              {SECTORS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>

            <select
              value={domainSort}
              onChange={(e) => setDomainSort(e.target.value as any)}
              className="w-full sm:w-48 h-11 px-3 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/40 text-xs font-medium text-[#2C2621] focus:outline-none"
            >
              <option value="fit">Sort by Match Score</option>
              <option value="name">Sort by Name</option>
              <option value="programmes">Most Programmes</option>
            </select>
          </Card>

          {/* Domains Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDomains.map((dom) => {
              const inCandidate = candidateIds.includes(dom.id)
              const score = dom.scored?.finalScore ?? dom.scored?.stage1Fit

              return (
                <Card key={dom.id} className="p-5 border-[#DFD7CB] bg-white rounded-3xl shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#A36B40]">{dom.id}</span>
                      <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] text-[9px] font-bold">
                        {dom.sector.split(',')[0]}
                      </Badge>
                    </div>

                    <h4 className="text-sm font-bold text-[#2C2621]">{dom.name}</h4>
                    <p className="text-xs text-[#7A7067] leading-relaxed">{dom.task}.</p>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] font-semibold bg-[#F1F1EB] text-[#77734B] px-2.5 py-0.5 rounded-full">
                        {dom.programmeCount} Sandip programme{dom.programmeCount === 1 ? '' : 's'}
                      </span>
                      {score !== undefined && (
                        <span className="text-[10px] font-extrabold bg-[#F7EFEA] text-[#A36B40] px-2.5 py-0.5 rounded-full border border-[#A36B40]/20">
                          Index: {score}%
                        </span>
                      )}
                      {inCandidate && (
                        <span className="text-[10px] font-bold bg-[#F1F1EB] text-[#77734B] px-2.5 py-0.5 rounded-full border border-[#77734B]/30">
                          ✓ In Stage 2
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#DFD7CB] flex items-center justify-between gap-2">
                    <Button
                      variant={inCandidate ? 'outline' : 'default'}
                      size="sm"
                      className={`text-xs font-bold rounded-2xl h-10 flex-1 ${
                        inCandidate
                          ? 'border-red-200 text-red-700 hover:bg-red-50'
                          : 'bg-[#A36B40] hover:bg-[#8E5B33] text-white shadow-md shadow-[#A36B40]/20'
                      }`}
                      onClick={() => {
                        if (inCandidate) handleRemoveCandidate(dom.id)
                        else handleAddCandidate(dom.id)
                      }}
                    >
                      {inCandidate ? 'Remove from Shortlist' : '+ Add to Stage 2'}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-bold text-[#7A7067] hover:bg-[#FAF6F0] h-10 rounded-2xl"
                      onClick={() => {
                        setProgramDomainFilter(dom.id)
                        setView('programs')
                      }}
                    >
                      Programmes →
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 7: 114 PROGRAMMES CATALOGUE FINDER */}
      {/* ========================================================================= */}
      {view === 'programs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#F7EFEA] text-[#A36B40] border border-[#A36B40]/30">
                PROGRAMME FINDER
              </span>
              <h2 className="text-2xl font-extrabold text-[#2C2621] tracking-tight mt-1.5">
                Sandip University Programme Catalogue
              </h2>
              <p className="text-xs text-[#7A7067]">
                Browse all 114 official programmes, linked career domains, and admission stream prerequisites.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-11 text-xs font-bold rounded-2xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
                onClick={() => {
                  const rows = [
                    ['Program ID', 'Name', 'Level', 'School', 'Stream Prerequisite', 'Career Fields Source'],
                    ...PROGRAMS.map((p) => [p.id, p.name, p.level, p.school, p.streamSource, p.careerSource])
                  ]
                  downloadCSV(rows, 'sandip-university-programmes.csv')
                }}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download CSV
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#7A7067] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={programSearch}
                onChange={(e) => setProgramSearch(e.target.value)}
                placeholder="Search programme, specialization or school..."
                className="pl-10 h-11 rounded-2xl border-[#DFD7CB] text-xs bg-[#FAF6F0]/40 text-[#2C2621]"
              />
            </div>

            <select
              value={programLevelFilter}
              onChange={(e) => setProgramLevelFilter(e.target.value)}
              className="w-full sm:w-44 h-11 px-3 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/40 text-xs font-medium text-[#2C2621] focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="UG">Undergraduate (UG)</option>
              <option value="Diploma">Diploma</option>
              <option value="PG">Postgraduate (PG)</option>
              <option value="PhD">Doctoral (PhD)</option>
            </select>

            <select
              value={programDomainFilter}
              onChange={(e) => setProgramDomainFilter(e.target.value)}
              className="w-full sm:w-60 h-11 px-3 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/40 text-xs font-medium text-[#2C2621] focus:outline-none"
            >
              <option value="all">All Career Domains</option>
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Card>

          {/* Programmes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrograms.map((p) => {
              const domains = (p.domainIds || []).map((id) => DOMAINS.find((d) => d.id === id)).filter(Boolean) as CareerDomain[]

              return (
                <Card key={p.id} className="p-5 border-[#DFD7CB] bg-white rounded-3xl shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#A36B40]">{p.id}</span>
                      <Badge variant="outline" className="text-[10px] font-bold text-[#77734B] bg-[#F1F1EB] border-[#77734B]/30">
                        {p.level}
                      </Badge>
                    </div>

                    <h4 className="text-xs font-bold text-[#2C2621] leading-snug">{p.name}</h4>
                    <p className="text-[11px] text-[#7A7067]">{p.school}</p>

                    <div className="pt-1 space-y-1 text-xs">
                      <p className="text-[11px] text-[#2C2621]">
                        <strong>Prerequisite:</strong> {p.streamSource}
                      </p>
                      <p className="text-[11px] text-[#7A7067]">
                        <strong>Careers:</strong> {p.careerSource}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {domains.slice(0, 3).map((d) => (
                        <span
                          key={d.id}
                          className="text-[9px] font-bold bg-[#F7EFEA] text-[#A36B40] px-2 py-0.5 rounded-md border border-[#A36B40]/20"
                        >
                          {d.name}
                        </span>
                      ))}
                      {domains.length > 3 && (
                        <span className="text-[9px] font-bold text-[#7A7067]">
                          +{domains.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
