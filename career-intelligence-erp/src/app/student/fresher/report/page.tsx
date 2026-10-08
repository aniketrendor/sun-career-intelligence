'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  GraduationCap, Award, CheckCircle2, ArrowRight, ExternalLink,
  Sparkles, ShieldCheck, Mail, Phone, BookOpen, Download,
  Building2, Users, FileText, Check, Star, Compass, Cpu, Cloud,
  Layers, BarChart3, ArrowUpRight, MapPin, Calendar, CheckCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const ADMISSION_URL = 'https://admission.sandipuniversity.edu.in/'

function FresherReportContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const referralCode = searchParams.get('code') || 'SUN-FRESHERS-2026'
  const candidateName = searchParams.get('name') || 'Harish'
  const candidateEmail = searchParams.get('email') || ''
  const candidatePhone = searchParams.get('phone') || ''
  const academicLevel = (searchParams.get('level') === 'PG' ? 'PG' : 'UG') as 'UG' | 'PG'
  const mentorName = searchParams.get('mentor') || 'Admissions & Advisory Council'
  const d1Name = searchParams.get('d1Name') || searchParams.get('topDomain') || 'Computer Science & Information Technology'
  const d1Score = Number(searchParams.get('d1Score') || searchParams.get('fitScore') || 94)
  const d1Label = searchParams.get('d1Label') || 'Strong Alignment'
  const d1Code = searchParams.get('d1Code') || 'CS_IT'

  const d2Name = searchParams.get('d2Name') || 'Engineering & Advanced Technology'
  const d2Score = Number(searchParams.get('d2Score') || 86)
  const d2Label = searchParams.get('d2Label') || 'High Compatibility'
  const d2Code = searchParams.get('d2Code') || 'ENG_TECH'

  const d3Name = searchParams.get('d3Name') || 'Business & Management'
  const d3Score = Number(searchParams.get('d3Score') || 78)
  const d3Label = searchParams.get('d3Label') || 'Moderate Alignment'
  const d3Code = searchParams.get('d3Code') || 'BUS_MGMT'

  const top3Domains = [
    {
      rank: 1,
      name: d1Name,
      code: d1Code,
      score: d1Score,
      label: d1Label,
      tag: 'Best Fit / Primary Recommendation',
      badgeBg: 'bg-[#A36B40] text-white shadow-xs',
      meterColor: 'from-[#A36B40] to-[#C87D55]',
      degreePath: academicLevel === 'UG' ? 'B.Tech CSE (AI & ML) / Software Engineering' : 'M.Tech CSE / MCA Advanced Full-Stack',
      rationale: 'Highest cognitive affinity, structured logic, and technical problem decomposition instincts.',
    },
    {
      rank: 2,
      name: d2Name,
      code: d2Code,
      score: d2Score,
      label: d2Label,
      tag: 'Strong Alternative Pathway',
      badgeBg: 'bg-[#77734B] text-white shadow-xs',
      meterColor: 'from-[#77734B] to-[#969163]',
      degreePath: academicLevel === 'UG' ? 'B.Tech Cloud Systems & Cyber Defense / Robotics' : 'M.Tech Cloud Infrastructure & DevSecOps',
      rationale: 'Robust analytical capacity and quantitative modeling suitable for advanced systems architecture.',
    },
    {
      rank: 3,
      name: d3Name,
      code: d3Code,
      score: d3Score,
      label: d3Label,
      tag: 'Complementary Domain',
      badgeBg: 'bg-[#2C2621] text-white shadow-xs',
      meterColor: 'from-[#8E5B34] to-[#B0774B]',
      degreePath: academicLevel === 'UG' ? 'BCA & B.Tech Integrated / Business Analytics' : 'MBA Technology Management & Strategic Fintech',
      rationale: 'Complementary commercial acumen, strategic decision reasoning, and leadership aptitude.',
    },
  ]

  const topDomain = d1Name
  const fitScore = d1Score

  const aiScore = d1Score
  const cloudScore = d2Score
  const fsScore = d3Score
  const bizScore = Number(searchParams.get('bizScore') || 72)

  // Dynamically compute recommended program based on UG vs PG and topDomain
  let recommendedProgram = {
    degree: 'B.Tech in Computer Science & Engineering',
    specialization: 'Artificial Intelligence & Machine Learning (AI & ML)',
    faculty: 'School of Engineering & Technology (SOET)',
    campus: 'Sandip University Main Campus, Nashik',
    duration: '4 Years (8 Semesters)',
    eligibility: 'Verified · Passed 12th / Diploma with High STEM Aptitude',
    admissionStatus: 'Recommended for Direct Admission & Scholarship Grant',
  }

  if (academicLevel === 'UG') {
    if (topDomain.includes('AI')) {
      recommendedProgram = {
        degree: 'B.Tech in Computer Science & Engineering',
        specialization: 'Artificial Intelligence & Machine Learning (AI & ML)',
        faculty: 'School of Engineering & Technology (SOET)',
        campus: 'Sandip University Main Campus, Nashik',
        duration: '4 Years (8 Semesters)',
        eligibility: 'Verified · Passed 12th / Diploma with High STEM Aptitude',
        admissionStatus: 'Recommended for Direct Admission & Scholarship Grant',
      }
    } else if (topDomain.includes('Cloud')) {
      recommendedProgram = {
        degree: 'B.Tech in Computer Engineering',
        specialization: 'Cloud Computing & Cyber Security Systems',
        faculty: 'School of Engineering & Technology (SOET)',
        campus: 'Sandip University Main Campus, Nashik',
        duration: '4 Years (8 Semesters)',
        eligibility: 'Verified · Passed 12th / Diploma with High Systems Aptitude',
        admissionStatus: 'Recommended for Direct Admission & Lab Access',
      }
    } else if (topDomain.includes('Product')) {
      recommendedProgram = {
        degree: 'B.Tech in Computer Science & Software Engineering',
        specialization: 'Full-Stack Software Architecture & Web Systems',
        faculty: 'School of Engineering & Technology (SOET)',
        campus: 'Sandip University Main Campus, Nashik',
        duration: '4 Years (8 Semesters)',
        eligibility: 'Verified · High Engineering & Logic Fit',
        admissionStatus: 'Recommended for Direct Admission & Incubation Access',
      }
    } else {
      recommendedProgram = {
        degree: 'BCA & B.Tech Integrated',
        specialization: 'Technology Management & Business Analytics',
        faculty: 'School of Commerce & Management Studies',
        campus: 'Sandip University Main Campus, Nashik',
        duration: '3 - 4 Years',
        eligibility: 'Verified · High Business & Technology Analytical Fit',
        admissionStatus: 'Recommended for Direct Admission & Merit Scholarship',
      }
    }
  } else {
    // Postgraduate (PG)
    if (topDomain.includes('AI')) {
      recommendedProgram = {
        degree: 'M.Tech in Computer Science & Engineering',
        specialization: 'Artificial Intelligence & Data Engineering',
        faculty: 'School of Engineering & Technology (SOET)',
        campus: 'Sandip University Main Campus, Nashik',
        duration: '2 Years (4 Semesters)',
        eligibility: 'Verified · Graduate with High Machine Learning & Algorithmic Fit',
        admissionStatus: 'Recommended for PG Fellowship & Advanced Research Lab',
      }
    } else if (topDomain.includes('Cloud')) {
      recommendedProgram = {
        degree: 'M.Tech in Computer Engineering',
        specialization: 'Enterprise Cloud Infrastructure & Cyber Defense',
        faculty: 'School of Engineering & Technology (SOET)',
        campus: 'Sandip University Main Campus, Nashik',
        duration: '2 Years (4 Semesters)',
        eligibility: 'Verified · Graduate with Systems & DevSecOps Aptitude',
        admissionStatus: 'Recommended for PG Direct Admission & Industry Track',
      }
    } else if (topDomain.includes('Product')) {
      recommendedProgram = {
        degree: 'Master of Computer Applications (MCA)',
        specialization: 'Advanced Software Architecture & Enterprise Full-Stack',
        faculty: 'School of Computer Science & Applications',
        campus: 'Sandip University Main Campus, Nashik',
        duration: '2 Years (4 Semesters)',
        eligibility: 'Verified · Graduate with Strong Software Engineering Aptitude',
        admissionStatus: 'Recommended for Direct Admission & Placement Accelerator',
      }
    } else {
      recommendedProgram = {
        degree: 'MBA in Technology Management',
        specialization: 'Business Analytics & Strategic Fintech Innovation',
        faculty: 'School of Commerce & Management Studies',
        campus: 'Sandip University Main Campus, Nashik',
        duration: '2 Years (4 Semesters)',
        eligibility: 'Verified · Graduate with High Strategic & Analytical Aptitude',
        admissionStatus: 'Recommended for Executive Mentorship & Merit Fellowship',
      }
    }
  }

  const handleApplyClick = () => {
    toast.success('Opening Sandip University Online Admission Portal...')
    window.open(ADMISSION_URL, '_blank', 'noopener,noreferrer')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans text-[#2C2621]">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top University Header Card */}
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
              className="text-xs font-semibold rounded-xl border-[#DFD7CB] text-[#2C2621] hover:bg-[#FAF6F0] gap-1.5 h-9"
            >
              <Download className="w-3.5 h-3.5 text-[#A36B40]" />
              <span>Download Report</span>
            </Button>
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold rounded-xl text-[#7A7067] hover:text-[#2C2621] hover:bg-[#FAF6F0] h-9"
              >
                Exit
              </Button>
            </Link>
          </div>
        </div>

        {/* 5-Step Process Pipeline Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { step: '1', title: 'Advisor', desc: mentorName.split(' ')[0] || 'Admissions', done: true },
            { step: '2', title: 'Token', desc: referralCode, done: true },
            { step: '3', title: `${academicLevel} Test`, desc: '30/30 Complete', done: true },
            { step: '4', title: 'Fit Report', desc: `${fitScore}% Fit`, done: true },
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
          {/* Subtle Warm Amber Glow in top right */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#A36B40]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#77734B]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            
            {/* Header with Title and Alignment Score */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
              <div className="space-y-2">
                <Badge className="bg-[#A36B40]/30 text-[#E8C5A8] border-[#A36B40]/60 text-xs font-bold gap-1.5 px-3 py-1">
                  <Star className="w-3.5 h-3.5 fill-[#E8C5A8] text-[#E8C5A8]" />
                  Optimal {academicLevel} Specialization Identified
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight pt-1">
                  {recommendedProgram.specialization}
                </h2>
                <p className="text-xs sm:text-sm text-[#DFD7CB] font-medium">
                  {recommendedProgram.degree} · <span className="text-[#C6A18D]">{recommendedProgram.faculty}</span>
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3.5 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 self-start">
                <div className="text-right">
                  <span className="text-[10px] text-[#DFD7CB] uppercase tracking-wider block font-bold">
                    Domain Alignment
                  </span>
                  <span className="text-2xl font-black text-white">{fitScore}%</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A36B40] to-[#8E5B34] border border-amber-300/30 flex items-center justify-center font-black text-lg text-white shadow-md">
                  A+
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
                <span className="font-semibold text-white block">{recommendedProgram.campus}</span>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-[#C6A18D]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Program Duration</span>
                </div>
                <span className="font-semibold text-white block">{recommendedProgram.duration}</span>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Admission Status</span>
                </div>
                <span className="font-semibold text-emerald-300 block">{recommendedProgram.admissionStatus}</span>
              </div>
            </div>

            {/* Primary Action Button (Matches Sandip University Online Admission Link) */}
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

        {/* ─── TOP 3 RECOMMENDED CAREER DOMAINS (BEST FIT) ────────── */}
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
                      Rank #{dom.rank} · {dom.rank === 1 ? 'Best Fit' : dom.rank === 2 ? 'Alternative' : 'Complementary'}
                    </span>
                    <span className="text-[11px] font-bold text-[#77734B]">
                      {dom.label}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-[#2C2621] leading-tight">
                      {dom.name}
                    </h4>
                    <span className="text-xs font-mono font-extrabold text-[#A36B40] block mt-1.5">
                      Compatibility: {dom.score}% Match
                    </span>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1">
                    <Progress value={dom.score} className="h-2.5" />
                  </div>

                  <p className="text-xs text-[#5C544D] leading-relaxed">
                    {dom.rationale}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#FAF6F0] space-y-1.5">
                  <span className="text-[10px] uppercase font-extrabold text-[#7A7067] tracking-wider block">
                    Recommended {academicLevel} Pathway
                  </span>
                  <div className="text-xs font-bold text-[#2C2621] bg-[#FAF6F0] p-2.5 rounded-xl border border-[#DFD7CB]">
                    {dom.degreePath}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

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
              Based on the 30-question diagnostic assessment, candidate <strong className="text-[#2C2621]">{candidateName}</strong> demonstrates highest aptitude alignment for <strong className="text-[#A36B40]">{d1Name} ({d1Score}%)</strong> with strong alternative pathways in <strong className="text-[#2C2621]">{d2Name} ({d2Score}%)</strong> and <strong className="text-[#2C2621]">{d3Name} ({d3Score}%)</strong>.
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
