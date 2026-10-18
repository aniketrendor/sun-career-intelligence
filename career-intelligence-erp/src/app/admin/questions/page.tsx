'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Filter, Download, Sparkles, CheckCircle2,
  AlertCircle, ChevronRight, Layers, Tag, BookOpen, Edit2, Trash2, X,
  Building2, Briefcase, Eye, Sliders, Check, Copy, ArrowRight,
  HelpCircle, RefreshCw, Compass, FileText, ChevronDown
} from 'lucide-react'
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

type ActiveStageTab = 'stage1' | 'stage2'
type Stage2SubTab = 'domains' | 'contexts' | 'preview'

export default function AdminQuestionBankPage() {
  // Main Stage Tab
  const [activeStage, setActiveStage] = useState<ActiveStageTab>('stage1')

  // =========================================================================
  // STAGE 1 STATE (30 Broad Cognitive Profile Cases)
  // =========================================================================
  const [stage1Questions, setStage1Questions] = useState<Stage1Question[]>(STAGE1)
  const [s1SearchQuery, setS1SearchQuery] = useState('')
  const [s1SelectedDim, setS1SelectedDim] = useState<string>('all')
  const [s1SelectedLevel, setS1SelectedLevel] = useState<string>('all')
  const [s1ActiveModal, setS1ActiveModal] = useState<Stage1Question | null>(null)
  const [s1IsEditing, setS1IsEditing] = useState(false)

  // =========================================================================
  // STAGE 2 STATE (Targeted Work Simulations & 79 Domain Activities)
  // =========================================================================
  const [s2SubTab, setS2SubTab] = useState<Stage2SubTab>('domains')
  const [s2Activities, setS2Activities] = useState<Record<string, string[]>>(STAGE2_ACTIVITIES)
  const [sectorContextsState, setSectorContextsState] = useState<Record<string, SectorContext[]>>(SECTOR_CONTEXTS)
  const [discoveryCasesState, setDiscoveryCasesState] = useState<DiscoveryCase[]>(DISCOVERY_CASES)

  // Stage 2 Domain Filter
  const [s2DomainSearch, setS2DomainSearch] = useState('')
  const [s2SelectedSector, setS2SelectedSector] = useState<string>('all')

  // Stage 2 Domain Activity Edit Modal
  const [editingDomain, setEditingDomain] = useState<{
    domain: CareerDomain
    tasks: string[]
  } | null>(null)

  // Stage 2 Sector Context Edit Modal
  const [editingSectorContext, setEditingSectorContext] = useState<{
    sector: string
    variantIndex: number
    context: SectorContext
  } | null>(null)

  // Stage 2 Discovery Case Edit Modal
  const [editingDiscoveryCase, setEditingDiscoveryCase] = useState<{
    index: number
    caseItem: DiscoveryCase
  } | null>(null)

  // Stage 2 Preview Simulator State
  const [previewPathway, setPreviewPathway] = useState<'UG' | 'PG'>('UG')
  const [previewSector, setPreviewSector] = useState<string>(SECTORS[0])
  const [previewVariant, setPreviewVariant] = useState<number>(0)
  const [previewSelectedOptions, setPreviewSelectedOptions] = useState<string[]>([])

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3200)
  }

  // =========================================================================
  // STAGE 1 FILTERING & HANDLERS
  // =========================================================================
  const filteredStage1 = useMemo(() => {
    const q = s1SearchQuery.toLowerCase().trim()
    return stage1Questions.filter((item) => {
      if (s1SelectedLevel !== 'all' && String(item.level) !== s1SelectedLevel) return false
      if (s1SelectedDim !== 'all') {
        const hasDim = item.options.some((o) => o.dims && o.dims[s1SelectedDim] !== undefined && o.dims[s1SelectedDim] > 0)
        if (!hasDim) return false
      }
      if (!q) return true
      const fullText = `${item.id} ${item.prompt} ${item.ugCase} ${item.pgCase} ${item.caseType}`.toLowerCase()
      return fullText.includes(q)
    })
  }, [stage1Questions, s1SearchQuery, s1SelectedDim, s1SelectedLevel])

  const handleSaveStage1Question = (updated: Stage1Question) => {
    setStage1Questions((prev) => {
      const idx = prev.findIndex((x) => x.id === updated.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = updated
        return copy
      }
      return [updated, ...prev]
    })
    setS1ActiveModal(null)
    triggerToast(`Question ${updated.id} saved successfully.`)
  }

  const handleDeleteStage1Question = (id: string) => {
    if (stage1Questions.length <= 1) {
      triggerToast('Assessment must contain at least one question.')
      return
    }
    if (!confirm(`Are you sure you want to delete question ${id}?`)) return
    setStage1Questions((prev) => prev.filter((q) => q.id !== id))
    triggerToast(`Question ${id} removed.`)
  }

  const handleExportStage1JSON = () => {
    const data = {
      title: 'Sandip University Stage 1 Career Assessment Question Bank',
      version: '2.0 Audited',
      stage: 'Stage 1 (Broad Profile Exploration)',
      exportedAt: new Date().toISOString(),
      dimensions: DIMENSIONS,
      questions: stage1Questions
    }
    downloadJSON(data, 'sun-stage1-question-bank.json')
    triggerToast('Stage 1 Question Bank exported.')
  }

  // =========================================================================
  // STAGE 2 FILTERING & HANDLERS
  // =========================================================================
  const filteredDomains = useMemo(() => {
    const q = s2DomainSearch.toLowerCase().trim()
    return DOMAINS.filter((d) => {
      if (s2SelectedSector !== 'all' && d.sector !== s2SelectedSector) return false
      if (!q) return true
      const fullText = `${d.id} ${d.name} ${d.sector} ${d.task}`.toLowerCase()
      return fullText.includes(q)
    })
  }, [s2DomainSearch, s2SelectedSector])

  const handleSaveDomainActivities = () => {
    if (!editingDomain) return
    setS2Activities((prev) => ({
      ...prev,
      [editingDomain.domain.id]: editingDomain.tasks
    }))
    setEditingDomain(null)
    triggerToast(`Task activities updated for ${editingDomain.domain.name}.`)
  }

  const handleSaveSectorContext = () => {
    if (!editingSectorContext) return
    const { sector, variantIndex, context } = editingSectorContext
    setSectorContextsState((prev) => {
      const copy = { ...prev }
      const list = [...(copy[sector] || [])]
      list[variantIndex] = context
      copy[sector] = list
      return copy
    })
    setEditingSectorContext(null)
    triggerToast(`Scenario context for ${sector} Variant ${variantIndex + 1} updated.`)
  }

  const handleSaveDiscoveryCase = () => {
    if (!editingDiscoveryCase) return
    const { index, caseItem } = editingDiscoveryCase
    setDiscoveryCasesState((prev) => {
      const copy = [...prev]
      copy[index] = caseItem
      return copy
    })
    setEditingDiscoveryCase(null)
    triggerToast(`Cross-field discovery case ${index + 1} updated.`)
  }

  const handleExportStage2JSON = () => {
    const data = {
      title: 'Sandip University Stage 2 Targeted Work Simulations & Domain Activity Bank',
      version: '2.0 Audited',
      stage: 'Stage 2 (Targeted Work Simulations)',
      exportedAt: new Date().toISOString(),
      totalDomains: DOMAINS.length,
      sectors: SECTORS,
      sectorContexts: sectorContextsState,
      discoveryCases: discoveryCasesState,
      promptMap: STAGE2_PROMPT_MAP,
      domainActivities: s2Activities
    }
    downloadJSON(data, 'sun-stage2-work-simulations-bank.json')
    triggerToast('Stage 2 Question Bank exported.')
  }

  const handleExportUnifiedBankJSON = () => {
    const data = {
      title: 'Sandip University Complete Dual-Stage Career Assessment Bank',
      version: '2.0 Audited',
      exportedAt: new Date().toISOString(),
      stage1: {
        totalQuestions: stage1Questions.length,
        dimensions: DIMENSIONS,
        questions: stage1Questions
      },
      stage2: {
        totalDomains: DOMAINS.length,
        sectors: SECTORS,
        sectorContexts: sectorContextsState,
        discoveryCases: discoveryCasesState,
        promptMap: STAGE2_PROMPT_MAP,
        domainActivities: s2Activities
      }
    }
    downloadJSON(data, 'sun-complete-dual-stage-question-bank.json')
    triggerToast('Complete unified assessment bank exported.')
  }

  function downloadJSON(data: any, filename: string) {
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C2621] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border border-[#DFD7CB]/40 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#A36B40]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Top Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] gap-1.5 font-bold text-xs px-3 py-1">
            <BookOpen className="w-3.5 h-3.5" /> Central Assessment Repository
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Master Assessment Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
            Full management console for both assessment stages: 30 dual-narrative cognitive profile scenarios and 79 sector-specific practical work simulation task banks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Button
            variant="outline"
            className="h-11 px-4 rounded-2xl border-[#DFD7CB] text-xs font-bold text-[#2C2621] hover:bg-[#FAF6F0]"
            onClick={handleExportUnifiedBankJSON}
          >
            <Download className="w-4 h-4 mr-1.5 text-[#A36B40]" /> Export Complete Bank (JSON)
          </Button>

          {activeStage === 'stage1' ? (
            <Button
              className="h-11 px-5 rounded-2xl bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
              onClick={() => {
                const newQ: Stage1Question = {
                  id: `S1Q${String(stage1Questions.length + 1).padStart(3, '0')}`,
                  level: 0,
                  levelName: 'Explore',
                  ugCase: 'Describe the real-life work scenario for Class 12 students...',
                  pgCase: 'Describe the real-life work scenario for Bachelor graduates...',
                  prompt: 'What would you prefer to do in this situation?',
                  caseType: 'General exploration',
                  responseLimit: 3,
                  instructions: 'Select up to three options that genuinely appeal to you.',
                  options: [
                    { id: `OPT_1`, text: 'Collect and verify facts before proceeding.', dims: { D01: 3, D07: 1 }, primaryDim: 'D01', secondaryDim: 'D07' },
                    { id: `OPT_2`, text: 'Experiment with a small trial approach.', dims: { D08: 3, D04: 1 }, primaryDim: 'D08', secondaryDim: 'D04' },
                    { id: OPT_OUT_ID, text: 'None of these options feels right for me at the moment.', dims: {}, optOut: true }
                  ]
                }
                setS1ActiveModal(newQ)
                setS1IsEditing(false)
              }}
            >
              <Plus className="w-4 h-4" /> Add Stage 1 Case
            </Button>
          ) : (
            <Button
              variant="outline"
              className="h-11 px-4 rounded-2xl border-[#DFD7CB] text-xs font-bold text-[#77734B] hover:bg-[#FAF6F0]"
              onClick={handleExportStage2JSON}
            >
              <Download className="w-4 h-4 mr-1.5" /> Export Stage 2 JSON
            </Button>
          )}
        </div>
      </div>

      {/* Primary Stage Tab Switcher */}
      <div className="bg-[#FAF6F0] p-1.5 rounded-2xl border border-[#DFD7CB] flex items-center gap-2">
        <button
          onClick={() => setActiveStage('stage1')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2.5 ${
            activeStage === 'stage1'
              ? 'bg-white text-[#2C2621] shadow-xs border border-[#DFD7CB]'
              : 'text-[#7A7067] hover:text-[#2C2621]'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeStage === 'stage1' ? 'text-[#A36B40]' : 'text-[#7A7067]'}`} />
          <span>Stage 1: Broad Profile Exploration</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB]">
            30 Cases · 20 Dimensions
          </span>
        </button>

        <button
          onClick={() => setActiveStage('stage2')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2.5 ${
            activeStage === 'stage2'
              ? 'bg-white text-[#2C2621] shadow-xs border border-[#DFD7CB]'
              : 'text-[#7A7067] hover:text-[#2C2621]'
          }`}
        >
          <Briefcase className={`w-4 h-4 ${activeStage === 'stage2' ? 'text-[#77734B]' : 'text-[#7A7067]'}`} />
          <span>Stage 2: Targeted Work Simulations</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6F0] text-[#77734B] border border-[#DFD7CB]">
            79 Domains · 237 Tasks
          </span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* STAGE 1 VIEW: BROAD PROFILE EXPLORATION (30 COGNITIVE CASES)          */}
      {/* ===================================================================== */}
      {activeStage === 'stage1' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Stage 1 KPI Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
              <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Total Scenarios</p>
              <p className="text-2xl font-black text-[#2C2621]">{stage1Questions.length}</p>
              <p className="text-[11px] text-[#77734B]">Across 5 exploration levels</p>
            </Card>

            <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
              <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Total Choice Options</p>
              <p className="text-2xl font-black text-[#2C2621]">
                {stage1Questions.reduce((acc, q) => acc + q.options.length, 0)}
              </p>
              <p className="text-[11px] text-[#7A7067]">~7 options per case</p>
            </Card>

            <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
              <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Dimensions Covered</p>
              <p className="text-2xl font-black text-[#A36B40]">20 / 20</p>
              <p className="text-[11px] text-[#77734B]">100% multidimensional</p>
            </Card>

            <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
              <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Dual Narratives</p>
              <p className="text-2xl font-black text-[#77734B]">60 Stories</p>
              <p className="text-[11px] text-[#7A7067]">30 Class 12 + 30 Graduate</p>
            </Card>
          </div>

          {/* Filter Toolbar */}
          <Card className="border-[#DFD7CB] bg-white rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#7A7067] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={s1SearchQuery}
                onChange={(e) => setS1SearchQuery(e.target.value)}
                placeholder="Search questions by ID, scenario text, prompt, or case type..."
                className="pl-10 h-10 rounded-xl border-[#DFD7CB] text-xs bg-[#FAF6F0]/40 focus:bg-white"
              />
            </div>

            <select
              value={s1SelectedDim}
              onChange={(e) => setS1SelectedDim(e.target.value)}
              className="w-full sm:w-60 h-10 px-3 rounded-xl border border-[#DFD7CB] bg-white text-xs font-medium text-[#2C2621] focus:outline-none"
            >
              <option value="all">All 20 Dimensions</option>
              {DIMENSIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.id} · {d.name}
                </option>
              ))}
            </select>

            <select
              value={s1SelectedLevel}
              onChange={(e) => setS1SelectedLevel(e.target.value)}
              className="w-full sm:w-48 h-10 px-3 rounded-xl border border-[#DFD7CB] bg-white text-xs font-medium text-[#2C2621] focus:outline-none"
            >
              <option value="all">All Levels (1–5)</option>
              <option value="0">Level 1 · Explore</option>
              <option value="1">Level 2 · Look for clues</option>
              <option value="2">Level 3 · Try ideas</option>
              <option value="3">Level 4 · Compare choices</option>
              <option value="4">Level 5 · Make a decision</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-bold border-[#DFD7CB] text-[#2C2621] shrink-0"
              onClick={handleExportStage1JSON}
            >
              <Download className="w-3.5 h-3.5 mr-1" /> Export JSON
            </Button>
          </Card>

          {/* Stage 1 Questions List */}
          <div className="space-y-4">
            {filteredStage1.map((q) => (
              <Card key={q.id} className="p-6 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-4 hover:border-[#A36B40]/40 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[#A36B40] bg-[#FAF6F0] border border-[#DFD7CB] px-2.5 py-0.5 rounded-md">
                      {q.id}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold text-[#77734B] border-[#DFD7CB] bg-[#F1F1EB]">
                      Level {q.level + 1} · {q.levelName}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold text-[#2C2621] border-[#DFD7CB]">
                      {q.caseType}
                    </Badge>
                    <span className="text-[10px] text-[#7A7067] font-semibold">
                      Max {q.responseLimit || 3} choices allowed
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-bold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
                      onClick={() => {
                        setS1ActiveModal(JSON.parse(JSON.stringify(q)))
                        setS1IsEditing(true)
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1 text-[#A36B40]" /> Edit Case
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs font-bold rounded-xl text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteStage1Question(q.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Dual Narratives Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#A36B40] uppercase tracking-wider">
                        UG Narrative (Class 12 Context)
                      </span>
                      <Badge className="bg-white text-[#A36B40] border-[#DFD7CB] text-[9px] font-bold px-1.5 py-0">
                        Class 12
                      </Badge>
                    </div>
                    <p className="text-xs text-[#2C2621] leading-relaxed">{q.ugCase}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F1F1EB] border border-[#DFD7CB] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#77734B] uppercase tracking-wider">
                        PG Narrative (Graduate Context)
                      </span>
                      <Badge className="bg-white text-[#77734B] border-[#DFD7CB] text-[9px] font-bold px-1.5 py-0">
                        Graduate
                      </Badge>
                    </div>
                    <p className="text-xs text-[#2C2621] leading-relaxed">{q.pgCase}</p>
                  </div>
                </div>

                <div className="bg-[#FAF6F0]/60 p-3 rounded-xl border border-[#DFD7CB]/60">
                  <p className="text-xs font-bold text-[#2C2621]">
                    <span className="text-[#A36B40] uppercase text-[10px] tracking-wider block font-black mb-0.5">Prompt Question</span>
                    {q.prompt}
                  </p>
                </div>

                {/* Options Strip */}
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7067]">
                    Options & Assigned Psychometric Dimension Weights ({q.options.length} options)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oidx) => {
                      const dims = Object.entries(opt.dims || {})
                      return (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-colors ${
                            opt.optOut
                              ? 'bg-amber-50/50 border-amber-200'
                              : 'bg-white border-[#DFD7CB]'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5 ${
                            opt.optOut
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB]'
                          }`}>
                            {opt.optOut ? 'X' : String.fromCharCode(65 + oidx)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#2C2621] leading-snug">{opt.text}</p>
                            {dims.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                                {dims.map(([k, v]) => (
                                  <span key={k} className="text-[10px] font-bold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] px-2 py-0.5 rounded-full">
                                    {k} +{v} ({DIMENSIONS.find(d => d.id === k)?.name || k})
                                  </span>
                                ))}
                              </div>
                            )}
                            {opt.optOut && (
                              <span className="text-[10px] font-bold text-amber-800 mt-1 inline-block">
                                Opt-out option (Clears other selections)
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 2 VIEW: TARGETED WORK SIMULATIONS & 79 DOMAIN ACTIVITIES         */}
      {/* ===================================================================== */}
      {activeStage === 'stage2' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Stage 2 Sub-Navigation Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-[#DFD7CB] shadow-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#7A7067] mr-1">Stage 2 Component:</span>
              <div className="p-1 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center gap-1">
                <Button
                  variant={s2SubTab === 'domains' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${s2SubTab === 'domains' ? 'bg-[#A36B40] text-white hover:bg-[#8E5B33]' : 'text-[#7A7067] hover:text-[#2C2621]'}`}
                  onClick={() => setS2SubTab('domains')}
                >
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" /> 79 Domain Activity Tasks ({DOMAINS.length})
                </Button>
                <Button
                  variant={s2SubTab === 'contexts' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${s2SubTab === 'contexts' ? 'bg-[#77734B] text-white hover:bg-[#63603E]' : 'text-[#7A7067] hover:text-[#2C2621]'}`}
                  onClick={() => setS2SubTab('contexts')}
                >
                  <Building2 className="w-3.5 h-3.5 mr-1.5" /> Sector Scenario Contexts (20 Cases)
                </Button>
                <Button
                  variant={s2SubTab === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${s2SubTab === 'preview' ? 'bg-[#2C2621] text-white hover:bg-[#1A1613]' : 'text-[#7A7067] hover:text-[#2C2621]'}`}
                  onClick={() => setS2SubTab('preview')}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> Student Simulation Preview
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs font-bold border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0]"
              onClick={handleExportStage2JSON}
            >
              <Download className="w-3.5 h-3.5 mr-1 text-[#77734B]" /> Export Stage 2 JSON
            </Button>
          </div>

          {/* Sub-Tab 1: 79 Domain Task Banks */}
          {s2SubTab === 'domains' && (
            <div className="space-y-6">
              {/* Stage 2 KPI Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Career Domains</p>
                  <p className="text-2xl font-black text-[#2C2621]">{DOMAINS.length}</p>
                  <p className="text-[11px] text-[#77734B]">CD001 through CD079</p>
                </Card>

                <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Task Activities</p>
                  <p className="text-2xl font-black text-[#2C2621]">{DOMAINS.length * 3}</p>
                  <p className="text-[11px] text-[#7A7067]">3 unique task variants each</p>
                </Card>

                <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Industry Sectors</p>
                  <p className="text-2xl font-black text-[#A36B40]">{SECTORS.length}</p>
                  <p className="text-[11px] text-[#77734B]">Comprehensive coverage</p>
                </Card>

                <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Linked Degree Programs</p>
                  <p className="text-2xl font-black text-[#77734B]">{PROGRAMS.length}</p>
                  <p className="text-[11px] text-[#7A7067]">SUN-001 to SUN-114</p>
                </Card>
              </div>

              {/* Filter & Search Bar */}
              <Card className="border-[#DFD7CB] bg-white rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-[#7A7067] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    value={s2DomainSearch}
                    onChange={(e) => setS2DomainSearch(e.target.value)}
                    placeholder="Search by domain ID (CD001), domain name, sector, or keywords..."
                    className="pl-10 h-10 rounded-xl border-[#DFD7CB] text-xs bg-[#FAF6F0]/40 focus:bg-white"
                  />
                </div>

                <select
                  value={s2SelectedSector}
                  onChange={(e) => setS2SelectedSector(e.target.value)}
                  className="w-full sm:w-72 h-10 px-3 rounded-xl border border-[#DFD7CB] bg-white text-xs font-medium text-[#2C2621] focus:outline-none"
                >
                  <option value="all">All 6 Industry Sectors</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Card>

              {/* Domains Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDomains.map((d) => {
                  const tasks = s2Activities[d.id] || [
                    'Variant 1 activity description...',
                    'Variant 2 activity description...',
                    'Variant 3 activity description...'
                  ]
                  const linkedProgramCount = d.programIds?.length || 0

                  return (
                    <Card key={d.id} className="p-5 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-4 hover:border-[#A36B40]/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-[#A36B40] bg-[#FAF6F0] border border-[#DFD7CB] px-2 py-0.5 rounded-md">
                              {d.id}
                            </span>
                            <Badge variant="outline" className="text-[10px] font-bold text-[#77734B] border-[#DFD7CB] bg-[#F1F1EB]">
                              {d.sector}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-semibold text-[#2C2621] border-[#DFD7CB]">
                              {linkedProgramCount} Programs
                            </Badge>
                          </div>
                          <h3 className="text-base font-extrabold text-[#2C2621] leading-snug">
                            {d.name}
                          </h3>
                          <p className="text-xs text-[#7A7067] line-clamp-1">{d.task}</p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-bold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] shrink-0"
                          onClick={() => setEditingDomain({ domain: d, tasks: [...tasks] })}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1 text-[#A36B40]" /> Edit Tasks
                        </Button>
                      </div>

                      {/* 3 Variants Preview Strip */}
                      <div className="space-y-2 pt-2 border-t border-[#DFD7CB]/70">
                        {tasks.map((taskText, tidx) => (
                          <div key={tidx} className="p-3 rounded-xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/60 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase text-[#A36B40]">
                                {tidx === 0 && 'Variant 1: Introductory Hands-on Exploration'}
                                {tidx === 1 && 'Variant 2: Diagnostic & Collaborative Problem'}
                                {tidx === 2 && 'Variant 3: Strategic Decision & Optimisation'}
                              </span>
                              <Badge className="bg-white text-[#7A7067] border-[#DFD7CB] text-[9px] font-bold px-1.5 py-0">
                                Case Var {tidx + 1}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#2C2621] leading-relaxed">{taskText}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Sector Scenario Contexts & Prompts (20 Cases) */}
          {s2SubTab === 'contexts' && (
            <div className="space-y-6">
              <div className="bg-[#FAF6F0] border border-[#DFD7CB] rounded-2xl p-4 text-xs text-[#7A7067] leading-relaxed">
                <span className="font-bold text-[#2C2621] block text-sm mb-1">
                  Stage 2 Simulation Structure: 18 Sector Cases + 2 Discovery Sprints
                </span>
                During Stage 2, each student encounters 3 simulation cases per sector covering practical work packages, followed by 2 cross-field exploratory challenge sprints. You can calibrate the narrative context, student prompts, and case types below.
              </div>

              {/* 6 Sectors */}
              <div className="space-y-6">
                {SECTORS.map((sectorName) => {
                  const variants = sectorContextsState[sectorName] || []
                  return (
                    <Card key={sectorName} className="p-6 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-5">
                      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#DFD7CB]">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-[#A36B40] uppercase tracking-wider">
                            Industry Sector Simulation Context
                          </span>
                          <h3 className="text-lg font-black text-[#2C2621]">{sectorName}</h3>
                        </div>
                        <Badge className="bg-[#FAF6F0] text-[#77734B] border-[#DFD7CB] text-xs font-bold px-3 py-1">
                          3 Progressive Case Variants
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {variants.map((ctx, vidx) => (
                          <div key={vidx} className="p-4 rounded-2xl bg-[#FAF6F0]/50 border border-[#DFD7CB] space-y-3 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge className="bg-[#A36B40] text-white border-0 text-[10px] font-bold">
                                  Variant {vidx + 1}
                                </Badge>
                                <span className="text-xs font-bold text-[#2C2621]">{ctx.caseType}</span>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-[#A36B40] uppercase">UG Scenario</span>
                                <p className="text-xs text-[#2C2621] leading-relaxed line-clamp-3">{ctx.ug}</p>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[9px] font-black text-[#77734B] uppercase">PG Scenario</span>
                                <p className="text-xs text-[#2C2621] leading-relaxed line-clamp-3">{ctx.pg}</p>
                              </div>

                              <div className="bg-white p-2.5 rounded-xl border border-[#DFD7CB]">
                                <span className="text-[9px] font-black text-[#7A7067] uppercase block">Prompt</span>
                                <p className="text-xs font-bold text-[#2C2621]">{ctx.prompt}</p>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs font-bold border-[#DFD7CB] text-[#2C2621] hover:bg-white mt-2"
                              onClick={() => setEditingSectorContext({
                                sector: sectorName,
                                variantIndex: vidx,
                                context: { ...ctx }
                              })}
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1 text-[#A36B40]" /> Edit Scenario
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* Cross-Disciplinary Discovery Sprints (2 cases) */}
              <Card className="p-6 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#DFD7CB]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-[#77734B] uppercase tracking-wider">
                      Discovery Cases (Breadth Calibration)
                    </span>
                    <h3 className="text-lg font-black text-[#2C2621]">Cross-Field Exploration Sprints</h3>
                  </div>
                  <Badge className="bg-[#FAF6F0] text-[#77734B] border-[#DFD7CB] text-xs font-bold px-3 py-1">
                    2 Cross-Sector Discovery Cases
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {discoveryCasesState.map((dc, didx) => (
                    <div key={didx} className="p-4 rounded-2xl bg-[#F1F1EB]/50 border border-[#DFD7CB] space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-[#77734B] text-white border-0 text-[10px] font-bold">
                            Discovery Sprint {didx + 1}
                          </Badge>
                          <span className="text-xs font-bold text-[#2C2621]">{dc.caseType}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-[#A36B40] uppercase">UG Scenario</span>
                          <p className="text-xs text-[#2C2621] leading-relaxed">{dc.ug}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-[#77734B] uppercase">PG Scenario</span>
                          <p className="text-xs text-[#2C2621] leading-relaxed">{dc.pg}</p>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-[#DFD7CB]">
                          <span className="text-[9px] font-black text-[#7A7067] uppercase block">Prompt</span>
                          <p className="text-xs font-bold text-[#2C2621]">{dc.prompt}</p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs font-bold border-[#DFD7CB] text-[#2C2621] hover:bg-white mt-2"
                        onClick={() => setEditingDiscoveryCase({
                          index: didx,
                          caseItem: { ...dc }
                        })}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1 text-[#77734B]" /> Edit Discovery Case
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Sub-Tab 3: Interactive Student Simulation Preview */}
          {s2SubTab === 'preview' && (
            <div className="space-y-6">
              {/* Simulator Controls */}
              <Card className="p-5 border-[#DFD7CB] bg-white rounded-3xl shadow-xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-extrabold text-[#2C2621]">Live Student Simulation Sandbox</h3>
                    <p className="text-xs text-[#7A7067]">
                      Test how Stage 2 work simulation items render for students under various qualification levels and sectors.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#7A7067] hover:text-[#2C2621]"
                      onClick={() => setPreviewSelectedOptions([])}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Selection
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#DFD7CB]">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#7A7067] uppercase">Student Pathway</label>
                    <div className="flex rounded-xl bg-[#FAF6F0] p-1 border border-[#DFD7CB]">
                      <button
                        onClick={() => setPreviewPathway('UG')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          previewPathway === 'UG' ? 'bg-[#A36B40] text-white shadow-xs' : 'text-[#7A7067]'
                        }`}
                      >
                        Undergraduate (UG)
                      </button>
                      <button
                        onClick={() => setPreviewPathway('PG')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          previewPathway === 'PG' ? 'bg-[#77734B] text-white shadow-xs' : 'text-[#7A7067]'
                        }`}
                      >
                        Postgraduate (PG)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#7A7067] uppercase">Simulation Sector</label>
                    <select
                      value={previewSector}
                      onChange={(e) => {
                        setPreviewSector(e.target.value)
                        setPreviewSelectedOptions([])
                      }}
                      className="w-full h-10 px-3 rounded-xl border border-[#DFD7CB] bg-white text-xs font-semibold text-[#2C2621]"
                    >
                      {SECTORS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#7A7067] uppercase">Scenario Variant</label>
                    <div className="flex rounded-xl bg-[#FAF6F0] p-1 border border-[#DFD7CB]">
                      {[0, 1, 2].map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            setPreviewVariant(v)
                            setPreviewSelectedOptions([])
                          }}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            previewVariant === v ? 'bg-[#2C2621] text-white shadow-xs' : 'text-[#7A7067]'
                          }`}
                        >
                          Variant {v + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Rendered Live Simulation Card */}
              {(() => {
                const sectorCtx = (sectorContextsState[previewSector] || [])[previewVariant] || {
                  ug: 'A team is comparing several project tasks across this field.',
                  pg: 'A team is comparing specialist work packages across this field.',
                  prompt: 'Which tasks would you choose to explore?',
                  caseType: 'Career task sampler'
                }
                const sectorDomains = DOMAINS.filter((d) => d.sector === previewSector).slice(0, 6)

                const toggleOption = (id: string) => {
                  if (id === OPT_OUT_ID) {
                    setPreviewSelectedOptions([OPT_OUT_ID])
                    return
                  }
                  if (previewSelectedOptions.includes(OPT_OUT_ID)) {
                    setPreviewSelectedOptions([id])
                    return
                  }
                  if (previewSelectedOptions.includes(id)) {
                    setPreviewSelectedOptions(previewSelectedOptions.filter((x) => x !== id))
                  } else {
                    if (previewSelectedOptions.length >= 3) {
                      triggerToast('Maximum 3 activities can be selected.')
                      return
                    }
                    setPreviewSelectedOptions([...previewSelectedOptions, id])
                  }
                }

                return (
                  <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-md p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
                    {/* Header Pill */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-[#DFD7CB]">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] font-bold text-xs px-3 py-1">
                          Stage 2 Work Simulation
                        </Badge>
                        <span className="text-xs font-bold text-[#7A7067]">
                          {previewSector} · {sectorCtx.caseType}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs font-semibold text-[#2C2621] border-[#DFD7CB]">
                        {previewPathway} Student View
                      </Badge>
                    </div>

                    {/* Scenario Brief Box */}
                    <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#A36B40]">
                          Workplace Simulation Brief
                        </span>
                      </div>
                      <p className="text-sm text-[#2C2621] leading-relaxed font-medium">
                        {previewPathway === 'UG' ? sectorCtx.ug : sectorCtx.pg}
                      </p>
                    </div>

                    {/* Question Prompt */}
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-[#2C2621]">{sectorCtx.prompt}</h4>
                      <div className="flex items-center justify-between text-xs text-[#7A7067]">
                        <span>Select up to 3 options you would genuinely choose in this situation.</span>
                        <span className="font-bold text-[#A36B40]">
                          {previewSelectedOptions.length} of 3 selected
                        </span>
                      </div>
                    </div>

                    {/* Selectable Domain Activities */}
                    <div className="space-y-3">
                      {sectorDomains.map((d, didx) => {
                        const taskText = (s2Activities[d.id] || [])[previewVariant] || 'Engage in a practical work package related to this domain.'
                        const isSelected = previewSelectedOptions.includes(d.id)

                        return (
                          <div
                            key={d.id}
                            onClick={() => toggleOption(d.id)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                              isSelected
                                ? 'bg-[#FAF6F0] border-[#A36B40] shadow-xs'
                                : 'bg-white border-[#DFD7CB] hover:border-[#A36B40]/40'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                              isSelected
                                ? 'bg-[#A36B40] text-white'
                                : 'bg-[#FAF6F0] text-[#7A7067] border border-[#DFD7CB]'
                            }`}>
                              {isSelected ? <Check className="w-3.5 h-3.5" /> : didx + 1}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-[#A36B40]">{d.name}</span>
                                <span className="text-[10px] text-[#7A7067] font-mono">{d.id}</span>
                              </div>
                              <p className="text-xs text-[#2C2621] leading-relaxed">{taskText}</p>
                            </div>
                          </div>
                        )
                      })}

                      {/* Opt Out Option */}
                      <div
                        onClick={() => toggleOption(OPT_OUT_ID)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          previewSelectedOptions.includes(OPT_OUT_ID)
                            ? 'bg-amber-50 border-amber-300 shadow-xs'
                            : 'bg-white border-[#DFD7CB] hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                          previewSelectedOptions.includes(OPT_OUT_ID)
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          X
                        </div>
                        <span className="text-xs text-slate-600 font-medium">
                          None of these activities interest me right now.
                        </span>
                      </div>
                    </div>
                  </Card>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: STAGE 1 CASE EDITOR                                          */}
      {/* ===================================================================== */}
      {s1ActiveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto border-[#DFD7CB]">
            <div className="flex items-center justify-between border-b border-[#DFD7CB] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#2C2621]">
                  {s1IsEditing ? `Edit Stage 1 Case · ${s1ActiveModal.id}` : 'Create New Stage 1 Case'}
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Configure dual UG/PG scenario narratives, question prompt, and multi-dimensional scoring weights.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setS1ActiveModal(null)} className="rounded-xl">
                <X className="w-5 h-5 text-[#7A7067]" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C2621]">Case ID</label>
                  <Input
                    value={s1ActiveModal.id}
                    onChange={(e) => setS1ActiveModal({ ...s1ActiveModal, id: e.target.value })}
                    className="h-10 text-xs rounded-xl border-[#DFD7CB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C2621]">Exploration Level</label>
                  <select
                    value={s1ActiveModal.level}
                    onChange={(e) => {
                      const lvl = Number(e.target.value)
                      const names = ['Explore', 'Look for clues', 'Try ideas', 'Compare choices', 'Make a thoughtful decision']
                      setS1ActiveModal({ ...s1ActiveModal, level: lvl, levelName: names[lvl] || 'Explore' })
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-[#DFD7CB] text-xs font-medium text-[#2C2621] bg-white"
                  >
                    <option value={0}>Level 1 · Explore</option>
                    <option value={1}>Level 2 · Look for clues</option>
                    <option value={2}>Level 3 · Try ideas</option>
                    <option value={3}>Level 4 · Compare choices</option>
                    <option value={4}>Level 5 · Make a decision</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C2621]">Case Type Tag</label>
                  <Input
                    value={s1ActiveModal.caseType}
                    onChange={(e) => setS1ActiveModal({ ...s1ActiveModal, caseType: e.target.value })}
                    className="h-10 text-xs rounded-xl border-[#DFD7CB]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A36B40] uppercase">UG Narrative Scenario (Class 12 Context)</label>
                <textarea
                  value={s1ActiveModal.ugCase}
                  onChange={(e) => setS1ActiveModal({ ...s1ActiveModal, ugCase: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-[#DFD7CB] text-xs font-medium focus:outline-none focus:border-[#A36B40]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#77734B] uppercase">PG Narrative Scenario (Graduate Context)</label>
                <textarea
                  value={s1ActiveModal.pgCase}
                  onChange={(e) => setS1ActiveModal({ ...s1ActiveModal, pgCase: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-[#DFD7CB] text-xs font-medium focus:outline-none focus:border-[#77734B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C2621]">Question Prompt</label>
                <Input
                  value={s1ActiveModal.prompt}
                  onChange={(e) => setS1ActiveModal({ ...s1ActiveModal, prompt: e.target.value })}
                  className="h-10 text-xs rounded-xl border-[#DFD7CB]"
                />
              </div>

              {/* Options & Dimension Weights Configurator */}
              <div className="space-y-2 pt-2 border-t border-[#DFD7CB]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#2C2621]">Choice Options & Scoring Weights</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 rounded-xl border-[#DFD7CB] text-[#A36B40]"
                    onClick={() => {
                      const newOpt: Stage1Option = {
                        id: `${s1ActiveModal.id}_O${s1ActiveModal.options.length + 1}`,
                        text: 'New choice option description',
                        dims: { D01: 3, D02: 1 },
                        primaryDim: 'D01',
                        secondaryDim: 'D02'
                      }
                      setS1ActiveModal({ ...s1ActiveModal, options: [...s1ActiveModal.options, newOpt] })
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Option
                  </Button>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {s1ActiveModal.options.map((opt, oidx) => (
                    <div key={opt.id} className="p-3 rounded-xl bg-[#FAF6F0]/60 border border-[#DFD7CB] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-[#A36B40]">
                          Option {oidx + 1} ({opt.id}) {opt.optOut && '· Opt-out'}
                        </span>
                        {!opt.optOut && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setS1ActiveModal({
                                ...s1ActiveModal,
                                options: s1ActiveModal.options.filter((_, idx) => idx !== oidx)
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
                          const updatedOpts = [...s1ActiveModal.options]
                          updatedOpts[oidx].text = e.target.value
                          setS1ActiveModal({ ...s1ActiveModal, options: updatedOpts })
                        }}
                        className="h-9 text-xs rounded-lg border-[#DFD7CB] bg-white"
                        placeholder="Option description"
                      />

                      {!opt.optOut && (
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="text-[10px] font-bold text-[#7A7067]">Primary (+3):</span>
                          <select
                            value={opt.primaryDim || 'D01'}
                            onChange={(e) => {
                              const updatedOpts = [...s1ActiveModal.options]
                              const pdim = e.target.value
                              updatedOpts[oidx].primaryDim = pdim
                              updatedOpts[oidx].dims = { ...updatedOpts[oidx].dims, [pdim]: 3 }
                              setS1ActiveModal({ ...s1ActiveModal, options: updatedOpts })
                            }}
                            className="h-7 px-2 rounded-md border border-[#DFD7CB] text-[11px] bg-white"
                          >
                            {DIMENSIONS.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.id} · {d.name}
                              </option>
                            ))}
                          </select>

                          <span className="text-[10px] font-bold text-[#7A7067] ml-2">Secondary (+1):</span>
                          <select
                            value={opt.secondaryDim || 'D02'}
                            onChange={(e) => {
                              const updatedOpts = [...s1ActiveModal.options]
                              const sdim = e.target.value
                              updatedOpts[oidx].secondaryDim = sdim
                              updatedOpts[oidx].dims = { ...updatedOpts[oidx].dims, [sdim]: 1 }
                              setS1ActiveModal({ ...s1ActiveModal, options: updatedOpts })
                            }}
                            className="h-7 px-2 rounded-md border border-[#DFD7CB] text-[11px] bg-white"
                          >
                            {DIMENSIONS.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.id} · {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#DFD7CB]">
              <Button variant="outline" size="sm" onClick={() => setS1ActiveModal(null)} className="h-10 rounded-xl border-[#DFD7CB]">
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-10 px-5 rounded-xl bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold"
                onClick={() => handleSaveStage1Question(s1ActiveModal)}
              >
                Save to Stage 1 Bank
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: STAGE 2 DOMAIN ACTIVITY TASKS EDITOR                         */}
      {/* ===================================================================== */}
      {editingDomain && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto border-[#DFD7CB]">
            <div className="flex items-center justify-between border-b border-[#DFD7CB] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#A36B40] bg-[#FAF6F0] border border-[#DFD7CB] px-2 py-0.5 rounded-md">
                    {editingDomain.domain.id}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold text-[#77734B] border-[#DFD7CB]">
                    {editingDomain.domain.sector}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-[#2C2621] mt-1">
                  Edit Task Activities · {editingDomain.domain.name}
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Configure the 3 hands-on simulation task statements presented to students in Stage 2.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditingDomain(null)} className="rounded-xl">
                <X className="w-5 h-5 text-[#7A7067]" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Variant 1 */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#A36B40] uppercase tracking-wider">
                    Variant 1: Foundational / Hands-on Exploration
                  </span>
                  <Badge className="bg-white text-[#A36B40] border-[#DFD7CB] text-[9px] font-bold">
                    Introductory
                  </Badge>
                </div>
                <textarea
                  value={editingDomain.tasks[0] || ''}
                  onChange={(e) => {
                    const copy = [...editingDomain.tasks]
                    copy[0] = e.target.value
                    setEditingDomain({ ...editingDomain, tasks: copy })
                  }}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#DFD7CB] text-xs font-medium bg-white focus:outline-none focus:border-[#A36B40]"
                />
              </div>

              {/* Variant 2 */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-[#F1F1EB] border border-[#DFD7CB]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#77734B] uppercase tracking-wider">
                    Variant 2: Diagnostic & Collaborative Problem Solving
                  </span>
                  <Badge className="bg-white text-[#77734B] border-[#DFD7CB] text-[9px] font-bold">
                    Investigative
                  </Badge>
                </div>
                <textarea
                  value={editingDomain.tasks[1] || ''}
                  onChange={(e) => {
                    const copy = [...editingDomain.tasks]
                    copy[1] = e.target.value
                    setEditingDomain({ ...editingDomain, tasks: copy })
                  }}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#DFD7CB] text-xs font-medium bg-white focus:outline-none focus:border-[#77734B]"
                />
              </div>

              {/* Variant 3 */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#2C2621] uppercase tracking-wider">
                    Variant 3: Strategic Evaluation, Governance & Optimisation
                  </span>
                  <Badge className="bg-white text-[#2C2621] border-[#DFD7CB] text-[9px] font-bold">
                    Strategic
                  </Badge>
                </div>
                <textarea
                  value={editingDomain.tasks[2] || ''}
                  onChange={(e) => {
                    const copy = [...editingDomain.tasks]
                    copy[2] = e.target.value
                    setEditingDomain({ ...editingDomain, tasks: copy })
                  }}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#DFD7CB] text-xs font-medium bg-white focus:outline-none focus:border-[#2C2621]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#DFD7CB]">
              <Button variant="outline" size="sm" onClick={() => setEditingDomain(null)} className="h-10 rounded-xl border-[#DFD7CB]">
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-10 px-5 rounded-xl bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold"
                onClick={handleSaveDomainActivities}
              >
                Save Domain Tasks
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: SECTOR SCENARIO CONTEXT EDITOR                               */}
      {/* ===================================================================== */}
      {editingSectorContext && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto border-[#DFD7CB]">
            <div className="flex items-center justify-between border-b border-[#DFD7CB] pb-4">
              <div>
                <span className="text-xs font-bold text-[#A36B40] uppercase">
                  {editingSectorContext.sector} · Variant {editingSectorContext.variantIndex + 1}
                </span>
                <h3 className="text-lg font-bold text-[#2C2621]">Edit Sector Simulation Scenario</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditingSectorContext(null)} className="rounded-xl">
                <X className="w-5 h-5 text-[#7A7067]" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C2621]">Case Type Label</label>
                <Input
                  value={editingSectorContext.context.caseType}
                  onChange={(e) => setEditingSectorContext({
                    ...editingSectorContext,
                    context: { ...editingSectorContext.context, caseType: e.target.value }
                  })}
                  className="h-10 text-xs rounded-xl border-[#DFD7CB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A36B40] uppercase">UG Scenario Narrative (Class 12)</label>
                <textarea
                  value={editingSectorContext.context.ug}
                  onChange={(e) => setEditingSectorContext({
                    ...editingSectorContext,
                    context: { ...editingSectorContext.context, ug: e.target.value }
                  })}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#DFD7CB] text-xs font-medium focus:outline-none focus:border-[#A36B40]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#77734B] uppercase">PG Scenario Narrative (Graduate)</label>
                <textarea
                  value={editingSectorContext.context.pg}
                  onChange={(e) => setEditingSectorContext({
                    ...editingSectorContext,
                    context: { ...editingSectorContext.context, pg: e.target.value }
                  })}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#DFD7CB] text-xs font-medium focus:outline-none focus:border-[#77734B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C2621]">Question Prompt</label>
                <Input
                  value={editingSectorContext.context.prompt}
                  onChange={(e) => setEditingSectorContext({
                    ...editingSectorContext,
                    context: { ...editingSectorContext.context, prompt: e.target.value }
                  })}
                  className="h-10 text-xs rounded-xl border-[#DFD7CB]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#DFD7CB]">
              <Button variant="outline" size="sm" onClick={() => setEditingSectorContext(null)} className="h-10 rounded-xl border-[#DFD7CB]">
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-10 px-5 rounded-xl bg-[#77734B] hover:bg-[#63603E] text-white font-bold"
                onClick={handleSaveSectorContext}
              >
                Save Sector Scenario
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: DISCOVERY SPRINT CASE EDITOR                                 */}
      {/* ===================================================================== */}
      {editingDiscoveryCase && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto border-[#DFD7CB]">
            <div className="flex items-center justify-between border-b border-[#DFD7CB] pb-4">
              <div>
                <span className="text-xs font-bold text-[#77734B] uppercase">
                  Discovery Case {editingDiscoveryCase.index + 1}
                </span>
                <h3 className="text-lg font-bold text-[#2C2621]">Edit Cross-Field Discovery Sprint</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditingDiscoveryCase(null)} className="rounded-xl">
                <X className="w-5 h-5 text-[#7A7067]" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C2621]">Case Type Label</label>
                <Input
                  value={editingDiscoveryCase.caseItem.caseType}
                  onChange={(e) => setEditingDiscoveryCase({
                    ...editingDiscoveryCase,
                    caseItem: { ...editingDiscoveryCase.caseItem, caseType: e.target.value }
                  })}
                  className="h-10 text-xs rounded-xl border-[#DFD7CB]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#A36B40] uppercase">UG Scenario Narrative (Class 12)</label>
                <textarea
                  value={editingDiscoveryCase.caseItem.ug}
                  onChange={(e) => setEditingDiscoveryCase({
                    ...editingDiscoveryCase,
                    caseItem: { ...editingDiscoveryCase.caseItem, ug: e.target.value }
                  })}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#DFD7CB] text-xs font-medium focus:outline-none focus:border-[#A36B40]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#77734B] uppercase">PG Scenario Narrative (Graduate)</label>
                <textarea
                  value={editingDiscoveryCase.caseItem.pg}
                  onChange={(e) => setEditingDiscoveryCase({
                    ...editingDiscoveryCase,
                    caseItem: { ...editingDiscoveryCase.caseItem, pg: e.target.value }
                  })}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-[#DFD7CB] text-xs font-medium focus:outline-none focus:border-[#77734B]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C2621]">Question Prompt</label>
                <Input
                  value={editingDiscoveryCase.caseItem.prompt}
                  onChange={(e) => setEditingDiscoveryCase({
                    ...editingDiscoveryCase,
                    caseItem: { ...editingDiscoveryCase.caseItem, prompt: e.target.value }
                  })}
                  className="h-10 text-xs rounded-xl border-[#DFD7CB]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#DFD7CB]">
              <Button variant="outline" size="sm" onClick={() => setEditingDiscoveryCase(null)} className="h-10 rounded-xl border-[#DFD7CB]">
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-10 px-5 rounded-xl bg-[#77734B] hover:bg-[#63603E] text-white font-bold"
                onClick={handleSaveDiscoveryCase}
              >
                Save Discovery Case
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
