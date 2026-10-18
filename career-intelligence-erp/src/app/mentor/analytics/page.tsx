import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart2, Users, BookOpen, Target, CheckCircle2,
  TrendingUp, Layers, Sparkles, Building2, Calendar, ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export const dynamic = 'force-dynamic'

export default async function CounselorAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Fetch mentor's assigned students
  const { data: assignments } = await supabase
    .from('student_counselor_assignments')
    .select('student_id')
    .eq('counselor_id', profile.id)
    .eq('status', 'ACTIVE')

  const assignedStudentIds = (assignments || []).map(a => a.student_id).filter(Boolean)

  // Fetch institutional & advisee data
  const [
    { count: totalStudents },
    { count: completedAttempts },
    { data: domains },
    { data: careerProfiles },
    { data: mySessions },
    { count: myAdviseeCompletedCount }
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }).eq('role', 'STUDENT'),
    supabase.from('assessment_attempts').select('id', { count: 'exact' }).eq('status', 'COMPLETED'),
    supabase.from('career_domains').select('id, name'),
    supabase.from('career_profiles').select('primary_domain_id'),
    supabase.from('counseling_sessions').select('id').eq('counselor_id', profile.id),
    assignedStudentIds.length > 0
      ? supabase.from('assessment_attempts').select('id', { count: 'exact' }).in('student_id', assignedStudentIds).eq('status', 'COMPLETED')
      : Promise.resolve({ count: 0 })
  ])

  const completionRate = totalStudents && totalStudents > 0
    ? Math.round(((completedAttempts || 0) / totalStudents) * 100)
    : 0

  // Calculate domain distribution
  const domainCounts: Record<string, number> = {}
  careerProfiles?.forEach(cp => {
    if (cp.primary_domain_id) {
      domainCounts[cp.primary_domain_id] = (domainCounts[cp.primary_domain_id] || 0) + 1
    }
  })

  const domainStats = (domains || []).map((d: any) => ({
    name: d.name,
    count: domainCounts[d.id] || 0,
    percent: (careerProfiles?.length || 0) > 0
      ? Math.round(((domainCounts[d.id] || 0) / (careerProfiles?.length || 1)) * 100)
      : 0,
  })).sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] mb-2 gap-1.5 font-bold text-xs px-3 py-1">
            <BarChart2 className="w-3.5 h-3.5" /> Institutional & Caseload Intelligence
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Advisee & Department Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Real-time analytics on your assigned advisees, assessment completions, career domain affinities, and guidance outcomes.
          </p>
        </div>

        <Link href="/mentor/students">
          <Button size="sm" className="gap-2 bg-[#A36B40] hover:bg-[#8E5B34] text-white font-bold text-xs h-10 px-4 rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all cursor-pointer">
            <Users className="w-3.5 h-3.5" /> View My Advisees
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-xs">
          <CardHeader className="pb-2 p-5">
            <CardDescription className="text-xs text-[#7A7067] font-medium">My Assigned Advisees</CardDescription>
            <CardTitle className="text-3xl font-black text-[#A36B40]">{assignedStudentIds.length}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <p className="text-[11px] text-[#8C8276]">Active students in your panel</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-xs">
          <CardHeader className="pb-2 p-5">
            <CardDescription className="text-xs text-[#7A7067] font-medium">Advisee Tests Completed</CardDescription>
            <CardTitle className="text-3xl font-black text-[#77734B]">{myAdviseeCompletedCount || 0}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <p className="text-[11px] text-[#8C8276]">
              {assignedStudentIds.length > 0
                ? `${Math.round(((myAdviseeCompletedCount || 0) / assignedStudentIds.length) * 100)}% caseload completion`
                : 'Awaiting student assignments'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-xs">
          <CardHeader className="pb-2 p-5">
            <CardDescription className="text-xs text-[#7A7067] font-medium">Mentorship Sessions</CardDescription>
            <CardTitle className="text-3xl font-black text-[#C6A18D]">{mySessions?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <p className="text-[11px] text-[#8C8276]">1-on-1 advisor interventions</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-xs">
          <CardHeader className="pb-2 p-5">
            <CardDescription className="text-xs text-[#7A7067] font-medium">University Program Syllabi</CardDescription>
            <CardTitle className="text-3xl font-black text-[#2C2621]">114</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <p className="text-[11px] text-[#8C8276]">Active degree curricula</p>
          </CardContent>
        </Card>
      </div>

      {/* Domain Distribution */}
      <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5 sm:p-6">
          <CardTitle className="text-base font-bold text-[#2C2621]">Career Domain Affinity Distribution</CardTitle>
          <CardDescription className="text-xs text-[#7A7067]">
            Percentage of student body aligning with each primary career domain track based on completed diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-4">
          {domainStats.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#7A7067]">
              No domain affinity data available yet.
            </div>
          ) : (
            domainStats.map((ds, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#2C2621]">{ds.name}</span>
                  <span className="font-mono font-bold text-[#A36B40]">{ds.count} Students ({ds.percent}%)</span>
                </div>
                <Progress value={ds.percent} className="h-2 bg-[#FAF6F0]" />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
