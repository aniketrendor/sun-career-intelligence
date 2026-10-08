'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles, ArrowRight, Award, GraduationCap, CheckCircle2,
  Users, BookOpen, Target, Compass, Brain, ChevronRight,
  ChevronDown, Phone, Building2, ExternalLink, Clock,
  Cpu, Wrench, Briefcase, Pill, Scale, Microscope, Palette,
  HelpCircle, MessageSquare, Star, ArrowUpRight, Check,
  Layers, ShieldCheck, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface MobileLandingProps {
  dashboardHref: string
}

export function MobileLandingView({ dashboardHref }: MobileLandingProps) {
  // Step tracker state for How It Works
  const [activeStep, setActiveStep] = useState(0)
  
  // School filter state
  const [selectedSchoolIdx, setSelectedSchoolIdx] = useState(0)

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const assessmentSteps = [
    {
      step: '01',
      title: 'Quick Profile Setup',
      time: '0 Mins · Free Access',
      icon: Sparkles,
      tag: 'Zero Registration Fee',
      desc: 'Enter your basic student details or referral code. No credit card or documents required.',
      highlights: ['Instant mobile start', 'Zero paperwork', '100% Free always']
    },
    {
      step: '02',
      title: 'Adaptive Diagnostic Test',
      time: '15 Mins · 30 MCQs',
      icon: Brain,
      tag: 'Psychometric & Logic',
      desc: '30 engaging scenario questions evaluating your problem-solving instinct and domain affinity.',
      highlights: ['Adaptive difficulty', 'Realistic case questions', 'Cognitive mapping']
    },
    {
      step: '03',
      title: 'Assessment Report',
      time: 'Instant Analytics',
      icon: Compass,
      tag: 'Archetype Blueprint',
      desc: 'Get immediate analytical breakdown of your career archetype, skill gaps, and degree rankings.',
      highlights: ['Top 5 domain fits', 'Strength radar score', 'Elective recommendations']
    },
    {
      step: '04',
      title: '1-on-1 Mentor Guidance',
      time: 'Expert Counseling',
      icon: Users,
      tag: 'Industry & Subject Mentors',
      desc: 'Connect directly with Sandip University faculty and corporate mentors to finalize your roadmap.',
      highlights: ['Custom degree roadmap', 'Elective specialization', 'Priority admission pathway']
    }
  ]

  const schools = [
    {
      id: 'cse',
      shortName: 'AI & CSE',
      title: 'School of Computer Sciences & Engineering',
      degrees: 'B.Tech · BCA · MCA',
      desc: 'AI & ML, Cloud Architecture, Cyber Security, DevOps, and Enterprise Software Systems.',
      badge: 'High Demand',
      icon: Cpu,
      color: 'from-blue-600 to-indigo-700',
      careers: ['AI/ML Engineer', 'Cloud Architect', 'Cyber Defense Lead', 'Full-Stack Dev']
    },
    {
      id: 'eng',
      shortName: 'Engineering',
      title: 'School of Engineering & Technology',
      degrees: 'B.Tech · M.Tech · Ph.D',
      desc: 'Robotics, Civil, Mechanical, Electrical, and Smart Automation with experiential labs.',
      badge: 'Core Innovation',
      icon: Wrench,
      color: 'from-amber-600 to-orange-700',
      careers: ['Robotics Engineer', 'Automation Lead', 'Structural Lead', 'Systems Specialist']
    },
    {
      id: 'mgmt',
      shortName: 'Management',
      title: 'School of Commerce & Management Studies',
      degrees: 'MBA · BBA · B.Com',
      desc: 'Business Analytics, Fintech, Technology Management, and Corporate Leadership.',
      badge: 'Corporate Track',
      icon: Briefcase,
      color: 'from-emerald-600 to-teal-700',
      careers: ['Business Strategist', 'Financial Analyst', 'Fintech Manager', 'Product Lead']
    },
    {
      id: 'pharma',
      shortName: 'Pharma',
      title: 'School of Pharmaceutical Sciences',
      degrees: 'B.Pharm · M.Pharm · Pharm.D',
      desc: 'PCI-approved facilities for Pharmacology, drug formulation, clinical research, and biotech.',
      badge: 'Healthcare Tech',
      icon: Pill,
      color: 'from-rose-600 to-pink-700',
      careers: ['Formulation Scientist', 'Clinical Researcher', 'Drug Analyst', 'Health Executive']
    },
    {
      id: 'law',
      shortName: 'Law',
      title: 'School of Law',
      degrees: 'BA LL.B · BBA LL.B · LL.M',
      desc: 'Experiential legal advocacy, national moot court competitions, corporate and cyber jurisprudence.',
      badge: 'Jurisprudence',
      icon: Scale,
      color: 'from-purple-600 to-indigo-800',
      careers: ['Corporate Counsel', 'Litigation Advocate', 'Compliance Officer', 'Legal Analyst']
    },
    {
      id: 'science',
      shortName: 'Science',
      title: 'School of Science',
      degrees: 'B.Sc · M.Sc · Ph.D',
      desc: 'Biotechnology, Microbiology, Applied Physics, Chemistry, and Mathematical Data Science.',
      badge: 'Pure & Applied',
      icon: Microscope,
      color: 'from-cyan-600 to-blue-700',
      careers: ['Research Scientist', 'Biotechnologist', 'Data Modeler', 'Lab Operations']
    },
    {
      id: 'design',
      shortName: 'Design',
      title: 'School of Design',
      degrees: 'B.Des · M.Des',
      desc: 'UX/UI Architecture, Fashion Design, Spatial Interiors, and Digital Animation.',
      badge: 'Creative Tech',
      icon: Palette,
      color: 'from-fuchsia-600 to-purple-700',
      careers: ['UI/UX Architect', 'Product Designer', 'Creative Director', 'Spatial Lead']
    },
    {
      id: 'campus',
      shortName: 'Campus Hub',
      title: 'Sandip University Campus Hub',
      degrees: 'NAAC "A" · 250+ Acres',
      desc: '250+ Acre Ultra-Modern Eco Campus in Nashik with 200+ global corporate placement partnerships.',
      badge: 'Campus Ecosystem',
      icon: Building2,
      color: 'from-[#A36B40] to-[#77734B]',
      careers: ['Merit Scholarships', 'Research Labs', 'Corporate Tie-Ups', 'Hostel & Sports']
    }
  ]

  const faqs = [
    {
      q: 'Is this career diagnostic test completely free?',
      a: 'Yes! The Sandip University Career Intelligence Assessment is 100% free of cost for all 10th, 12th, Diploma, and Graduate students.'
    },
    {
      q: 'How long does the assessment take?',
      a: 'The test contains 30 multiple-choice questions designed to be completed in 15 to 20 minutes directly on your phone.'
    },
    {
      q: 'What do I receive after finishing?',
      a: 'You immediately receive a comprehensive Career Intelligence Report with your primary archetype, program compatibility scores, and 1-on-1 mentor guidance.'
    },
    {
      q: 'Do I need any prior preparation?',
      a: 'No preparation is needed. The questions evaluate your natural cognitive instincts and interests through realistic scenarios.'
    }
  ]

  const activeSchool = schools[selectedSchoolIdx]
  const ActiveSchoolIcon = activeSchool.icon

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2621] pb-28 font-sans antialiased">
      
      {/* ─── ULTRA CLEAN GLASS TOP BAR ─────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#EAE2D7]/80 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-32 shrink-0">
            <Image
              src="/sandip-university-logo.png"
              alt="Sandip University"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
        
        <div className="flex items-center gap-2">
          <a
            href="tel:18002122714"
            className="w-8 h-8 rounded-full bg-white/90 border border-[#E2D8CC] flex items-center justify-center text-[#A36B40] shadow-xs active:scale-95 transition-transform"
            aria-label="Call Admissions Helpline"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
          <Link href="/login">
            <Button size="sm" className="bg-[#2C2621] hover:bg-black text-[#FAF7F2] font-bold text-xs h-8 px-3.5 rounded-full shadow-xs gap-1 cursor-pointer active:scale-95 transition-transform">
              <span>Sign In</span>
              <ArrowRight className="w-3 h-3 text-[#C6A18D]" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ─── PREMIUM HERO SECTION ──────────────────────────────────── */}
      <section className="relative px-4 pt-5 pb-6 overflow-hidden">
        {/* Soft Background Gradient Glow */}
        <div className="absolute top-0 right-[-10%] w-72 h-72 bg-gradient-to-bl from-[#A36B40]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="space-y-4">
          
          {/* Top Floating Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-white/80 backdrop-blur-md border border-[#E2D8CC] text-[#8C5832] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NAAC 'A' Grade · Admissions 2026–27</span>
          </div>

          {/* Impact Headline */}
          <div className="space-y-2">
            <h1 className="text-[30px] font-black tracking-tight leading-[1.12] text-[#1E1915]">
              Discover Your Ideal Career Path with{' '}
              <span className="bg-gradient-to-r from-[#A36B40] via-[#C87D55] to-[#8C5832] bg-clip-text text-transparent">
                Experts.
              </span>
            </h1>
            <p className="text-[13px] text-[#6E645A] leading-relaxed">
              Take the scientific 15-minute diagnostic test engineered by Sandip University experts. Discover your top degree matches and connect with 1-on-1 mentors.
            </p>
          </div>

          {/* Hero Live Preview Card (High-Tech Capsule) */}
          <div className="bg-gradient-to-br from-[#211D19] via-[#2A241F] to-[#1A1613] text-[#FAF7F2] p-4 rounded-3xl border border-[#3E362F] shadow-xl space-y-3 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#A36B40]/25 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-[#3E362F] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#A36B40]/30 text-[#C6A18D] flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[#EAE2D7]">AI Career Match Engine</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                100% Free
              </span>
            </div>

            {/* Diagnostic Snapshot Metric */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#C6A18D]">
                <span>Top Matched Trajectory</span>
                <span className="text-emerald-400 font-bold">94% Compatibility</span>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-white">B.Tech in AI & Data Science</div>
                  <div className="text-[10px] text-[#A89D8F]">School of Computer Sciences</div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#A36B40] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  #1
                </div>
              </div>

              {/* 3 Quick Pill Specs */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-center text-[10px] font-medium text-[#C6A18D]">
                <div className="bg-white/5 rounded-lg py-1 px-1">⚡ 15 Mins</div>
                <div className="bg-white/5 rounded-lg py-1 px-1">🎯 30 MCQs</div>
                <div className="bg-white/5 rounded-lg py-1 px-1">🤝 1-on-1 Mentor</div>
              </div>
            </div>

            {/* Launch Button Inside Hero */}
            <Link href="/login" className="block w-full pt-1">
              <Button className="w-full h-11 bg-gradient-to-r from-[#A36B40] to-[#8C5832] hover:from-[#8C5832] hover:to-[#744523] text-white font-black text-xs rounded-2xl shadow-lg shadow-[#A36B40]/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Start Free Assessment Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>

          </div>

          {/* Quick Sub-trust Checkmarks */}
          <div className="flex items-center justify-around text-[11px] font-semibold text-[#6E645A] pt-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant Assessment Report
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Free Access
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Expert Guidance
            </span>
          </div>

        </div>
      </section>

      {/* ─── UNIVERSITY CREDIBILITY STRIP ──────────────────────────── */}
      <section className="px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-[#E2D8CC] flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#A36B40]/10 text-[#A36B40] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-[#1E1915]">NAAC 'A' Grade</div>
              <div className="text-[10px] text-[#7A7067]">Highest Accreditation</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border border-[#E2D8CC] flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#77734B]/10 text-[#77734B] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-[#1E1915]">250+ Acres</div>
              <div className="text-[10px] text-[#7A7067]">Modern Smart Campus</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE 4-STEP ASSESSMENT JOURNEY ─────────────────── */}
      <section className="px-4 py-5 space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A36B40]">
              Diagnostic Journey
            </span>
            <h2 className="text-lg font-black text-[#1E1915]">How It Works</h2>
          </div>
          <span className="text-[10px] font-bold text-[#77734B] bg-[#77734B]/10 px-2 py-0.5 rounded-full">
            4 Interactive Stages
          </span>
        </div>

        {/* Step Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#E2D8CC] shadow-2xs">
          {assessmentSteps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`flex-1 py-2 px-1 rounded-xl text-center transition-all ${
                activeStep === idx
                  ? 'bg-[#A36B40] text-white font-black shadow-xs scale-[1.02]'
                  : 'text-[#7A7067] font-semibold text-[11px] hover:bg-[#FAF7F2]'
              }`}
            >
              <div className="text-[9px] uppercase tracking-wider opacity-80">Stage</div>
              <div className="text-xs font-black leading-tight">{s.step}</div>
            </button>
          ))}
        </div>

        {/* Active Step Card */}
        <div className="bg-white rounded-3xl border border-[#E2D8CC] p-4.5 space-y-3.5 shadow-xs transition-all animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#FAF7F2] pb-2.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#A36B40] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#E2D8CC]">
              <Clock className="w-3 h-3 text-[#A36B40]" />
              <span>{assessmentSteps[activeStep].time}</span>
            </div>
            <span className="text-[11px] font-black text-[#77734B]">
              {assessmentSteps[activeStep].tag}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-black text-[#1E1915]">
              {assessmentSteps[activeStep].title}
            </h3>
            <p className="text-xs text-[#6E645A] leading-relaxed">
              {assessmentSteps[activeStep].desc}
            </p>
          </div>

          {/* Highlights */}
          <div className="bg-[#FAF7F2] p-3 rounded-2xl space-y-2 border border-[#EAE2D7]">
            {assessmentSteps[activeStep].highlights.map((hl, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-[#2C2621]">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                <span>{hl}</span>
              </div>
            ))}
          </div>

          {/* Prev/Next Navigation */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
              className="text-xs font-bold text-[#7A7067] disabled:opacity-30 disabled:pointer-events-none px-2 py-1"
            >
              ← Previous
            </button>

            {activeStep < 3 ? (
              <Button
                size="sm"
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="bg-[#2C2621] hover:bg-black text-white text-xs font-bold h-8 px-3.5 rounded-xl gap-1"
              >
                <span>Next Stage</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Link href="/login">
                <Button size="sm" className="bg-[#A36B40] hover:bg-[#8E5B34] text-white text-xs font-bold h-8 px-3.5 rounded-xl gap-1">
                  <span>Start Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── INTERACTIVE ACADEMIC FACULTIES EXPLORER ───────────────── */}
      <section className="px-4 py-5 space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A36B40]">
              7 Academic Faculties
            </span>
            <h2 className="text-lg font-black text-[#1E1915]">Explore Disciplines</h2>
          </div>
          <span className="text-[10px] font-semibold text-[#7A7067]">Tap to switch</span>
        </div>

        {/* Horizontal Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
          {schools.map((sch, idx) => {
            const Icon = sch.icon
            const isSelected = selectedSchoolIdx === idx
            return (
              <button
                key={sch.id}
                onClick={() => setSelectedSchoolIdx(idx)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs whitespace-nowrap transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-[#A36B40] text-white font-bold border-[#A36B40] shadow-sm scale-[1.02]'
                    : 'bg-white text-[#2C2621] font-medium border-[#E2D8CC] active:bg-[#FAF7F2]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#A36B40]'}`} />
                <span>{sch.shortName}</span>
              </button>
            )
          })}
        </div>

        {/* Selected School Card */}
        <div className="bg-white rounded-3xl border border-[#E2D8CC] p-4.5 space-y-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FAF7F2] text-[#A36B40] flex items-center justify-center border border-[#EAE2D7] shrink-0 shadow-2xs">
              <ActiveSchoolIcon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#A36B40] block">
                {activeSchool.badge}
              </span>
              <h3 className="text-sm font-black text-[#1E1915] leading-snug">
                {activeSchool.title}
              </h3>
            </div>
          </div>

          <div className="inline-block bg-[#FAF7F2] text-[#77734B] border border-[#EAE2D7] text-[10px] font-bold rounded-lg px-2.5 py-1">
            Programs: {activeSchool.degrees}
          </div>

          <p className="text-xs text-[#6E645A] leading-relaxed">
            {activeSchool.desc}
          </p>

          <div className="pt-2 border-t border-[#FAF7F2] space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-[#A36B40] tracking-wider block">
              Key Career Outcomes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeSchool.careers.map((career, i) => (
                <span
                  key={i}
                  className="text-[10px] font-semibold bg-[#FAF7F2] text-[#2C2621] px-2.5 py-1 rounded-lg border border-[#EAE2D7]"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 1-ON-1 ADVISORY SPOTLIGHT ─────────────────────────────── */}
      <section className="px-4 py-5">
        <div className="bg-gradient-to-br from-[#211D19] via-[#2A241F] to-[#1A1613] text-[#FAF7F2] p-4.5 rounded-3xl border border-[#3E362F] shadow-xl space-y-3.5 relative overflow-hidden">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#A36B40]/30 text-[#C6A18D] border border-[#A36B40]/40">
              <Users className="w-3 h-3 text-[#C6A18D]" /> 1-on-1 Counseling
            </div>
            <h2 className="text-base font-black text-[#FAF7F2] leading-snug">
              Guided by Subject & Industry Mentors
            </h2>
            <p className="text-xs text-[#C6A18D]/90 leading-relaxed">
              Every student gets paired with domain experts to review test scores, clarify specializations, and explore scholarship options.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 text-[11px] text-[#EAE2D7]">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
              <span>Personalized cognitive strength breakdown</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#EAE2D7]">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
              <span>1-on-1 career mentor consultation</span>
            </div>
          </div>

          <Link href="/login" className="block w-full pt-1">
            <Button className="w-full h-11 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs rounded-2xl shadow-xs gap-2 active:scale-95">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Book Mentor Session with Free Test</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── ACCORDION FAQS & HELPLINE ────────────────────────────── */}
      <section className="px-4 py-5 space-y-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#A36B40]">
            Help & Guidance
          </span>
          <h2 className="text-lg font-black text-[#1E1915]">Frequently Asked Questions</h2>
        </div>

        {/* Accordion Questions */}
        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E2D8CC] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="text-xs font-bold text-[#1E1915] leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#A36B40] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-[#FAF7F2] text-xs text-[#6E645A] leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Admissions Quick Dial Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E2D8CC] flex items-center justify-between gap-2 shadow-2xs">
          <div className="space-y-0.5">
            <h4 className="text-xs font-black text-[#1E1915]">Admissions Helpline</h4>
            <p className="text-[10px] text-[#7A7067]">Mon – Sat: 9:00 AM – 6:00 PM</p>
          </div>
          <a
            href="tel:18002122714"
            className="bg-[#77734B] hover:bg-[#63603E] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 active:scale-95 shadow-xs"
          >
            <Phone className="w-3 h-3" />
            <span>1800-212-2714</span>
          </a>
        </div>
      </section>

      {/* ─── STREAMLINED FOOTER ────────────────────────────────────── */}
      <footer className="bg-[#211D19] text-[#FAF7F2] px-4 pt-6 pb-6 border-t border-[#332D27] space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-[#332D27] pb-3.5">
          <div className="bg-white px-2.5 py-1 rounded-xl">
            <div className="relative h-6 w-24">
              <Image
                src="/sandip-university-logo.png"
                alt="Sandip University"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="text-[10px] font-bold text-[#C6A18D]">
            NAAC 'A' Grade · Nashik
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[11px] text-[#C6A18D]">
          <div className="space-y-1.5">
            <p className="font-bold text-white uppercase text-[10px] tracking-wider">Portals</p>
            <p><Link href="/login" className="hover:text-white">Student Login</Link></p>
            <p><Link href="/login" className="hover:text-white">Mentor Login</Link></p>
            <p><a href="https://admission.sandipuniversity.edu.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white inline-flex items-center gap-1">Admissions <ExternalLink className="w-2.5 h-2.5" /></a></p>
          </div>
          <div className="space-y-1.5">
            <p className="font-bold text-white uppercase text-[10px] tracking-wider">Contact</p>
            <p><a href="tel:18002122714" className="hover:text-white">1800-212-2714</a></p>
            <p><a href="mailto:admissions@sandipuniversity.edu.in" className="hover:text-white truncate block">admissions@sandipuniversity.edu.in</a></p>
          </div>
        </div>

        <div className="pt-2 border-t border-[#332D27] text-[10px] text-[#A89D8F] text-center">
          © {new Date().getFullYear()} Sandip University Career Intelligence Platform.
        </div>
      </footer>

      {/* ─── MODERN FLOATING BOTTOM ACTION PILL ────────────────────── */}
      <div className="fixed bottom-3 left-4 right-4 z-50">
        <div className="bg-[#211D19]/95 backdrop-blur-xl border border-white/15 p-2 px-3.5 rounded-2xl shadow-2xl flex items-center justify-between text-white">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase text-[#EAE2D7] tracking-wider">100% Free Test</span>
            </div>
            <p className="text-[10px] text-[#C6A18D]">15 Mins · Instant Report</p>
          </div>
          <Link href="/login">
            <Button size="sm" className="bg-gradient-to-r from-[#A36B40] to-[#8C5832] hover:from-[#8C5832] hover:to-[#744523] text-white font-black text-xs h-8.5 px-3.5 rounded-xl shadow-md shadow-[#A36B40]/30 active:scale-95 flex items-center gap-1.5 cursor-pointer">
              <span>Start Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

    </div>
  )
}
