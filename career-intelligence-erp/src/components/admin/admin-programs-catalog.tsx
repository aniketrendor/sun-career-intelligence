'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2, GraduationCap, Search, Filter,
  ArrowRight, BookOpen, Layers, CheckCircle2,
  Sparkles, Award, Compass, School, Tag,
  Briefcase, ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SANDIP_SCHOOLS, SANDIP_LEVELS, type SandipProgram } from '@/lib/services/sandip-catalog'

interface AdminProgramsCatalogProps {
  initialPrograms: any[]
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

export function AdminProgramsCatalog({ initialPrograms }: AdminProgramsCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<string>('All Schools')
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')
  const [selectedStream, setSelectedStream] = useState<string>('ALL')

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
    return { total, ug, pg, phd, diploma }
  }, [initialPrograms])

  return (
    <div className="space-y-6">
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
          <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider block">Doctoral / PhD</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-stone-800">{stats.phd}</span>
            <span className="text-xs text-stone-600">Research</span>
          </div>
        </div>

        <div className="bg-white border border-[#DFD7CB] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">Diploma</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-teal-800">{stats.diploma}</span>
            <span className="text-xs text-teal-600">Vocational</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-[#7A7067] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code (e.g. SUN-001), specialization, degree, or keyword..."
              className="pl-10 h-11 rounded-2xl border-[#DFD7CB] bg-[#FAF8F5] focus:bg-white text-sm text-[#2C2621] focus:border-[#A36B40]"
            />
          </div>

          {/* Level Selector */}
          <div className="flex items-center gap-2">
            <div className="w-full">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full h-11 px-3.5 rounded-2xl border border-[#DFD7CB] bg-white text-xs font-bold text-[#2C2621] focus:outline-none focus:border-[#A36B40] cursor-pointer"
              >
                <option value="ALL">All Academic Levels ({stats.total})</option>
                <option value="UG">Undergraduate (UG - {stats.ug})</option>
                <option value="PG">Postgraduate (PG - {stats.pg})</option>
                <option value="PhD">Doctoral (PhD - {stats.phd})</option>
                <option value="Diploma">Diploma ({stats.diploma})</option>
              </select>
            </div>
          </div>
        </div>

        {/* School Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {SANDIP_SCHOOLS.map((school) => {
            const isSelected = selectedSchool === school
            const count = school === 'All Schools'
              ? initialPrograms.length
              : initialPrograms.filter(p => p.school === school).length

            return (
              <button
                key={school}
                type="button"
                onClick={() => setSelectedSchool(school)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 text-xs ${
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

      {/* Showing Result Count Header */}
      <div className="flex items-center justify-between px-1 text-xs text-[#7A7067]">
        <span>
          Showing <strong className="text-[#2C2621]">{filteredPrograms.length}</strong> of {initialPrograms.length} Sandip University programs
        </span>
        {filteredPrograms.length !== initialPrograms.length && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedSchool('All Schools')
              setSelectedLevel('ALL')
              setSelectedStream('ALL')
            }}
            className="text-[#A36B40] hover:underline font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPrograms.map((prog: any) => {
          const schoolStyle = SCHOOL_COLORS[prog.school] || { bg: 'bg-stone-50', text: 'text-stone-700', border: 'border-stone-200' }

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

                  {/* Notes / Special feature */}
                  {prog.notes && (
                    <div className="text-[11px] text-[#7A7067] italic bg-[#FAF8F5] p-2 rounded-xl border border-[#DFD7CB]/60 line-clamp-2">
                      💡 {prog.notes}
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 border-t border-[#F0EAE1] bg-[#FAF8F5]/30 flex items-center justify-between text-xs">
                <span className="text-[11px] text-[#7A7067]">
                  Academic Year: <strong className="text-[#2C2621]">{prog.academic_year || '2026-27'}</strong>
                </span>
                <Link
                  href={`/admin/classes?program=${prog.id}`}
                  className="font-bold text-[#A36B40] hover:text-[#8E5B33] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  Manage Classes <ArrowRight className="w-3.5 h-3.5" />
                </Link>
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
    </div>
  )
}
