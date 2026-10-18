'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2, GraduationCap, Search, Filter,
  ArrowRight, BookOpen, Layers, CheckCircle2,
  Sparkles, Award, Compass, School, Tag,
  Briefcase, ChevronRight, FileText, Download,
  Eye, Edit3, Plus, Upload, Printer
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SANDIP_SCHOOLS, SANDIP_LEVELS, type SandipProgram } from '@/lib/services/sandip-catalog'
import { SyllabusPdfPreviewModal } from './syllabus-pdf-preview-modal'
import { ManageSyllabusModal } from './manage-syllabus-modal'

interface AdminProgramsCatalogProps {
  initialPrograms: any[]
  defaultTab?: 'catalog' | 'syllabus'
}

const SCHOOL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Commerce & Management Studies': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Engineering & Technology': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  'Computer Science & Engineering': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Design': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  'Science': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Law': { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  'Pharmaceutical Sciences': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  'Doctoral': { bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-300' },
}

export function AdminProgramsCatalog({ initialPrograms, defaultTab = 'catalog' }: AdminProgramsCatalogProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'syllabus'>(defaultTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<string>('All Schools')
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')
  const [selectedStream, setSelectedStream] = useState<string>('ALL')

  // Modals state
  const [previewProgram, setPreviewProgram] = useState<any | null>(null)
  const [manageProgram, setManageProgram] = useState<any | null>(null)

  // Filter programs in real time
  const filteredPrograms = useMemo(() => {
    return initialPrograms.filter((p: any) => {
      // School filter
      if (selectedSchool !== 'All Schools' && p.school !== selectedSchool) return false

      // Level filter
      if (selectedLevel !== 'ALL' && p.level !== selectedLevel) return false

      // Stream filter
      if (selectedStream !== 'ALL') {
        const streamStr = String(p.suitable_stream || p.primary_stream || '').toLowerCase()
        if (!streamStr.includes(selectedStream.toLowerCase()) && !streamStr.includes('any')) return false
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = p.name?.toLowerCase().includes(q)
        const matchCode = p.code?.toLowerCase().includes(q)
        const matchSpec = p.specialization?.toLowerCase().includes(q)
        const matchDegree = p.course_degree?.toLowerCase().includes(q)
        const matchSchool = p.school?.toLowerCase().includes(q)
        const matchDomains = Array.isArray(p.career_domains) && p.career_domains.some((d: string) => d.toLowerCase().includes(q))
        if (!matchName && !matchCode && !matchSpec && !matchDegree && !matchSchool && !matchDomains) return false
      }

      return true
    })
  }, [initialPrograms, selectedSchool, selectedLevel, selectedStream, searchQuery])

  // Aggregate counts
  const stats = useMemo(() => {
    const total = initialPrograms.length
    const ug = initialPrograms.filter(p => p.level === 'UG').length
    const pg = initialPrograms.filter(p => p.level === 'PG').length
    const phd = initialPrograms.filter(p => p.level === 'PhD' || p.level === 'Doctoral').length
    const diploma = initialPrograms.filter(p => p.level === 'Diploma').length
    
    // Count custom uploaded syllabi
    let customSyllabiCount = 0
    initialPrograms.forEach(p => {
      if (p.notes) {
        try {
          const parsed = JSON.parse(p.notes)
          if (parsed.syllabus_url) customSyllabiCount++
        } catch {}
      }
    })

    return { total, ug, pg, phd, diploma, customSyllabiCount }
  }, [initialPrograms])

  return (
    <div className="space-y-6">
      
      {/* Top View Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white border border-[#DFD7CB] p-2 rounded-2xl shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#FAF6F0] rounded-xl border border-[#DFD7CB]">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-white text-[#2C2621] shadow-xs border border-[#DFD7CB]'
                : 'text-[#7A7067] hover:text-[#2C2621]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#A36B40]" />
            <span>Academic Degree Catalog ({stats.total})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'syllabus'
                ? 'bg-white text-[#2C2621] shadow-xs border border-[#DFD7CB]'
                : 'text-[#7A7067] hover:text-[#2C2621]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#A36B40]" />
            <span>Syllabus PDF Directory & Management ({stats.total})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-2">
          <Badge variant="outline" className="text-xs bg-[#FAF6F0] text-[#77734B] border-[#77734B]/30 font-bold px-3 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> All 114 Syllabi NEP 2020 Compliant
          </Badge>
        </div>
      </div>

      {/* Metric Cards Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white border border-[#DFD7CB] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider block">Total Catalog</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-[#2C2621]">{stats.total}</span>
            <span className="text-xs text-[#7A7067]">Programs</span>
          </div>
        </div>

        <div className="bg-white border border-[#DFD7CB] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Undergraduate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-blue-800">{stats.ug}</span>
            <span className="text-xs text-blue-600">UG Degrees</span>
          </div>
        </div>

        <div className="bg-white border border-[#DFD7CB] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Postgraduate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-amber-800">{stats.pg}</span>
            <span className="text-xs text-amber-600">PG Degrees</span>
          </div>
        </div>

        <div className="bg-white border border-[#DFD7CB] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Doctoral / PhD</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-purple-800">{stats.phd}</span>
            <span className="text-xs text-purple-600">Research</span>
          </div>
        </div>

        <div className="bg-white border border-[#DFD7CB] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">PDF Syllabi</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-800">{stats.total}</span>
            <span className="text-xs text-emerald-600">Active PDFs</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-[#DFD7CB] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#7A7067] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (e.g. SUN-001), specialization, degree, or keyword..."
              className="pl-10 h-10 rounded-xl border-[#DFD7CB] bg-[#FAF8F5]/50 text-xs focus:bg-white text-[#2C2621]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="h-10 px-3 rounded-xl border border-[#DFD7CB] bg-[#FAF8F5]/50 text-xs font-semibold text-[#2C2621] focus:bg-white focus:outline-none w-full sm:w-auto cursor-pointer"
            >
              <option value="ALL">All Academic Levels ({stats.total})</option>
              <option value="UG">Undergraduate ({stats.ug})</option>
              <option value="PG">Postgraduate ({stats.pg})</option>
              <option value="PhD">Doctoral / PhD ({stats.phd})</option>
              <option value="Diploma">Diploma ({stats.diploma})</option>
            </select>
          </div>
        </div>

        {/* School Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedSchool('All Schools')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
              selectedSchool === 'All Schools'
                ? 'bg-[#2C2621] text-white shadow-xs'
                : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
            }`}
          >
            All Schools ({stats.total})
          </button>
          {SANDIP_SCHOOLS.map((school) => {
            const count = initialPrograms.filter(p => p.school === school).length
            if (count === 0) return null
            const isSelected = selectedSchool === school

            return (
              <button
                key={school}
                type="button"
                onClick={() => setSelectedSchool(school)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-[#A36B40] text-white shadow-xs'
                    : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
                }`}
              >
                {school} <span className="opacity-75 font-normal ml-0.5">({count})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* VIEW 1: SYLLABUS PDF DIRECTORY & MANAGEMENT          */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'syllabus' && (
        <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm overflow-hidden">
          <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#A36B40]" />
                <span>Program Syllabi Directory & Document Management</span>
              </CardTitle>
              <CardDescription className="text-xs text-[#7A7067] mt-0.5">
                Manage curriculum PDFs, preview semester modules, upload revisions, and update accreditation metadata
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white text-[#A36B40] border-[#DFD7CB] text-xs font-bold px-3 py-1">
                Showing {filteredPrograms.length} Syllabi
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-[#DFD7CB]/60">
              {filteredPrograms.map((prog: any) => {
                let customSyllabus: any = null
                if (prog.notes) {
                  try {
                    customSyllabus = JSON.parse(prog.notes)
                  } catch {}
                }

                const pdfUrl = `/api/syllabus/pdf?code=${encodeURIComponent(prog.code)}${prog.id ? `&id=${encodeURIComponent(prog.id)}` : ''}`

                return (
                  <div
                    key={prog.id || prog.code}
                    className="p-4 sm:p-5 hover:bg-[#FAF6F0]/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 max-w-2xl">
                      <div className="w-11 h-11 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-[#A36B40] bg-[#FAF5EC] px-2 py-0.5 rounded-lg border border-[#DFD7CB]">
                            {prog.code}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-bold border-[#DFD7CB] bg-white text-[#7A7067]">
                            {prog.level}
                          </Badge>
                          {customSyllabus?.syllabus_url ? (
                            <Badge className="bg-blue-50 text-blue-800 border-blue-200 text-[10px] font-semibold gap-1">
                              Custom Upload Active
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px] font-semibold gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Official PDF Ready
                            </Badge>
                          )}
                        </div>

                        <h4 className="font-bold text-[#2C2621] text-sm">
                          {prog.name}
                        </h4>

                        <p className="text-xs text-[#7A7067]">
                          {prog.school} · {prog.duration_years || 3} Years ({prog.total_semesters || 6} Sems) · Framework: <strong className="text-[#2C2621]">{customSyllabus?.academic_framework || 'NEP 2020 / CBCS'}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => setPreviewProgram(prog)}
                        className="text-xs font-bold bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-xl h-9 px-3.5 gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview PDF</span>
                      </Button>

                      <a href={pdfUrl} download={`Sandip_University_${prog.code}_Syllabus.pdf`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs font-semibold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] h-9 px-3 gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#7A7067]" />
                          <span>Download</span>
                        </Button>
                      </a>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setManageProgram(prog)}
                        className="text-xs font-semibold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] hover:border-[#A36B40] h-9 px-3 gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#A36B40]" />
                        <span>Edit / Add PDF</span>
                      </Button>
                    </div>
                  </div>
                )
              })}

              {filteredPrograms.length === 0 && (
                <div className="py-16 text-center text-[#7A7067] space-y-2">
                  <p className="font-bold text-[#2C2621] text-sm">No Syllabi Match Your Search</p>
                  <p className="text-xs text-[#7A7067]">Try adjusting your search keywords or filter selections.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 2: ACADEMIC DEGREE CATALOG CARDS                */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPrograms.map((prog: any) => {
            const schoolStyle = SCHOOL_COLORS[prog.school] || { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' }
            const pdfUrl = `/api/syllabus/pdf?code=${encodeURIComponent(prog.code)}${prog.id ? `&id=${encodeURIComponent(prog.id)}` : ''}`

            return (
              <Card
                key={prog.id || prog.code}
                className="bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:shadow-md transition-all flex flex-col justify-between rounded-3xl shadow-xs overflow-hidden"
              >
                <div>
                  <CardHeader className="pb-3 border-b border-[#F0EAE1] bg-[#FAF8F5]/60 p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-white border border-[#DFD7CB] text-[#2C2621]">
                        {prog.code}
                      </span>
                      <Badge className={`${schoolStyle.bg} ${schoolStyle.text} ${schoolStyle.border} border text-[11px] font-bold rounded-lg px-2 py-0.5`}>
                        {prog.level}
                      </Badge>
                    </div>

                    <span className="text-[11px] font-semibold text-[#7A7067] line-clamp-1 block">
                      {prog.school}
                    </span>

                    <CardTitle className="text-base font-bold text-[#2C2621] mt-0.5 leading-snug">
                      {prog.name}
                    </CardTitle>

                    {prog.specialization && prog.specialization !== '-' && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#A36B40] shrink-0" />
                        <span className="text-xs font-semibold text-[#A36B40] line-clamp-1">
                          {prog.specialization}
                        </span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="p-5 space-y-3.5 text-xs">
                    {/* Metadata chips */}
                    <div className="grid grid-cols-2 gap-2 bg-[#FAF6F0] p-3 rounded-2xl border border-[#DFD7CB]">
                      <div>
                        <span className="text-[#7A7067] block text-[10px] font-bold uppercase tracking-wider">Duration</span>
                        <span className="font-bold text-[#2C2621]">
                          {prog.duration_years || 3} Years ({prog.total_semesters || 6} Sems)
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7A7067] block text-[10px] font-bold uppercase tracking-wider">Stream Eligible</span>
                        <span className="font-bold text-[#A36B40] truncate block">
                          {prog.suitable_stream || prog.primary_stream || 'Any Stream'}
                        </span>
                      </div>
                    </div>

                    {/* Career Domains */}
                    {prog.career_domains && prog.career_domains.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-[#7A7067] uppercase tracking-wider block mb-1.5">
                          Aligned Career Domains
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {prog.career_domains.slice(0, 3).map((d: string) => (
                            <span
                              key={d}
                              className="text-[10px] font-medium bg-white text-[#2C2621] border border-[#DFD7CB] px-2 py-0.5 rounded-lg"
                            >
                              {d}
                            </span>
                          ))}
                          {prog.career_domains.length > 3 && (
                            <span className="text-[10px] font-bold text-[#7A7067] bg-[#FAF6F0] px-1.5 py-0.5 rounded-lg">
                              +{prog.career_domains.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Footer with Syllabus PDF Controls */}
                <div className="p-4 border-t border-[#F0EAE1] bg-[#FAF8F5]/50 flex items-center justify-between gap-2 text-xs">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewProgram(prog)}
                    className="text-xs font-bold rounded-xl border-[#DFD7CB] bg-white text-[#A36B40] hover:bg-[#FAF6F0] gap-1.5 h-8 px-3 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview PDF</span>
                  </Button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setManageProgram(prog)}
                      className="text-xs font-semibold text-[#7A7067] hover:text-[#2C2621] hover:bg-white rounded-xl h-8 px-2.5 cursor-pointer"
                      title="Edit Syllabus PDF"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <a href={pdfUrl} download={`Sandip_University_${prog.code}_Syllabus.pdf`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs font-semibold text-[#7A7067] hover:text-[#2C2621] hover:bg-white rounded-xl h-8 px-2.5 cursor-pointer"
                        title="Download Syllabus PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            )
          })}

          {filteredPrograms.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#7A7067] bg-white border border-[#DFD7CB] rounded-3xl space-y-3">
              <Building2 className="w-12 h-12 mx-auto text-[#A36B40]/60" />
              <div className="space-y-1">
                <p className="font-bold text-base text-[#2C2621]">No Programs Found</p>
                <p className="text-xs text-[#7A7067]">
                  No Sandip University programs matched your filter criteria.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedSchool('All Schools')
                  setSelectedLevel('ALL')
                  setSelectedStream('ALL')
                }}
                className="rounded-xl border-[#DFD7CB] text-xs font-bold"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Syllabus PDF Preview Modal */}
      <SyllabusPdfPreviewModal
        isOpen={!!previewProgram}
        onClose={() => setPreviewProgram(null)}
        program={previewProgram}
      />

      {/* Admin Manage Syllabus Modal */}
      <ManageSyllabusModal
        isOpen={!!manageProgram}
        onClose={() => setManageProgram(null)}
        program={manageProgram}
        onSuccess={() => {
          // Soft reload or state refresh if needed
        }}
      />

    </div>
  )
}
