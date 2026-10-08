import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  UserCheck, Users, Search, Filter, BookOpen,
  ArrowRight, ShieldCheck, CheckCircle2, Clock, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { AssignCounselorModal } from '@/components/dean/assign-counselor-modal'

export const dynamic = 'force-dynamic'

export default async function DeanAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; counselor?: string; class?: string }>
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

  // Fetch all counselors / mentors
  const { data: counselors } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('role', ['MENTOR', 'COUNSELOR'])
    .eq('status', 'ACTIVE')

  // Fetch all classes
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name, code, program:programs(name)')

  // Fetch all active students with their current counselor assignment and enrollment
  const { data: students } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      phone,
      student_profile:student_profiles(prn),
      enrollments:enrollments(
        program:programs(name, code),
        class:classes(id, name, semester)
      ),
      assignments:student_counselor_assignments!student_id(
        id,
        status,
        assigned_at,
        counselor:users!counselor_id(id, full_name, email)
      )
    `)
    .eq('role', 'STUDENT')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })

  const counselorOptions = (counselors || []).map(c => ({
    id: c.id,
    name: c.full_name,
    email: c.email,
  }))

  const studentOptions = (students || []).map((s: any) => ({
    id: s.id,
    name: s.full_name,
    email: s.email,
    programName: s.enrollments?.[0]?.program?.name,
  }))

  const filteredStudents = (students || []).filter((s: any) => {
    if (params.q && !s.full_name?.toLowerCase().includes(params.q.toLowerCase())) return false
    if (params.counselor) {
      const activeAssn = (s.assignments || []).find((a: any) => a.status === 'ACTIVE')
      if (activeAssn?.counselor?.id !== params.counselor) return false
    }
    if (params.class) {
      const classId = s.enrollments?.[0]?.class?.id
      if (classId !== params.class) return false
    }
    return true
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77734B] bg-[#F1F1EB] px-3 py-1 rounded-full border border-[#77734B]/30">
              <UserCheck className="w-3.5 h-3.5" /> Dean Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Student-Mentor Allocation
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Assign individual students or entire class cohorts to institutional career mentors.
          </p>
        </div>

        <AssignCounselorModal
          students={studentOptions}
          classes={classes || []}
          counselors={counselorOptions}
        />
      </div>

      {/* Roster & Assignment Status */}
      <Card className="bg-white border-[#DFD7CB] rounded-2xl shadow-sm">
        <CardHeader className="pb-3 border-b border-[#DFD7CB]">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <CardTitle className="text-base font-bold text-[#2C2621]">Student Allocation Roster</CardTitle>
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
        <CardContent className="p-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10 text-[#7A7067] text-sm">
              No students found matching your filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-[#DFD7CB]/60">
              {filteredStudents.map((s: any) => {
                const enrollment = s.enrollments?.[0]
                const activeAssignment = (s.assignments || []).find((a: any) => a.status === 'ACTIVE')
                const assignedCounselor = activeAssignment?.counselor

                return (
                  <div
                    key={s.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF6F0] -mx-4 px-4 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#F7EFEA] text-[#A36B40] flex items-center justify-center font-bold text-sm shrink-0 border border-[#A36B40]/30">
                        {s.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'ST'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#2C2621] text-sm">{s.full_name}</h4>
                          <span className="text-xs text-[#7A7067]">({(s.student_profile as any)?.prn || 'No PRN'})</span>
                        </div>
                        <p className="text-xs text-[#7A7067]">
                          {enrollment?.program?.name || 'Unenrolled'} · {enrollment?.class?.name || ''}
                        </p>
                        <p className="text-[11px] text-[#7A7067]">{s.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div>
                        <span className="text-[#7A7067] block text-[11px]">Assigned Mentor</span>
                        {assignedCounselor ? (
                          <div className="flex items-center gap-1.5 font-bold text-xs text-[#2C2621]">
                            <span className="w-2 h-2 rounded-full bg-[#77734B]" />
                            {assignedCounselor.full_name}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-[#A36B40] bg-[#F7EFEA] border-[#A36B40]/30 text-[11px]">
                            Unassigned
                          </Badge>
                        )}
                      </div>

                      <AssignCounselorModal
                        students={[{ id: s.id, name: s.full_name, email: s.email }]}
                        counselors={counselorOptions}
                        defaultStudentId={s.id}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
