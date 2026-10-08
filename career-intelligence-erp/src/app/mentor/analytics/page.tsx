import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  BarChart2, Users, BookOpen, Target, CheckCircle2,
  TrendingUp, Layers, Sparkles, Building2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  // Fetch counts
  const [
    { count: totalStudents },
    { count: totalAttempts },
    { count: completedAttempts },
    { data: domains },
    { data: careerProfiles },
    { data: sessions },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }).eq('role', 'STUDENT'),
    supabase.from('assessment_attempts').select('id', { count: 'exact' }),
    supabase.from('assessment_attempts').select('id', { count: 'exact' }).eq('status', 'COMPLETED'),
    supabase.from('career_domains').select('id, name'),
    supabase.from('career_profiles').select('primary_domain_id'),
    supabase.from('counseling_sessions').select('id, status'),
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
            <BarChart2 className="w-3.5 h-3.5" /> Institutional Intelligence
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Career Intelligence & Cohort Analytics</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Aggregate analytics on student assessment completion, career domain affinities, and counseling outcomes.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-xs">
          <CardHeader className="pb-2 p-5">
            <CardDescription className="text-xs text-[#7A7067] font-medium">Total Enrolled Students</CardDescription>
            <CardTitle className="text-3xl font-black text-[#2C2621]">{totalStudents || 0}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <p className="text-[11px] text-[#8C8276]">Across all registered cohorts</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-xs">
          <CardHeader className="pb-2 p-5">
            <CardDescription className="text-xs text-[#7A7067] font-medium">Assessments Completed</CardDescription>
            <CardTitle className="text-3xl font-black text-[#77734B]">{completedAttempts || 0}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <p className="text-[11px] text-[#8C8276]">Completion rate: <strong className="text-[#2C2621]">{completionRate}%</strong></p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-xs">
          <CardHeader className="pb-2 p-5">
            <CardDescription className="text-xs text-[#7A7067] font-medium">Career Profiles Generated</CardDescription>
            <CardTitle className="text-3xl font-black text-[#A36B40]">{careerProfiles?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <p className="text-[11px] text-[#8C8276]">Active psychometric profiles</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-xs">
          <CardHeader className="pb-2 p-5">
            <CardDescription className="text-xs text-[#7A7067] font-medium">Counseling Sessions</CardDescription>
            <CardTitle className="text-3xl font-black text-[#C6A18D]">{sessions?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0">
            <p className="text-[11px] text-[#8C8276]">Advisor interventions logged</p>
          </CardContent>
        </Card>
      </div>

      {/* Domain Distribution */}
      <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5 sm:p-6">
          <CardTitle className="text-base font-bold text-[#2C2621]">Career Domain Affinity Distribution</CardTitle>
          <CardDescription className="text-xs text-[#7A7067]">
            Percentage of student body aligning with each primary career domain track
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 space-y-4">
          {domainStats.map((ds, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#2C2621]">{ds.name}</span>
                <span className="font-mono font-bold text-[#A36B40]">{ds.count} Students ({ds.percent}%)</span>
              </div>
              <Progress value={ds.percent} className="h-2 bg-[#FAF6F0]" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
