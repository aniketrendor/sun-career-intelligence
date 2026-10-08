import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles, ArrowRight, Award, GraduationCap, CheckCircle2,
  Users, BookOpen, Target, Compass, ShieldCheck, Star,
  Layers, Brain, ChevronRight, MessageSquare, Phone,
  Building2, ExternalLink, HelpCircle, Laptop, Clock,
  Cpu, Wrench, Briefcase, Pill, Scale, Microscope, Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MobileLandingView } from '@/components/landing/mobile-landing'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userProfile: { full_name: string; role: string } | null = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('full_name, role')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    userProfile = data
  }

  const dashboardHref = userProfile
    ? userProfile.role === 'ADMIN' || userProfile.role === 'DEAN_HOD'
      ? '/admin/dashboard'
      : userProfile.role === 'MENTOR' || userProfile.role === 'COUNSELOR'
      ? '/mentor/dashboard'
      : '/student/dashboard'
    : '/login'

  const schools = [
    {
      title: 'School of Engineering & Technology',
      degrees: 'B.Tech · M.Tech · Ph.D',
      desc: 'Civil, Mechanical, Electrical, Robotics, and Smart Automation Engineering with world-class labs.',
      badge: 'Engineering & Innovation',
      icon: Wrench,
      careers: ['Robotics Engineer', 'Automation Lead', 'Structural Engineer', 'Systems Specialist']
    },
    {
      title: 'School of Computer Sciences & Engineering',
      degrees: 'B.Tech · BCA · MCA',
      desc: 'AI & ML, Cloud Systems, Cyber Security, DevOps, and Enterprise Full-Stack Software Engineering.',
      badge: 'AI & Computing',
      icon: Cpu,
      careers: ['AI/ML Engineer', 'Cloud Architect', 'Cyber Defense Specialist', 'Full-Stack Developer']
    },
    {
      title: 'School of Commerce & Management Studies',
      degrees: 'MBA · BBA · B.Com',
      desc: 'Technology Management, Business Analytics, Fintech, International Business, and Corporate Leadership.',
      badge: 'Business & Leadership',
      icon: Briefcase,
      careers: ['Business Strategist', 'Financial Analyst', 'Fintech Manager', 'Product Leader']
    },
    {
      title: 'School of Pharmaceutical Sciences',
      degrees: 'B.Pharm · M.Pharm · Pharm.D',
      desc: 'Pharmacology, drug formulation, clinical research, and bio-tech research with PCI-approved facilities.',
      badge: 'Healthcare & Pharma',
      icon: Pill,
      careers: ['Formulation Scientist', 'Clinical Researcher', 'Drug Analyst', 'Healthcare Executive']
    },
    {
      title: 'School of Law',
      degrees: 'BA LL.B · BBA LL.B · LL.M',
      desc: 'Experiential legal education with national moot court competitions, corporate law, and constitutional advocacy.',
      badge: 'Legal & Jurisprudence',
      icon: Scale,
      careers: ['Corporate Legal Counsel', 'Litigation Advocate', 'Compliance Officer', 'Policy Analyst']
    },
    {
      title: 'School of Science',
      degrees: 'B.Sc · M.Sc · Ph.D',
      desc: 'Pure and applied sciences spanning Biotechnology, Microbiology, Applied Physics, and Mathematical Data Science.',
      badge: 'Applied Sciences',
      icon: Microscope,
      careers: ['Research Scientist', 'Biotechnologist', 'Data Modeler', 'Lab Operations Lead']
    },
    {
      title: 'School of Design',
      degrees: 'B.Des · M.Des',
      desc: 'Creative design programs covering UX/UI Architecture, Fashion Design, Spatial Interiors, and Digital Animation.',
      badge: 'Design & Media',
      icon: Palette,
      careers: ['UI/UX Architect', 'Product Designer', 'Creative Director', 'Spatial Experience Lead']
    }
  ]

  const assessmentSteps = [
    {
      step: '01',
      title: 'Quick Profile Setup',
      time: '0 Mins · Free',
      desc: '100% free access with zero registration fees. Simply enter your basic candidate details or school referral code.',
      icon: Sparkles,
      highlights: ['No credit card needed', 'Instant mobile/laptop access', 'Secure profile generation']
    },
    {
      step: '02',
      title: 'Adaptive Diagnostic Test',
      time: '15 Mins · 30 MCQs',
      desc: 'Complete 30 interactive multiple-choice questions assessing your cognitive strengths, logic, and subject interests.',
      icon: Brain,
      highlights: ['Psychometric evaluation', 'Domain-specific problem scenarios', 'Adaptive difficulty engine']
    },
    {
      step: '03',
      title: 'Assessment Report',
      time: 'Instant Report',
      desc: 'Instantly receive your comprehensive analytical report revealing your core archetype and program rankings.',
      icon: Compass,
      highlights: ['Archetype fingerprint', 'Top 5 career domain fits', 'Skill gap & strength analysis']
    },
    {
      step: '04',
      title: 'Expert Mentor Consultation',
      time: '1-on-1 Guidance',
      desc: 'Connect with Sandip University subject experts and industry mentors to discuss degree pathways and admissions.',
      icon: Users,
      highlights: ['Personalized degree roadmap', 'Elective specialization planning', 'Priority admission pathway']
    }
  ]

  const faqs = [
    {
      q: 'Is this career diagnostic test completely free?',
      a: 'Yes! The Sandip University Career Intelligence Assessment is 100% free of cost for all 10th, 12th, Diploma, and Graduate students exploring their next career move.'
    },
    {
      q: 'How long does the assessment take?',
      a: 'The test comprises 30 adaptive multiple-choice questions designed to be completed in approximately 15 to 20 minutes on any smartphone, tablet, or laptop.'
    },
    {
      q: 'What happens after I complete the test?',
      a: 'You immediately receive a comprehensive Career Intelligence Report with your primary archetype, domain compatibility scores, recommended specializations, and direct booking for mentor consultation.'
    },
    {
      q: 'Do I need any preparation before taking the test?',
      a: 'No prior preparation or study is required. The test evaluates your natural problem-solving instincts, cognitive logic, and subject interests through intuitive scenario-based questions.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans text-[#2C2621] selection:bg-[#A36B40]/20 selection:text-[#A36B40]">
      
      {/* ─── DEDICATED MOBILE VIEW (HIGH PERFORMANCE, INTERACTIVE & COMPACT) ─── */}
      <div className="block md:hidden">
        <MobileLandingView dashboardHref={dashboardHref} />
      </div>

      {/* ─── DESKTOP VIEW (FULL & UNCHANGED) ─────────────────────────────────── */}
      <div className="hidden md:block">
        {/* ─── TOP INSTITUTIONAL ACCREDITATION STRIP (DESKTOP) ───────────── */}
        <div className="bg-[#211D19] text-[#EFE2D0] py-2 px-4 text-xs font-medium border-b border-[#332D27]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Sandip University, Nashik</span>
            <span className="text-[#C6A18D] hidden md:inline">· NAAC 'A' Grade Accredited · UGC Recognized · 250+ Acres Campus</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#C6A18D]">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Free Career Diagnostic Open
            </span>
            <span className="hidden sm:inline">Admissions 2026–27 Helpline: 1800-212-2714</span>
          </div>
        </div>
      </div>

      {/* ─── NAVBAR ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#DFD7CB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group">
            <div className="relative h-8 sm:h-10 w-28 sm:w-40 shrink-0">
              <Image
                src="/sandip-university-logo.png"
                alt="Sandip University Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden xl:block h-7 w-[1px] bg-[#DFD7CB]" />
            <div className="hidden xl:flex flex-col">
              <span className="text-xs font-extrabold text-[#2C2621] uppercase tracking-wider">Career Intelligence</span>
              <span className="text-[10px] text-[#7A7067] font-semibold">Institutional Assessment & Advisory System</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#7A7067]">
            <a href="#assessment" className="hover:text-[#A36B40] transition-colors">Free Assessment</a>
            <a href="#mentorship" className="hover:text-[#A36B40] transition-colors">Expert Mentors</a>
            <a href="#schools" className="hover:text-[#A36B40] transition-colors">Academic Schools</a>
            <a href="#how-it-works" className="hover:text-[#A36B40] transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-[#A36B40] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button className="bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-[11px] sm:text-xs h-8 sm:h-9 px-3 sm:px-4 rounded-xl shadow-md shadow-[#A36B40]/25 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                <span>Go to Login</span>
                <ArrowRight className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative pt-4 sm:pt-6 lg:pt-8 pb-10 sm:pb-12 lg:pb-20 overflow-hidden">
        {/* Background decorative soft circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#EFE0CB]/60 to-[#F9F4F0]/80 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
              
              {/* Highlight Badge */}
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#FAF6F0] border border-[#DFD7CB] shadow-xs text-[#A36B40] max-w-full">
                <span className="w-2 h-2 rounded-full bg-[#A36B40] animate-ping shrink-0" />
                <span className="bg-[#A36B40] text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider shrink-0">
                  100% Free
                </span>
                <span className="truncate">Official Sandip University Career Diagnostic 2026–27</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-[54px] font-extrabold text-[#2C2621] tracking-tight leading-[1.2] lg:leading-[1.12]">
                Discover Your Ideal Degree & Career Track with{' '}
                <span className="text-[#A36B40]">
                  Experts
                </span>
                .
              </h1>

              {/* Subheadline */}
              <p className="text-xs sm:text-sm lg:text-base text-[#7A7067] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Stop guessing your future. Take the scientific 30-question diagnostic assessment engineered by Sandip University’s subject and industry experts. Discover your top-matched programs, specializations, and get 1-on-1 career mentor counseling.
              </p>

              {/* Value Points Pill Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 sm:pt-2 text-[11px] sm:text-xs font-bold text-[#2C2621]">
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#DFD7CB] shadow-xs text-center sm:text-left">
                  <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#77734B] shrink-0" />
                  <span className="leading-tight">100% Free Test</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#DFD7CB] shadow-xs text-center sm:text-left">
                  <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#A36B40] shrink-0" />
                  <span className="leading-tight">~15 Mins</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#DFD7CB] shadow-xs text-center sm:text-left">
                  <Award className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#77734B] shrink-0" />
                  <span className="leading-tight">Mentor Review</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-12 sm:h-13 px-6 sm:px-8 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xl shadow-[#A36B40]/30 transition-all hover:scale-[1.02] active:scale-[0.99] flex items-center justify-center gap-2 sm:gap-2.5 cursor-pointer">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Start Free Assessment Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-13 px-5 sm:px-6 border-[#DFD7CB] bg-white text-[#2C2621] hover:bg-[#FAF6F0] font-semibold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                    <BookOpen className="w-4 h-4 text-[#A36B40]" />
                    <span>How Assessment Works</span>
                  </Button>
                </a>
              </div>

              {/* Trust Subtext */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-[#7A7067]">
                <div className="flex -space-x-1.5 sm:-space-x-2">
                  <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#A36B40] text-white font-bold text-[9px] sm:text-[10px] flex items-center justify-center border-2 border-white">AK</div>
                  <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#77734B] text-white font-bold text-[9px] sm:text-[10px] flex items-center justify-center border-2 border-white">RD</div>
                  <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-[#C6A18D] text-white font-bold text-[9px] sm:text-[10px] flex items-center justify-center border-2 border-white">PS</div>
                </div>
                <span>Guided by <strong>45+ Subject & Industry Mentors</strong></span>
              </div>

            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5 relative">
              
              {/* Outer decorative card frame */}
              <div className="relative bg-white border border-[#DFD7CB] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl shadow-[#A36B40]/10 space-y-4 sm:space-y-6">
                
                {/* Card Header Badge */}
                <div className="flex items-center justify-between border-b border-[#DFD7CB] pb-3 sm:pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center border border-[#DFD7CB]">
                      <Brain className="w-4 sm:w-5 h-4 sm:h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#2C2621]">Live Diagnostic Sample</h4>
                      <p className="text-[10px] text-[#7A7067]">UG & PG Career Trajectories</p>
                    </div>
                  </div>
                  <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-[10px] font-bold rounded-full px-2.5 py-0.5">
                    Free Access
                  </Badge>
                </div>

                {/* Sample Question Box */}
                <div className="bg-[#FAF6F0] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#DFD7CB] space-y-2 sm:space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#A36B40]">
                    <span>QUESTION 04 OF 30</span>
                    <span>COGNITIVE DIMENSION</span>
                  </div>
                  <p className="text-xs font-semibold text-[#2C2621] leading-snug">
                    "When building a solution for a complex challenge, do you focus first on algorithmic architecture, financial sustainability, or user-centric workflows?"
                  </p>
                </div>

                {/* Trajectory Outcome Preview */}
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2C2621] flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#A36B40]" /> AI & Machine Learning Fit
                    </span>
                    <span className="font-extrabold text-[#A36B40]">94% Match</span>
                  </div>
                  <div className="h-2 w-full bg-[#FAF6F0] rounded-full overflow-hidden border border-[#DFD7CB]">
                    <div className="h-full bg-gradient-to-r from-[#A36B40] to-[#77734B] rounded-full w-[94%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5 sm:pt-1">
                    <span className="font-bold text-[#2C2621] flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#77734B]" /> Technology Management Fit
                    </span>
                    <span className="font-extrabold text-[#77734B]">88% Match</span>
                  </div>
                  <div className="h-2 w-full bg-[#FAF6F0] rounded-full overflow-hidden border border-[#DFD7CB]">
                    <div className="h-full bg-[#77734B] rounded-full w-[88%]" />
                  </div>
                </div>

                {/* Mentor Endorsement Strip */}
                <div className="bg-[#211D19] text-white p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-[#332D27] flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] sm:text-[10px] text-[#C6A18D] uppercase font-bold tracking-wider">Advisory Outcome</span>
                    <p className="text-[11px] sm:text-xs font-bold text-[#EFE2D0]">Recommended for B.Tech CSE (AI & ML)</p>
                  </div>
                  <Link href="/login" className="shrink-0">
                    <Button size="sm" className="bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs h-7 sm:h-8 px-2.5 sm:px-3 rounded-xl cursor-pointer">
                      Start Test
                    </Button>
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── UNIVERSITY CREDIBILITY STATS ────────────────────────────────── */}
      <section className="py-8 sm:py-10 bg-white border-y border-[#DFD7CB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            
            <div className="bg-[#FAF6F0]/60 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-[#DFD7CB] space-y-1">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#A36B40]">NAAC 'A'</span>
              <p className="text-[11px] sm:text-xs text-[#7A7067] font-semibold">Highest National Accreditation</p>
            </div>

            <div className="bg-[#FAF6F0]/60 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-[#DFD7CB] space-y-1">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#77734B]">250+</span>
              <p className="text-[11px] sm:text-xs text-[#7A7067] font-semibold">Acres Ultra-Modern Campus</p>
            </div>

            <div className="bg-[#FAF6F0]/60 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-[#DFD7CB] space-y-1">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#2C2621]">100%</span>
              <p className="text-[11px] sm:text-xs text-[#7A7067] font-semibold">Free Career Diagnostic</p>
            </div>

            <div className="bg-[#FAF6F0]/60 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-[#DFD7CB] space-y-1">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#A36B40]">200+</span>
              <p className="text-[11px] sm:text-xs text-[#7A7067] font-semibold">Global Placement Partners</p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4-STEP HOW IT WORKS SECTION ─────────────────────────────────── */}
      <section id="how-it-works" className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB]">
            <Layers className="w-3.5 h-3.5 text-[#A36B40]" /> Diagnostic Journey
          </div>
          <h2 className="text-xl sm:text-4xl font-extrabold text-[#2C2621] tracking-tight">
            How the Free Career Diagnostic Works
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7067]">
            A structured 4-stage evaluation designed to map your natural cognitive aptitudes to Sandip University disciplines.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {assessmentSteps.map((item, idx) => {
            return (
              <div
                key={idx}
                className="bg-white border border-[#DFD7CB] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs hover:border-[#A36B40] hover:shadow-lg transition-all duration-300 space-y-3.5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-[#2C2621] text-[#FAF6F0] font-black text-[11px] tracking-wider">
                      STEP {item.step}
                    </span>
                    <span className="text-[11px] font-bold text-[#A36B40] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#DFD7CB]">
                      {item.time}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-[#2C2621] leading-snug">{item.title}</h3>
                    <p className="text-xs text-[#7A7067] leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                <div className="pt-2.5 sm:pt-3 border-t border-[#FAF6F0] space-y-1.5">
                  {item.highlights.map((hl, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-[#2C2621]/85 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B] shrink-0" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Unified Bottom Action Bar */}
        <div className="mt-6 sm:mt-8 bg-white border border-[#DFD7CB] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#A36B40]/15 text-[#A36B40] flex items-center justify-center shrink-0 hidden sm:flex">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2C2621]">Ready to begin? Takes only 15 minutes</h4>
              <p className="text-[11px] sm:text-xs text-[#7A7067]">Unlock your personalized Assessment Report free of cost today.</p>
            </div>
          </div>

          <Link href="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs rounded-xl shadow-sm gap-2 cursor-pointer transition-all hover:scale-[1.02]">
              <span>Start Free Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── EXPERT MENTORSHIP & GUIDANCE HIGHLIGHT ─────────────────────── */}
      <section id="mentorship" className="py-12 sm:py-16 bg-[#211D19] text-white border-y border-[#332D27]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#A36B40]/25 text-[#C6A18D] border border-[#A36B40]/40">
                <Users className="w-3.5 h-3.5 text-[#C6A18D]" /> 1-on-1 Advisory Council
              </div>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#EFE2D0] tracking-tight leading-tight">
                Get Guided by Experienced Subject Experts & Industry Mentors
              </h2>

              <p className="text-xs sm:text-sm text-[#C6A18D]/90 leading-relaxed max-w-xl">
                Unlike generic online tests, Sandip University pairs your psychometric diagnostic results with seasoned industry and domain experts. Review your strengths, explore elective specializations, and resolve curriculum doubts in personalized 1-on-1 sessions.
              </p>

              <div className="space-y-2.5 sm:space-y-3 pt-1">
                {[
                  'Personalized analysis of your cognitive aptitude & domain compatibility',
                  'In-depth breakdown of high-growth specializations and elective tracks',
                  'Prerequisite roadmap and readiness planning for competitive campus placements',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#EFE2D0]">
                    <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#77734B] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 sm:pt-4">
                <Link href="/login" className="block sm:inline-block">
                  <Button className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-7 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all gap-2 cursor-pointer">
                    <MessageSquare className="w-4 h-4" />
                    <span>Book Mentor Guidance with Free Test</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Mentor Feature Cards */}
            <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
              
              <div className="bg-[#2C2621] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#3D352E] space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-[#A36B40] text-white font-bold text-xs sm:text-sm flex items-center justify-center">
                    AK
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#EFE2D0]">Prof. Ananya Kulkarni</h4>
                    <p className="text-[10px] sm:text-[11px] text-[#C6A18D]">Senior Subject Expert & Engineering Advisory</p>
                  </div>
                </div>
                <p className="text-[11px] sm:text-xs text-[#C6A18D]/80 italic">
                  "The diagnostic assessment bridges student passion with industry reality, helping candidates pick future-proof degrees."
                </p>
              </div>

              <div className="bg-[#2C2621] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#3D352E] space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-[#77734B] text-white font-bold text-xs sm:text-sm flex items-center justify-center">
                    RD
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#EFE2D0]">Dr. Rajesh Deshmukh</h4>
                    <p className="text-[10px] sm:text-[11px] text-[#C6A18D]">Industry Expert & Corporate Career Advisor</p>
                  </div>
                </div>
                <p className="text-[11px] sm:text-xs text-[#C6A18D]/80 italic">
                  "Every student has a unique aptitude fingerprint. Our subject and industry experts help transform that into executive leadership."
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── ACADEMIC SCHOOLS & PROGRAMS ─────────────────────────────────── */}
      <section id="schools" className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2.5 sm:space-y-3 max-w-2xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB]">
            <Building2 className="w-3.5 h-3.5 text-[#A36B40]" /> 7 Dedicated Faculties
          </div>
          <h2 className="text-xl sm:text-4xl font-extrabold text-[#2C2621] tracking-tight">
            Explore Sandip University Academic Disciplines
          </h2>
          <p className="text-xs sm:text-sm text-[#7A7067]">
            Industry-aligned curricula engineered with experiential labs, global corporate partnerships, and research excellence.
          </p>
        </div>

        {/* 8-Card Balanced Grid (7 Schools + 1 Institutional Campus Ecosystem Card) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {schools.map((sch, idx) => {
            const Icon = sch.icon
            return (
              <div
                key={idx}
                className="bg-white border border-[#DFD7CB] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs hover:border-[#A36B40] hover:shadow-lg transition-all duration-300 space-y-3.5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-[#FAF6F0] group-hover:bg-[#A36B40] text-[#A36B40] group-hover:text-white flex items-center justify-center border border-[#DFD7CB] transition-colors duration-300">
                      <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                    </div>
                    <Badge className="bg-[#FAF6F0] text-[#77734B] border-[#DFD7CB] text-[10px] font-bold rounded-full px-2 py-0.5">
                      {sch.degrees}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A36B40] block">
                      {sch.badge}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#2C2621] leading-snug">{sch.title}</h3>
                    <p className="text-xs text-[#7A7067] leading-relaxed">{sch.desc}</p>
                  </div>
                </div>

                <div className="pt-2.5 sm:pt-3 border-t border-[#FAF6F0]">
                  <span className="text-[10px] uppercase font-bold text-[#A36B40] tracking-wider block mb-1.5">
                    Key Career Outcomes:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sch.careers.map((c, i) => (
                      <span key={i} className="text-[10px] font-medium bg-[#FAF6F0] text-[#2C2621] px-2 py-0.5 rounded-md border border-[#DFD7CB]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          {/* 8th Card: Sandip University Campus & Placement Ecosystem */}
          <div className="bg-gradient-to-br from-[#2C2621] via-[#352D26] to-[#211D19] text-[#EFE2D0] border border-[#443C34] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-md space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-[#A36B40] text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <Badge className="bg-[#A36B40]/30 text-[#EFE2D0] border-[#A36B40]/40 text-[10px] font-bold rounded-full px-2 py-0.5">
                  NAAC 'A' Accredited
                </Badge>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A18D] block">
                  Campus Ecosystem
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  Sandip University Campus Hub
                </h3>
                <p className="text-xs text-[#C6A18D]/90 leading-relaxed">
                  250+ Acre Ultra-Modern Eco Campus in Nashik with 200+ global placement and corporate hiring tie-ups.
                </p>
              </div>
            </div>

            <div className="pt-2.5 sm:pt-3 border-t border-[#443C34] space-y-1.5 text-[11px] text-[#EFE2D0]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Merit Scholarships Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>State-of-the-Art Research Labs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FREQUENTLY ASKED QUESTIONS (FAQ) & ADMISSIONS DESK ──────────── */}
      <section id="faq" className="py-12 sm:py-20 bg-white border-t border-[#DFD7CB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: FAQ Context & Quick Support Desk */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB]">
                  <HelpCircle className="w-3.5 h-3.5 text-[#A36B40]" /> Answers & Support
                </div>
                <h2 className="text-xl sm:text-4xl font-extrabold text-[#2C2621] tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
                  Everything you need to know about the Sandip University Free Career Diagnostic Assessment and admission pathways.
                </p>
              </div>

              {/* Support Contact Box */}
              <div className="bg-[#FAF6F0] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#DFD7CB] space-y-3.5 sm:space-y-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl sm:rounded-2xl bg-[#A36B40] text-white flex items-center justify-center font-bold shrink-0">
                    <Phone className="w-4 sm:w-5 h-4 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#2C2621]">Admissions Advisory Desk</h4>
                    <p className="text-[10px] sm:text-[11px] text-[#7A7067]">Mon – Sat: 9:00 AM to 6:00 PM</p>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#DFD7CB]">
                    <span className="text-[#7A7067] font-medium text-[11px] sm:text-xs">Toll Free:</span>
                    <a href="tel:18002122714" className="font-bold text-[#A36B40] hover:underline text-xs sm:text-sm">1800-212-2714</a>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white rounded-xl border border-[#DFD7CB] gap-1">
                    <span className="text-[#7A7067] font-medium text-[11px]">Counseling Email:</span>
                    <a href="mailto:admissions@sandipuniversity.edu.in" className="font-bold text-[#2C2621] hover:underline text-[11px] truncate">admissions@sandipuniversity.edu.in</a>
                  </div>
                </div>

                <Link href="/login" className="block pt-1">
                  <Button className="w-full h-10 bg-[#77734B] hover:bg-[#625E3B] text-white font-bold text-xs rounded-xl gap-2 shadow-xs cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Talk to a Career Mentor</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: 2x2 FAQ Question Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAF6F0]/60 hover:bg-[#FAF6F0] p-4 sm:p-5 rounded-2xl border border-[#DFD7CB] hover:border-[#A36B40] transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-[#A36B40]/15 text-[#A36B40] font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0">
                        Q{idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2C2621] leading-snug">{faq.q}</h4>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#7A7067] leading-relaxed pl-7 sm:pl-8">{faq.a}</p>
                  </div>
                  <div className="pl-7 sm:pl-8 pt-1 text-[10px] sm:text-[11px] font-semibold text-[#A36B40] flex items-center gap-1">
                    <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#77734B]" /> Verified by Advisory Council
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ─── FINAL CALL TO ACTION (CTA) CONVERSION HUB ───────────────────── */}
      <section id="assessment" className="py-10 sm:py-14 lg:py-18 bg-[#211D19] text-white border-t border-[#332D27]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-r from-[#2C2621] via-[#332D27] to-[#211D19] rounded-2xl sm:rounded-3xl border border-[#443C34] p-5 sm:p-8 lg:p-12 shadow-2xl relative overflow-hidden">
            
            {/* Soft Ambient Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#A36B40]/20 rounded-full blur-3xl pointer-events-none -z-0" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center relative z-10">
              
              {/* Left Column: Heading & Value Checklist */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#A36B40]/25 text-[#C6A18D] border border-[#A36B40]/40">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" /> Admissions 2026–27 Open · 100% Free
                </div>

                <h2 className="text-xl sm:text-3xl lg:text-[40px] font-extrabold text-[#EFE2D0] tracking-tight leading-[1.2] lg:leading-[1.15]">
                  Take the 15-Minute Test That Shapes Your Career Trajectory.
                </h2>

                <p className="text-xs sm:text-sm text-[#C6A18D]/90 leading-relaxed max-w-xl mx-auto sm:mx-0">
                  Evaluate your strengths across 10 psychometric & aptitude dimensions. Get instant course match rankings and personalized counseling from Sandip University subject and industry mentors.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1 sm:pt-2 text-xs text-[#EFE2D0] text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#77734B] shrink-0" />
                    <span>100% Free · Zero Sign-Up Fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#77734B] shrink-0" />
                    <span>Instant Assessment Report</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#77734B] shrink-0" />
                    <span>1-on-1 Mentor Consultation</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Launch Action Box */}
              <div className="lg:col-span-5 bg-[#FAF6F0] text-[#2C2621] p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-[#DFD7CB] shadow-xl space-y-4 sm:space-y-5">
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-[#A36B40] bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#DFD7CB]">
                      Free Access
                    </span>
                    <span className="text-[11px] sm:text-xs text-[#7A7067] font-bold">~15 Minutes</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#2C2621]">Launch Career Assessment</h3>
                  <p className="text-xs text-[#7A7067]">
                    Choose your candidate track and begin your 30-MCQ diagnostic test immediately.
                  </p>
                </div>

                <div className="space-y-2.5 sm:space-y-3 pt-1">
                  <Link href="/login" className="block w-full">
                    <Button className="w-full h-11 sm:h-12 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-extrabold text-xs rounded-xl sm:rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer">
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>Start Free Assessment (Fresher Track)</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Link href="/login" className="block w-full">
                    <Button variant="outline" className="w-full h-10 sm:h-11 border-[#DFD7CB] bg-white text-[#2C2621] hover:bg-[#FAF6F0] font-bold text-xs rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                      <GraduationCap className="w-4 h-4 text-[#77734B]" />
                      <span>Existing Student PRN / Mentor Login</span>
                    </Button>
                  </Link>
                </div>

                <div className="pt-2 border-t border-[#DFD7CB] flex items-center justify-between text-[10px] sm:text-[11px] text-[#7A7067]">
                  <span>Direct Admissions Portal:</span>
                  <a
                    href="https://admission.sandipuniversity.edu.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#A36B40] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Sandip Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#211D19] text-[#EFE2D0] pt-10 sm:pt-14 pb-8 sm:pb-10 border-t border-[#332D27] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
            
            {/* Column 1: Brand & Campus Info */}
            <div className="lg:col-span-4 space-y-3 sm:space-y-4">
              <div className="bg-white px-3 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl inline-block shadow-xs">
                <div className="relative h-8 sm:h-9 w-32 sm:w-36">
                  <Image
                    src="/sandip-university-logo.png"
                    alt="Sandip University"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <p className="text-[#C6A18D] text-xs leading-relaxed max-w-sm">
                Sandip University is a premier NAAC 'A' Grade accredited multidisciplinary institution located on a 250+ acre eco-friendly campus in Nashik, Maharashtra.
              </p>

              <div className="space-y-1 text-[11px] text-[#A89D8F] pt-1">
                <p className="font-semibold text-white">Main Campus Address:</p>
                <p>Trimbak Road, Mahiravani, Nashik, Maharashtra – 422213</p>
              </div>
            </div>

            {/* Column 2: Academic Faculties */}
            <div className="lg:col-span-3 space-y-2.5 sm:space-y-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider block">
                Academic Disciplines
              </span>
              <ul className="space-y-1.5 sm:space-y-2 text-[#C6A18D]">
                <li><a href="#schools" className="hover:text-white transition-colors">School of Engineering & Tech</a></li>
                <li><a href="#schools" className="hover:text-white transition-colors">School of Computer Sciences</a></li>
                <li><a href="#schools" className="hover:text-white transition-colors">School of Commerce & Mgmt</a></li>
                <li><a href="#schools" className="hover:text-white transition-colors">School of Pharmaceutical Sciences</a></li>
                <li><a href="#schools" className="hover:text-white transition-colors">School of Law & Jurisprudence</a></li>
                <li><a href="#schools" className="hover:text-white transition-colors">School of Science & Design</a></li>
              </ul>
            </div>

            {/* Column 3: Platform Portals */}
            <div className="lg:col-span-2 space-y-2.5 sm:space-y-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider block">
                Career Platform
              </span>
              <ul className="space-y-1.5 sm:space-y-2 text-[#C6A18D]">
                <li><Link href="/login" className="hover:text-white transition-colors">Start Free Assessment</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Student PRN Login</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Mentor & Admin Portal</Link></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="https://admission.sandipuniversity.edu.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Admission Form</a></li>
              </ul>
            </div>

            {/* Column 4: Admissions Helpline & Support */}
            <div className="lg:col-span-3 space-y-2.5 sm:space-y-3">
              <span className="font-bold text-white text-xs uppercase tracking-wider block">
                Admissions & Helpline
              </span>
              <div className="space-y-2.5 text-[#C6A18D]">
                <div className="bg-[#2C2621] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-[#3D352E] space-y-1">
                  <span className="text-[10px] text-[#A89D8F] uppercase font-bold tracking-wider block">Toll-Free Helpline</span>
                  <a href="tel:18002122714" className="text-xs sm:text-sm font-extrabold text-[#FAF6F0] hover:text-[#A36B40] block transition-colors">
                    1800-212-2714
                  </a>
                </div>
                <div className="text-[11px] space-y-1">
                  <p className="text-[#A89D8F]">Email: <a href="mailto:admissions@sandipuniversity.edu.in" className="text-white hover:underline">admissions@sandipuniversity.edu.in</a></p>
                  <p className="text-[#A89D8F]">Hours: <span className="text-white font-medium">Mon – Sat: 9:00 AM – 6:00 PM</span></p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 sm:pt-8 border-t border-[#332D27] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] sm:text-[11px] text-[#A89D8F] text-center sm:text-left">
            <p>© {new Date().getFullYear()} Sandip University Career Intelligence Platform. All rights reserved.</p>
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-[#C6A18D]">
              <span>NAAC 'A' Grade</span>
              <span>·</span>
              <span>UGC Approved</span>
              <span>·</span>
              <span>AICTE Recognized</span>
            </div>
          </div>

        </div>
      </footer>

      </div>
    </div>
  )
}
