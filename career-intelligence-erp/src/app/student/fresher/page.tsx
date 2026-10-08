'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  GraduationCap, Users, Ticket, ArrowRight, CheckCircle2,
  Sparkles, ShieldCheck, Mail, Phone, BookOpen, Clock,
  Award, Building2, User, School, FileText, Layers, Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getReferralKeyDetails } from '@/lib/actions/key.actions'

const ugQualifications = [
  '12th / HSC Science (PCM / Computer Science)',
  '12th / HSC Science (PCB / Biology)',
  '12th / HSC Commerce (Maths / Statistics)',
  '12th / HSC Commerce (General)',
  '12th / HSC Arts & Humanities',
  'Diploma in Engineering / Polytechnic (3-Year)',
  '10th / SSC (Transitioning to Junior College / Diploma)',
  'Other Intermediate Equivalent',
]

const pgQualifications = [
  'B.Tech / B.E (Computer Science / IT / AI / Data Science)',
  'B.Tech / B.E (Mechanical / Civil / Electrical / ENTC / Other)',
  'BCA (Bachelor of Computer Applications)',
  'B.Sc (Computer Science / IT / Mathematics / Data)',
  'B.Com / BBA / BMS / Economics',
  'B.Sc (General Science / Life Sciences / Chemistry)',
  'Bachelor of Arts (BA / Humanities / Journalism)',
  'Other Graduate Degree',
]

function FresherOverviewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const referralCode = searchParams.get('code') || 'SUN-FRESHERS-2026'
  const [academicLevel, setAcademicLevel] = useState<'UG' | 'PG'>('UG')
  const [name, setName] = useState(searchParams.get('name') || '')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [phone, setPhone] = useState(() => {
    const raw = (searchParams.get('phone') || '').replace(/\D/g, '')
    if (raw.length === 12 && raw.startsWith('91')) return raw.slice(2)
    if (raw.length === 11 && raw.startsWith('0')) return raw.slice(1)
    return raw.slice(-10)
  })
  const [highestQualification, setHighestQualification] = useState(ugQualifications[0])
  const [lastAttemptedCollege, setLastAttemptedCollege] = useState(searchParams.get('college') || '')

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '')
    let cleaned = digitsOnly
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      cleaned = cleaned.slice(2)
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = cleaned.slice(1)
    }
    setPhone(cleaned.slice(0, 10))
  }

  const [advisorInfo, setAdvisorInfo] = useState<{
    advisorName: string
    advisorTitle: string
    advisorRole: string
    isMentorKey: boolean
  }>({
    advisorName: 'Admissions Directorate',
    advisorTitle: 'Sandip University Admissions & Advisory Council',
    advisorRole: 'Admissions Council',
    isMentorKey: false,
  })

  // Fetch real key details (Zero Mock Data)
  useEffect(() => {
    let mounted = true
    getReferralKeyDetails(referralCode).then((res) => {
      if (mounted && res) {
        setAdvisorInfo({
          advisorName: res.advisorName || 'Admissions Directorate',
          advisorTitle: res.advisorTitle || 'Sandip University Admissions Council',
          advisorRole: res.advisorRole || 'Admissions Council',
          isMentorKey: res.isMentorKey || false,
        })
      }
    }).catch(console.error)
    return () => { mounted = false }
  }, [referralCode])

  // Switch default qualification when level changes
  const handleLevelChange = (lvl: 'UG' | 'PG') => {
    setAcademicLevel(lvl)
    setHighestQualification(lvl === 'UG' ? ugQualifications[0] : pgQualifications[0])
  }

  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter your full name.')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }
    if (!phone.trim() || phone.trim().length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!lastAttemptedCollege.trim()) {
      toast.error('Please enter your last attended school or college.')
      return
    }

    const params = new URLSearchParams({
      code: referralCode,
      name: name.trim(),
      email: email.trim(),
      phone: `+91 ${phone.trim()}`,
      level: academicLevel,
      qualification: highestQualification,
      college: lastAttemptedCollege.trim(),
      mentor: advisorInfo.advisorName,
    })

    toast.success(`Launching ${academicLevel} Diagnostic Assessment for ${name.trim()}...`)
    window.location.href = `/student/fresher/test?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Header / University Branding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#DFD7CB] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#A36B40] via-[#C6A18D] to-[#77734B] flex items-center justify-center text-white shadow-md shadow-[#A36B40]/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#2C2621] tracking-tight">
                  Fresher Admissions & Career Gateway
                </h1>
                <Badge className="bg-[#F9F4F0] text-[#C6A18D] border-[#C6A18D]/40 text-xs font-semibold">
                  {academicLevel} Track Active
                </Badge>
              </div>
              <p className="text-xs text-[#7A7067] mt-0.5">
                Sandip University Career Intelligence ERP · Official Candidate Intake & Evaluation
              </p>
            </div>
          </div>

          <Link href="/login">
            <Button variant="outline" size="sm" className="text-xs rounded-xl border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] hover:bg-[#F2EAE0]">
              Back to Login
            </Button>
          </Link>
        </div>

        {/* 5-Step Visual Pipeline Tracker */}
        <Card className="border-[#DFD7CB] shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="bg-[#FAF6F0] border-b border-[#DFD7CB] pb-3">
            <CardTitle className="text-sm font-bold text-[#2C2621] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A36B40]" />
              {academicLevel === 'UG' ? 'Undergraduate (UG)' : 'Postgraduate (PG)'} Admission & Evaluation Pathway
            </CardTitle>
            <CardDescription className="text-xs text-[#7A7067]">
              Complete your profile to take the 10-minute diagnostic test and generate your personalized degree fit report
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
              {[
                { step: '1', title: 'Referral Token', desc: referralCode, done: true },
                { step: '2', title: `${academicLevel} Profile`, desc: 'Academic Details', current: true },
                { step: '3', title: `${academicLevel} Assessment`, desc: '10 Min Diagnostic' },
                { step: '4', title: 'Decision Report', desc: 'Domain Fit Score' },
                { step: '5', title: 'Mentorship', desc: 'Admission Allocation' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                    item.done
                      ? 'bg-[#F1F1EB] border-[#77734B]/30 text-[#77734B]'
                      : item.current
                      ? 'bg-[#A36B40] text-white border-[#A36B40] shadow-md shadow-[#A36B40]/25 scale-[1.03]'
                      : 'bg-[#FAF6F0] border-[#DFD7CB] text-[#8C8276]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      item.done
                        ? 'bg-[#77734B] text-white'
                        : item.current
                        ? 'bg-white text-[#A36B40]'
                        : 'bg-[#E8DDD0] text-[#7A7067]'
                    }`}
                  >
                    {item.done ? '✓' : item.step}
                  </div>
                  <span className="text-xs font-bold block">{item.title}</span>
                  <span className={`text-[10px] block ${item.current ? 'text-white/85' : 'text-[#8C8276]'}`}>
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two-Column Form & Real Advisor Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Candidate Registration Form (2 cols) */}
          <Card className="md:col-span-2 border-[#DFD7CB] shadow-sm rounded-3xl overflow-hidden bg-white">
            <div className="h-3 w-full bg-gradient-to-r from-[#A36B40] via-[#C6A18D] to-[#77734B]" />
            <CardHeader className="pb-3 border-b border-[#DFD7CB]">
              <div className="flex items-center justify-between">
                <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#A36B40]/30 text-xs font-semibold">
                  Required Candidate Information
                </Badge>
                <span className="text-xs text-[#7A7067] font-mono">Token: {referralCode}</span>
              </div>
              <CardTitle className="text-lg font-bold text-[#2C2621] mt-2">
                Candidate Academic & Contact Details
              </CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Select your target degree level and background before starting the diagnostic assessment.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleStartTest} className="space-y-4">
                
                {/* UG vs PG Segmented Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#A36B40]" /> Target Degree Program Level *
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#FAF6F0] rounded-2xl border border-[#DFD7CB]">
                    <button
                      type="button"
                      onClick={() => handleLevelChange('UG')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        academicLevel === 'UG'
                          ? 'bg-[#A36B40] text-white shadow-sm shadow-[#A36B40]/25'
                          : 'text-[#7A7067] hover:text-[#2C2621] hover:bg-white/60'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Undergraduate (UG / B.Tech / BCA)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLevelChange('PG')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        academicLevel === 'PG'
                          ? 'bg-[#77734B] text-white shadow-sm shadow-[#77734B]/25'
                          : 'text-[#7A7067] hover:text-[#2C2621] hover:bg-white/60'
                      }`}
                    >
                      <Award className="w-4 h-4" />
                      <span>Postgraduate (PG / MBA / M.Tech)</span>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#A36B40]" /> Full Name *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Harry"
                    required
                    className="h-10 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#A36B40]" /> Email Address *
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. candidate@gmail.com"
                      required
                      className="h-10 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#77734B]" /> Phone / WhatsApp *
                      </label>
                      {phone.length > 0 && (
                        <span className={`text-[11px] font-mono ${
                          phone.length === 10 ? 'text-emerald-700 font-semibold' : 'text-[#7A7067]'
                        }`}>
                          {phone.length}/10
                        </span>
                      )}
                    </div>
                    <div className={`flex items-center h-10 rounded-xl bg-[#FAF6F0] border transition-all duration-200 overflow-hidden ${
                      phone.length === 10
                        ? 'border-emerald-600/70 ring-2 ring-emerald-600/10'
                        : 'border-[#DFD7CB] focus-within:border-[#A36B40] focus-within:ring-2 focus-within:ring-[#A36B40]/15'
                    }`}>
                      <div className="flex items-center gap-1.5 px-3 h-full bg-[#EFE8DD] border-r border-[#DFD7CB] text-[#5C544D] text-xs font-semibold select-none shrink-0 font-mono">
                        <span className="text-xs">🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        placeholder="7030430756"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="w-full h-full px-2.5 text-xs text-[#2C2621] bg-transparent outline-none font-mono placeholder:text-[#9E9589] placeholder:font-sans"
                      />
                      {phone.length === 10 && (
                        <div className="pr-2.5 shrink-0 text-emerald-600 animate-in fade-in zoom-in-75 duration-200">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dynamic Highest Qualification based on UG vs PG */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C6A18D]" /> 
                    {academicLevel === 'UG' ? 'Previous Schooling / 12th Qualification *' : 'Undergraduate Degree / Major *'}
                  </label>
                  <select
                    value={highestQualification}
                    onChange={(e) => setHighestQualification(e.target.value)}
                    required
                    className="w-full h-10 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0] px-3 py-1 text-xs text-[#2C2621] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                  >
                    {(academicLevel === 'UG' ? ugQualifications : pgQualifications).map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Last Attempted College / School */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-[#A36B40]" /> 
                    {academicLevel === 'UG' ? 'Last Attended Junior College / School *' : 'Last Attended University / College *'}
                  </label>
                  <Input
                    value={lastAttemptedCollege}
                    onChange={(e) => setLastAttemptedCollege(e.target.value)}
                    placeholder={academicLevel === 'UG' ? 'e.g. Sandip Junior College / RYK Science College' : 'e.g. Pune University / Sandip University'}
                    required
                    className="h-10 bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Proceed to {academicLevel} 30-Question Diagnostic Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Real Advisor & Assessment Specifications Card (1 col) */}
          <div className="space-y-4">
            <Card className="border-[#DFD7CB] shadow-sm rounded-3xl p-5 bg-white space-y-5">
              
              {/* Real Advisor Info Header (Zero Mock Data) */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-[#DFD7CB]">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#77734B] to-[#555234] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[10px] font-bold text-[#77734B] uppercase tracking-wider bg-[#F1F1EB] px-2 py-0.5 rounded-md border border-[#77734B]/30 mb-1">
                    {advisorInfo.advisorRole}
                  </span>
                  <h3 className="font-extrabold text-[#2C2621] text-sm truncate">
                    {advisorInfo.advisorName}
                  </h3>
                  <p className="text-[11px] text-[#7A7067] truncate">
                    {advisorInfo.advisorTitle}
                  </p>
                </div>
              </div>

              {/* Assessment Protocol Specifications (Clean 2x2 Grid) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">
                    Diagnostic Overview
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#A36B40] bg-[#FAF6F0] px-2 py-0.5 rounded-md border border-[#DFD7CB]">
                    {referralCode}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#A36B40]">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7067]">Duration</span>
                    </div>
                    <p className="text-xs font-extrabold text-[#2C2621]">15 – 20 Mins</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#77734B]">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7067]">Format</span>
                    </div>
                    <p className="text-xs font-extrabold text-[#2C2621]">30 Questions</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#C6A18D]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7067]">Level Track</span>
                    </div>
                    <p className="text-xs font-extrabold text-[#2C2621]">{academicLevel} Track</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#A36B40]">
                      <Award className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7067]">Output</span>
                    </div>
                    <p className="text-xs font-extrabold text-[#2C2621]">{academicLevel} Degree Fit</p>
                  </div>
                </div>
              </div>

              {/* What You Get Highlights */}
              <div className="p-3.5 bg-[#F9F4F0] rounded-2xl border border-[#C6A18D]/30 space-y-2">
                <span className="text-[11px] font-bold text-[#A36B40] uppercase tracking-wider block">
                  {academicLevel} Track Evaluation Benefits
                </span>
                <ul className="space-y-1.5 text-xs text-[#5C5248]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B] shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      {academicLevel === 'UG' ? 'AI domain mapping across CSE, AI & Software' : 'Strategic evaluation across MBA Tech & M.Tech specializations'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B] shrink-0 mt-0.5" />
                    <span className="leading-tight">Curated Sandip University specialization report</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#77734B] shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      {advisorInfo.isMentorKey ? `Direct mentorship from ${advisorInfo.advisorName}` : 'Official admissions advisory review'}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Security & Confidentiality */}
              <div className="flex items-center gap-2 text-[11px] text-[#8C8276] pt-1">
                <ShieldCheck className="w-4 h-4 text-[#77734B] shrink-0" />
                <span className="leading-tight">Official Sandip University Diagnostic · Free for all candidates</span>
              </div>
            </Card>
          </div>

        </div>

      </div>
    </div>
  )
}

export default function FresherOverviewPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-[#7A7067]">Loading Fresher Portal...</div>}>
      <FresherOverviewContent />
    </Suspense>
  )
}
