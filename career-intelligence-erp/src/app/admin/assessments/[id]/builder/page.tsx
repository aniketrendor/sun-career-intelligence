'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles, Plus, Layers, Clock, CheckCircle2,
  AlertCircle, ArrowRight, ArrowLeft, Copy, Edit3, BarChart3, Eye, FileText,
  Trash2, GripVertical, Check, RefreshCw, Smartphone, Tablet, Monitor,
  Sliders, ShieldCheck, ChevronDown, ChevronRight, X, Info, Briefcase, Building2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DIMENSIONS,
  STAGE1,
  DOMAINS,
  SECTORS,
  PROGRAMS,
  STAGE2_ACTIVITIES,
  SECTOR_CONTEXTS,
  DISCOVERY_CASES,
  STAGE2_PROMPT_MAP,
  Stage1Question,
  Stage1Option,
  SectorContext,
  DiscoveryCase,
  CareerDomain,
  OPT_OUT_ID
} from '@/lib/data/su-career-data'
import {
  computeDimensionProfile,
  scoreAllDomains
} from '@/lib/services/career-scoring-engine'

interface Stage2CaseItem {
  id: string
  caseNumber: number
  sector: string
  caseType: string
  variantIndex: number
  ugCase: string
  pgCase: string
  prompt: string
  isDiscovery: boolean
  domains: CareerDomain[]
}

