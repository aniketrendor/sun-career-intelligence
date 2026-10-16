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
  countSubstantive
} from '@/lib/services/career-scoring-engine'

const STORAGE_KEY = 'su_career_intelligence_erp_v1'

interface TwoStageAssessmentViewProps {
  initialStudentName?: string
  initialPathway?: 'UG' | 'PG'
  initialStream?: string
  initialProgram?: string
  onSaveAttempt?: (attemptData: any) => Promise<void>
}

export function TwoStageAssessmentView({
  initialStudentName = '',
  initialPathway = 'UG',
  initialStream = '',
  initialProgram = '',
  onSaveAttempt
}: TwoStageAssessmentViewProps) {
  // Navigation / View State
  const [view, setView] = useState<'home' | 'stage1' | 'stage1Results' | 'stage2' | 'results' | 'domains' | 'programs'>('home')

  // Applicant Profile
  const [pathway, setPathway] = useState<'UG' | 'PG'>(initialPathway)
  const [applicantName, setApplicantName] = useState(initialStudentName)
  const [situation, setSituation] = useState(initialPathway === 'UG' ? 'Class 12 completed' : "Bachelor's completed")
  const [stream, setStream] = useState(initialStream || 'PCM')
  const [previousField, setPreviousField] = useState('Engineering & Technology')
  const [priorProgramme, setPriorProgramme] = useState('')
  const [highestQualification, setHighestQualification] = useState(initialPathway === 'UG' ? "Class 12" : "Bachelor's degree")

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
    <div className="min-h-screen bg-[#F4F7FB] text-[#172436] font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12243A] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-3">
          <Info className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="border-b border-[#DFE6EF] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#12243A] text-white flex items-center justify-center font-black text-sm tracking-tight shadow-sm">
              SU
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#12243A] leading-tight">SU Career Intelligence</h1>
              <p className="text-[11px] text-[#617187]">Sandip University · Career and Programme Exploration</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#F0F4FF] text-[#244BA9] border border-[#CBD7F3]">
              20 DIMENSIONS · 79 CAREER DOMAINS
            </span>

            <nav className="flex items-center gap-1">
              <Button
                variant={view === 'home' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs h-9 font-semibold ${view === 'home' ? 'bg-[#12243A] text-white' : 'text-[#42536A]'}`}
                onClick={() => setView('home')}
              >
                Home
              </Button>
              <Button
                variant={view === 'domains' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs h-9 font-semibold ${view === 'domains' ? 'bg-[#12243A] text-white' : 'text-[#42536A]'}`}
                onClick={() => setView('domains')}
              >
                Career Domains
              </Button>
              <Button
                variant={view === 'programs' ? 'default' : 'ghost'}
                size="sm"
                className={`text-xs h-9 font-semibold ${view === 'programs' ? 'bg-[#12243A] text-white' : 'text-[#42536A]'}`}
                onClick={() => setView('programs')}
              >
                Programme Finder
              </Button>
              {completed && (
                <Button
                  variant={view === 'results' ? 'default' : 'ghost'}
                  size="sm"
                  className={`text-xs h-9 font-semibold ${view === 'results' ? 'bg-[#087F75] text-white' : 'text-[#087F75]'}`}
                  onClick={() => setView('results')}
                >
                  My Report
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* ========================================================================= */}
        {/* VIEW 1: HOME & ONBOARDING */}
        {/* ========================================================================= */}
        {view === 'home' && (
          <div className="space-y-6">
            {/* Hero Card */}
            <div className="rounded-3xl p-8 sm:p-10 text-white bg-gradient-to-br from-[#12243A] via-[#1B3554] to-[#234B82] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-2xl space-y-3 relative z-10">
                <span className="text-[11px] font-extrabold tracking-widest text-[#BBCCFF] uppercase">
                  Discover · Compare · Explore
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Find fields worth exploring—not a label for your future.
                </h2>
                <p className="text-xs sm:text-sm text-[#DCE6F6] leading-relaxed">
                  Work through real-life cases, discover your authentic problem-solving patterns, and explore specific
                  career fields. Your results provide actionable guidance on what to investigate next.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 shrink-0 relative z-10">
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                  <span className="text-2xl font-black block">30</span>
                  <span className="text-[11px] text-[#DCE6F6]">Stage 1 case questions</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                  <span className="text-2xl font-black block">20</span>
                  <span className="text-[11px] text-[#DCE6F6]">Shared dimensions</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                  <span className="text-2xl font-black block">20</span>
                  <span className="text-[11px] text-[#DCE6F6]">Personalized Stage 2 cases</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
                  <span className="text-2xl font-black block">79</span>
                  <span className="text-[11px] text-[#DCE6F6]">Specific career domains</span>
                </div>
              </div>
            </div>

            {/* Resume Banner (If answers exist) */}
            {(Object.keys(s1Answers).length > 0 || completed) && (
              <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#12243A]">Continue where you left off</h3>
                  <p className="text-xs text-[#617187]">
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
                    className="h-10 text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleRestart}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Restart
                  </Button>
                  <Button
                    className="h-10 text-xs font-bold bg-[#2858D8] hover:bg-[#1F45AD] text-white px-5 rounded-xl shadow-sm"
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

            {/* Assessment Setup Form */}
            <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#12243A]">Start your assessment</h3>
                <p className="text-xs text-[#617187]">Choose the study pathway that matches your next academic goal.</p>
              </div>

              {/* Pathway Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPathway('UG')}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                    pathway === 'UG'
                      ? 'border-[#2858D8] bg-[#F6F8FF] ring-2 ring-[#2858D8]/20'
                      : 'border-[#DFE6EF] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className="text-2xl block mb-2">🎓</span>
                  <strong className="text-sm block font-bold text-[#12243A]">Undergraduate (UG)</strong>
                  <small className="text-xs text-[#617187] block mt-1">
                    For students who have completed or are completing Class 12.
                  </small>
                </button>

                <button
                  type="button"
                  onClick={() => setPathway('PG')}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                    pathway === 'PG'
                      ? 'border-[#2858D8] bg-[#F6F8FF] ring-2 ring-[#2858D8]/20'
                      : 'border-[#DFE6EF] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className="text-2xl block mb-2">📘</span>
                  <strong className="text-sm block font-bold text-[#12243A]">Postgraduate (PG)</strong>
                  <small className="text-xs text-[#617187] block mt-1">
                    For students who have completed or are completing a bachelor’s degree.
                  </small>
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#40516A]">Your Name (Optional)</label>
                  <Input
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-11 rounded-xl border-[#CBD5E1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#40516A]">Current Status</label>
                  <select
                    value={situation}
                    onChange={(e) => setSituation(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#172436] focus:outline-none focus:ring-2 focus:ring-[#2858D8]"
                  >
                    <option value="Class 12 completed">I have completed Class 12</option>
                    <option value="Class 12 completing">I am completing Class 12</option>
                    <option value="Bachelor's completed">I have completed my bachelor's degree</option>
                    <option value="Bachelor's completing">I am completing my bachelor's degree</option>
                    <option value="Master's completed">I have completed a master's degree and may consider a PhD</option>
                  </select>
                </div>

                {pathway === 'UG' ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#40516A]">Class 12 Academic Stream</label>
                    <select
                      value={stream}
                      onChange={(e) => setStream(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#172436] focus:outline-none focus:ring-2 focus:ring-[#2858D8]"
                    >
                      <option value="PCM">Science: Physics, Chemistry, Mathematics (PCM)</option>
                      <option value="PCB">Science: Physics, Chemistry, Biology (PCB)</option>
                      <option value="PCMB">Science: PCM and Biology (PCMB)</option>
                      <option value="COM">Commerce</option>
                      <option value="ARTS">Arts / Humanities</option>
                      <option value="OTHER">Other / equivalent</option>
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#40516A]">Area of Previous Degree</label>
                      <select
                        value={previousField}
                        onChange={(e) => setPreviousField(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#172436] focus:outline-none focus:ring-2 focus:ring-[#2858D8]"
                      >
                        <option value="Engineering & Technology">Engineering & Technology</option>
                        <option value="Computer Science & IT">Computer Science & IT</option>
                        <option value="Science">Science / Mathematics</option>
                        <option value="Business / Management">Business / Management</option>
                        <option value="Commerce / Finance">Commerce / Finance</option>
                        <option value="Law">Law</option>
                        <option value="Pharmacy / Health">Pharmacy / Health</option>
                        <option value="Design / Media">Design / Media</option>
                        <option value="Other">Other / not listed</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#40516A]">Highest Qualification</label>
                      <select
                        value={highestQualification}
                        onChange={(e) => setHighestQualification(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#172436] focus:outline-none focus:ring-2 focus:ring-[#2858D8]"
                      >
                        <option value="Bachelor's degree">Bachelor's degree (exploring master's programmes)</option>
                        <option value="Master's degree">Master's degree (exploring doctoral programmes)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Start Button */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  className="h-12 px-7 rounded-2xl bg-[#2858D8] hover:bg-[#1F45AD] text-white font-extrabold text-xs shadow-md shadow-[#2858D8]/20 transition-all cursor-pointer"
                  onClick={() => {
                    setView('stage1')
                    setS1Index(0)
                  }}
                >
                  Begin Stage 1 · 30 Cases →
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-5 rounded-2xl text-xs font-bold border-[#DFE6EF] text-[#42536A]"
                  onClick={() => setView('domains')}
                >
                  Explore 79 Domains
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-5 rounded-2xl text-xs font-bold border-[#DFE6EF] text-[#42536A]"
                  onClick={() => setView('programs')}
                >
                  Browse Programmes
                </Button>
              </div>

              {/* Notice Banner */}
              <div className="p-4 rounded-2xl bg-[#EFF4FF] border border-[#D9E4FF] text-[#31518A] text-xs leading-relaxed space-y-1">
                <strong>How it works:</strong> Stage 1 evaluates your problem-solving patterns across 20 foundational dimensions.
                Stage 2 presents personalized work cases from your highest-fit sectors. University programme matches are then computed with eligibility criteria.
              </div>
            </Card>

            {/* 3 Step Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-[#DFE6EF] bg-white rounded-2xl space-y-2">
                <span className="text-xs font-bold text-[#244BA9] bg-[#F0F4FF] px-2.5 py-0.5 rounded-full">
                  1 · Broad Exploration
                </span>
                <h4 className="text-sm font-bold text-[#12243A]">30 Varied-Format Cases</h4>
                <p className="text-xs text-[#617187] leading-relaxed">
                  Problem scenarios, role picks, clue hunts, and mini-projects. Choose up to 3 options that genuinely appeal to you.
                </p>
              </Card>

              <Card className="p-5 border-[#DFE6EF] bg-white rounded-2xl space-y-2">
                <span className="text-xs font-bold text-[#087F75] bg-[#E8F7F4] px-2.5 py-0.5 rounded-full">
                  2 · Domain Exploration
                </span>
                <h4 className="text-sm font-bold text-[#12243A]">20 Personalized Work Cases</h4>
                <p className="text-xs text-[#617187] leading-relaxed">
                  Tailored task descriptions comparing day-to-day activities across specific career fields without revealing domain titles.
                </p>
              </Card>

              <Card className="p-5 border-[#DFE6EF] bg-white rounded-2xl space-y-2">
                <span className="text-xs font-bold text-[#76500F] bg-[#FFF5DF] px-2.5 py-0.5 rounded-full">
                  3 · Programme Guidance
                </span>
                <h4 className="text-sm font-bold text-[#12243A]">Sandip University Courses</h4>
                <p className="text-xs text-[#617187] leading-relaxed">
                  Matched against 114 university courses with detailed entry notes and prerequisites evaluated automatically.
                </p>
              </Card>
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
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#F0F4FF] text-[#244BA9] border border-[#CBD7F3]">
                  STAGE 1 · BROAD PROFILE EXPLORATION
                </span>
                <h2 className="text-2xl font-extrabold text-[#12243A] tracking-tight mt-1.5">
                  Explore what draws your interest
                </h2>
                <p className="text-xs text-[#617187]">
                  Every case allows up to three selections. Choose options that genuinely appeal to you—there are no right or wrong answers.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-10 text-xs font-bold rounded-xl border-[#DFE6EF]"
                onClick={() => setView('home')}
              >
                Save & Return Home
              </Button>
            </div>

            {/* Layout: Sidebar + Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Left Sidebar: Progress & Levels */}
              <Card className="border-[#DFE6EF] bg-white rounded-3xl p-5 space-y-4 lg:sticky lg:top-20">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#12243A]">
                    <span>Case {s1Index + 1} of {STAGE1.length}</span>
                    <span>{Math.round(((s1Index + 1) / STAGE1.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E9EEF5] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2858D8] to-[#5A83F5] transition-all duration-300 rounded-full"
                      style={{ width: `${((s1Index + 1) / STAGE1.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#617187]">Progress Levels</p>
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
                        className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-all ${
                          isCurrent
                            ? 'bg-[#EDF2FF] text-[#2858D8] font-bold border border-[#CBD7F3]'
                            : isAllDone
                            ? 'text-[#147A52] bg-[#E8F7EF]/50'
                            : 'text-[#617187]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                              isCurrent
                                ? 'bg-[#2858D8] text-white'
                                : isAllDone
                                ? 'bg-[#147A52] text-white'
                                : 'bg-[#E9EEF5] text-[#42536A]'
                            }`}
                          >
                            {isAllDone ? '✓' : lidx + 1}
                          </span>
                          <span>{lname}</span>
                        </div>
                        <span className="text-[10px] text-[#617187] font-semibold">({doneCount}/6)</span>
                      </div>
                    )
                  })}
                </div>

                <div className="p-3 rounded-2xl bg-[#EFF4FF] border border-[#D9E4FF] text-[11px] text-[#31518A] leading-relaxed">
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
                    <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                      {/* Meta Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-[#EDF2FF] text-[#2858D8] border-[#CBD7F3] text-[10px] font-extrabold px-2.5 py-0.5">
                          STAGE 1 · CASE {s1Index + 1}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-bold text-[#617187]">
                          LEVEL {currentQ.level + 1} · {currentQ.levelName}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-bold text-[#617187]">
                          {currentQ.caseType}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-extrabold text-[#42536A]">
                          {pathway} PATHWAY
                        </Badge>
                      </div>

                      {/* Case Scenario Box */}
                      <div className="p-5 rounded-2xl bg-[#F8FAFF] border border-[#E1E9FA] text-sm sm:text-base leading-relaxed text-[#172436] font-medium">
                        {caseNarrative}
                      </div>

                      {/* Prompt */}
                      <div>
                        <h3 className="text-xl font-bold text-[#12243A] tracking-tight">{currentQ.prompt}</h3>
                        <p className="text-xs text-[#617187] mt-1">
                          {currentQ.instructions || `Select up to 3 responses that genuinely fit your approach.`} Choose “None of these” if no option applies.
                        </p>
                      </div>

                      {/* Options List */}
                      <div className="space-y-2.5">
                        {currentQ.options.map((opt, oidx) => {
                          const isSelected = selectedIds.includes(opt.id)
                          const letter = String.fromCharCode(65 + oidx)

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectOption('s1', currentQ.id, opt.id)}
                              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                                isSelected
                                  ? 'border-[#2858D8] bg-[#F3F6FF] ring-2 ring-[#2858D8]/20 shadow-sm'
                                  : 'border-[#DFE6EF] bg-white hover:border-[#A4B9F7] hover:bg-[#FBFCFF]'
                              }`}
                            >
                              <span
                                className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isSelected ? 'bg-[#2858D8] text-white' : 'bg-[#EDF1F7] text-[#46576E]'
                                }`}
                              >
                                {letter}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-[#172436] leading-relaxed font-medium">
                                  {opt.text}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {/* Question Actions */}
                      <div className="pt-4 border-t border-[#DFE6EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs text-[#617187]">
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
                            className="h-10 text-xs font-bold rounded-xl border-[#DFE6EF] px-4"
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
                            className="h-10 text-xs font-bold rounded-xl text-[#617187]"
                            onClick={() => {
                              // Skip clears answer
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
                            className="h-10 text-xs font-bold bg-[#2858D8] hover:bg-[#1F45AD] text-white rounded-xl px-5 shadow-sm"
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
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#F0F4FF] text-[#244BA9] border border-[#CBD7F3]">
                  STAGE 1 COMPLETE · BROAD EXPLORATION PROFILE
                </span>
                <h2 className="text-2xl font-extrabold text-[#12243A] tracking-tight mt-1.5">
                  Your 20-Dimensional Profile & Shortlist
                </h2>
                <p className="text-xs text-[#617187]">
                  These exploratory signals reflect your response patterns across the 30 cases. Review and customize the domains before Stage 2.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 text-xs font-bold rounded-xl border-[#DFE6EF]"
                  onClick={() => setView('domains')}
                >
                  Browse All 79 Domains
                </Button>
                <Button
                  className="h-10 text-xs font-bold bg-[#087F75] hover:bg-[#06655D] text-white px-5 rounded-xl shadow-sm"
                  onClick={handleStartStage2}
                >
                  Continue to Stage 2 · 20 Cases →
                </Button>
              </div>
            </div>

            {/* Two Column Summary: 20 Dimensions & Top Preliminary Domains */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dimensions Card */}
              <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#12243A]">Your 20 Psychometric Dimensions</h3>
                  <p className="text-xs text-[#617187]">
                    Relative affinity scores derived from your selections (not ability or IQ scores).
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {DIMENSIONS.map((dim) => {
                    const val = Number(s1Dimensions?.scores[dim.id] || 0)
                    const ev = s1Dimensions?.evidence[dim.id] || 0

                    return (
                      <div key={dim.id} className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF]/70 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] font-black text-[#597090] tracking-wider">{dim.id}</span>
                            <p className="font-bold text-[#12243A] text-xs leading-tight">{dim.name}</p>
                          </div>
                          <span className="text-sm font-black text-[#2858D8]">{val}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#EBEFF6] overflow-hidden">
                          <div className="h-full bg-[#2858D8] rounded-full" style={{ width: `${val}%` }} />
                        </div>
                        <p className="text-[10px] text-[#617187] truncate">
                          {dim.desc} · {ev} evidence hits
                        </p>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Preliminary Top Domains */}
              <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#12243A]">Preliminary Career Domain Matches</h3>
                    <p className="text-xs text-[#617187]">
                      Highest vector similarity against benchmark task profiles. Stage 2 will evaluate these directly.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {(s1Domains || []).slice(0, 8).map((dom, didx) => (
                      <div
                        key={dom.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF]/70"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-xl bg-[#EEF2F8] text-[#42546C] text-xs font-black flex items-center justify-center shrink-0">
                            {didx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#12243A] truncate">{dom.name}</p>
                            <p className="text-[10px] text-[#617187] truncate">{dom.sector}</p>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-[#087F75] bg-[#E8F7F4] px-2.5 py-1 rounded-full shrink-0">
                          {dom.stage1Fit}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#EFF4FF] border border-[#D9E4FF] text-xs text-[#31518A]">
                  💡 <strong>Note:</strong> You can add or swap any career domain below before launching Stage 2.
                </div>
              </Card>
            </div>

            {/* Candidate Shortlist Editor (12 Domains) */}
            <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-bold text-[#12243A]">Domains Selected for Stage 2 Exploration</h3>
                  <p className="text-xs text-[#617187]">
                    Includes high-affinity matches and cross-sector alternatives. (Maximum 3 per sector).
                  </p>
                </div>
                <Badge className="bg-[#E8F7F4] text-[#087F75] border-[#BDE8E1] text-xs font-bold px-3 py-1">
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
                      className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-[#597090] uppercase">{dom.id}</span>
                        <p className="text-xs font-bold text-[#12243A] truncate">{dom.name}</p>
                        <p className="text-[10px] text-[#617187] truncate">{dom.sector}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg shrink-0"
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
                  className="h-10 text-xs font-bold rounded-xl border-[#DFE6EF]"
                  onClick={() => setView('domains')}
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" /> Find & Add Other Domains
                </Button>

                <Button
                  className="h-11 px-7 rounded-2xl bg-[#087F75] hover:bg-[#06655D] text-white font-extrabold text-xs shadow-md shadow-[#087F75]/20 cursor-pointer"
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
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#E8F7F4] text-[#087F75] border border-[#BDE8E1]">
                  STAGE 2 · PERSONALIZED DOMAIN EXPLORATION
                </span>
                <h2 className="text-2xl font-extrabold text-[#12243A] tracking-tight mt-1.5">
                  Which kind of work would you like to try?
                </h2>
                <p className="text-xs text-[#617187]">
                  These task-based activities test actual day-to-day responsibilities in each field. Choose up to three activities you would enjoy.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-10 text-xs font-bold rounded-xl border-[#DFE6EF]"
                onClick={() => setView('home')}
              >
                Save & Return Home
              </Button>
            </div>

            {/* Layout: Sidebar + Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Left Sidebar: Progress */}
              <Card className="border-[#DFE6EF] bg-white rounded-3xl p-5 space-y-4 lg:sticky lg:top-20">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#12243A]">
                    <span>Case {s2Index + 1} of {s2Items.length}</span>
                    <span>{Math.round(((s2Index + 1) / s2Items.length) * 100)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E9EEF5] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#087F75] to-[#25B4A7] transition-all duration-300 rounded-full"
                      style={{ width: `${((s2Index + 1) / s2Items.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#617187]">Sector Groups</p>
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
                        className={`p-2 rounded-xl text-xs flex items-center justify-between ${
                          isCurrent
                            ? 'bg-[#E8F7F4] text-[#087F75] font-bold border border-[#BDE8E1]'
                            : 'text-[#617187]'
                        }`}
                      >
                        <span className="truncate max-w-[170px]">{sec}</span>
                        <span className="text-[10px] font-semibold">({doneCount}/{sectorQuestions.length})</span>
                      </div>
                    )
                  })}
                </div>

                <div className="p-3 rounded-2xl bg-[#E8F7F4] border border-[#BDE8E1] text-[11px] text-[#126B64] leading-relaxed">
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
                    <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                      {/* Meta Tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-[#E8F7F4] text-[#087F75] border-[#BDE8E1] text-[10px] font-extrabold px-2.5 py-0.5">
                          STAGE 2 · CASE {s2Index + 1}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-bold text-[#617187]">
                          {currentQ.caseType}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-bold text-[#617187]">
                          {currentQ.sector}
                        </Badge>
                      </div>

                      {/* Scenario */}
                      <div className="p-5 rounded-2xl bg-[#F8FAFF] border border-[#E1E9FA] text-sm sm:text-base leading-relaxed text-[#172436] font-medium">
                        {caseNarrative}
                      </div>

                      {/* Prompt */}
                      <div>
                        <h3 className="text-xl font-bold text-[#12243A] tracking-tight">{currentQ.prompt}</h3>
                        <p className="text-xs text-[#617187] mt-1">
                          Select up to 3 activities you would genuinely like to try in this setting. Choose “None of these” if none fit.
                        </p>
                      </div>

                      {/* Activity Option Cards */}
                      <div className="space-y-2.5">
                        {currentQ.options.map((opt, oidx) => {
                          const isSelected = selectedIds.includes(opt.id)
                          const letter = String.fromCharCode(65 + oidx)

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectOption('s2', currentQ.id, opt.id)}
                              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                                isSelected
                                  ? 'border-[#087F75] bg-[#E8F7F4] ring-2 ring-[#087F75]/20 shadow-sm'
                                  : 'border-[#DFE6EF] bg-white hover:border-[#087F75]/40 hover:bg-[#F8FCFB]'
                              }`}
                            >
                              <span
                                className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isSelected ? 'bg-[#087F75] text-white' : 'bg-[#EDF1F7] text-[#46576E]'
                                }`}
                              >
                                {letter}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm text-[#172436] leading-relaxed font-medium">
                                  {opt.text}
                                </p>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {/* Actions Footer */}
                      <div className="pt-4 border-t border-[#DFE6EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs text-[#617187]">
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
                            className="h-10 text-xs font-bold rounded-xl border-[#DFE6EF] px-4"
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
                            className="h-10 text-xs font-bold rounded-xl text-[#617187]"
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
                            className="h-10 text-xs font-bold bg-[#087F75] hover:bg-[#06655D] text-white rounded-xl px-5 shadow-sm"
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
            <div className="rounded-3xl p-8 sm:p-10 text-white bg-gradient-to-br from-[#12243A] via-[#1B3554] to-[#234B82] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl space-y-2">
                <span className="text-[11px] font-extrabold tracking-widest text-[#BBCCFF] uppercase">
                  Verified Career Exploration Report
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {applicantName ? `${applicantName}, your career report is ready` : 'Your Career Exploration Report'}
                </h2>
                <p className="text-xs sm:text-sm text-[#DCE6F6] leading-relaxed">
                  {pathway} Pathway ({stream || previousField}) · Combines 20-dimensional broad psychometrics with direct Stage 2 work activity choices.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-center">
                  <span className="text-xl font-black block">{Object.keys(s1Answers).length}/30</span>
                  <span className="text-[10px] text-[#DCE6F6]">Stage 1 answered</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-center">
                  <span className="text-xl font-black block">{Object.keys(s2Answers).length}/20</span>
                  <span className="text-[10px] text-[#DCE6F6]">Stage 2 answered</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm text-center">
                  <span className="text-xl font-black block">{DOMAINS.length}</span>
                  <span className="text-[10px] text-[#DCE6F6]">Domains evaluated</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Print / Download) */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 text-xs font-bold rounded-xl border-[#DFE6EF] text-[#42536A]"
                  onClick={() => window.print()}
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 text-xs font-bold rounded-xl border-[#DFE6EF] text-[#42536A]"
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
                  className="h-10 text-xs font-bold rounded-xl border-[#DFE6EF] text-[#42536A]"
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
                className="h-10 text-xs font-bold text-red-600 hover:bg-red-50"
                onClick={handleRestart}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Start New Assessment
              </Button>
            </div>

            {/* 2-Column: 20 Dimensions & Ranked Career Domains */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 20 Dimensions */}
              <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#12243A]">Your 20-Dimensional Profile</h3>
                  <p className="text-xs text-[#617187]">Response pattern distribution across all cognitive and behavioral dimensions.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[440px] overflow-y-auto pr-1">
                  {DIMENSIONS.map((dim) => {
                    const val = Number(s1Dimensions?.scores[dim.id] || 0)
                    return (
                      <div key={dim.id} className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF]/70 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] font-black text-[#597090]">{dim.id}</span>
                            <p className="font-bold text-[#12243A] text-xs leading-tight">{dim.name}</p>
                          </div>
                          <span className="text-sm font-black text-[#2858D8]">{val}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#EBEFF6] overflow-hidden">
                          <div className="h-full bg-[#2858D8] rounded-full" style={{ width: `${val}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Career Domains to Explore */}
              <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#12243A]">Recommended Career Domains</h3>
                  <p className="text-xs text-[#617187]">
                    Blended index from Stage 1 psychometrics and direct Stage 2 activity selections.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {(finalDomains || []).slice(0, 10).map((dom, didx) => (
                    <div
                      key={dom.id}
                      className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF]/80 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-[#EEF2F8] text-[#42546C] text-xs font-black flex items-center justify-center shrink-0">
                            {didx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#12243A] truncate">{dom.name}</p>
                            <p className="text-[10px] text-[#617187] truncate">{dom.sector}</p>
                          </div>
                        </div>

                        <span className="text-xs font-black text-[#087F75] bg-[#E8F7F4] px-2.5 py-1 rounded-full shrink-0">
                          {dom.finalScore}%
                        </span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-[#EBEFF6] overflow-hidden">
                        <div className="h-full bg-[#087F75] rounded-full" style={{ width: `${dom.finalScore}%` }} />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#617187]">
                        <span>Confidence: {dom.confidence}</span>
                        <span>Selected {dom.stage2Selections}/{dom.stage2Exposures} times in Stage 2</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sandip University Programme Recommendations */}
            <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#12243A]">Sandip University Programme Guidance</h3>
                <p className="text-xs text-[#617187]">
                  Programmes matched with your highest-ranked career domains, evaluated against your Class 12 / prior degree qualifications.
                </p>
              </div>

              {/* Matched / Aligned Programmes */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#147A52] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#147A52]" /> Aligned Pathway Programmes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchedPrograms
                    .filter((p) => p.eligibility.code === 'match')
                    .slice(0, 6)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#597090]">{p.id}</span>
                            <Badge className="bg-[#E8F7EF] text-[#147A52] border-[#CCEBD9] text-[10px] font-bold">
                              {p.level}
                            </Badge>
                          </div>
                          <h5 className="text-xs font-bold text-[#12243A] leading-snug">{p.name}</h5>
                          <p className="text-[11px] text-[#617187]">{p.school}</p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-[#40516A] font-semibold">Programme Fit Index:</span>
                            <span className="text-xs font-black text-[#2858D8]">{p.fit}/100</span>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-[#DFE6EF]/70">
                          <p className="text-[10px] text-[#147A52] font-semibold bg-[#E8F7EF] p-2 rounded-xl">
                            ✓ {p.eligibility.reason}
                          </p>
                          <div className="flex items-center gap-1 flex-wrap">
                            {p.domains.slice(0, 2).map((dname) => (
                              <span key={dname} className="text-[9px] font-bold bg-[#EDF2FF] text-[#2858D8] px-2 py-0.5 rounded-md">
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
              {matchedPrograms.some((p) => p.eligibility.code === 'review') && (
                <div className="space-y-3 pt-4 border-t border-[#DFE6EF]">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8B530C] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-[#8B530C]" /> Related Programmes for Subject Review
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matchedPrograms
                      .filter((p) => p.eligibility.code === 'review')
                      .slice(0, 3)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-5 rounded-2xl bg-[#FFFBF0] border border-[#F3E0B4] space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-[#8B530C]">{p.id}</span>
                              <Badge className="bg-[#FFF5DF] text-[#8B530C] border-[#F3E0B4] text-[10px] font-bold">
                                {p.level}
                              </Badge>
                            </div>
                            <h5 className="text-xs font-bold text-[#12243A] leading-snug">{p.name}</h5>
                            <p className="text-[11px] text-[#617187]">{p.school}</p>
                            <p className="text-[10px] text-[#8B530C] font-semibold pt-1">{p.eligibility.reason}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </Card>

            {/* How to Use Your Results */}
            <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#12243A]">Next Steps with Your Career Report</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-1.5">
                  <h5 className="text-xs font-bold text-[#12243A]">1. Compare the Actual Work</h5>
                  <p className="text-[11px] text-[#617187] leading-relaxed">
                    Review the daily tasks in your top domains. Do not select a course based solely on the degree title.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-1.5">
                  <h5 className="text-xs font-bold text-[#12243A]">2. Check Entry Requirements</h5>
                  <p className="text-[11px] text-[#617187] leading-relaxed">
                    Verify official minimum percentage and prerequisite marks with Sandip University admissions counsellors.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-1.5">
                  <h5 className="text-xs font-bold text-[#12243A]">3. Try a Mini Project</h5>
                  <p className="text-[11px] text-[#617187] leading-relaxed">
                    Undertake a small introductory project in your top 2 fields to confirm hands-on engagement.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-1.5">
                  <h5 className="text-xs font-bold text-[#12243A]">4. Consult Your Mentor</h5>
                  <p className="text-[11px] text-[#617187] leading-relaxed">
                    Share this report with your university counsellor or mentor to plan your curriculum electives.
                  </p>
                </div>
              </div>
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
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#E8F7F4] text-[#087F75] border border-[#BDE8E1]">
                  CATALOGUE BROWSER
                </span>
                <h2 className="text-2xl font-extrabold text-[#12243A] tracking-tight mt-1.5">
                  Explore All 79 Career Domains
                </h2>
                <p className="text-xs text-[#617187]">
                  Search across 6 industry sectors. Add or swap domains into your Stage 2 exploration shortlist.
                </p>
              </div>

              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white border border-[#DFE6EF] text-[#42536A]">
                {filteredDomains.length} of 79 Domains
              </span>
            </div>

            {/* Filter Bar */}
            <Card className="border-[#DFE6EF] bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#617187] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={domainSearch}
                  onChange={(e) => setDomainSearch(e.target.value)}
                  placeholder="Search domains, e.g. aerospace, ML, fintech..."
                  className="pl-10 h-10 rounded-xl border-[#CBD5E1] text-xs"
                />
              </div>

              <select
                value={domainSectorFilter}
                onChange={(e) => setDomainSectorFilter(e.target.value)}
                className="w-full sm:w-64 h-10 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#172436] focus:outline-none"
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
                className="w-full sm:w-48 h-10 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#172436] focus:outline-none"
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
                  <Card key={dom.id} className="p-5 border-[#DFE6EF] bg-white rounded-3xl shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#597090]">{dom.id}</span>
                        <Badge className="bg-[#EDF2FF] text-[#2858D8] border-[#CBD7F3] text-[9px] font-bold">
                          {dom.sector.split(',')[0]}
                        </Badge>
                      </div>

                      <h4 className="text-sm font-bold text-[#12243A]">{dom.name}</h4>
                      <p className="text-xs text-[#617187] leading-relaxed">{dom.task}.</p>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-semibold bg-[#F0F3F8] text-[#526277] px-2 py-0.5 rounded-full">
                          {dom.programmeCount} Sandip programme{dom.programmeCount === 1 ? '' : 's'}
                        </span>
                        {score !== undefined && (
                          <span className="text-[10px] font-extrabold bg-[#E8F7F4] text-[#087F75] px-2 py-0.5 rounded-full">
                            Index: {score}%
                          </span>
                        )}
                        {inCandidate && (
                          <span className="text-[10px] font-bold bg-[#E8F7EF] text-[#147A52] px-2 py-0.5 rounded-full">
                            ✓ In Stage 2
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#DFE6EF]/70 flex items-center justify-between gap-2">
                      <Button
                        variant={inCandidate ? 'outline' : 'default'}
                        size="sm"
                        className={`text-xs font-bold rounded-xl h-9 flex-1 ${
                          inCandidate
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'bg-[#2858D8] hover:bg-[#1F45AD] text-white'
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
                        className="text-xs font-bold text-[#42536A] h-9"
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
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-[#F0F4FF] text-[#244BA9] border border-[#CBD7F3]">
                  PROGRAMME FINDER
                </span>
                <h2 className="text-2xl font-extrabold text-[#12243A] tracking-tight mt-1.5">
                  Sandip University Programme Catalogue
                </h2>
                <p className="text-xs text-[#617187]">
                  Browse all 114 official programmes, linked career domains, and admission stream prerequisites.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 text-xs font-bold rounded-xl border-[#DFE6EF]"
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
            <Card className="border-[#DFE6EF] bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-[#617187] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={programSearch}
                  onChange={(e) => setProgramSearch(e.target.value)}
                  placeholder="Search programme, specialization or school..."
                  className="pl-10 h-10 rounded-xl border-[#CBD5E1] text-xs"
                />
              </div>

              <select
                value={programLevelFilter}
                onChange={(e) => setProgramLevelFilter(e.target.value)}
                className="w-full sm:w-44 h-10 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#172436] focus:outline-none"
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
                className="w-full sm:w-60 h-10 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#172436] focus:outline-none"
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
                  <Card key={p.id} className="p-5 border-[#DFE6EF] bg-white rounded-3xl shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#597090]">{p.id}</span>
                        <Badge variant="outline" className="text-[10px] font-bold text-[#42536A]">
                          {p.level}
                        </Badge>
                      </div>

                      <h4 className="text-xs font-bold text-[#12243A] leading-snug">{p.name}</h4>
                      <p className="text-[11px] text-[#617187]">{p.school}</p>

                      <div className="pt-1 space-y-1 text-xs">
                        <p className="text-[11px] text-[#40516A]">
                          <strong>Prerequisite:</strong> {p.streamSource}
                        </p>
                        <p className="text-[11px] text-[#617187]">
                          <strong>Careers:</strong> {p.careerSource}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {domains.slice(0, 3).map((d) => (
                          <span
                            key={d.id}
                            className="text-[9px] font-bold bg-[#EDF2FF] text-[#2858D8] px-2 py-0.5 rounded-md"
                          >
                            {d.name}
                          </span>
                        ))}
                        {domains.length > 3 && (
                          <span className="text-[9px] font-bold text-[#617187]">
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
      </main>
    </div>
  )
}
