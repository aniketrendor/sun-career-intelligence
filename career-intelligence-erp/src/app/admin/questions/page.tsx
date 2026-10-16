'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Filter, Download, Sparkles, CheckCircle2,
  AlertCircle, ChevronRight, Layers, Tag, BookOpen, Edit2, Trash2, X
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

export default function AdminQuestionBankPage() {
  const [questions, setQuestions] = useState<Stage1Question[]>(STAGE1)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDim, setSelectedDim] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [activeModal, setActiveModal] = useState<Stage1Question | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return questions.filter((item) => {
      if (selectedLevel !== 'all' && String(item.level) !== selectedLevel) return false
      if (selectedDim !== 'all') {
        const hasDim = item.options.some((o) => o.dims && o.dims[selectedDim] !== undefined && o.dims[selectedDim] > 0)
        if (!hasDim) return false
      }
      if (!q) return true
      const fullText = `${item.id} ${item.prompt} ${item.ugCase} ${item.pgCase} ${item.caseType}`.toLowerCase()
      return fullText.includes(q)
    })
  }, [questions, searchQuery, selectedDim, selectedLevel])

  // Download Question Bank JSON
  const handleDownloadJSON = () => {
    const data = {
      title: 'Sandip University Master Career Question Bank',
      version: '2.0 Audited',
      exportedAt: new Date().toISOString(),
      dimensions: DIMENSIONS,
      questions: questions.map((q) => ({
        id: q.id,
        level: q.level + 1,
        levelName: q.levelName,
        caseType: q.caseType,
        ugCase: q.ugCase,
        pgCase: q.pgCase,
        prompt: q.prompt,
        responseLimit: q.responseLimit,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          dims: o.dims,
          primaryDim: o.primaryDim,
          secondaryDim: o.secondaryDim,
          optOut: !!o.optOut
        }))
      }))
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sun-master-question-bank.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // Save Question Edit / Create
  const handleSaveQuestion = (updated: Stage1Question) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((x) => x.id === updated.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = updated
        return copy
      }
      return [updated, ...prev]
    })
    setActiveModal(null)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] gap-1.5 font-bold text-xs px-3 py-1">
            <BookOpen className="w-3.5 h-3.5" /> Central Question Repository
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Master Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
            Manage psychometric scenario cases, dual UG/PG narratives, and multi-dimensional option scoring weights.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Button
            variant="outline"
            className="h-11 px-4 rounded-2xl border-[#DFD7CB] text-xs font-bold text-[#2C2621]"
            onClick={handleDownloadJSON}
          >
            <Download className="w-4 h-4 mr-1.5" /> Export Bank JSON
          </Button>

          <Button
            className="h-11 px-5 rounded-2xl bg-[#2858D8] hover:bg-[#1F45AD] text-white font-bold text-xs shadow-md shadow-[#2858D8]/20 flex items-center gap-1.5 cursor-pointer"
            onClick={() => {
              const newQ: Stage1Question = {
                id: `S1Q${String(questions.length + 1).padStart(3, '0')}`,
                level: 0,
                levelName: 'Explore',
                ugCase: 'New UG scenario description...',
                pgCase: 'New PG scenario description...',
                prompt: 'What would you prefer to do in this situation?',
                caseType: 'General exploration',
                responseLimit: 3,
                instructions: 'Select up to three options that genuinely appeal to you.',
                options: [
                  { id: `OPT_1`, text: 'Sample option A', dims: { D01: 3, D02: 1 }, primaryDim: 'D01', secondaryDim: 'D02' },
                  { id: `OPT_2`, text: 'Sample option B', dims: { D08: 3, D09: 1 }, primaryDim: 'D08', secondaryDim: 'D09' },
                  { id: OPT_OUT_ID, text: 'None of these options feels right for me at the moment.', dims: {}, optOut: true }
                ]
              }
              setActiveModal(newQ)
              setIsEditing(false)
            }}
          >
            <Plus className="w-4 h-4" /> Add Question
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Total Questions</p>
          <p className="text-2xl font-black text-[#2C2621]">{questions.length}</p>
          <p className="text-[11px] text-[#77734B]">Across 5 exploration levels</p>
        </Card>

        <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Total Options</p>
          <p className="text-2xl font-black text-[#2C2621]">
            {questions.reduce((acc, q) => acc + q.options.length, 0)}
          </p>
          <p className="text-[11px] text-[#7A7067]">~7 options per case</p>
        </Card>

        <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Dimensions Covered</p>
          <p className="text-2xl font-black text-[#2858D8]">20/20</p>
          <p className="text-[11px] text-[#77734B]">100% multidimensional</p>
        </Card>

        <Card className="p-4 border-[#DFD7CB] bg-white rounded-3xl shadow-sm space-y-1">
          <p className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Assessments Using Bank</p>
          <p className="text-2xl font-black text-[#087F75]">SUN V1.0</p>
          <p className="text-[11px] text-[#7A7067]">Active Flagship Model</p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-[#DFD7CB] bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#7A7067] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by ID, scenario, prompt, or case type..."
            className="pl-10 h-10 rounded-xl border-[#CBD5E1] text-xs"
          />
        </div>

        <select
          value={selectedDim}
          onChange={(e) => setSelectedDim(e.target.value)}
          className="w-full sm:w-60 h-10 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#2C2621] focus:outline-none"
        >
          <option value="all">All 20 Dimensions</option>
          {DIMENSIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.id} · {d.name}
            </option>
          ))}
        </select>

        <select
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          className="w-full sm:w-44 h-10 px-3 rounded-xl border border-[#CBD5E1] bg-white text-xs font-medium text-[#2C2621] focus:outline-none"
        >
          <option value="all">All Levels (1–5)</option>
          <option value="0">Level 1 · Explore</option>
          <option value="1">Level 2 · Look for clues</option>
          <option value="2">Level 3 · Try ideas</option>
          <option value="3">Level 4 · Compare choices</option>
          <option value="4">Level 5 · Decisions</option>
        </select>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <Card key={q.id} className="p-6 border-[#DFD7CB] bg-white rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#12243A] bg-[#EDF2FF] px-2.5 py-0.5 rounded-md">
                  {q.id}
                </span>
                <Badge variant="outline" className="text-[10px] font-bold text-[#617187]">
                  Level {q.level + 1} · {q.levelName}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-bold text-[#617187]">
                  {q.caseType}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold rounded-lg border-[#DFE6EF] text-[#2C2621]"
                  onClick={() => {
                    setActiveModal(JSON.parse(JSON.stringify(q)))
                    setIsEditing(true)
                  }}
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB]/70 space-y-1">
                <span className="text-[10px] font-black text-[#A36B40] uppercase">UG Scenario (Class 12)</span>
                <p className="text-xs text-[#2C2621] leading-relaxed">{q.ugCase}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB]/70 space-y-1">
                <span className="text-[10px] font-black text-[#77734B] uppercase">PG Scenario (Graduate)</span>
                <p className="text-xs text-[#2C2621] leading-relaxed">{q.pgCase}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#12243A]">Prompt: {q.prompt}</p>
            </div>

            {/* Options Strip */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#617187]">Options & Psychometric Weights</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, oidx) => {
                  const dims = Object.entries(opt.dims || {})
                  return (
                    <div
                      key={opt.id}
                      className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE6EF]/70 flex items-start gap-2 text-xs"
                    >
                      <span className="w-5 h-5 rounded-md bg-[#EEF2F8] text-[#42546C] text-[10px] font-black flex items-center justify-center shrink-0">
                        {opt.optOut ? 'X' : String.fromCharCode(65 + oidx)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[#2C2621] leading-snug truncate">{opt.text}</p>
                        {dims.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap mt-1">
                            {dims.map(([k, v]) => (
                              <span key={k} className="text-[9px] font-black bg-[#EDF2FF] text-[#2858D8] px-1.5 py-0.5 rounded">
                                {k} +{v}
                              </span>
                            ))}
                          </div>
                        )}
                        {opt.optOut && (
                          <span className="text-[9px] font-bold text-[#617187]">Opt-out choice</span>
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

      {/* Edit / Create Question Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DFD7CB] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#2C2621]">
                  {isEditing ? `Edit Question · ${activeModal.id}` : 'Create New Question'}
                </h3>
                <p className="text-xs text-[#7A7067]">Configure question properties, narratives, and option dimension scores.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActiveModal(null)} className="rounded-xl">
                <X className="w-5 h-5 text-[#7A7067]" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#40516A]">Question ID</label>
                  <Input
                    value={activeModal.id}
                    onChange={(e) => setActiveModal({ ...activeModal, id: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#40516A]">Exploration Level</label>
                  <select
                    value={activeModal.level}
                    onChange={(e) => setActiveModal({ ...activeModal, level: Number(e.target.value), levelName: ['Explore', 'Look for clues', 'Try ideas', 'Compare choices', 'Decisions'][Number(e.target.value)] || 'Explore' })}
                    className="w-full h-10 px-3 rounded-xl border border-[#CBD5E1] text-xs font-medium"
                  >
                    <option value={0}>Level 1 · Explore</option>
                    <option value={1}>Level 2 · Look for clues</option>
                    <option value={2}>Level 3 · Try ideas</option>
                    <option value={3}>Level 4 · Compare choices</option>
                    <option value={4}>Level 5 · Make a decision</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#40516A]">Case Type Tag</label>
                  <Input
                    value={activeModal.caseType}
                    onChange={(e) => setActiveModal({ ...activeModal, caseType: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#40516A]">UG Narrative Scenario (Class 12 context)</label>
                <textarea
                  value={activeModal.ugCase}
                  onChange={(e) => setActiveModal({ ...activeModal, ugCase: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-[#CBD5E1] text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#40516A]">PG Narrative Scenario (Graduate context)</label>
                <textarea
                  value={activeModal.pgCase}
                  onChange={(e) => setActiveModal({ ...activeModal, pgCase: e.target.value })}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-[#CBD5E1] text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#40516A]">Question Prompt</label>
                <Input
                  value={activeModal.prompt}
                  onChange={(e) => setActiveModal({ ...activeModal, prompt: e.target.value })}
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              {/* Options & Scoring Configurator */}
              <div className="space-y-2 pt-2 border-t border-[#DFD7CB]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#12243A]">Options & Psychometric Weights</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 rounded-lg"
                    onClick={() => {
                      const newOpt: Stage1Option = {
                        id: `${activeModal.id}_O${activeModal.options.length + 1}`,
                        text: 'New option text',
                        dims: { D01: 3, D02: 1 },
                        primaryDim: 'D01',
                        secondaryDim: 'D02'
                      }
                      setActiveModal({ ...activeModal, options: [...activeModal.options, newOpt] })
                    }}
                  >
                    + Add Option
                  </Button>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {activeModal.options.map((opt, oidx) => (
                    <div key={opt.id} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE6EF] space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-[#597090]">
                          Option {oidx + 1} ({opt.id})
                        </span>
                        {!opt.optOut && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setActiveModal({
                                ...activeModal,
                                options: activeModal.options.filter((_, idx) => idx !== oidx)
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
                          const updatedOpts = [...activeModal.options]
                          updatedOpts[oidx].text = e.target.value
                          setActiveModal({ ...activeModal, options: updatedOpts })
                        }}
                        className="h-9 text-xs rounded-lg"
                        placeholder="Option description"
                      />

                      {!opt.optOut && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-[#617187]">Primary Dim:</span>
                          <select
                            value={opt.primaryDim || 'D01'}
                            onChange={(e) => {
                              const updatedOpts = [...activeModal.options]
                              const pdim = e.target.value
                              updatedOpts[oidx].primaryDim = pdim
                              updatedOpts[oidx].dims = { ...updatedOpts[oidx].dims, [pdim]: 3 }
                              setActiveModal({ ...activeModal, options: updatedOpts })
                            }}
                            className="h-7 px-2 rounded-md border text-[11px]"
                          >
                            {DIMENSIONS.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.id} · {d.name} (+3)
                              </option>
                            ))}
                          </select>

                          <span className="text-[10px] font-bold text-[#617187] ml-2">Secondary Dim:</span>
                          <select
                            value={opt.secondaryDim || 'D02'}
                            onChange={(e) => {
                              const updatedOpts = [...activeModal.options]
                              const sdim = e.target.value
                              updatedOpts[oidx].secondaryDim = sdim
                              updatedOpts[oidx].dims = { ...updatedOpts[oidx].dims, [sdim]: 1 }
                              setActiveModal({ ...activeModal, options: updatedOpts })
                            }}
                            className="h-7 px-2 rounded-md border text-[11px]"
                          >
                            {DIMENSIONS.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.id} · {d.name} (+1)
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
              <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} className="h-10 rounded-xl">
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-10 px-5 rounded-xl bg-[#2858D8] hover:bg-[#1F45AD] text-white font-bold"
                onClick={() => handleSaveQuestion(activeModal)}
              >
                Save to Question Bank
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
