import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Search, BookOpen, CheckCircle2, Clock,
  ArrowRight, GraduationCap, Sparkles, UserCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { FresherLeadsPipeline } from '@/components/dean/fresher-leads-pipeline'

export const dynamic = 'force-dynamic'

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; class?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Parallel fetch: enrollments, fresher leads, mentors
  const [
    { data: enrollments },
    { data: fresherLeads },
    { data: mentors },
  ] = await Promise.all([
    supabase.from('enrollments').select(`
      id,
      created_at,
      status,
      program:programs(name, code),
      class:classes(id, name, semester),
      referral_code:referral_codes(code),
      student:users!student_id(
        id,
        full_name,
        email,
        phone,
        student_profile:student_profiles(prn)
      )
    `).order('created_at', { ascending: false }),
    supabase.from('fresher_leads').select(`
      *,
      mentor:users!assigned_mentor_id(id, full_name, email)
    `).order('created_at', { ascending: false }),
    supabase.from('users').select('id, full_name, email').in('role', ['MENTOR', 'COUNSELOR']).eq('status', 'ACTIVE'),
  ])

  const filteredEnrollments = (enrollments || []).filter((e: any) => {
    if (!params.q) return true
    const name = e.student?.full_name?.toLowerCase() || ''
    return name.includes(params.q.toLowerCase())
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A36B40] bg-[#F7EFEA] px-3 py-1 rounded-full border border-[#A36B40]/30">
              <GraduationCap className="w-3.5 h-3.5" /> Student & Fresher Intake
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Students & Fresher Leads Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Review incoming fresher leads generated via referral tokens and manage enrolled student rosters.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <Badge variant="outline" className="px-3.5 py-2 text-xs font-bold bg-[#F9F4F0] text-[#C6A18D] border-[#C6A18D]/40 rounded-xl">
            {fresherLeads?.length || 0} Fresher Leads
          </Badge>
          <Badge variant="outline" className="px-3.5 py-2 text-xs font-bold bg-[#FAF6F0] text-[#2C2621] border-[#DFD7CB] rounded-xl">
            {filteredEnrollments.length} Enrolled
          </Badge>
        </div>
      </div>

      {/* SECTION 1: Fresher Leads & Mentor Allocation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-[#2C2621] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C6A18D]" />
              Fresher Assessment Leads & Mentor Assignment
            </h2>
            <p className="text-xs text-[#7A7067]">
              Candidates who completed the career diagnostic using a Fresher Referral Token. Assign mentors to guide their admissions.
            </p>
          </div>
        </div>

        <FresherLeadsPipeline
          leads={fresherLeads || []}
          mentors={mentors || []}
        />
      </div>

      {/* SECTION 2: Enrolled Students Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-[#2C2621] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#A36B40]" />
              Enrolled Student Cohort Roster
            </h2>
            <p className="text-xs text-[#7A7067]">
              Active students officially onboarded into academic degree programs and class divisions.
            </p>
          </div>
        </div>

        <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm">
          <CardHeader className="pb-3 border-b border-[#DFD7CB]">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <CardTitle className="text-base font-bold text-[#2C2621]">Cohort Directory</CardTitle>
              <form className="flex items-center gap-2 w-full sm:w-72">
                <Input
                  name="q"
                  defaultValue={params.q || ''}
                  placeholder="Search student name..."
                  className="text-xs bg-[#FAF6F0] border-[#DFD7CB] rounded-xl focus-visible:ring-[#A36B40]"
                />
                <Button type="submit" size="sm" className="shrink-0 text-xs bg-[#A36B40] hover:bg-[#8E5B33] text-white rounded-xl cursor-pointer">
                  <Search className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {filteredEnrollments.length === 0 ? (
              <div className="text-center py-10 text-[#7A7067] text-sm">
                No student enrollments found matching criteria.
              </div>
            ) : (
              <div className="divide-y divide-[#DFD7CB]/60">
                {filteredEnrollments.map((enr: any) => {
                  const s = enr.student
                  return (
                    <div
                      key={enr.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF6F0] -mx-4 px-4 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#F7EFEA] text-[#A36B40] flex items-center justify-center font-bold text-sm shrink-0 border border-[#A36B40]/30">
                          {s?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'ST'}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#2C2621] text-sm">{s?.full_name}</h4>
                            <span className="text-xs text-[#7A7067]">({(s?.student_profile as any)?.prn || 'No PRN'})</span>
                          </div>
                          <p className="text-xs text-[#7A7067]">
                            {enr.program?.name} · {enr.class?.name} (Sem {enr.class?.semester})
                          </p>
                          <p className="text-[11px] text-[#7A7067]">{s?.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-xs text-[#7A7067]">
                        <div>
                          <span className="text-[#7A7067] block text-[11px]">Enrolled On</span>
                          <span className="font-medium text-[#2C2621]">{formatDate(enr.created_at)}</span>
                        </div>
                        <div>
                          <span className="text-[#7A7067] block text-[11px]">Referral Key</span>
                          <span className="font-mono font-bold text-[#2C2621]">{enr.referral_code?.code || 'DIRECT'}</span>
                        </div>
                        <Badge className={enr.status === 'ACTIVE' ? 'bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 text-xs' : 'bg-stone-100 text-stone-500 text-xs'}>
                          {enr.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
