'use client'

import { useState, Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  GraduationCap, Award, CheckCircle2, ArrowRight, ExternalLink,
  Sparkles, ShieldCheck, Mail, Phone, BookOpen, Download,
  Building2, Users, FileText, Check, Star, Compass, Cpu, Cloud,
  Layers, BarChart3, ArrowUpRight, MapPin, Calendar, CheckCheck,
  AlertCircle, Info, Target, BookmarkCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  getAllCourses,
  getAllDimensions,
  getCourseById,
  type UniversityCourse,
  type AssessmentDimension,
} from '@/lib/engines'

const ADMISSION_URL = 'https://admission.sandipuniversity.edu.in/'

function FresherReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const referralCode = searchParams?.get('code') || 'SUN-FRESHERS-2026'
  const candidateName = searchParams?.get('name') || 'Prospective Candidate'
  const candidateEmail = searchParams?.get('email') || ''
  const candidatePhone = searchParams?.get('phone') || ''
  const academicLevel = (searchParams?.get('level') === 'PG' ? 'PG' : 'UG') as 'UG' | 'PG'
  const mentorName = searchParams?.get('mentor') || 'Admissions & Advisory Council'
  const qualification = searchParams?.get('qualification') || ''
  const progId = searchParams?.get('progId') || ''
  const recommendedSpec = searchParams?.get('recommendedSpec') || 'Computer Science & Engineering'
  const fitScore = Number(searchParams?.get('fitScore') || 92)

  // Extract Top 3 Dimensions and Scores
  const d1Name = searchParams?.get('d1Name') || 'Technology & computing'
  const d1Score = Number(searchParams?.get('d1Score') || 94)
  const d1Code = searchParams?.get('d1Code') || 'TECHNOLOGY'

  const d2Name = searchParams?.get('d2Name') || 'Engineering & applied technology'
  const d2Score = Number(searchParams?.get('d2Score') || 86)
  const d2Code = searchParams?.get('d2Code') || 'ENGINEERING'

  const d3Name = searchParams?.get('d3Name') || 'Business & management'
  const d3Score = Number(searchParams?.get('d3Score') || 78)
  const d3Code = searchParams?.get('d3Code') || 'BUSINESS'

  // Look up matched course from catalog
  const allCourses = useMemo(() => getAllCourses(), [])
  const matchedCourse: UniversityCourse = useMemo(() => {
    if (progId) {
      const found = getCourseById(progId)
      if (found) return found
    }
    const levelCourses = allCourses.filter((c) => c.level === academicLevel)
    return levelCourses.find((c) => c.specialization.toLowerCase().includes(recommendedSpec.toLowerCase())) ||
      levelCourses[0] || {
        program_id: 'SUN-001',
        school: 'Engineering & Technology',
        level: academicLevel,
        course: 'B.Tech',
        specialization: recommendedSpec,
        suitable_12th_stream: 'PCM',
        career_domains: 'Software engineering, artificial intelligence, cloud architecture',
        domain_ids: ['TECHNOLOGY', 'ENGINEERING'],
        active_status: 'ACTIVE',
      }
  }, [progId, recommendedSpec, academicLevel, allCourses])

  // Alternative recommendations from catalog matching top domains
  const alternativeCourses = useMemo(() => {
    return allCourses
      .filter((c) => c.level === academicLevel && c.program_id !== matchedCourse.program_id)
      .filter((c) => c.domain_ids.includes(d1Code) || c.domain_ids.includes(d2Code))
      .slice(0, 3)
  }, [allCourses, academicLevel, matchedCourse.program_id, d1Code, d2Code])

  const top3Domains = [
    { name: d1Name, score: d1Score, code: d1Code, rank: 1, label: 'Primary Alignment', badgeBg: 'bg-emerald-100 text-emerald-800' },
    { name: d2Name, score: d2Score, code: d2Code, rank: 2, label: 'High Synergy', badgeBg: 'bg-blue-100 text-blue-800' },
    { name: d3Name, score: d3Score, code: d3Code, rank: 3, label: 'Complementary Strengths', badgeBg: 'bg-amber-100 text-amber-800' },
  ]

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans text-[#2C2621]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-[#DFD7CB] shadow-sm">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#A36B40] via-[#C6A18D] to-[#77734B] flex items-center justify-center text-white shadow-md shadow-[#A36B40]/25 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-[#2C2621] tracking-tight">
                  {academicLevel} Career Decision & Specialization Report
                </h1>
                <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] text-[11px] font-bold px-2.5 py-0.5">
                  {academicLevel} Decision Ready
                </Badge>
              </div>
              <p className="text-xs text-[#7A7067] mt-0.5">
                Sandip University Career Intelligence Platform · Official Diagnostic Result for <strong className="text-[#2C2621]">{candidateName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="text-xs font-semibold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] gap-1.5 h-9 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#A36B40]" />
              <span>Download Report</span>
            </Button>
            <Link href="/student/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold rounded-xl text-[#7A7067] hover:text-[#2C2621] hover:bg-[#FAF6F0] h-9"
              >
                Exit to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* 5-Step Process Pipeline Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { step: '1', title: 'Advisor', desc: mentorName.split(' ')[0] || 'Admissions', done: true },
            { step: '2', title: 'Token', desc: referralCode, done: true },
            { step: '3', title: `${academicLevel} Test`, desc: 'Completed', done: true },
            { step: '4', title: 'Fit Report', desc: `${fitScore}% Match`, done: true },
            { step: '5', title: 'Admission', desc: 'Action Ready', active: true },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center space-y-1 transition-all ${
                item.active
                  ? 'col-span-2 sm:col-span-1 bg-[#A36B40] text-white border-[#8E5B34] shadow-md shadow-[#A36B40]/25'
                  : 'bg-white border-[#DFD7CB] text-[#2C2621]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  item.active
                    ? 'bg-white text-[#A36B40]'
                    : 'bg-[#FAF6F0] text-[#77734B] border border-[#DFD7CB]'
                }`}
              >
                {item.done ? '✓' : item.step}
              </div>
              <span className="text-xs font-bold block leading-tight">{item.title}</span>
              <span className={`text-[10px] block truncate max-w-[120px] ${
                item.active ? 'text-amber-100 font-medium' : 'text-[#7A7067]'
              }`}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Candidate Summary Strip */}
        <div className="bg-white rounded-2xl p-4 border border-[#DFD7CB] shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#7A7067] uppercase font-bold tracking-wider block">Candidate Name</span>
            <span className="font-bold text-[#2C2621] block truncate">{candidateName}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#7A7067] uppercase font-bold tracking-wider block">Contact Number</span>
            <span className="font-mono font-medium text-[#2C2621] block truncate">{candidatePhone || 'Not Specified'}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#7A7067] uppercase font-bold tracking-wider block">Email Address</span>
            <span className="font-medium text-[#2C2621] block truncate">{candidateEmail || 'Candidate Record'}</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] text-[#7A7067] uppercase font-bold tracking-wider block">Referral Key</span>
            <span className="font-mono font-bold text-[#A36B40] block truncate">{referralCode}</span>
          </div>
        </div>

        {/* Hero Specialization Recommendation Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1F1915] via-[#2A221C] to-[#1A1512] text-white shadow-xl border border-[#3E342D] relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#A36B40]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#77734B]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            
            {/* Header with Title and Alignment Score */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
              <div className="space-y-2">
                <Badge className="bg-[#A36B40]/30 text-[#E8C5A8] border-[#A36B40]/60 text-xs font-bold gap-1.5 px-3 py-1">
                  <Star className="w-3.5 h-3.5 fill-[#E8C5A8] text-[#E8C5A8]" />
                  Optimal {academicLevel} Degree Recommendation
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight pt-1">
                  {matchedCourse.course} in {matchedCourse.specialization}
                </h2>
                <p className="text-xs sm:text-sm text-[#DFD7CB] font-medium">
                  {matchedCourse.school} · <span className="text-[#C6A18D]">Program Code: {matchedCourse.program_id}</span>
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3.5 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 self-start">
                <div className="text-right">
                  <span className="text-[10px] text-[#DFD7CB] uppercase tracking-wider block font-bold">
                    Suitability Fit
                  </span>
                  <span className="text-2xl font-black text-white">{fitScore}%</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A36B40] to-[#8E5B34] border border-amber-300/30 flex items-center justify-center font-black text-lg text-white shadow-md">
                  {fitScore >= 85 ? 'A+' : fitScore >= 70 ? 'A' : 'B+'}
                </div>
              </div>
            </div>

            {/* Key Decision Points Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-[#C6A18D]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Campus Location</span>
                </div>
                <span className="font-semibold text-white block">Sandip University, Nashik Campus</span>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-[#C6A18D]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Prerequisite Stream</span>
                </div>
                <span className="font-semibold text-white block">{matchedCourse.suitable_12th_stream || 'General'}</span>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Admission Status</span>
                </div>
                <span className="font-semibold text-emerald-300 block">Admissions Open 2026-27</span>
              </div>
            </div>

            {/* Evaluation Rationale */}
            <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs text-[#DFD7CB] space-y-1">
              <span className="text-[10px] font-bold text-[#C6A18D] uppercase tracking-wider block">Evaluation Rationale</span>
              <p className="leading-relaxed">
                Candidate exhibits highest alignment for <strong>{d1Name} ({d1Score}%)</strong> and <strong>{d2Name} ({d2Score}%)</strong>. This degree program delivers direct career specialization into {matchedCourse.career_domains}.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={ADMISSION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-2xl bg-gradient-to-r from-[#A36B40] via-[#B87B4C] to-[#8E5B34] hover:from-[#8E5B34] hover:to-[#734725] text-white font-bold text-sm shadow-lg shadow-[#A36B40]/30 hover:shadow-[#A36B40]/50 transition-all active:scale-[0.99] cursor-pointer"
              >
                <span>Apply Online for {academicLevel} Admission</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <span className="text-xs text-[#DFD7CB] text-center sm:text-left">
                Referral Token <span className="font-mono text-white font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-white/15">[{referralCode}]</span> applied for priority admissions evaluation.
              </span>
            </div>

          </div>
        </div>

        {/* ─── TOP 3 RECOMMENDED CAREER DOMAINS ────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-[#2C2621] tracking-tight flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#A36B40]" />
                <span>Top 3 Recommended Career Domains</span>
              </h3>
              <p className="text-xs text-[#7A7067]">
                Ranked by multi-dimensional cognitive aptitude, reasoning, and domain compatibility scoring
              </p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold px-3 py-1 self-start sm:self-auto">
              Diagnostic Engine Validated
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {top3Domains.map((dom) => (
              <Card
                key={dom.rank}
                className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                  dom.rank === 1
                    ? 'border-[#A36B40] ring-2 ring-[#A36B40]/25 shadow-sm'
                    : 'border-[#DFD7CB]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${dom.badgeBg}`}>
                      Rank #{dom.rank} · {dom.label}
                    </span>
                    <span className="text-[11px] font-bold text-[#77734B]">
                      {dom.score}% Score
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-[#2C2621] leading-tight">
                      {dom.name}
                    </h4>
                  </div>

                  <Progress value={dom.score} className="h-2 bg-[#FAF6F0]" />

                  <p className="text-xs text-[#5C544D] leading-relaxed">
                    Demonstrates strong behavioral affinity, interest intensity, and problem-solving readiness in this academic domain.
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* ─── ALTERNATIVE UNIVERSITY DEGREE PATHWAYS ────────── */}
        {alternativeCourses.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-black text-[#2C2621] tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#77734B]" />
              <span>Alternative Degree Pathways to Consider</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {alternativeCourses.map((alt) => (
                <Card key={alt.program_id} className="p-5 rounded-3xl bg-white border border-[#DFD7CB] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] text-[#A36B40] bg-[#FAF6F0] border-[#DFD7CB]">
                      {alt.level} Degree
                    </Badge>
                    <span className="text-[10px] text-[#7A7067] font-mono">{alt.program_id}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2C2621] leading-tight">
                      {alt.course} in {alt.specialization}
                    </h4>
                    <p className="text-[11px] text-[#7A7067] mt-1">{alt.school}</p>
                  </div>
                  <div className="pt-2 border-t border-[#FAF6F0] text-[11px] text-[#5C544D]">
                    Prerequisite: <strong>{alt.suitable_12th_stream || 'Any'}</strong>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Advisory Council Endorsement Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#DFD7CB] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 flex-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#77734B]/15 flex items-center justify-center text-[#77734B] font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#2C2621]">Advisory Council Endorsement</h4>
                <p className="text-xs text-[#7A7067]">Official recommendation by {mentorName}</p>
              </div>
            </div>
            <p className="text-xs text-[#5C544D] leading-relaxed">
              Based on the diagnostic assessment, candidate <strong className="text-[#2C2621]">{candidateName}</strong> is recommended for <strong className="text-[#A36B40]">{matchedCourse.course} in {matchedCourse.specialization}</strong> at Sandip University.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href={ADMISSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-2xl bg-[#2C2621] hover:bg-[#1A1512] text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer w-full"
            >
              <span>Apply for {academicLevel} Priority Admission</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function FresherReportPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[#7A7067]">Generating Career Decision Report...</div>}>
      <FresherReportContent />
    </Suspense>
  )
}
