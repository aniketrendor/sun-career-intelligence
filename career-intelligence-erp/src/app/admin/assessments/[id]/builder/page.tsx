'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Sparkles, Plus, Layers, Clock, CheckCircle2,
  AlertCircle, ArrowRight, ArrowLeft, Copy, Edit3, BarChart3, Eye, FileText,
  Trash2, GripVertical, Check, RefreshCw, Smartphone, Tablet, Monitor,
  Sliders, ShieldCheck, ChevronDown, ChevronRight, X, Info
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
  Stage1Question,
  Stage1Option,
  OPT_OUT_ID
} from '@/lib/data/su-career-data'
import {
  computeDimensionProfile,
  scoreAllDomains
} from '@/lib/services/career-scoring-engine'

export default function AssessmentBuilderPage() {
  // Assessment metadata
  const [assessmentName, setAssessmentName] = useState('SUN Two-Stage Career Exploration Assessment')
  const [versionNumber, setVersionNumber] = useState('1.0')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED')
  const [questions, setQuestions] = useState<Stage1Question[]>(STAGE1)
  const [selectedQIndex, setSelectedQIndex] = useState(0)
  const [activeScenarioTab, setActiveScenarioTab] = useState<'ug' | 'pg'>('ug')

  // Builder vs Preview vs Analytics Mode
  const [mode, setMode] = useState<'builder' | 'preview' | 'analytics'>('builder')
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [previewPathway, setPreviewPathway] = useState<'UG' | 'PG'>('UG')
  const [previewSelectedOptions, setPreviewSelectedOptions] = useState<Record<string, string[]>>({})

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active question currently focused in canvas & inspector
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

  // Add Question
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
    showToast('New question created and selected.')
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

  // Update current question helper
  const updateCurrentQuestion = (fields: Partial<Stage1Question>) => {
    setQuestions((prev) => {
      const copy = [...prev]
      copy[selectedQIndex] = { ...copy[selectedQIndex], ...fields }
      return copy
    })
  }

  // Quality Linter Rules Engine
  const linterIssues = useMemo(() => {
    const issues: Array<{ id: string; type: 'error' | 'warning' | 'info'; message: string }> = []

    questions.forEach((q, qidx) => {
      // 1. Check unweighted substantive options
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

      // 2. Point imbalance
      const totalPoints = nonOptOut.map((o) => Object.values(o.dims || {}).reduce((a, b) => a + b, 0))
      const maxPts = Math.max(0, ...totalPoints)
      const minPts = Math.min(...totalPoints)
      if (maxPts - minPts >= 4) {
        issues.push({
          id: `${q.id}-pts-imbalance`,
          type: 'warning',
          message: `Question ${q.id} has significant point discrepancy across options (Max ${maxPts} vs Min ${minPts}).`
        })
      }
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
    showToast(`🎉 Assessment V${nextVer} successfully published! Immutable snapshot created.`)
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] font-sans pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12243A] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-3">
          <Info className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Builder Navigation Bar */}
      <header className="border-b border-[#DFE6EF] bg-white sticky top-0 z-40">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/assessments">
              <Button variant="ghost" size="sm" className="h-9 px-2 text-[#42536A] rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-1" /> Assessments
              </Button>
            </Link>
            <div className="h-4 w-px bg-[#DFE6EF]" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-[#12243A] truncate max-w-sm sm:max-w-md">
                  {assessmentName}
                </h1>
                <Badge className="bg-[#EDF2FF] text-[#2858D8] border-[#CBD7F3] text-[10px] font-extrabold">
                  V{versionNumber}
                </Badge>
                <Badge
                  className={`text-[9px] font-black ${
                    status === 'PUBLISHED'
                      ? 'bg-[#E8F7EF] text-[#147A52] border-[#CCEBD9]'
                      : 'bg-[#FFF5DF] text-[#8B530C] border-[#F3E0B4]'
                  }`}
                >
                  {status}
                </Badge>
              </div>
              <p className="text-[10px] text-[#617187]">
                Google Forms + Psychometric Engine · {questions.length} Questions Configured
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Tabs */}
            <div className="p-1 rounded-xl bg-[#F0F3F8] flex items-center gap-1">
              <Button
                variant={mode === 'builder' ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 text-xs font-bold rounded-lg ${mode === 'builder' ? 'bg-white text-[#12243A] shadow-sm' : 'text-[#617187]'}`}
                onClick={() => setMode('builder')}
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" /> Canvas
              </Button>
              <Button
                variant={mode === 'preview' ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 text-xs font-bold rounded-lg ${mode === 'preview' ? 'bg-white text-[#12243A] shadow-sm' : 'text-[#617187]'}`}
                onClick={() => setMode('preview')}
              >
                <Eye className="w-3.5 h-3.5 mr-1" /> Multi-Device Preview
              </Button>
              <Button
                variant={mode === 'analytics' ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 text-xs font-bold rounded-lg ${mode === 'analytics' ? 'bg-white text-[#12243A] shadow-sm' : 'text-[#617187]'}`}
                onClick={() => setMode('analytics')}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1" /> Response Analytics
              </Button>
            </div>

            {/* Publish Button */}
            <Button
              className="h-9 px-4 rounded-xl bg-[#2858D8] hover:bg-[#1F45AD] text-white font-bold text-xs shadow-sm cursor-pointer"
              onClick={handlePublish}
            >
              Publish V{(parseFloat(versionNumber) + 0.1).toFixed(1)} Snapshot
            </Button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MODE 1: 3-PANE ASSESSMENT BUILDER */}
      {/* ========================================================================= */}
      {mode === 'builder' && (
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 pt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* PANE 1: Left Outline & Question Tree (3 cols) */}
          <Card className="lg:col-span-3 border-[#DFE6EF] bg-white rounded-3xl p-5 shadow-sm space-y-4 lg:sticky lg:top-20 max-h-[85vh] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#12243A]">Questions Outline</h3>
                  <p className="text-[11px] text-[#617187]">{questions.length} questions in 5 levels</p>
                </div>
                <Button
                  size="sm"
                  className="h-8 text-xs font-bold bg-[#2858D8] text-white rounded-xl"
                  onClick={handleAddQuestion}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {/* Scrollable Questions List */}
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                {questions.map((q, qidx) => {
                  const isSelected = qidx === selectedQIndex
                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQIndex(qidx)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-[#2858D8] bg-[#F3F6FF] ring-2 ring-[#2858D8]/20'
                          : 'border-[#DFE6EF] bg-white hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-black text-[#597090] shrink-0">{q.id}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#12243A] truncate">{q.prompt}</p>
                          <span className="text-[10px] text-[#617187]">{q.caseType}</span>
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
                          className="w-5 h-5 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 text-xs font-bold"
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
                          className="w-5 h-5 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 text-xs font-bold"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quality Linter Summary Badge */}
            <div className="pt-2 border-t border-[#DFE6EF]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#40516A]">Linter Status:</span>
                {linterIssues.length === 0 ? (
                  <Badge className="bg-[#E8F7EF] text-[#147A52] border-[#CCEBD9] text-[10px]">
                    ✓ 0 Warnings
                  </Badge>
                ) : (
                  <Badge className="bg-[#FFF5DF] text-[#8B530C] border-[#F3E0B4] text-[10px]">
                    {linterIssues.length} Quality Notice{linterIssues.length === 1 ? '' : 's'}
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {/* PANE 2: Center Live Question Canvas (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="p-6 sm:p-8 border-[#DFE6EF] bg-white rounded-3xl shadow-sm space-y-6">
              {/* Question Meta Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#12243A] bg-[#EDF2FF] px-2.5 py-0.5 rounded-md">
                    {currentQ.id}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-bold text-[#617187]">
                    Level {currentQ.level + 1} · {currentQ.levelName}
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
                  <label className="text-xs font-bold text-[#40516A]">Real-World Scenario Narrative</label>
                  <div className="flex items-center gap-1 bg-[#F0F3F8] p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setActiveScenarioTab('ug')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                        activeScenarioTab === 'ug' ? 'bg-white text-[#2858D8] shadow-sm' : 'text-[#617187]'
                      }`}
                    >
                      Class 12 / UG
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveScenarioTab('pg')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                        activeScenarioTab === 'pg' ? 'bg-white text-[#2858D8] shadow-sm' : 'text-[#617187]'
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
                    placeholder="Describe the scenario in a high-school / Class 12 context..."
                    className="w-full p-3.5 rounded-2xl border border-[#CBD5E1] text-xs font-medium focus:ring-2 focus:ring-[#2858D8] focus:outline-none"
                  />
                ) : (
                  <textarea
                    value={currentQ.pgCase}
                    onChange={(e) => updateCurrentQuestion({ pgCase: e.target.value })}
                    rows={3}
                    placeholder="Describe the scenario in a college / workplace graduate context..."
                    className="w-full p-3.5 rounded-2xl border border-[#CBD5E1] text-xs font-medium focus:ring-2 focus:ring-[#2858D8] focus:outline-none"
                  />
                )}
              </div>

              {/* Question Prompt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#40516A]">Question Prompt</label>
                <Input
                  value={currentQ.prompt}
                  onChange={(e) => updateCurrentQuestion({ prompt: e.target.value })}
                  placeholder="e.g. Which role would you choose to help your team?"
                  className="h-11 rounded-xl text-xs font-semibold text-[#12243A]"
                />
              </div>

              {/* Options & Scoring Canvas */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#40516A]">Choice Options & Attached Weights</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-bold rounded-xl"
                    onClick={() => {
                      const newOpt: Stage1Option = {
                        id: `${currentQ.id}_O${currentQ.options.length + 1}`,
                        text: 'New option response...',
                        dims: { D01: 3, D02: 1 },
                        primaryDim: 'D01',
                        secondaryDim: 'D02'
                      }
                      updateCurrentQuestion({ options: [...currentQ.options, newOpt] })
                    }}
                  >
                    + Add Option
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {currentQ.options.map((opt, oidx) => {
                    const isOptOut = !!opt.optOut
                    const letter = isOptOut ? 'X' : String.fromCharCode(65 + oidx)
                    const dims = Object.entries(opt.dims || {})

                    return (
                      <div
                        key={opt.id}
                        className="p-4 rounded-2xl border border-[#DFE6EF] bg-[#F8FAFC] space-y-2.5 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-[#EEF2F8] text-[#42546C] text-xs font-black flex items-center justify-center">
                              {letter}
                            </span>
                            <span className="text-[11px] font-bold text-[#617187]">Option {letter}</span>
                            {isOptOut && (
                              <Badge variant="outline" className="text-[9px] text-[#617187]">
                                Neutral Opt-Out
                              </Badge>
                            )}
                          </div>

                          {!isOptOut && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
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
                            const copy = [...currentQ.options]
                            copy[oidx].text = e.target.value
                            updateCurrentQuestion({ options: copy })
                          }}
                          className="h-10 text-xs rounded-xl bg-white"
                          placeholder="Option description..."
                        />

                        {/* Dimension Chips Preview */}
                        {!isOptOut && dims.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] text-[#617187] font-bold">Awards:</span>
                            {dims.map(([k, v]) => {
                              const dimObj = DIMENSIONS.find((d) => d.id === k)
                              return (
                                <Badge
                                  key={k}
                                  className="bg-[#EDF2FF] text-[#2858D8] border-[#CBD7F3] text-[10px] font-extrabold px-2 py-0.5"
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
          </div>

          {/* PANE 3: Right Inspector & Psychometric Scoring Matrix (3 cols) */}
          <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
            {/* Inspector Settings Card */}
            <Card className="p-6 border-[#DFE6EF] bg-white rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#12243A] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#2858D8]" /> Question Inspector
              </h3>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#40516A]">Question Type</label>
                  <select
                    className="w-full h-9 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium focus:outline-none"
                    value="MULTIPLE_CHOICE"
                    onChange={() => {}}
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice (Up to 3)</option>
                    <option value="SINGLE_CHOICE">Single Choice</option>
                    <option value="LIKERT_SCALE">Likert Scale (1-5)</option>
                    <option value="SCENARIO">Scenario Choice</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#40516A]">Exploration Level</label>
                  <select
                    value={currentQ.level}
                    onChange={(e) => {
                      const lvl = Number(e.target.value)
                      updateCurrentQuestion({
                        level: lvl,
                        levelName: ['Explore', 'Look for clues', 'Try ideas', 'Compare choices', 'Decisions'][lvl] || 'Explore'
                      })
                    }}
                    className="w-full h-9 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium focus:outline-none"
                  >
                    <option value={0}>Level 1 · Explore</option>
                    <option value={1}>Level 2 · Look for clues</option>
                    <option value={2}>Level 3 · Try ideas</option>
                    <option value={3}>Level 4 · Compare choices</option>
                    <option value={4}>Level 5 · Decisions</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#40516A]">Case Type Tag</label>
                  <Input
                    value={currentQ.caseType}
                    onChange={(e) => updateCurrentQuestion({ caseType: e.target.value })}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            </Card>

            {/* Quality Linter Card */}
            <Card className="p-6 border-[#DFE6EF] bg-white rounded-3xl shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#12243A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#147A52]" /> Quality Linter
              </h3>

              {linterIssues.length === 0 ? (
                <div className="p-3.5 rounded-2xl bg-[#E8F7EF] border border-[#CCEBD9] text-[#147A52] text-xs font-medium">
                  ✓ All questions adhere to SUN psychometric standards (balanced point weights, correct dimensions).
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {linterIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className={`p-2.5 rounded-xl border text-[11px] leading-snug flex items-start gap-2 ${
                        issue.type === 'error'
                          ? 'bg-[#FFF0F0] border-[#F1D1D1] text-[#A93636]'
                          : 'bg-[#FFF5DF] border-[#F3E0B4] text-[#76500F]'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
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
      {/* MODE 2: MULTI-DEVICE PREVIEW & TEST SANDBOX */}
      {/* ========================================================================= */}
      {mode === 'preview' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
          {/* Device Switcher Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-[#DFE6EF]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#40516A]">Preview Viewport:</span>
              <div className="p-1 rounded-xl bg-[#F0F3F8] flex items-center gap-1">
                <Button
                  variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${previewDevice === 'desktop' ? 'bg-white text-[#12243A] shadow-sm' : 'text-[#617187]'}`}
                  onClick={() => setPreviewDevice('desktop')}
                >
                  <Monitor className="w-3.5 h-3.5 mr-1" /> Desktop
                </Button>
                <Button
                  variant={previewDevice === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${previewDevice === 'tablet' ? 'bg-white text-[#12243A] shadow-sm' : 'text-[#617187]'}`}
                  onClick={() => setPreviewDevice('tablet')}
                >
                  <Tablet className="w-3.5 h-3.5 mr-1" /> Tablet (768px)
                </Button>
                <Button
                  variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${previewDevice === 'mobile' ? 'bg-white text-[#12243A] shadow-sm' : 'text-[#617187]'}`}
                  onClick={() => setPreviewDevice('mobile')}
                >
                  <Smartphone className="w-3.5 h-3.5 mr-1" /> Mobile (375px)
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#40516A]">Pathway:</span>
              <div className="p-1 rounded-xl bg-[#F0F3F8] flex items-center gap-1">
                <Button
                  variant={previewPathway === 'UG' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${previewPathway === 'UG' ? 'bg-white text-[#2858D8] shadow-sm' : 'text-[#617187]'}`}
                  onClick={() => setPreviewPathway('UG')}
                >
                  UG (Class 12)
                </Button>
                <Button
                  variant={previewPathway === 'PG' ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 text-xs font-bold ${previewPathway === 'PG' ? 'bg-white text-[#2858D8] shadow-sm' : 'text-[#617187]'}`}
                  onClick={() => setPreviewPathway('PG')}
                >
                  PG (Graduate)
                </Button>
              </div>
            </div>
          </div>

          {/* Viewport Frame */}
          <div className="flex justify-center py-6 bg-slate-900/5 rounded-3xl p-4">
            <div
              className={`transition-all bg-white rounded-3xl border border-[#DFE6EF] shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden ${
                previewDevice === 'desktop'
                  ? 'w-full max-w-4xl'
                  : previewDevice === 'tablet'
                  ? 'w-[768px]'
                  : 'w-[375px]'
              }`}
            >
              {(() => {
                const q = questions[selectedQIndex]
                if (!q) return null
                const caseText = previewPathway === 'UG' ? q.ugCase : q.pgCase
                const selected = previewSelectedOptions[q.id] || []

                return (
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-[#EDF2FF] text-[#2858D8] border-[#CBD7F3] text-[10px] font-extrabold">
                        PREVIEW · CASE {selectedQIndex + 1}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-[#617187]">
                        {previewPathway} PATHWAY
                      </Badge>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F8FAFF] border border-[#E1E9FA] text-xs sm:text-sm font-medium leading-relaxed">
                      {caseText}
                    </div>

                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-[#12243A]">{q.prompt}</h4>
                      <p className="text-[11px] text-[#617187] mt-1">{q.instructions}</p>
                    </div>

                    <div className="space-y-2">
                      {q.options.map((opt, oidx) => {
                        const isSelected = selected.includes(opt.id)
                        const letter = String.fromCharCode(65 + oidx)

                        return (
                          <div
                            key={opt.id}
                            onClick={() => {
                              let arr = [...selected]
                              if (opt.optOut) {
                                arr = [OPT_OUT_ID]
                              } else {
                                arr = arr.filter((x) => x !== OPT_OUT_ID)
                                if (arr.includes(opt.id)) arr = arr.filter((x) => x !== opt.id)
                                else if (arr.length < 3) arr.push(opt.id)
                              }
                              setPreviewSelectedOptions({ ...previewSelectedOptions, [q.id]: arr })
                            }}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isSelected
                                ? 'border-[#2858D8] bg-[#F3F6FF] ring-2 ring-[#2858D8]/20'
                                : 'border-[#DFE6EF] bg-white hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[#2858D8] text-white' : 'bg-[#EDF1F7] text-[#46576E]'
                              }`}
                            >
                              {letter}
                            </span>
                            <p className="text-xs text-[#172436] font-medium leading-relaxed">{opt.text}</p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#DFE6EF]">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={selectedQIndex === 0}
                        onClick={() => setSelectedQIndex((prev) => Math.max(0, prev - 1))}
                        className="h-9 text-xs"
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        disabled={selectedQIndex === questions.length - 1}
                        onClick={() => setSelectedQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                        className="h-9 text-xs bg-[#2858D8] text-white"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: RESPONSE ANALYTICS & ITEM DISCRIMINATION */}
      {/* ========================================================================= */}
      {mode === 'analytics' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-6">
          <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#12243A]">Cohort Response Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Total Submissions</span>
                <p className="text-2xl font-black text-[#12243A]">1,248</p>
                <p className="text-[10px] text-[#617187]">Across all tracks</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Completed</span>
                <p className="text-2xl font-black text-[#147A52]">1,102</p>
                <p className="text-[10px] text-[#147A52]">88.3% completion rate</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Incomplete</span>
                <p className="text-2xl font-black text-[#8B530C]">146</p>
                <p className="text-[10px] text-[#617187]">11.7% drop-off</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Average Score</span>
                <p className="text-2xl font-black text-[#2858D8]">67.4%</p>
                <p className="text-[10px] text-[#617187]">Relative domain match</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#7A7067]">Average Time</span>
                <p className="text-2xl font-black text-[#087F75]">18m 42s</p>
                <p className="text-[10px] text-[#617187]">Efficient test length</p>
              </div>
            </div>
          </Card>

          {/* Item Discrimination & Option Frequencies */}
          <Card className="border-[#DFE6EF] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-bold text-[#12243A]">Question Quality & Discrimination Analytics</h3>
              <p className="text-xs text-[#617187]">
                Analyzes option selection distributions to identify non-discriminating questions or bias.
              </p>
            </div>

            <div className="space-y-4">
              {questions.slice(0, 5).map((q, idx) => (
                <div key={q.id} className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#12243A]">
                      Case {idx + 1} ({q.id}) · {q.prompt}
                    </span>
                    <Badge className="bg-[#E8F7EF] text-[#147A52] border-[#CCEBD9] text-[10px]">
                      Healthy Discrimination
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {q.options.slice(0, 4).map((opt, oidx) => {
                      const mockFreq = [32, 28, 22, 18][oidx] || 15
                      return (
                        <div key={opt.id} className="p-3 rounded-xl bg-white border border-[#DFE6EF] space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#42546C]">Option {String.fromCharCode(65 + oidx)}</span>
                            <span className="font-black text-[#2858D8]">{mockFreq}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-[#2858D8] rounded-full" style={{ width: `${mockFreq}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
