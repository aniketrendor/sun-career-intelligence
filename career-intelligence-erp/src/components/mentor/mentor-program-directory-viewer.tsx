'use client'

import { useState, useMemo } from 'react'
import {
  Search, Filter, BookOpen, FileText, Download,
  Eye, CheckCircle2, AlertCircle, Building2, Layers,
  ExternalLink, Printer, Sparkles, GraduationCap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SyllabusPdfPreviewModal } from '@/components/admin/syllabus-pdf-preview-modal'

interface MentorProgramDirectoryViewerProps {
  programs: any[]
}

export function MentorProgramDirectoryViewer({ programs }: MentorProgramDirectoryViewerProps) {
  const [selectedId, setSelectedId] = useState<string>(programs[0]?.id || '')
  const [selectedSem, setSelectedSem] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [schoolFilter, setSchoolFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  // Preview modal state
  const [previewProgram, setPreviewProgram] = useState<any | null>(null)

  // Filtered Programs List
  const filteredPrograms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return programs.filter((p) => {
      if (schoolFilter !== 'all' && p.school !== schoolFilter) return false
      if (levelFilter !== 'all' && p.level !== levelFilter) return false
      if (!q) return true
      const text = `${p.name} ${p.school} ${p.code} ${p.course_degree} ${p.specialization}`.toLowerCase()
      return text.includes(q)
    })
  }, [programs, searchQuery, schoolFilter, levelFilter])

  // Current Selected Program
  const selectedProgram = useMemo(() => {
    return programs.find((p) => p.id === selectedId) || filteredPrograms[0] || programs[0]
  }, [programs, selectedId, filteredPrograms])

  // Distinct Schools
  const schools = useMemo(() => {
    return Array.from(new Set(programs.map((p) => p.school).filter(Boolean)))
  }, [programs])

  // Parse notes JSON for syllabus metadata
  let syllabusMeta: any = null
  if (selectedProgram?.notes) {
    try {
      syllabusMeta = JSON.parse(selectedProgram.notes)
    } catch {}
  }

  const semestersMap: Record<string, any> = syllabusMeta?.semesters || {}
  const totalSems = selectedProgram?.total_semesters || 8
  const currentSemData = semestersMap[selectedSem]
  const currentSemPdfUrl = currentSemData?.preview_url || currentSemData?.url || null
  const fullProgramPdfUrl = syllabusMeta?.preview_url || syllabusMeta?.syllabus_url || null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* Left Column: Program Directory (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        <Card className="border-[#DFD7CB] bg-white rounded-3xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#2C2621]">Program Directory</h3>
            <p className="text-[11px] text-[#7A7067]">
              Showing {filteredPrograms.length} of {programs.length} degree programs
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#7A7067] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, degree or course..."
              className="pl-9 h-10 rounded-xl border-[#DFD7CB] text-xs bg-[#FAF6F0]/50 text-[#2C2621]"
            />
          </div>

          {/* School & Level Filters */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="h-9 px-2 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0]/40 text-[11px] font-medium text-[#2C2621] focus:outline-none cursor-pointer"
            >
              <option value="all">All Schools</option>
              {schools.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-9 px-2 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0]/40 text-[11px] font-medium text-[#2C2621] focus:outline-none cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="UG">Undergraduate (UG)</option>
              <option value="PG">Postgraduate (PG)</option>
              <option value="Diploma">Diploma</option>
              <option value="PhD">Doctoral (PhD)</option>
            </select>
          </div>

          {/* Programme List Scroll */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredPrograms.map((p) => {
              const isSelected = p.id === selectedProgram?.id
              let pSyllabus: any = null
              if (p.notes) {
                try {
                  pSyllabus = JSON.parse(p.notes)
                } catch {}
              }
              const hasPdf = Boolean(pSyllabus?.preview_url || pSyllabus?.syllabus_url || (pSyllabus?.semesters && Object.keys(pSyllabus.semesters).length > 0))

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(p.id)
                    setSelectedSem(1)
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                    isSelected
                      ? 'border-[#A36B40] bg-[#FAF6F0] ring-1 ring-[#A36B40]/40 shadow-xs'
                      : 'border-[#DFD7CB]/80 bg-white hover:border-[#A36B40]/40 hover:bg-[#FAF6F0]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#A36B40] uppercase font-mono">
                      {p.code}
                    </span>
                    <div className="flex items-center gap-1">
                      {hasPdf && (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                          PDF Active
                        </span>
                      )}
                      <Badge className="bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-[9px] font-bold px-1.5 py-0">
                        {p.level}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-[#2C2621] leading-tight line-clamp-1">
                    {p.name}
                  </p>
                  <p className="text-[10px] text-[#7A7067] line-clamp-1">
                    {p.school}
                  </p>
                </button>
              )
            })}

            {filteredPrograms.length === 0 && (
              <div className="text-center py-8 text-xs text-[#7A7067]">
                No programs match your search or filter.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right Column: Program Approved Syllabus Details (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        {selectedProgram ? (
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Header Banner */}
            <div className="space-y-3 pb-6 border-b border-[#DFD7CB]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#A36B40] bg-[#F7EFEA] px-2.5 py-1 rounded-xl border border-[#A36B40]/20 font-mono">
                    {selectedProgram.code}
                  </span>
                  <Badge className="bg-[#FAF6F0] text-[#2C2621] border-[#DFD7CB] text-xs font-bold">
                    {selectedProgram.level} Degree
                  </Badge>
                </div>
                <span className="text-xs font-bold text-[#77734B] bg-[#F1F1EB] px-3 py-1 rounded-full border border-[#77734B]/30">
                  {selectedProgram.duration_years || 3} Years · {selectedProgram.total_semesters || 6} Semesters · {syllabusMeta?.total_credits || 160} Total Credits
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#2C2621] tracking-tight">
                  {selectedProgram.name}
                </h2>
                <p className="text-xs font-semibold text-[#A36B40] mt-0.5">
                  {selectedProgram.school} · Sandip University, Nashik
                </p>
              </div>

              {selectedProgram.description && (
                <p className="text-xs text-[#7A7067] leading-relaxed">
                  {selectedProgram.description}
                </p>
              )}

              {/* Framework & Metadata chips */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-[#2C2621]">
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#DFD7CB] font-semibold">
                  Framework: {syllabusMeta?.academic_framework || 'NEP 2020 / CBCS Scheme'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#DFD7CB] font-semibold">
                  Prerequisite: {selectedProgram.suitable_stream || 'Eligible Stream'}
                </span>
                {syllabusMeta?.approved_by && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#F7EFEA] border border-[#A36B40]/30 font-semibold text-[#A36B40]">
                    Approved By: {syllabusMeta.approved_by}
                  </span>
                )}
              </div>

              {/* Full Program PDF Action Bar */}
              {fullProgramPdfUrl && (
                <div className="pt-2 flex items-center justify-between bg-[#FAF6F0] p-3 rounded-2xl border border-[#DFD7CB]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-[#2C2621]">Full Program Approved Syllabus PDF</p>
                      <p className="text-[10px] text-[#7A7067]">
                        Hosted on Google Drive · Complete degree curriculum document
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setPreviewProgram(selectedProgram)}
                      className="text-xs font-bold bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-xl h-8 px-3 gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview PDF
                    </Button>
                    <a href={syllabusMeta?.download_url || fullProgramPdfUrl} download target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="text-xs font-semibold rounded-xl border-[#DFD7CB] h-8 px-2.5 gap-1">
                        <Download className="w-3.5 h-3.5 text-[#7A7067]" />
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Semester-wise Syllabus Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#7A7067]">
                    Semester-wise Approved Curriculum PDFs
                  </h3>
                  <p className="text-[11px] text-[#7A7067]">
                    Select a semester below to view its university approved syllabus document
                  </p>
                </div>
              </div>

              {/* Semester Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {Array.from({ length: totalSems }, (_, i) => i + 1).map((sNum) => {
                  const sHasPdf = Boolean(semestersMap[sNum]?.url || semestersMap[sNum]?.preview_url)
                  const isSelected = selectedSem === sNum

                  return (
                    <button
                      key={sNum}
                      type="button"
                      onClick={() => setSelectedSem(sNum)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-sm'
                          : sHasPdf
                          ? 'bg-white text-[#2C2621] hover:bg-[#FAF6F0] border-[#DFD7CB]'
                          : 'bg-[#FAF6F0]/80 text-[#7A7067] border-[#DFD7CB]'
                      }`}
                    >
                      <span>Semester {sNum}</span>
                      {sHasPdf && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    </button>
                  )
                })}
              </div>

              {/* Current Semester Content Card */}
              <div className="bg-[#FAF8F5] border border-[#DFD7CB] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#2C2621]">
                      Semester {selectedSem} Syllabus Document
                    </h4>
                    <p className="text-xs text-[#7A7067]">
                      {selectedProgram.name} · Academic Year {selectedProgram.academic_year || '2026-2027'}
                    </p>
                  </div>

                  {currentSemPdfUrl ? (
                    <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved PDF Available
                    </Badge>
                  ) : fullProgramPdfUrl ? (
                    <Badge className="bg-blue-50 text-blue-800 border-blue-200 text-xs font-semibold gap-1">
                      Available in Full Program PDF
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-800 bg-amber-50 border-amber-200 text-xs font-semibold gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Pending Admin Upload
                    </Badge>
                  )}
                </div>

                {currentSemPdfUrl ? (
                  <div className="bg-white p-4 rounded-xl border border-[#DFD7CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[#2C2621]">
                          {currentSemData?.filename || `Semester_${selectedSem}_Approved_Syllabus.pdf`}
                        </p>
                        <p className="text-[10px] text-[#7A7067]">
                          Google Drive Hosted · Approved by {syllabusMeta?.approved_by || 'Academic Council'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setPreviewProgram(selectedProgram)}
                        className="text-xs font-bold bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-xl h-8 px-3 gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview PDF
                      </Button>
                      <a href={currentSemData?.download_url || currentSemPdfUrl} download target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="text-xs font-semibold rounded-xl border-[#DFD7CB] h-8 px-2.5 gap-1">
                          <Download className="w-3.5 h-3.5 text-[#7A7067]" />
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : fullProgramPdfUrl ? (
                  <div className="bg-white p-4 rounded-xl border border-[#DFD7CB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-[#7A7067]">
                      The individual semester PDF is bundled inside the approved Full Program Curriculum PDF document.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setPreviewProgram(selectedProgram)}
                      className="text-xs font-bold bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-xl h-8 px-3 gap-1 cursor-pointer shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" /> Open Full PDF
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white p-6 rounded-xl border border-[#DFD7CB] text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                    <p className="text-xs font-bold text-[#2C2621]">
                      Official Syllabus PDF Pending Upload
                    </p>
                    <p className="text-[11px] text-[#7A7067] max-w-md mx-auto">
                      An official university approved syllabus PDF for this program has not yet been uploaded by the department administration to Google Drive.
                    </p>
                  </div>
                )}
              </div>

              {/* Career domains mapped to this program */}
              {selectedProgram.career_domains && selectedProgram.career_domains.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-[#7A7067] uppercase tracking-wider block mb-1.5">
                    Aligned Career Domains
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProgram.career_domains.map((d: string, di: number) => (
                      <Badge key={di} variant="outline" className="text-[11px] bg-white text-[#2C2621] border-[#DFD7CB]">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </Card>
        ) : (
          <div className="text-center py-16 bg-white border border-[#DFD7CB] rounded-3xl p-6 text-xs text-[#7A7067]">
            Select a program from the directory on the left to view its approved syllabus document.
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      <SyllabusPdfPreviewModal
        isOpen={!!previewProgram}
        onClose={() => setPreviewProgram(null)}
        program={previewProgram}
      />

    </div>
  )
}
