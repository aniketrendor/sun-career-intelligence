'use client'

import React, { useState, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  BookOpen, Search, Download, Printer, Filter, ChevronRight,
  GraduationCap, Clock, Award, Layers, CheckCircle2, Building2,
  FileText, ExternalLink, Sparkles, AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PROGRAMS, SandipMasterProgram } from '@/lib/data/su-career-data'
import { getProgramSyllabus, ProgramSyllabus } from '@/lib/data/su-syllabus-data'

function SyllabusContent() {
  const searchParams = useSearchParams()
  const initialProgramId = searchParams.get('program') || 'SUN-020'

  const [selectedId, setSelectedId] = useState<string>(initialProgramId)
  const [selectedSem, setSelectedSem] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [schoolFilter, setSchoolFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  // Filtered Programs List
  const filteredPrograms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return PROGRAMS.filter((p) => {
      if (schoolFilter !== 'all' && p.school !== schoolFilter) return false
      if (levelFilter !== 'all' && p.level !== levelFilter) return false
      if (!q) return true
      const text = `${p.name} ${p.school} ${p.id} ${p.course} ${p.specialization}`.toLowerCase()
      return text.includes(q)
    })
  }, [searchQuery, schoolFilter, levelFilter])

  // Current Program & Syllabus
  const selectedProgram = useMemo(() => {
    return PROGRAMS.find((p) => p.id === selectedId) || PROGRAMS[0]
  }, [selectedId])

  const syllabus = useMemo<ProgramSyllabus | null>(() => {
    return getProgramSyllabus(selectedProgram.id)
  }, [selectedProgram])

  // Distinct Schools
  const schools = useMemo(() => {
    return Array.from(new Set(PROGRAMS.map((p) => p.school)))
  }, [])

  // Handle program switch
  const handleSelectProgram = (id: string) => {
    setSelectedId(id)
    setSelectedSem(1)
  }

  const currentSemesterData = syllabus?.semesters.find((s) => s.semesterNumber === selectedSem) || syllabus?.semesters[0]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl p-8 sm:p-10 text-white bg-gradient-to-br from-[#2C2621] via-[#352D26] to-[#453A31] border border-[#2C2621] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2">
          <span className="text-[11px] font-extrabold tracking-widest text-[#E6AF2E] uppercase flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Sandip University Academic Curricula
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#FAF6F0]">
            Official Program Syllabus Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#DFD7CB] leading-relaxed">
            Choice Based Credit System (CBCS) and NEP 2020 aligned course curricula across 114 degree programmes at Sandip University.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="h-11 text-xs font-bold rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Syllabus
          </Button>
          <Link href="/student/career-profile">
            <Button
              size="sm"
              className="h-11 px-5 text-xs font-bold rounded-2xl bg-[#A36B40] hover:bg-[#8E5B33] text-white shadow-md shadow-[#A36B40]/25"
            >
              Back to Career Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Sidebar Navigator + Syllabus Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Programme Directory (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#2C2621]">Programmes Directory</h3>
              <p className="text-[11px] text-[#7A7067]">
                Browse {filteredPrograms.length} of 114 official curricula
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
                className="h-9 px-2 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0]/40 text-[11px] font-medium text-[#2C2621] focus:outline-none"
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
                className="h-9 px-2 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0]/40 text-[11px] font-medium text-[#2C2621] focus:outline-none"
              >
                <option value="all">All Levels</option>
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
                <option value="Diploma">Diploma</option>
                <option value="PhD">Doctoral (PhD)</option>
              </select>
            </div>

            {/* Programme List Scroll */}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredPrograms.map((p) => {
                const isSelected = p.id === selectedId
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProgram(p.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 ${
                      isSelected
                        ? 'border-[#A36B40] bg-[#FAF6F0] ring-1 ring-[#A36B40]/40 shadow-xs'
                        : 'border-[#DFD7CB]/80 bg-white hover:border-[#A36B40]/40 hover:bg-[#FAF6F0]/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#A36B40] uppercase">
                        {p.id}
                      </span>
                      <Badge className="bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-[9px] font-bold px-1.5 py-0">
                        {p.level}
                      </Badge>
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
            </div>
          </Card>
        </div>

        {/* Right Column: Detailed Syllabus Document (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {syllabus ? (
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Program Overview Banner */}
              <div className="space-y-3 pb-6 border-b border-[#DFD7CB]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#A36B40] bg-[#F7EFEA] px-2.5 py-1 rounded-xl border border-[#A36B40]/20">
                      {syllabus.programId}
                    </span>
                    <Badge className="bg-[#FAF6F0] text-[#2C2621] border-[#DFD7CB] text-xs font-bold">
                      {syllabus.level} Degree
                    </Badge>
                  </div>
                  <span className="text-xs font-bold text-[#77734B] bg-[#F1F1EB] px-3 py-1 rounded-full border border-[#77734B]/30">
                    {syllabus.durationYears} Years · {syllabus.totalSemesters} Semesters · {syllabus.totalCredits} Total Credits
                  </span>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#2C2621] tracking-tight">
                    {syllabus.name}
                  </h2>
                  <p className="text-xs font-semibold text-[#A36B40] mt-0.5">
                    {syllabus.school} · Sandip University, Nashik
                  </p>
                </div>

                <p className="text-xs text-[#7A7067] leading-relaxed">
                  {syllabus.overview}
                </p>

                {/* Key Tags */}
                <div className="flex items-center gap-2 flex-wrap pt-1 text-[10px] text-[#2C2621]">
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#DFD7CB] font-semibold">
                    Framework: {syllabus.academicFramework}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#DFD7CB] font-semibold">
                    Prerequisite: {selectedProgram.streamSource}
                  </span>
                </div>
              </div>

              {/* Semester Navigation Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#7A7067]">
                    Semester Curriculum & Course Units
                  </h3>
                  <span className="text-[11px] font-semibold text-[#A36B40]">
                    Select a semester below
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {syllabus.semesters.map((s) => (
                    <button
                      key={s.semesterNumber}
                      type="button"
                      onClick={() => setSelectedSem(s.semesterNumber)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                        selectedSem === s.semesterNumber
                          ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-sm'
                          : 'bg-[#FAF6F0]/80 text-[#7A7067] hover:text-[#2C2621] hover:bg-[#FAF6F0] border-[#DFD7CB]'
                      }`}
                    >
                      Semester {s.semesterNumber}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Semester Course Modules */}
              {currentSemesterData && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-[#2C2621]">
                        {currentSemesterData.title}
                      </h4>
                      <p className="text-[11px] text-[#7A7067]">
                        Semester Credit Weight: {currentSemesterData.credits} Credits · {currentSemesterData.courses.length} Subject Modules
                      </p>
                    </div>
                    <Badge className="bg-white border-[#DFD7CB] text-[#2C2621] text-xs font-bold">
                      {currentSemesterData.credits} Total Credits
                    </Badge>
                  </div>

                  <div className="space-y-3.5">
                    {currentSemesterData.courses.map((course, cidx) => (
                      <div
                        key={course.code + cidx}
                        className="p-5 rounded-2xl bg-white border border-[#DFD7CB] space-y-3 shadow-2xs hover:border-[#A36B40]/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black text-[#A36B40] bg-[#F7EFEA] px-2 py-0.5 rounded border border-[#A36B40]/20">
                                {course.code}
                              </span>
                              <Badge
                                className={`text-[10px] font-bold ${
                                  course.type === 'Core'
                                    ? 'bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30'
                                    : course.type === 'Laboratory' || course.type === 'Studio'
                                    ? 'bg-[#F7EFEA] text-[#A36B40] border-[#A36B40]/30'
                                    : 'bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB]'
                                }`}
                              >
                                {course.type}
                              </Badge>
                              <span className="text-[11px] text-[#7A7067] font-medium">
                                L-T-P: {course.ltp}
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-[#2C2621] mt-1.5">
                              {course.title}
                            </h5>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-[#A36B40]">
                              {course.credits} Credits
                            </span>
                          </div>
                        </div>

                        {/* Units Outline */}
                        <div className="space-y-1.5 pt-1 border-t border-[#DFD7CB]/50">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7A7067]">
                            Syllabus Units & Key Topics
                          </p>
                          <ul className="space-y-1">
                            {course.units.map((unit, uidx) => (
                              <li key={uidx} className="text-xs text-[#2C2621] flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#A36B40] mt-1.5 shrink-0" />
                                <span className="leading-relaxed">{unit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Course Learning Outcome */}
                        <div className="p-3 rounded-xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/60 text-[11px] text-[#7A7067]">
                          <strong className="text-[#2C2621]">Course Learning Outcome:</strong> {course.learningOutcome}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specialization Tracks & Career Outcomes */}
              <div className="space-y-4 pt-6 border-t border-[#DFD7CB]">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#7A7067]">
                  Career Trajectories & Professional Outlets
                </h4>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {syllabus.careerOutcomes.map((career) => (
                    <span
                      key={career}
                      className="text-xs font-bold bg-[#FAF6F0] text-[#2C2621] px-3 py-1.5 rounded-xl border border-[#DFD7CB]"
                    >
                      {career}
                    </span>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-[#F7EFEA] border border-[#A36B40]/25 text-xs text-[#8E5B33] flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <strong className="text-[#2C2621]">Accreditation & Quality Standards:</strong>
                    <p className="text-[11px] mt-0.5">{syllabus.accreditationNotes}</p>
                  </div>
                  <Link href="/student/counselor">
                    <Button
                      size="sm"
                      className="h-9 px-4 text-xs font-bold rounded-xl bg-[#A36B40] hover:bg-[#8E5B33] text-white"
                    >
                      Consult Academic Advisor
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-12 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-[#A36B40] mx-auto" />
              <h3 className="text-base font-bold text-[#2C2621]">Curriculum In Development</h3>
              <p className="text-xs text-[#7A7067]">
                Please select another course from the directory on the left.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StudentSyllabusPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-sm font-medium text-[#7A7067]">
          Loading Sandip University Program Syllabus...
        </div>
      }
    >
      <SyllabusContent />
    </Suspense>
  )
}
