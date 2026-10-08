import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart2, Users, Building2, GraduationCap, QrCode,
  Target, CheckCircle2, TrendingUp, Sparkles, ExternalLink,
  ArrowRight, Award, Check, KeyRound, Clock, ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export const dynamic = 'force-dynamic'

export default async function DeanAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminClient = await createAdminClient()

  const { data: profile } = await adminClient
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD', 'MENTOR', 'COUNSELOR'].includes(profile.role)) redirect('/login')

  // Fetch real database counts and metrics
  const [
    { count: totalPrograms },
    { count: totalClasses },
    { count: totalEnrollments },
    { data: allReferralCodes },
    { data: domains },
    { data: careerProfiles },
    { data: allAttempts },
    { data: allStudentProfiles },
  ] = await Promise.all([
    adminClient.from('programs').select('id', { count: 'exact' }),
    adminClient.from('classes').select('id', { count: 'exact' }),
    adminClient.from('enrollments').select('id', { count: 'exact' }).eq('status', 'ACTIVE'),
    adminClient.from('referral_codes').select(`
      id,
      code,
      key_type,
      status,
      usage_count,
      max_uses,
      created_at,
      program:programs(name, code),
      class:classes(name),
      creator:users!created_by(full_name)
    `).order('created_at', { ascending: false }),
    adminClient.from('career_domains').select('id, name, code, description'),
    adminClient.from('career_profiles').select('id, student_id, primary_domain_id, secondary_domain_id'),
    adminClient.from('assessment_attempts').select('id, status, started_at, completed_at, track, student_id'),
    adminClient.from('student_profiles').select('id, user_id, prn, current_program'),
  ])

  const attempts = allAttempts || []
  const completedAttempts = attempts.filter(a => a.status === 'COMPLETED')
  const inProgressAttempts = attempts.filter(a => a.status === 'IN_PROGRESS')
  const totalAttemptsCount = attempts.length
  const completedCount = completedAttempts.length

  // Real Referral Keys Stats
  const referralCodes = allReferralCodes || []
  const activeKeysCount = referralCodes.filter(c => c.status === 'ACTIVE').length
  const totalKeysCount = referralCodes.length
  const totalKeyUsage = referralCodes.reduce((sum, c) => sum + (c.usage_count || 0), 0)

  // Real Enrolled Student PRN count
  const studentProfiles = allStudentProfiles || []
  const enrolledWithPRNCount = studentProfiles.filter(sp => sp.prn && String(sp.prn).trim().length > 0).length
  const totalStudentsEnrolled = totalEnrollments || enrolledWithPRNCount || 0

  // Real Conversion Rate: Completed tests out of total tests initiated
  const completionRate = totalAttemptsCount > 0
    ? Math.round((completedCount / totalAttemptsCount) * 100)
    : (completedCount > 0 ? 100 : 0)

  // Real Domain Affinity Distribution
  const domainCounts: Record<string, number> = {}
  const totalProfiles = careerProfiles?.length || 0
  careerProfiles?.forEach(cp => {
    if (cp.primary_domain_id) {
      domainCounts[cp.primary_domain_id] = (domainCounts[cp.primary_domain_id] || 0) + 1
    }
  })

  const domainStats = (domains || []).map((d: any) => {
    const count = domainCounts[d.id] || 0
    const percent = totalProfiles > 0 ? Math.round((count / totalProfiles) * 100) : 0
    return {
      name: d.name,
      count,
      percent,
    }
  }).sort((a, b) => b.count - a.count)

  // Dynamic Pipeline Funnel computed directly from database
  const funnelMax = Math.max(totalKeysCount, totalAttemptsCount, completedCount, totalProfiles, 1)
  const conversionFunnel = [
    {
      step: '1. Access Keys & Referral Capacity',
      count: totalKeysCount,
      sublabel: `${totalKeyUsage} keys claimed across ${totalKeysCount} batches`,
      rate: `${totalKeysCount > 0 ? 100 : 0}%`,
      barPercent: Math.min(100, Math.round((totalKeysCount / funnelMax) * 100)),
      color: 'bg-[#A36B40]'
    },
    {
      step: '2. Diagnostic Assessments Initiated',
      count: totalAttemptsCount,
      sublabel: `${inProgressAttempts.length} currently in progress`,
      rate: `${totalKeysCount > 0 ? Math.min(100, Math.round((totalAttemptsCount / Math.max(1, totalKeysCount)) * 100)) : (totalAttemptsCount > 0 ? 100 : 0)}%`,
      barPercent: Math.min(100, Math.round((totalAttemptsCount / funnelMax) * 100)),
      color: 'bg-[#77734B]'
    },
    {
      step: '3. Full Diagnostic Evaluations Completed',
      count: completedCount,
      sublabel: 'Psychometric, aptitude, and domain scores generated',
      rate: `${completionRate}%`,
      barPercent: Math.min(100, Math.round((completedCount / funnelMax) * 100)),
      color: 'bg-[#C6A18D]'
    },
    {
      step: '4. Specialization & Career Profiles Active',
      count: totalProfiles,
      sublabel: 'Curriculum alignments and recommendation reports issued',
      rate: `${completedCount > 0 ? Math.min(100, Math.round((totalProfiles / Math.max(1, completedCount)) * 100)) : (totalProfiles > 0 ? 100 : 0)}%`,
      barPercent: Math.min(100, Math.round((totalProfiles / funnelMax) * 100)),
      color: 'bg-[#A36B40]'
    },
    {
      step: '5. Institutional Students with Verified PRN',
      count: enrolledWithPRNCount,
      sublabel: 'Active academic profiles ready for semester evaluation',
      rate: `${totalProfiles > 0 ? Math.min(100, Math.round((enrolledWithPRNCount / Math.max(1, totalProfiles)) * 100)) : (enrolledWithPRNCount > 0 ? 100 : 0)}%`,
      barPercent: Math.min(100, Math.round((enrolledWithPRNCount / funnelMax) * 100)),
      color: 'bg-[#77734B]'
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
            <BarChart2 className="w-3.5 h-3.5 text-[#A36B40]" /> Admin Intelligence Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Admission Conversion & Academic Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Real-time live database tracking of referral keys, diagnostic evaluations, and institutional student profiles.
          </p>
        </div>

        <Link href="/admin/referral-codes">
          <Button className="h-10 px-4 bg-[#A36B40] hover:bg-[#8E5B34] text-white text-xs font-semibold rounded-2xl gap-2 shadow-sm cursor-pointer">
            <KeyRound className="w-4 h-4" />
            <span>Manage Access Keys</span>
          </Button>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-[#7A7067] font-semibold">Diagnostic Completion Rate</CardDescription>
            <CardTitle className="text-3xl font-black text-[#77734B]">{completionRate}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#7A7067]">
              {completedCount} of {totalAttemptsCount} assessments completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-[#7A7067] font-semibold">Evaluations Completed</CardDescription>
            <CardTitle className="text-3xl font-black text-[#A36B40]">{completedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#7A7067]">Candidates with full diagnostic reports</p>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-[#7A7067] font-semibold">Enrolled Students (PRN)</CardDescription>
            <CardTitle className="text-3xl font-black text-[#2C2621]">{enrolledWithPRNCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#7A7067]">Verified institutional student records</p>
          </CardContent>
        </Card>

        <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-[#7A7067] font-semibold">Active Access Keys</CardDescription>
            <CardTitle className="text-3xl font-black text-[#A36B40]">{activeKeysCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-[#7A7067]">{totalKeyUsage} total key claims registered</p>
          </CardContent>
        </Card>
      </div>

      {/* Admission Conversion Funnel Card */}
      <Card className="border-[#DFD7CB] shadow-xs rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-[#FAF6F0] border-b border-[#DFD7CB]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#77734B]" />
                Institutional Conversion Pipeline Funnel
              </CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                End-to-end live flow: Referral Code Issuance &rarr; Test Initiation &rarr; Full Completion &rarr; Career Profile &rarr; Enrolled PRN
              </CardDescription>
            </div>
            <Badge className="bg-[#77734B]/15 text-[#77734B] border-0 text-xs font-bold rounded-full px-3 py-1 w-fit">
              Live Database Stream
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            {conversionFunnel.map((step, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0]/40 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div>
                    <span className="font-bold text-[#2C2621] block sm:inline">{step.step}</span>
                    <span className="text-[11px] text-[#7A7067] sm:ml-2 block sm:inline">({step.sublabel})</span>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="font-bold text-[#2C2621]">{step.count} Records</span>
                    <Badge variant="outline" className="bg-white font-semibold text-[#2C2621] border-[#DFD7CB] text-[11px] rounded-full px-2 py-0.5">
                      {step.rate}
                    </Badge>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-[#DFD7CB]/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${step.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(step.barPercent, step.count > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real Performing Referral Codes Table */}
      <Card className="border-[#DFD7CB] shadow-xs rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-[#FAF6F0] border-b border-[#DFD7CB]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#A36B40]" />
                Referral Code Performance & Access Quota
              </CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Live tracking across active student access keys and mentor campaigns
              </CardDescription>
            </div>
            <Link href="/admin/referral-codes">
              <Button variant="ghost" size="sm" className="text-xs text-[#A36B40] hover:text-[#8E5B34] gap-1 h-8">
                <span>View All Keys</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {referralCodes.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <KeyRound className="w-8 h-8 text-[#A89D8F] mx-auto" />
              <p className="text-xs font-semibold text-[#2C2621]">No referral codes created yet</p>
              <p className="text-[11px] text-[#7A7067]">Generate your first key in Access Keys & Waiting Room</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF6F0] border-b border-[#DFD7CB] text-[#7A7067] font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Access Key</th>
                    <th className="p-4">Key Type</th>
                    <th className="p-4">Assigned Program / Class</th>
                    <th className="p-4">Created By</th>
                    <th className="p-4 text-center">Uses Claimed</th>
                    <th className="p-4 text-center">Max Capacity</th>
                    <th className="p-4 text-right">Key Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFD7CB]">
                  {referralCodes.map((code: any) => (
                    <tr key={code.id} className="hover:bg-[#FAF6F0]/50">
                      <td className="p-4 font-mono font-bold text-[#A36B40]">{code.code}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px] font-semibold bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] rounded-full px-2 py-0.5">
                          {code.key_type || 'FRESHER_REFERRAL'}
                        </Badge>
                      </td>
                      <td className="p-4 font-bold text-[#2C2621]">
                        {code.program?.name ? `${code.program.name} (${code.program.code})` : (code.class?.name || 'All Programs')}
                      </td>
                      <td className="p-4 text-[#7A7067]">{code.creator?.full_name || 'Admin'}</td>
                      <td className="p-4 text-center font-bold text-[#2C2621]">{code.usage_count || 0}</td>
                      <td className="p-4 text-center font-semibold text-[#7A7067]">{code.max_uses || 20}</td>
                      <td className="p-4 text-right">
                        <Badge className={code.status === 'ACTIVE' ? "bg-[#77734B]/15 text-[#77734B] border-0 font-bold rounded-full px-2.5 py-0.5" : "bg-red-50 text-red-700 border-0 font-bold rounded-full px-2.5 py-0.5"}>
                          {code.status || 'ACTIVE'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Career Domain Breakdown */}
      <Card className="border-[#DFD7CB] bg-white rounded-3xl shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#A36B40]" />
                Student Specialization & Domain Affinity
              </CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Psychometric alignment distribution across Sandip University academic tracks ({totalProfiles} Evaluated Profiles)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {domainStats.length === 0 ? (
            <p className="text-xs text-[#7A7067] text-center py-6">No domain score profiles recorded yet.</p>
          ) : (
            domainStats.map((ds, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2C2621]">{ds.name}</span>
                  <span className="font-bold text-[#2C2621]">{ds.count} Students ({ds.percent}%)</span>
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
