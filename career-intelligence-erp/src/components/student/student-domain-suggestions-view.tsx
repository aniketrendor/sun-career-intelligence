'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Compass, Sparkles, Building2, GraduationCap,
  ArrowRight, Search, CheckCircle2, BookOpen,
  Award, Layers, Check, ExternalLink, ShieldCheck,
  ChevronRight, Filter, Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  SANDIP_MASTER_PROGRAMS,
  SANDIP_SCHOOLS,
  SANDIP_LEVELS,
  getRecommendedSandipCourses,
  type SandipProgram
} from '@/lib/services/sandip-catalog'

interface StudentDomainSuggestionsViewProps {
  studentName: string
  studentLevel: 'UG' | 'PG'
  topDomains: string[]
  studentProgram?: string
  hasCompletedTest: boolean
}

export function StudentDomainSuggestionsView({
  studentName,
  studentLevel,
  topDomains,
  studentProgram,
  hasCompletedTest,
}: StudentDomainSuggestionsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<string>('All Schools')
  const [selectedLevel, setSelectedLevel] = useState<string>(studentLevel || 'ALL')
  const [selectedStream, setSelectedStream] = useState<string>('ALL')

  // Calculate top recommendations based on assessment results
  const recommendations = useMemo(() => {
    return getRecommendedSandipCourses(
      topDomains.length > 0 ? topDomains : ['Technology', 'Engineering', 'Management', 'Design'],
      studentLevel || 'UG',
      6
    )
  }, [topDomains, studentLevel])

  // Catalog filtered items
  const filteredCatalog = useMemo(() => {
    return SANDIP_MASTER_PROGRAMS.filter((p) => {
      if (selectedSchool !== 'All Schools' && p.school !== selectedSchool) return false
      if (selectedLevel !== 'ALL' && p.level !== selectedLevel) return false
      if (selectedStream !== 'ALL') {
        const streamStr = (p.suitable_stream || p.primary_stream || '').toLowerCase()
        if (!streamStr.includes(selectedStream.toLowerCase()) && !streamStr.includes('any')) return false
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = p.name.toLowerCase().includes(q)
        const matchCode = p.code.toLowerCase().includes(q)
        const matchSpec = p.specialization.toLowerCase().includes(q)
        const matchDomains = p.career_domains.some(d => d.toLowerCase().includes(q))
        if (!matchName && !matchCode && !matchSpec && !matchDomains) return false
      }
      return true
    })
  }, [selectedSchool, selectedLevel, selectedStream, searchQuery])

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-9 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
            <Compass className="w-3.5 h-3.5 text-[#A36B40]" /> Sandip University Course Catalog & Alignment
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Domain & Program Suggestions
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
            Personalized course pathways and specializations at Sandip University tailored to your psychometric traits, stream prerequisites, and career orientation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/student/assessment?start=true">
            <Button className="h-11 px-6 rounded-2xl bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs shadow-md shadow-[#A36B40]/25 flex items-center gap-2 cursor-pointer transition-all">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{hasCompletedTest ? 'Retake Diagnostic Test' : 'Take Diagnostic Test'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top AI Matched Programs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#A36B40]" />
              <span>Top AI-Recommended Programs for You</span>
            </h2>
            <p className="text-xs text-[#7A7067]">
              Ranked using your multi-dimensional aptitude scores and Sandip University curriculum mappings.
            </p>
          </div>
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] font-bold text-xs">
            {recommendations.length} Best Matches
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendations.map(({ program, matchScore }, idx) => (
            <Card
              key={program.code}
              className="bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:shadow-md transition-all rounded-3xl shadow-xs overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <CardHeader className="p-5 pb-3 border-b border-[#F0EAE1] bg-[#FAF8F5]/50">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-white border border-[#DFD7CB] text-[#2C2621]">
                      {program.code}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {matchScore}% Match
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#7A7067] block line-clamp-1">
                    {program.school}
                  </span>
                  <CardTitle className="text-base font-bold text-[#2C2621] mt-0.5 leading-snug group-hover:text-[#A36B40] transition-colors">
                    {program.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[11px] bg-[#FAF6F0] p-2.5 rounded-xl border border-[#DFD7CB]">
                    <span className="text-[#7A7067]">Level: <strong className="text-[#2C2621]">{program.level}</strong></span>
                    <span className="text-[#7A7067]">Stream: <strong className="text-[#A36B40]">{program.suitable_stream}</strong></span>
                    <span className="text-[#7A7067]">Duration: <strong className="text-[#2C2621]">{program.duration_years} yrs</strong></span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#7A7067] uppercase tracking-wider block mb-1">
                      Target Career Outcomes
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {program.career_domains.map(d => (
                        <span key={d} className="text-[10px] bg-white border border-[#DFD7CB] text-[#2C2621] px-2 py-0.5 rounded-lg font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 border-t border-[#F0EAE1] bg-[#FAF8F5]/30 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#7A7067]">Sandip University Nashik</span>
                <Link
                  href="/student/counselor"
                  className="font-bold text-[#A36B40] hover:text-[#8E5B33] flex items-center gap-1 cursor-pointer"
                >
                  <span>Talk to Mentor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Full 114 Program Curriculum Catalog Explorer */}
      <div className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2C2621] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#A36B40]" />
              <span>Explore All 114 Sandip University Degree Programs</span>
            </h2>
            <p className="text-xs text-[#7A7067]">
              Browse complete specializations across all 8 schools of study.
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-[#DFD7CB] rounded-3xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-[#7A7067] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by degree, specialization, domain, or code..."
                className="pl-10 h-10 rounded-2xl border-[#DFD7CB] bg-[#FAF8F5] focus:bg-white text-xs text-[#2C2621] focus:border-[#A36B40]"
              />
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-2xl border border-[#DFD7CB] bg-white text-xs font-bold text-[#2C2621] focus:outline-none focus:border-[#A36B40] cursor-pointer"
              >
                <option value="ALL">All Levels</option>
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
                <option value="PhD">Doctoral (PhD)</option>
                <option value="Diploma">Diploma</option>
              </select>
            </div>

            {/* Stream Filter */}
            <div>
              <select
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="w-full h-10 px-3 rounded-2xl border border-[#DFD7CB] bg-white text-xs font-bold text-[#2C2621] focus:outline-none focus:border-[#A36B40] cursor-pointer"
              >
                <option value="ALL">All 12th Streams</option>
                <option value="PCM">Science (PCM / Maths)</option>
                <option value="PCB">Science (PCB / Bio)</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts / Humanities</option>
                <option value="Any">Any Stream</option>
              </select>
            </div>
          </div>

          {/* School Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {SANDIP_SCHOOLS.map((school) => {
              const isSelected = selectedSchool === school
              const count = school === 'All Schools'
                ? SANDIP_MASTER_PROGRAMS.length
                : SANDIP_MASTER_PROGRAMS.filter(p => p.school === school).length

              return (
                <button
                  key={school}
                  type="button"
                  onClick={() => setSelectedSchool(school)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 text-xs ${
                    isSelected
                      ? 'bg-[#A36B40] text-white shadow-xs'
                      : 'bg-[#FAF6F0] text-[#7A7067] hover:bg-[#F0EAE1] hover:text-[#2C2621] border border-[#DFD7CB]/60'
                  }`}
                >
                  <span>{school}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-[#7A7067]'}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="text-xs text-[#7A7067] px-1">
          Displaying <strong className="text-[#2C2621]">{filteredCatalog.length}</strong> matching programs
        </div>

        {/* Full Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCatalog.map((prog) => (
            <Card
              key={prog.code}
              className="bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:shadow-md transition-all rounded-3xl shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <div>
                <CardHeader className="p-5 pb-3 border-b border-[#F0EAE1] bg-[#FAF8F5]/60">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-white border border-[#DFD7CB] text-[#2C2621]">
                      {prog.code}
                    </span>
                    <Badge className="bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-[10px] font-bold">
                      {prog.level}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-semibold text-[#7A7067] block line-clamp-1">
                    {prog.school}
                  </span>
                  <CardTitle className="text-base font-bold text-[#2C2621] mt-0.5 leading-snug">
                    {prog.name}
                  </CardTitle>
                  {prog.specialization && prog.specialization !== '-' && (
                    <p className="text-xs font-semibold text-[#A36B40] mt-1 line-clamp-1">
                      Specialization: {prog.specialization}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="p-5 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-[#FAF6F0] p-2.5 rounded-xl border border-[#DFD7CB] text-[11px]">
                    <div>
                      <span className="text-[#7A7067] block text-[10px] font-bold">DURATION</span>
                      <span className="font-bold text-[#2C2621]">{prog.duration_years} Years ({prog.total_semesters} Sems)</span>
                    </div>
                    <div>
                      <span className="text-[#7A7067] block text-[10px] font-bold">STREAM ELIGIBILITY</span>
                      <span className="font-bold text-[#A36B40] truncate block">{prog.suitable_stream}</span>
                    </div>
                  </div>

                  {prog.career_domains.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-[#7A7067] uppercase tracking-wider block mb-1">
                        Career Domains
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {prog.career_domains.map(d => (
                          <span key={d} className="text-[10px] bg-white border border-[#DFD7CB] text-[#2C2621] px-2 py-0.5 rounded-lg font-medium">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {prog.notes && (
                    <div className="text-[11px] text-[#7A7067] italic bg-[#FAF8F5] p-2 rounded-xl border border-[#DFD7CB]/60">
                      💡 {prog.notes}
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 border-t border-[#F0EAE1] bg-[#FAF8F5]/30 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#7A7067]">Admissions 2026-27</span>
                <Link
                  href="/student/counselor"
                  className="font-bold text-[#A36B40] hover:text-[#8E5B33] flex items-center gap-1 cursor-pointer"
                >
                  <span>Counseling</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
