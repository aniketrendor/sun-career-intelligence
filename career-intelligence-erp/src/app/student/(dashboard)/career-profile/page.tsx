import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Compass, Award, Target, BookOpen, AlertCircle,
  ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Sparkles,
  Layers, MessageSquare, Lightbulb, Info,
  GraduationCap, Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
    { data: enrollment }
  ] = await Promise.all([
    adminClient
      .from('student_profiles')
      .select('prn, current_program, academic_year, school, institution')
      .eq('user_id', profile.id)
      .maybeSingle(),
    adminClient
      .from('enrollments')
      .select('academic_year, program:programs(name, code), class:classes(semester)')
      .eq('student_id', profile.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()
  ])

  const enrolledProgramName = studentProfile?.current_program ||
    (Array.isArray(enrollment?.program) ? enrollment?.program?.[0]?.name : (enrollment?.program as any)?.name) ||
    'Academic Program Enrolled'

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-10">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-2xl">
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] mb-2 gap-1.5 font-bold text-xs px-3 py-1">
            <Compass className="w-3.5 h-3.5" /> Career Diagnostic Profile
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Academic & Career Alignment
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
            Personalized career trajectory and domain orientation for Sandip University students.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/student/domain-suggestions">
            <Button className="h-11 px-5 rounded-2xl bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs shadow-md shadow-[#A36B40]/25 flex items-center gap-2 cursor-pointer transition-all">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Explore Program Pathways</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-[#DFD7CB] bg-white rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[#DFD7CB]/60 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center border border-[#DFD7CB]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#2C2621]">Academic Status</h2>
              <p className="text-xs text-[#7A7067]">Current enrollment & department details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/70 space-y-1">
              <span className="text-[11px] font-semibold text-[#7A7067] uppercase tracking-wider">Candidate</span>
              <p className="text-sm font-bold text-[#2C2621]">{profile.full_name || 'Enrolled Student'}</p>
              <p className="text-xs text-[#7A7067]">{profile.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/70 space-y-1">
              <span className="text-[11px] font-semibold text-[#7A7067] uppercase tracking-wider">Program</span>
              <p className="text-sm font-bold text-[#2C2621]">{enrolledProgramName}</p>
              <p className="text-xs text-[#7A7067]">PRN: {studentProfile?.prn || 'Registered'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/70 space-y-1">
              <span className="text-[11px] font-semibold text-[#7A7067] uppercase tracking-wider">Institution</span>
              <p className="text-sm font-bold text-[#2C2621]">{studentProfile?.institution || 'Sandip University'}</p>
              <p className="text-xs text-[#7A7067]">{studentProfile?.school || 'School of Advanced Studies'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 border border-[#DFD7CB]/70 space-y-1">
              <span className="text-[11px] font-semibold text-[#7A7067] uppercase tracking-wider">Academic Year</span>
              <p className="text-sm font-bold text-[#2C2621]">{studentProfile?.academic_year || '2026-2027'}</p>
              <p className="text-xs text-[#7A7067]">Status: Active Learner</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#A36B40] shrink-0 mt-0.5" />
            <div className="text-xs text-[#7A7067] space-y-1">
              <p className="font-bold text-[#2C2621]">Assessment Recalibration</p>
              <p>
                The assessment setup and diagnostic question bank have been retired. Academic counseling and program alignment are available directly through your assigned faculty advisor.
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="border-[#DFD7CB] bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#2C2621] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A36B40]" />
              Advisory Resources
            </h3>
            <div className="space-y-2">
              <Link href="/student/domain-suggestions" className="block">
                <Button variant="outline" className="w-full justify-between h-11 border-[#DFD7CB] hover:bg-[#FAF6F0] text-[#2C2621] font-semibold text-xs rounded-xl">
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#A36B40]" />
                    Degree Programs
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#7A7067]" />
                </Button>
              </Link>
              <Link href="/student/counselor" className="block">
                <Button variant="outline" className="w-full justify-between h-11 border-[#DFD7CB] hover:bg-[#FAF6F0] text-[#2C2621] font-semibold text-xs rounded-xl">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#77734B]" />
                    Faculty Mentor
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#7A7067]" />
                </Button>
              </Link>
              <Link href="/student/profile" className="block">
                <Button variant="outline" className="w-full justify-between h-11 border-[#DFD7CB] hover:bg-[#FAF6F0] text-[#2C2621] font-semibold text-xs rounded-xl">
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#A36B40]" />
                    My Student Profile
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#7A7067]" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
