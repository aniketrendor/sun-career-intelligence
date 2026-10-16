import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Compass, Award, Target, BookOpen, AlertCircle,
  ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Sparkles,
  Layers, MessageSquare, Lightbulb, Info,
  GraduationCap, Clock, TrendingUp, BarChart2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function StudentCareerProfilePage() {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await adminClient
    .from('users')
    .select('id, full_name, email, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'STUDENT') redirect('/login')

  const [
    { data: studentProfile },
    { data: enrollment },
    { data: careerProfile },
    { data: dScores },
    { data: attempt }
  ] = await Promise.all([
    adminClient
      .from('student_profiles')
      .select('prn, current_program, academic_year, school, institution, stream_department')
      .eq('user_id', profile.id)
      .maybeSingle(),
    adminClient
      .from('enrollments')
      .select('academic_year, program:programs(name, code), class:classes(semester)')
      .eq('student_id', profile.id)
      .eq('status', 'ACTIVE')
      .maybeSingle(),
    adminClient
      .from('career_profiles')
      .select('*, primary_domain:career_domains!primary_domain_id(id, name, description, icon), secondary_domain:career_domains!secondary_domain_id(id, name, description, icon)')
      .eq('student_id', profile.id)
      .maybeSingle(),
    adminClient
      .from('domain_scores')
      .select('normalized_score, raw_score, rank, alignment_label, domain:career_domains(id, name, description, icon)')
      .eq('student_id', profile.id)
      .order('rank', { ascending: true })
      .limit(6),
    adminClient
      .from('assessment_attempts')
      .select('id, status, completed_at, started_at')
      .eq('student_id', profile.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  ])

  const enrolledProgramName = studentProfile?.current_program ||
    (Array.isArray(enrollment?.program) ? enrollment?.program?.[0]?.name : (enrollment?.program as any)?.name) ||
    'Academic Program Enrolled'

  const getDomain = (d: any) => (Array.isArray(d) ? d[0] : d)
  const primaryDomain = getDomain(careerProfile?.primary_domain)
  const secondaryDomain = getDomain(careerProfile?.secondary_domain)

  const topDomain1 = primaryDomain || getDomain(dScores?.[0]?.domain)
  const topDomain2 = secondaryDomain || getDomain(dScores?.[1]?.domain)

  const hasCareerProfile = !!careerProfile || (dScores && dScores.length > 0)

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] gap-1.5 font-bold text-xs px-3 py-1">
            <Compass className="w-3.5 h-3.5" /> Career Diagnostic Profile
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Academic & Career Alignment Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
            Multi-dimensional psychometric profile, functional career domains, and faculty recommendation trajectory.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/student/assessment">
            <Button className="h-11 px-5 rounded-2xl bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs shadow-md shadow-[#A36B40]/25 flex items-center gap-2 cursor-pointer transition-all">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{hasCareerProfile ? 'Retake Assessment' : 'Take Career Assessment'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic & Diagnostic Alignment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Diagnostic Archetype Hero Banner */}
          {hasCareerProfile ? (
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A36B40]">
                    Evaluated Career Persona
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#2C2621]">
                    {careerProfile?.profile_label || `${topDomain1?.name || 'Domain'} Practitioner`}
                  </h2>
                </div>
                <Badge className="bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 font-bold text-xs px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#77734B]" /> Verified Profile
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
                {careerProfile?.profile_description ||
                  `Based on your multidimensional cognitive and domain diagnostic responses, your strongest career affinities lie in ${topDomain1?.name || 'emerging sectors'}, complemented by cross-disciplinary applications.`}
              </p>

              {/* Primary & Secondary Domain Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Primary Domain */}
                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A36B40]">
                      Primary Specialization
                    </span>
                    <span className="text-[10px] font-bold text-[#77734B] bg-[#F1F1EB] px-2 py-0.5 rounded-full border border-[#77734B]/30">
                      Rank #1
                    </span>
                  </div>
                  <p className="text-base font-bold text-[#2C2621]">
                    {topDomain1?.name || 'Primary Domain'}
                  </p>
                  <p className="text-xs text-[#7A7067] line-clamp-2">
                    {topDomain1?.description || 'Core domain alignment'}
                  </p>
                </div>

                {/* Secondary Domain */}
                <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A18D]">
                      Secondary Complement
                    </span>
                    <span className="text-[10px] font-bold text-[#A36B40] bg-[#F7EFEA] px-2 py-0.5 rounded-full border border-[#A36B40]/30">
                      Rank #2
                    </span>
                  </div>
                  <p className="text-base font-bold text-[#2C2621]">
                    {topDomain2?.name || 'Secondary Domain'}
                  </p>
                  <p className="text-xs text-[#7A7067] line-clamp-2">
                    {topDomain2?.description || 'Complementary cross-functional domain'}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mx-auto flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="text-lg font-bold text-[#2C2621]">Assessment Pending</h2>
                <p className="text-xs text-[#7A7067] leading-relaxed">
                  You have not yet completed the two-stage career exploration assessment. Complete 30 quick scenario-based questions to unlock your personalized domain match profile.
                </p>
              </div>
              <div>
                <Link href="/student/assessment">
                  <Button className="h-11 px-6 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 cursor-pointer">
                    Launch 30-Question Assessment &rarr;
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Top Domain Scores Compatibility Meters */}
          {dScores && dScores.length > 0 && (
            <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFD7CB]/60 pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#A36B40]" />
                    Domain Alignment Metrics
                  </h3>
                  <p className="text-xs text-[#7A7067]">
                    Calculated affinity scores across assessed industry career domains
                  </p>
                </div>
                <Badge variant="outline" className="border-[#DFD7CB] text-[#7A7067] text-[10px] font-semibold">
                  Top {dScores.length} Domains
                </Badge>
              </div>

              <div className="space-y-3.5 pt-1">
                {dScores.map((ds: any, idx: number) => {
                  const score = Math.min(100, Math.round(Number(ds.normalized_score ?? ds.raw_score ?? 0)))
                  const dom = getDomain(ds.domain)
                  return (
                    <div key={ds.id || idx} className="space-y-1.5 p-3 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/60">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#A36B40] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {ds.rank || idx + 1}
                          </span>
                          <span className="font-bold text-[#2C2621]">{dom?.name}</span>
                          {ds.alignment_label && (
                            <Badge variant="secondary" className="text-[10px] font-medium bg-white text-[#7A7067] border border-[#DFD7CB]">
                              {ds.alignment_label}
                            </Badge>
                          )}
                        </div>
                        <span className="font-extrabold text-[#A36B40]">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2 bg-[#EFE2D0]" />
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Academic Profile Details */}
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-[#DFD7CB]/60 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center border border-[#DFD7CB]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2C2621]">Enrollment & Institutional Records</h3>
                <p className="text-xs text-[#7A7067]">Current Sandip University student records</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/70 space-y-1">
                <span className="text-[10px] font-bold text-[#7A7067] uppercase tracking-wider">Candidate</span>
                <p className="text-xs font-bold text-[#2C2621]">{profile.full_name || 'Enrolled Student'}</p>
                <p className="text-[11px] text-[#7A7067]">{profile.email}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/70 space-y-1">
                <span className="text-[10px] font-bold text-[#7A7067] uppercase tracking-wider">Program</span>
                <p className="text-xs font-bold text-[#2C2621]">{enrolledProgramName}</p>
                <p className="text-[11px] text-[#7A7067]">PRN: {studentProfile?.prn || 'Registered'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/70 space-y-1">
                <span className="text-[10px] font-bold text-[#7A7067] uppercase tracking-wider">Institution & School</span>
                <p className="text-xs font-bold text-[#2C2621]">{studentProfile?.institution || 'Sandip University'}</p>
                <p className="text-[11px] text-[#7A7067]">{studentProfile?.school || 'Main Campus'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/70 space-y-1">
                <span className="text-[10px] font-bold text-[#7A7067] uppercase tracking-wider">Academic Year</span>
                <p className="text-xs font-bold text-[#2C2621]">{studentProfile?.academic_year || '2026-2027'}</p>
                <p className="text-[11px] text-[#7A7067]">Status: Active Student</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Advisory Actions & Navigation */}
        <div className="space-y-6">
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#2C2621] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A36B40]" />
              Career Advisory Pathways
            </h3>
            <p className="text-xs text-[#7A7067] leading-relaxed">
              Explore aligned academic programs, faculty mentor counseling sessions, and curated career roles.
            </p>
            <div className="space-y-2 pt-1">
              <Link href="/student/domain-suggestions" className="block">
                <Button variant="outline" className="w-full justify-between h-11 border-[#DFD7CB] hover:bg-[#FAF6F0] text-[#2C2621] font-semibold text-xs rounded-xl">
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#A36B40]" />
                    Curriculum Programs
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#7A7067]" />
                </Button>
              </Link>
              <Link href="/student/roles" className="block">
                <Button variant="outline" className="w-full justify-between h-11 border-[#DFD7CB] hover:bg-[#FAF6F0] text-[#2C2621] font-semibold text-xs rounded-xl">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#A36B40]" />
                    Career Roles Catalog
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#7A7067]" />
                </Button>
              </Link>
              <Link href="/student/counselor" className="block">
                <Button variant="outline" className="w-full justify-between h-11 border-[#DFD7CB] hover:bg-[#FAF6F0] text-[#2C2621] font-semibold text-xs rounded-xl">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#77734B]" />
                    Faculty Mentor Advice
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#7A7067]" />
                </Button>
              </Link>
              <Link href="/student/syllabus" className="block">
                <Button variant="outline" className="w-full justify-between h-11 border-[#DFD7CB] hover:bg-[#FAF6F0] text-[#2C2621] font-semibold text-xs rounded-xl">
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#A36B40]" />
                    Program Syllabus
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#7A7067]" />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="border-[#DFD7CB] bg-[#FAF6F0] rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#A36B40]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#A36B40]">
                Psychometric Methodology
              </h4>
            </div>
            <p className="text-xs text-[#7A7067] leading-relaxed">
              Our assessment uses a 20-dimensional cognitive and behavioral model mapped to 79 distinct industry domains and 114 academic curricula across engineering, computing, management, science, law, and creative arts.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
