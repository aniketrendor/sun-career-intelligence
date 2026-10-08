import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, QrCode, Users, UserCheck, BarChart2, Plus,
  ArrowRight, GraduationCap, ShieldCheck, Sparkles, Award,
  CheckCircle2, Compass, KeyRound
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function DeanDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  const { data: deanProfile } = await supabase
    .from('dean_hod_profiles')
    .select('*')
    .eq('user_id', profile.id)
    .maybeSingle()

  const [
    { count: totalStudents },
    { count: totalMentors },
    { count: totalPrograms },
    { count: totalClasses },
    { count: totalReferralCodes },
    { data: recentMentors },
    { data: recentEnrollments },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }).eq('role', 'STUDENT').eq('status', 'ACTIVE'),
    supabase.from('users').select('id', { count: 'exact' }).in('role', ['MENTOR', 'COUNSELOR']).eq('status', 'ACTIVE'),
    supabase.from('programs').select('id', { count: 'exact' }),
    supabase.from('classes').select('id', { count: 'exact' }),
    supabase.from('referral_codes').select('id', { count: 'exact' }),
    supabase.from('users').select(`
      id,
      full_name,
      email,
      created_at,
      assignments:student_counselor_assignments!counselor_id(id)
    `).in('role', ['MENTOR', 'COUNSELOR']).eq('status', 'ACTIVE').limit(4),
    supabase.from('enrollments').select(`
      id,
      created_at,
      program:programs(name, code),
      class:classes(name),
      student:users!student_id(full_name, email)
    `).order('created_at', { ascending: false }).limit(5),
  ])

  const stats = [
    {
      label: 'Active Students',
      value: totalStudents || 0,
      icon: GraduationCap,
      color: 'text-[#A36B40] bg-[#F7EFEA] border-[#A36B40]/20',
      href: '/admin/students',
    },
    {
      label: 'Career Mentors',
      value: totalMentors || 0,
      icon: Award,
      color: 'text-[#77734B] bg-[#F1F1EB] border-[#77734B]/20',
      href: '/admin/mentors',
    },
    {
      label: 'Degree Programs',
      value: totalPrograms || 0,
      icon: Building2,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      href: '/admin/programs',
    },
    {
      label: 'Classes / Cohorts',
      value: totalClasses || 0,
      icon: Users,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      href: '/admin/classes',
    },
    {
      label: 'Referral Keys',
      value: totalReferralCodes || 0,
      icon: KeyRound,
      color: 'text-[#C6A18D] bg-[#F9F4F0] border-[#C6A18D]/30',
      href: '/admin/referral-codes',
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77734B] bg-[#F1F1EB] px-3 py-1 rounded-full border border-[#77734B]/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Institutional Administration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Admin Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
            {deanProfile?.designation || 'Administrator'} — Oversee academic programs, staff caseloads, and student enrollment keys.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/admin/users">
            <Button size="sm" className="h-9 px-4 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 transition-all flex items-center gap-1.5 cursor-pointer">
              <Users className="w-3.5 h-3.5" /> Manage Users
            </Button>
          </Link>
          <Link href="/admin/assignments">
            <Button size="sm" variant="outline" className="h-9 px-3.5 border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] hover:bg-[#F1E8DC] hover:text-[#A36B40] text-xs font-semibold rounded-xl transition-all cursor-pointer">
              <UserCheck className="w-3.5 h-3.5 mr-1.5 text-[#77734B]" /> Allocate Mentors
            </Button>
          </Link>
          <Link href="/admin/programs">
            <Button size="sm" variant="outline" className="h-9 px-3.5 border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] hover:bg-[#F1E8DC] hover:text-[#A36B40] text-xs font-semibold rounded-xl transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5 mr-1.5 text-[#A36B40]" /> New Program
            </Button>
          </Link>
          <Link href="/admin/referral-codes">
            <Button size="sm" variant="outline" className="h-9 px-3.5 border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] hover:bg-[#F1E8DC] hover:text-[#A36B40] text-xs font-semibold rounded-xl transition-all cursor-pointer">
              <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#C6A18D]" /> Referral Keys
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <Card className="bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:shadow-md transition-all cursor-pointer group rounded-2xl">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">{s.label}</span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${s.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-[#2C2621] group-hover:text-[#A36B40] transition-colors">
                    {s.value}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Mentors Caseloads & Recent Enrollments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mentors List */}
        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-[#DFD7CB]">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-[#77734B]" />
                Career Mentors & Caseloads
              </CardTitle>
              <CardDescription className="text-xs text-[#7A7067] mt-0.5">
                Staff authorized to conduct career advising & review student pathways
              </CardDescription>
            </div>
            <Link href="/admin/mentors">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-[#A36B40] hover:text-[#8E5B33] hover:bg-[#F7EFEA] rounded-xl cursor-pointer">
                All Mentors <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(recentMentors || []).map((c: any) => (
              <div key={c.id} className="p-3.5 rounded-xl border border-[#DFD7CB] flex items-center justify-between bg-[#FAF6F0] hover:bg-[#F6EFEA] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F1F1EB] border border-[#77734B]/30 text-[#77734B] flex items-center justify-center font-bold text-xs">
                    {c.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'MT'}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C2621] text-xs">{c.full_name}</h4>
                    <p className="text-[11px] text-[#7A7067]">{c.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="outline" className="text-xs font-semibold bg-white text-[#2C2621] border-[#DFD7CB]">
                    {c.assignments?.length || 0} Advisees
                  </Badge>
                </div>
              </div>
            ))}
            {(!recentMentors || recentMentors.length === 0) && (
              <p className="text-xs text-[#7A7067] text-center py-6">No mentors registered yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-[#DFD7CB]">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621] flex items-center gap-2">
                <GraduationCap className="w-4.5 h-4.5 text-[#A36B40]" />
                Recent Student Enrollments
              </CardTitle>
              <CardDescription className="text-xs text-[#7A7067] mt-0.5">
                Students onboarding into department cohorts
              </CardDescription>
            </div>
            <Link href="/admin/students">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-[#A36B40] hover:text-[#8E5B33] hover:bg-[#F7EFEA] rounded-xl cursor-pointer">
                Full Roster <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {(recentEnrollments || []).map((e: any) => (
              <div key={e.id} className="p-3.5 rounded-xl border border-[#DFD7CB] flex items-center justify-between bg-[#FAF6F0] hover:bg-[#F6EFEA] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F7EFEA] border border-[#A36B40]/30 text-[#A36B40] flex items-center justify-center font-bold text-xs">
                    {e.student?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'ST'}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C2621] text-xs">{e.student?.full_name}</h4>
                    <p className="text-[11px] text-[#7A7067]">
                      {e.program?.name} · {e.class?.name || ''}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-[#7A7067] font-mono">
                  {formatDate(e.created_at)}
                </span>
              </div>
            ))}
            {(!recentEnrollments || recentEnrollments.length === 0) && (
              <p className="text-xs text-[#7A7067] text-center py-6">No student enrollments yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