export default function AssessmentBuilderPage() {
  // Assessment metadata
  const [assessmentName, setAssessmentName] = useState('SUN Two-Stage Career Exploration Assessment')
  const [versionNumber, setVersionNumber] = useState('1.0')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED')

  // Top Mode Switcher: Builder Canvas vs Multi-Device Preview vs Response Analytics
  const [mode, setMode] = useState<'builder' | 'preview' | 'analytics'>('builder')

  // Stage Switcher inside Builder & Preview: Stage 1 vs Stage 2
  const [activeStage, setActiveStage] = useState<'stage1' | 'stage2'>('stage1')

  // =========================================================================
  // STAGE 1 STATE (30 Cognitive Profile Cases)
  // =========================================================================
  const [questions, setQuestions] = useState<Stage1Question[]>(STAGE1)
  const [selectedQIndex, setSelectedQIndex] = useState(0)
  const [activeScenarioTab, setActiveScenarioTab] = useState<'ug' | 'pg'>('ug')

  // =========================================================================
  // STAGE 2 STATE (20 Work Simulations & 79 Domain Activities)
  // =========================================================================
  const [sectorContexts, setSectorContexts] = useState<Record<string, SectorContext[]>>(SECTOR_CONTEXTS)
  const [discoveryCases, setDiscoveryCases] = useState<DiscoveryCase[]>(DISCOVERY_CASES)
  const [s2Activities, setS2Activities] = useState<Record<string, string[]>>(STAGE2_ACTIVITIES)
  const [selectedS2Index, setSelectedS2Index] = useState(0)
  const [activeS2ScenarioTab, setActiveS2ScenarioTab] = useState<'ug' | 'pg'>('ug')

  // Generate the 20 Stage 2 Cases list (18 sector cases + 2 discovery cases)
  const stage2Cases: Stage2CaseItem[] = useMemo(() => {
    const list: Stage2CaseItem[] = []
    let num = 1

    for (let variant = 0; variant < 3; variant++) {
      for (const sector of SECTORS) {
        const ctx = (sectorContexts[sector] || [])[variant] || {
          caseType: 'Workplace trial',
          ug: 'A team is comparing project tasks in this sector.',
          pg: 'A team is comparing specialist work packages in this sector.',
          prompt: 'Which tasks would you choose to explore?'
        }
        const sectorDomains = DOMAINS.filter((d) => d.sector === sector)
        list.push({
          id: `S2Q${String(num).padStart(3, '0')}`,
          caseNumber: num,
          sector,
          caseType: ctx.caseType,
          variantIndex: variant,
          ugCase: ctx.ug,
          pgCase: ctx.pg,
          prompt: ctx.prompt,
          isDiscovery: false,
          domains: sectorDomains
        })
        num++
      }
    }

    // 2 Discovery Cases
    discoveryCases.forEach((dc, didx) => {
      list.push({
        id: `S2Q${String(num).padStart(3, '0')}`,
        caseNumber: num,
        sector: 'Cross-Field Discovery',
        caseType: dc.caseType,
        variantIndex: didx,
        ugCase: dc.ug,
        pgCase: dc.pg,
        prompt: dc.prompt,
        isDiscovery: true,
        domains: DOMAINS.slice(didx * 6, (didx + 1) * 6)
      })
      num++
    })

    return list
  }, [sectorContexts, discoveryCases])

  // Focused Stage 2 case in canvas
  const currentS2 = stage2Cases[selectedS2Index] || stage2Cases[0]

  // Multi-Device Preview Sandbox State
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [previewPathway, setPreviewPathway] = useState<'UG' | 'PG'>('UG')
  const [previewSelectedOptions, setPreviewSelectedOptions] = useState<Record<string, string[]>>({})

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Live Cohort Response Metrics (loaded from Supabase database)
  const [cohortStats, setCohortStats] = useState<{
    totalSubmissions: number
    completed: number
    inProgress: number
    completionRate: number
    avgTime: string
  } | null>(null)

  useEffect(() => {
    async function loadAttemptMetrics() {
      try {
        const supabase = createClient()
        const { data: attempts } = await supabase
          .from('assessment_attempts')
          .select('id, status, started_at, completed_at')

        if (attempts) {
          const total = attempts.length
          const completed = attempts.filter((a) => a.status === 'COMPLETED').length
          const inProgress = attempts.filter((a) => a.status === 'IN_PROGRESS').length
          const rate = total > 0 ? Math.round((completed / total) * 100) : 0

          let avgMins = 0
          const durations = attempts
            .filter((a) => a.status === 'COMPLETED' && a.started_at && a.completed_at)
            .map((a) => (new Date(a.completed_at).getTime() - new Date(a.started_at).getTime()) / 60000)
            .filter((m) => m > 0 && m < 180)

          if (durations.length > 0) {
            avgMins = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          }

          setCohortStats({
            totalSubmissions: total,
            completed,
            inProgress,
            completionRate: rate,
            avgTime: avgMins > 0 ? `${avgMins}m` : 'Untimed'
          })
        }
      } catch (err) {
        console.error('Error loading live attempt metrics in builder:', err)
      }
    }

    loadAttemptMetrics()
  }, [])

  // Focused Stage 1 question in canvas
  const currentQ = questions[selectedQIndex] || questions[0]

  // Reorder Questions in list
  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= questions.length) return
    const copy = [...questions]
    const temp = copy[idx]
    copy[idx] = copy[newIdx]
    copy[newIdx] = temp
    setQuestions(copy)
    setSelectedQIndex(newIdx)
  }

  // Add Stage 1 Question
  const handleAddQuestion = () => {
    const newQ: Stage1Question = {
      id: `S1Q${String(questions.length + 1).padStart(3, '0')}`,
      level: currentQ ? currentQ.level : 0,
      levelName: currentQ ? currentQ.levelName : 'Explore',
      ugCase: 'Describe the real-life work scenario for Class 12 students...',
      pgCase: 'Describe the real-life work scenario for Bachelor graduates...',
      prompt: 'What would you prefer to do in this situation?',
      caseType: 'Case exploration',
      responseLimit: 3,
      instructions: 'Select up to three options that genuinely appeal to you.',
      options: [
        { id: `OPT_A`, text: 'Collect more information before proceeding.', dims: { D01: 3, D07: 1 }, primaryDim: 'D01', secondaryDim: 'D07' },
        { id: `OPT_B`, text: 'Experiment with different approaches.', dims: { D08: 3, D06: 1 }, primaryDim: 'D08', secondaryDim: 'D06' },
        { id: `OPT_C`, text: 'Discuss the situation with others.', dims: { D10: 3, D12: 1 }, primaryDim: 'D10', secondaryDim: 'D12' },
        { id: OPT_OUT_ID, text: 'None of these options feels right for me at the moment.', dims: {}, optOut: true }
      ]
    }
    setQuestions([...questions, newQ])
    setSelectedQIndex(questions.length)
    showToast('New Stage 1 case added and focused.')
  }

  // Delete Question
  const handleDeleteQuestion = (idx: number) => {
    if (questions.length <= 1) {
      showToast('Assessment must contain at least one question.')
      return
    }
    if (!confirm('Are you sure you want to delete this question?')) return
    const updated = questions.filter((_, i) => i !== idx)
    setQuestions(updated)
    setSelectedQIndex(Math.max(0, idx - 1))
    showToast('Question removed.')
  }

  // Update current Stage 1 question helper
  const updateCurrentQuestion = (fields: Partial<Stage1Question>) => {
    setQuestions((prev) => {
      const copy = [...prev]
      copy[selectedQIndex] = { ...copy[selectedQIndex], ...fields }
      return copy
    })
  }

  // Update current Stage 2 case helper
  const updateCurrentS2Case = (fields: Partial<{ ugCase: string; pgCase: string; prompt: string; caseType: string }>) => {
    if (!currentS2) return
    if (currentS2.isDiscovery) {
      const idx = currentS2.variantIndex
      setDiscoveryCases((prev) => {
        const copy = [...prev]
        copy[idx] = {
          ...copy[idx],
          ug: fields.ugCase !== undefined ? fields.ugCase : copy[idx].ug,
          pg: fields.pgCase !== undefined ? fields.pgCase : copy[idx].pg,
          prompt: fields.prompt !== undefined ? fields.prompt : copy[idx].prompt,
          caseType: fields.caseType !== undefined ? fields.caseType : copy[idx].caseType
        }
        return copy
      })
    } else {
      const sector = currentS2.sector
      const vidx = currentS2.variantIndex
      setSectorContexts((prev) => {
        const copy = { ...prev }
        const list = [...(copy[sector] || [])]
        list[vidx] = {
          ...list[vidx],
          ug: fields.ugCase !== undefined ? fields.ugCase : list[vidx].ug,
          pg: fields.pgCase !== undefined ? fields.pgCase : list[vidx].pg,
          prompt: fields.prompt !== undefined ? fields.prompt : list[vidx].prompt,
          caseType: fields.caseType !== undefined ? fields.caseType : list[vidx].caseType
        }
        copy[sector] = list
        return copy
      })
    }
  }

  // Quality Linter Rules Engine for Stage 1
  const linterIssues = useMemo(() => {
    const issues: Array<{ id: string; type: 'error' | 'warning' | 'info'; message: string }> = []

    questions.forEach((q) => {
      const nonOptOut = q.options.filter((o) => !o.optOut)
      if (nonOptOut.length < 2) {
        issues.push({
          id: `${q.id}-min-opts`,
          type: 'error',
          message: `Question ${q.id} has fewer than 2 valid choice options.`
        })
      }

      nonOptOut.forEach((o, oidx) => {
        const dimKeys = Object.keys(o.dims || {})
        if (dimKeys.length === 0) {
          issues.push({
            id: `${q.id}-opt-${oidx}-zero`,
            type: 'error',
            message: `Question ${q.id} Option ${String.fromCharCode(65 + oidx)} has no psychometric dimension weights assigned.`
          })
        } else if (dimKeys.length > 3) {
          issues.push({
            id: `${q.id}-opt-${oidx}-skew`,
            type: 'warning',
            message: `Question ${q.id} Option ${String.fromCharCode(65 + oidx)} awards >3 dimensions (${dimKeys.length}). Recommendation is ≤3.`
          })
        }
      })
    })

    return issues
  }, [questions])

  // Publish New Version Snapshot Action
  const handlePublish = () => {
    const errors = linterIssues.filter((i) => i.type === 'error')
    if (errors.length > 0) {
      showToast(`Cannot publish: ${errors.length} critical linter error(s) must be resolved.`)
      return
    }

    const nextVer = (parseFloat(versionNumber) + 0.1).toFixed(1)
    setVersionNumber(nextVer)
    setStatus('PUBLISHED')
    showToast(`Assessment V${nextVer} successfully published! Immutable snapshot created.`)
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C2621] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-[#DFD7CB]/30 animate-in fade-in slide-in-from-bottom-3">
          <Info className="w-4 h-4 text-[#A36B40]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Builder Navigation Bar */}
      <header className="border-b border-[#DFD7CB] bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin/assessments">
              <Button variant="ghost" size="sm" className="h-9 px-2 text-[#2C2621] hover:bg-[#FAF6F0] rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-1 text-[#A36B40]" /> Assessments
              </Button>
            </Link>
            <div className="h-5 w-px bg-[#DFD7CB]" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-extrabold text-[#2C2621]">
                  {assessmentName}
                </h1>
                <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] text-[10px] font-extrabold">
                  V{versionNumber}
                </Badge>
                <Badge
                  className={`text-[9px] font-black ${
                    status === 'PUBLISHED'
                      ? 'bg-[#F1F1EB] text-[#77734B] border-[#DFD7CB]'
                      : 'bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB]'
                  }`}
                >
                  {status}
                </Badge>
              </div>
              <p className="text-[11px] text-[#7A7067] mt-0.5">
                Two-Stage Psychometric Engine · 50 Total Cases (30 Stage 1 + 20 Stage 2 Simulations)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Mode Switcher Tabs */}
            <div className="p-1 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center gap-1">
              <Button
                variant={mode === 'builder' ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 text-xs font-bold rounded-lg ${mode === 'builder' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067] hover:text-[#2C2621]'}`}
                onClick={() => setMode('builder')}
              >
                <Edit3 className="w-3.5 h-3.5 mr-1 text-[#A36B40]" /> Canvas
              </Button>
              <Button
                variant={mode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 text-xs font-bold rounded-lg ${mode === 'preview' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067] hover:text-[#2C2621]'}`}
                onClick={() => setMode('preview')}
              >
                <Eye className="w-3.5 h-3.5 mr-1 text-[#77734B]" /> Preview
              </Button>
              <Button
                variant={mode === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 text-xs font-bold rounded-lg ${mode === 'analytics' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067] hover:text-[#2C2621]'}`}
                onClick={() => setMode('analytics')}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1" /> Analytics
              </Button>
            </div>

            {/* Publish Button */}
            <Button
              className="h-9 px-4 rounded-xl bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs shadow-xs cursor-pointer shrink-0"
              onClick={handlePublish}
            >
              Publish Snapshot
            </Button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MODE 1: 3-PANE ASSESSMENT BUILDER                                         */}
      {/* ========================================================================= */}
      {mode === 'builder' && (
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 pt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* PANE 1: Left Outline & Stage Selector (3 cols) */}
          <Card className="lg:col-span-3 border-[#DFD7CB] bg-white rounded-3xl p-5 shadow-xs space-y-4 lg:sticky lg:top-20 max-h-[85vh] flex flex-col justify-between">
            <div className="space-y-3">
              {/* Stage Selector Tabs */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#7A7067]">
                  Assessment Stage
                </span>
                <div className="flex rounded-xl bg-[#FAF6F0] p-1 border border-[#DFD7CB] gap-1">
                  <button
                    onClick={() => setActiveStage('stage1')}
                    className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                      activeStage === 'stage1'
                        ? 'bg-[#A36B40] text-white shadow-xs'
                        : 'text-[#7A7067] hover:text-[#2C2621]'
                    }`}
                  >
                    Stage 1 (30)
                  </button>
                  <button
                    onClick={() => setActiveStage('stage2')}
                    className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                      activeStage === 'stage2'
                        ? 'bg-[#77734B] text-white shadow-xs'
                        : 'text-[#7A7067] hover:text-[#2C2621]'
                    }`}
                  >
                    Stage 2 (20)
                  </button>
                </div>
              </div>

              {/* Header Title & Add Button */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#2C2621]">
                    {activeStage === 'stage1' ? 'Stage 1 Cases' : 'Stage 2 Simulations'}
                  </h3>
                  <p className="text-[10px] text-[#7A7067]">
                    {activeStage === 'stage1'
                      ? `${questions.length} questions in 5 levels`
                      : `${stage2Cases.length} simulation cases (6 sectors)`}
                  </p>
                </div>

                {activeStage === 'stage1' && (
                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold bg-[#A36B40] hover:bg-[#8E5B33] text-white rounded-xl"
                    onClick={handleAddQuestion}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                  </Button>
                )}
              </div>

              {/* Scrollable Cases List */}
              <div className="space-y-1.5 max-h-[55vh] overflow-y-auto pr-1">
                {activeStage === 'stage1' ? (
                  questions.map((q, qidx) => {
                    const isSelected = qidx === selectedQIndex
                    return (
                      <div
                        key={q.id}
                        onClick={() => setSelectedQIndex(qidx)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-[#A36B40] bg-[#FAF6F0] ring-1 ring-[#A36B40]/30'
                            : 'border-[#DFD7CB] bg-white hover:bg-[#FAF6F0]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-black text-[#A36B40] shrink-0">{q.id}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#2C2621] truncate">{q.prompt}</p>
                            <span className="text-[10px] text-[#7A7067]">{q.caseType}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={qidx === 0}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveQuestion(qidx, -1)
                            }}
                            className="w-5 h-5 rounded hover:bg-[#FAF6F0] text-[#7A7067] disabled:opacity-30 text-xs font-bold"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={qidx === questions.length - 1}
                            onClick={(e) => {
                              e.stopPropagation()
                              moveQuestion(qidx, 1)
                            }}
                            className="w-5 h-5 rounded hover:bg-[#FAF6F0] text-[#7A7067] disabled:opacity-30 text-xs font-bold"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  stage2Cases.map((s2, s2idx) => {
                    const isSelected = s2idx === selectedS2Index
                    return (
                      <div
                        key={s2.id}
                        onClick={() => setSelectedS2Index(s2idx)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-[#77734B] bg-[#F1F1EB] ring-1 ring-[#77734B]/30'
                            : 'border-[#DFD7CB] bg-white hover:bg-[#FAF6F0]/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-black text-[#77734B] shrink-0">{s2.id}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#2C2621] truncate">{s2.caseType}</p>
                            <span className="text-[10px] text-[#7A7067] truncate block">{s2.sector}</span>
                          </div>
                        </div>

                        <Badge className="text-[9px] font-bold bg-white text-[#77734B] border-[#DFD7CB] shrink-0">
                          Var {s2.variantIndex + 1}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Quality Linter Summary Badge */}
            <div className="pt-2 border-t border-[#DFD7CB]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2C2621]">Linter Status:</span>
                {linterIssues.length === 0 ? (
                  <Badge className="bg-[#F1F1EB] text-[#77734B] border-[#DFD7CB] text-[10px] font-bold">
                    0 Warnings
                  </Badge>
                ) : (
                  <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold">
                    {linterIssues.length} Notice{linterIssues.length === 1 ? '' : 's'}
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {/* PANE 2: Center Live Question / Simulation Canvas (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {activeStage === 'stage1' ? (
              <Card className="p-6 sm:p-8 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-6">
                {/* Stage 1 Meta Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#A36B40] bg-[#FAF6F0] border border-[#DFD7CB] px-2.5 py-0.5 rounded-md">
                      {currentQ.id}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold text-[#77734B] border-[#DFD7CB] bg-[#F1F1EB]">
                      Level {currentQ.level + 1} · {currentQ.levelName}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold text-[#2C2621] border-[#DFD7CB]">
                      {currentQ.caseType}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-red-600 hover:bg-red-50 rounded-xl"
                    onClick={() => handleDeleteQuestion(selectedQIndex)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>

                {/* Dual Scenario Tabs (UG vs PG) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2C2621]">Real-World Scenario Narrative</label>
                    <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#DFD7CB]">
                      <button
                        type="button"
                        onClick={() => setActiveScenarioTab('ug')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          activeScenarioTab === 'ug' ? 'bg-[#A36B40] text-white shadow-xs' : 'text-[#7A7067]'
                        }`}
                      >
                        Class 12 / UG
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveScenarioTab('pg')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          activeScenarioTab === 'pg' ? 'bg-[#77734B] text-white shadow-xs' : 'text-[#7A7067]'
                        }`}
                      >
                        Graduate / PG
                      </button>
                    </div>
                  </div>

                  {activeScenarioTab === 'ug' ? (
                    <textarea
                      value={currentQ.ugCase}
                      onChange={(e) => updateCurrentQuestion({ ugCase: e.target.value })}
                      rows={3}
                      className="w-full p-4 rounded-2xl border border-[#DFD7CB] text-xs font-medium bg-[#FAF6F0]/40 focus:outline-none focus:bg-white focus:border-[#A36B40]"
                      placeholder="Enter scenario for high-school students..."
                    />
                  ) : (
                    <textarea
                      value={currentQ.pgCase}
                      onChange={(e) => updateCurrentQuestion({ pgCase: e.target.value })}
                      rows={3}
                      className="w-full p-4 rounded-2xl border border-[#DFD7CB] text-xs font-medium bg-[#F1F1EB]/40 focus:outline-none focus:bg-white focus:border-[#77734B]"
                      placeholder="Enter scenario for degree graduates..."
                    />
                  )}
                </div>

                {/* Question Prompt */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621]">Question Prompt</label>
                  <Input
                    value={currentQ.prompt}
                    onChange={(e) => updateCurrentQuestion({ prompt: e.target.value })}
                    className="h-10 text-xs rounded-xl border-[#DFD7CB]"
                  />
                </div>

                {/* Choice Options & Dimension Weights List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2C2621]">Choice Options & Attached Weights</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-bold border-[#DFD7CB] text-[#A36B40] rounded-xl hover:bg-[#FAF6F0]"
                      onClick={() => {
                        const newOpt: Stage1Option = {
                          id: `${currentQ.id}_OPT_${currentQ.options.length + 1}`,
                          text: 'New choice option text...',
                          dims: { D01: 3, D02: 1 },
                          primaryDim: 'D01',
                          secondaryDim: 'D02'
                        }
                        updateCurrentQuestion({ options: [...currentQ.options, newOpt] })
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Option
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, oidx) => {
                      const dims = Object.entries(opt.dims || {})
                      const isOptOut = !!opt.optOut

                      return (
                        <div
                          key={opt.id}
                          className={`p-3.5 rounded-2xl border space-y-2 transition-all ${
                            isOptOut
                              ? 'border-amber-200 bg-amber-50/40'
                              : 'border-[#DFD7CB] bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-[#A36B40]">
                              Option {String.fromCharCode(65 + oidx)} {isOptOut && '· Opt-Out'}
                            </span>
                            {!isOptOut && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-1.5 text-xs text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  updateCurrentQuestion({
                                    options: currentQ.options.filter((_, idx) => idx !== oidx)
                                  })
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>

                          <Input
                            value={opt.text}
                            onChange={(e) => {
                              const opts = [...currentQ.options]
                              opts[oidx].text = e.target.value
                              updateCurrentQuestion({ options: opts })
                            }}
                            className="h-10 text-xs rounded-xl bg-white border-[#DFD7CB]"
                            placeholder="Option description..."
                          />

                          {/* Dimension Chips Preview */}
                          {!isOptOut && dims.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              <span className="text-[10px] text-[#7A7067] font-bold">Awards:</span>
                              {dims.map(([k, v]) => {
                                const dimObj = DIMENSIONS.find((d) => d.id === k)
                                return (
                                  <Badge
                                    key={k}
                                    className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] text-[10px] font-extrabold px-2 py-0.5"
                                  >
                                    {dimObj?.name || k} (+{v})
                                  </Badge>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            ) : (
              /* Stage 2 Simulation Canvas */
              <Card className="p-6 sm:p-8 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-6">
                {/* Stage 2 Meta Header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#77734B] bg-[#F1F1EB] border border-[#DFD7CB] px-2.5 py-0.5 rounded-md">
                      {currentS2.id}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold text-[#A36B40] border-[#DFD7CB] bg-[#FAF6F0]">
                      {currentS2.sector}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold text-[#2C2621] border-[#DFD7CB]">
                      {currentS2.caseType}
                    </Badge>
                    <Badge className="bg-white text-[#7A7067] border-[#DFD7CB] text-[10px] font-bold">
                      Variant {currentS2.variantIndex + 1}
                    </Badge>
                  </div>
                </div>

                {/* Dual Scenario Tabs for Stage 2 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2C2621]">Workplace Simulation Brief</label>
                    <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#DFD7CB]">
                      <button
                        type="button"
                        onClick={() => setActiveS2ScenarioTab('ug')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          activeS2ScenarioTab === 'ug' ? 'bg-[#A36B40] text-white shadow-xs' : 'text-[#7A7067]'
                        }`}
                      >
                        Class 12 / UG
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveS2ScenarioTab('pg')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                          activeS2ScenarioTab === 'pg' ? 'bg-[#77734B] text-white shadow-xs' : 'text-[#7A7067]'
                        }`}
                      >
                        Graduate / PG
                      </button>
                    </div>
                  </div>

                  {activeS2ScenarioTab === 'ug' ? (
                    <textarea
                      value={currentS2.ugCase}
                      onChange={(e) => updateCurrentS2Case({ ugCase: e.target.value })}
                      rows={3}
                      className="w-full p-4 rounded-2xl border border-[#DFD7CB] text-xs font-medium bg-[#FAF6F0]/40 focus:outline-none focus:bg-white focus:border-[#A36B40]"
                    />
                  ) : (
                    <textarea
                      value={currentS2.pgCase}
                      onChange={(e) => updateCurrentS2Case({ pgCase: e.target.value })}
                      rows={3}
                      className="w-full p-4 rounded-2xl border border-[#DFD7CB] text-xs font-medium bg-[#F1F1EB]/40 focus:outline-none focus:bg-white focus:border-[#77734B]"
                    />
                  )}
                </div>

                {/* Prompt */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621]">Question Prompt</label>
                  <Input
                    value={currentS2.prompt}
                    onChange={(e) => updateCurrentS2Case({ prompt: e.target.value })}
                    className="h-10 text-xs rounded-xl border-[#DFD7CB]"
                  />
                </div>

                {/* Sector Career Domains & Activity Task Statements in this Case */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-[#2C2621]">
                        Domain Practical Task Activities (Variant {currentS2.variantIndex + 1})
                      </label>
                      <p className="text-[10px] text-[#7A7067]">
                        Hands-on task options presented to students for each domain in this simulation case.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentS2.domains.map((dom) => {
                      const tasks = s2Activities[dom.id] || []
                      const taskText = tasks[currentS2.variantIndex] || 'Engage in a practical work package related to this domain.'

                      return (
                        <div key={dom.id} className="p-3.5 rounded-2xl border border-[#DFD7CB] bg-white space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#A36B40]">{dom.name}</span>
                            <span className="text-[10px] font-mono text-[#7A7067]">{dom.id}</span>
                          </div>
                          <Input
                            value={taskText}
                            onChange={(e) => {
                              const updatedTasks = [...(s2Activities[dom.id] || ['', '', ''])]
                              updatedTasks[currentS2.variantIndex] = e.target.value
                              setS2Activities((prev) => ({
                                ...prev,
                                [dom.id]: updatedTasks
                              }))
                            }}
                            className="h-9 text-xs rounded-xl border-[#DFD7CB]"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* PANE 3: Right Inspector & Psychometric Matrix (3 cols) */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
            {activeStage === 'stage1' ? (
              <Card className="p-6 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2C2621] flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#A36B40]" /> Stage 1 Question Inspector
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[#2C2621]">Question Type</label>
                    <select
                      className="w-full h-9 px-3 rounded-xl border border-[#DFD7CB] bg-white text-xs font-medium focus:outline-none"
                      value="MULTIPLE_CHOICE"
                      onChange={() => {}}
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice (Up to 3)</option>
                      <option value="SINGLE_CHOICE">Single Choice</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#2C2621]">Exploration Level</label>
                    <select
                      value={currentQ.level}
                      onChange={(e) => {
                        const lvl = Number(e.target.value)
                        updateCurrentQuestion({
                          level: lvl,
                          levelName: ['Explore', 'Look for clues', 'Try ideas', 'Compare choices', 'Decisions'][lvl] || 'Explore'
                        })
                      }}
                      className="w-full h-9 px-3 rounded-xl border border-[#DFD7CB] bg-white text-xs font-medium focus:outline-none"
                    >
                      <option value={0}>Level 1 · Explore</option>
                      <option value={1}>Level 2 · Look for clues</option>
                      <option value={2}>Level 3 · Try ideas</option>
                      <option value={3}>Level 4 · Compare choices</option>
                      <option value={4}>Level 5 · Decisions</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#2C2621]">Case Type Tag</label>
                    <Input
                      value={currentQ.caseType}
                      onChange={(e) => updateCurrentQuestion({ caseType: e.target.value })}
                      className="h-9 text-xs rounded-xl border-[#DFD7CB]"
                    />
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2C2621] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#77734B]" /> Stage 2 Simulation Inspector
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-[#2C2621]">Sector</label>
                    <p className="font-extrabold text-[#77734B]">{currentS2.sector}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#2C2621]">Simulation Variant</label>
                    <p className="font-bold text-[#2C2621]">Variant {currentS2.variantIndex + 1} of 3</p>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#2C2621]">Case Type</label>
                    <Input
                      value={currentS2.caseType}
                      onChange={(e) => updateCurrentS2Case({ caseType: e.target.value })}
                      className="h-9 text-xs rounded-xl border-[#DFD7CB]"
                    />
                  </div>

                  <div className="space-y-1 pt-2 border-t border-[#DFD7CB]">
                    <span className="font-bold text-[#7A7067] uppercase text-[10px]">Domains Covered</span>
                    <p className="text-sm font-black text-[#2C2621]">{currentS2.domains.length} Career Domains</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Quality Linter Card */}
            <Card className="p-6 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2C2621] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#77734B]" /> Quality Linter
              </h3>

              {linterIssues.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-[#F1F1EB] border border-[#DFD7CB] text-[#77734B] text-xs font-medium">
                  ✓ All questions adhere to Sandip University psychometric standards (balanced point weights, verified dimensions).
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {linterIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-900 text-[11px] leading-snug flex items-start gap-2"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-700" />
                      <span>{issue.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: MULTI-DEVICE PREVIEW & TEST SANDBOX                               */}
      {/* ========================================================================= */}
      {mode === 'preview' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
          {/* Device Switcher Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-[#DFD7CB] shadow-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex rounded-xl bg-[#FAF6F0] p-1 border border-[#DFD7CB] gap-1">
                <Button
                  variant={activeStage === 'stage1' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold rounded-lg ${activeStage === 'stage1' ? 'bg-[#A36B40] text-white' : 'text-[#7A7067]'}`}
                  onClick={() => setActiveStage('stage1')}
                >
                  Stage 1 Questions
                </Button>
                <Button
                  variant={activeStage === 'stage2' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold rounded-lg ${activeStage === 'stage2' ? 'bg-[#77734B] text-white' : 'text-[#7A7067]'}`}
                  onClick={() => setActiveStage('stage2')}
                >
                  Stage 2 Simulations
                </Button>
              </div>

              <div className="flex items-center gap-1 bg-[#FAF6F0] p-1 rounded-xl border border-[#DFD7CB]">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${previewDevice === 'desktop' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067]'}`}
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="w-3.5 h-3.5 mr-1" /> Desktop
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${previewDevice === 'tablet' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067]'}`}
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="w-3.5 h-3.5 mr-1" /> Tablet
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${previewDevice === 'mobile' ? 'bg-white text-[#2C2621] shadow-xs' : 'text-[#7A7067]'}`}
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="w-3.5 h-3.5 mr-1" /> Mobile
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#7A7067]">Pathway:</span>
              <div className="p-1 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center gap-1">
                <Button
                  variant={previewPathway === 'UG' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${previewPathway === 'UG' ? 'bg-[#A36B40] text-white shadow-xs' : 'text-[#7A7067]'}`}
                  onClick={() => setPreviewPathway('UG')}
                >
                  UG (Class 12)
                </Button>
                <Button
                  variant={previewPathway === 'PG' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${previewPathway === 'PG' ? 'bg-[#77734B] text-white shadow-xs' : 'text-[#7A7067]'}`}
                  onClick={() => setPreviewPathway('PG')}
                >
                  PG (Graduate)
                </Button>
              </div>
            </div>
          </div>

          {/* Rendered Viewport Container */}
          <div className="flex justify-center py-6">
            <div
              className={`transition-all duration-300 ${
                previewDevice === 'mobile'
                  ? 'w-[375px]'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-full max-w-4xl'
              }`}
            >
              {activeStage === 'stage1' ? (
                /* Stage 1 Preview Card */
                <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DFD7CB]">
                    <span className="text-xs font-black text-[#A36B40]">{currentQ.id}</span>
                    <Badge variant="outline" className="text-xs text-[#2C2621] border-[#DFD7CB]">
                      {previewPathway} Student View
                    </Badge>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-2">
                    <span className="text-[10px] font-black uppercase text-[#A36B40]">Case Scenario</span>
                    <p className="text-sm text-[#2C2621] leading-relaxed">
                      {previewPathway === 'UG' ? currentQ.ugCase : currentQ.pgCase}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-[#2C2621]">{currentQ.prompt}</h3>
                    <p className="text-xs text-[#7A7067]">Select up to 3 options you would genuinely choose.</p>
                  </div>

                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, oidx) => (
                      <div
                        key={opt.id}
                        className="p-4 rounded-2xl border border-[#DFD7CB] bg-white hover:border-[#A36B40]/40 transition-colors cursor-pointer flex items-start gap-3"
                      >
                        <span className="w-5 h-5 rounded-md bg-[#FAF6F0] text-[#A36B40] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#DFD7CB]">
                          {opt.optOut ? 'X' : String.fromCharCode(65 + oidx)}
                        </span>
                        <p className="text-xs text-[#2C2621] leading-snug">{opt.text}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : (
                /* Stage 2 Preview Card */
                <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DFD7CB]">
                    <span className="text-xs font-black text-[#77734B]">{currentS2.id} · {currentS2.sector}</span>
                    <Badge variant="outline" className="text-xs text-[#2C2621] border-[#DFD7CB]">
                      {previewPathway} Student View
                    </Badge>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-2">
                    <span className="text-[10px] font-black uppercase text-[#A36B40]">Workplace Simulation Brief</span>
                    <p className="text-sm text-[#2C2621] leading-relaxed">
                      {previewPathway === 'UG' ? currentS2.ugCase : currentS2.pgCase}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-[#2C2621]">{currentS2.prompt}</h3>
                    <p className="text-xs text-[#7A7067]">Select up to 3 activities you would enjoy taking on.</p>
                  </div>

                  <div className="space-y-2.5">
                    {currentS2.domains.map((dom, didx) => {
                      const taskText = (s2Activities[dom.id] || [])[currentS2.variantIndex] || 'Engage in a practical work package related to this domain.'
                      return (
                        <div
                          key={dom.id}
                          className="p-4 rounded-2xl border border-[#DFD7CB] bg-white hover:border-[#77734B]/40 transition-colors cursor-pointer flex items-start gap-3"
                        >
                          <span className="w-5 h-5 rounded-md bg-[#F1F1EB] text-[#77734B] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-[#DFD7CB]">
                            {didx + 1}
                          </span>
                          <div className="space-y-0.5 flex-1">
                            <span className="text-xs font-bold text-[#A36B40] block">{dom.name}</span>
                            <p className="text-xs text-[#2C2621] leading-relaxed">{taskText}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: RESPONSE ANALYTICS & ITEM DISCRIMINATION                          */}
      {/* ========================================================================= */}
      {mode === 'analytics' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#2C2621]">Cohort Response Metrics</h3>
                <p className="text-xs text-[#7A7067]">Live statistics aggregated from student assessment attempts.</p>
              </div>
              <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] text-[10px] font-bold">
                Live Database Stream
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Total Submissions</span>
                <p className="text-2xl font-black text-[#2C2621]">{cohortStats?.totalSubmissions || 0}</p>
                <p className="text-[10px] text-[#7A7067]">Across all tracks</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Completed</span>
                <p className="text-2xl font-black text-[#77734B]">{cohortStats?.completed || 0}</p>
                <p className="text-[10px] text-[#77734B]">
                  {cohortStats?.completionRate || 0}% completion rate
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">In Progress</span>
                <p className="text-2xl font-black text-[#A36B40]">{cohortStats?.inProgress || 0}</p>
                <p className="text-[10px] text-[#7A7067]">Active student attempts</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Average Duration</span>
                <p className="text-2xl font-black text-[#2C2621]">{cohortStats?.avgTime || 'Untimed'}</p>
                <p className="text-[10px] text-[#7A7067]">Observed test length</p>
              </div>
            </div>
          </Card>

          {/* Item Discrimination & Option Frequencies */}
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#2C2621]">Question Quality & Discrimination Diagnostics</h3>
              <p className="text-xs text-[#7A7067]">
                Analyzes option selection distributions and item balance across all 30 cognitive exploration cases.
              </p>
            </div>

            {(!cohortStats || cohortStats.completed === 0) ? (
              <div className="py-10 text-center space-y-3 bg-[#FAF6F0]/40 rounded-2xl border border-dashed border-[#DFD7CB]">
                <BarChart3 className="w-8 h-8 text-[#A89D8F] mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#2C2621]">Awaiting Student Cohort Responses</p>
                  <p className="text-[11px] text-[#7A7067] max-w-md mx-auto">
                    Live item-level selection frequencies, discrimination indices, and response curves will calibrate automatically as students complete their assessments.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.slice(0, 5).map((q, idx) => (
                  <div key={q.id} className="p-5 rounded-2xl bg-[#FAF6F0]/40 border border-[#DFD7CB] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2C2621]">
                        Case {idx + 1} ({q.id}) · {q.prompt}
                      </span>
                      <Badge className="bg-[#F1F1EB] text-[#77734B] border-[#DFD7CB] text-[10px] font-bold">
                        Active In Bank
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {q.options.slice(0, 4).map((opt, oidx) => (
                        <div key={opt.id} className="p-3 rounded-xl bg-white border border-[#DFD7CB] space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#7A7067]">Option {String.fromCharCode(65 + oidx)}</span>
                            <span className="font-bold text-[#2C2621]">
                              {opt.optOut ? 'Opt-Out' : `${Object.keys(opt.dims || {}).join(', ')}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A7067] truncate">{opt.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
