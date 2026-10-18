import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  GraduationCap, UserCheck, ShieldCheck, Clock, Users, BookOpen
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StudentsMentorshipTable } from '@/components/dean/students-mentorship-table'

export const dynamic = 'force-dynamic'

export default async function AdminStudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Parallel fetch: students, mentors, programs
  const [
    { data: rawStudents },
    { data: mentors },
    { data: programs },
  ] = await Promise.all([
    supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        phone,
        status,
        created_at,
        student_profiles(
          prn,
          current_program,
          current_semester
        ),
        enrollments(
          id,
          status,
          program:programs(id, name, code),
          class:classes(id, name, semester)
        ),
        assignments:student_counselor_assignments!student_id(
          id,
          status,
          assigned_at,
          notes,
          counselor:users!counselor_id(
            id,
            full_name,
            email,
            phone,
            counselor_profiles(designation, employee_id)
          )
        )
      `)
      .eq('role', 'STUDENT')
      .order('created_at', { ascending: false }),

    supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        phone,
        counselor_profiles(designation, employee_id)
      `)
      .in('role', ['MENTOR', 'COUNSELOR'])
      .eq('status', 'ACTIVE')
      .order('full_name', { ascending: true }),

    supabase
      .from('programs')
      .select('id, name, code')
      .order('name', { ascending: true }),
  ])

  const students = (rawStudents as any[]) || []
  const mentorList = (mentors as any[]) || []
  const programList = programs || []

  // Metrics
  const totalStudents = students.length
  const assignedCount = students.filter(
    (s) => s.assignments && s.assignments.some((a: any) => a.status === 'ACTIVE' && a.counselor)
  ).length
  const unassignedCount = totalStudents - assignedCount

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Redesigned Hero Header Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A36B40] bg-[#FAF6F0] px-3 py-1 rounded-full border border-[#A36B40]/30">
              <GraduationCap className="w-3.5 h-3.5" /> University Student Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Students & Assigned Mentors
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1 leading-relaxed">
            Institutional directory of enrolled students and their assigned faculty mentors. Students select mentors according to faculty expertise and available advisory slots through the Student Portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <Badge variant="outline" className="px-3.5 py-2 text-xs font-bold bg-[#FAF6F0] text-[#2C2621] border-[#DFD7CB] rounded-2xl shadow-2xs">
            {totalStudents} Enrolled
          </Badge>
          <Badge variant="outline" className="px-3.5 py-2 text-xs font-bold bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 rounded-2xl shadow-2xs">
            {assignedCount} Mentor Paired
          </Badge>
          <Badge variant="outline" className="px-3.5 py-2 text-xs font-bold bg-[#F9F4F0] text-[#A36B40] border-[#A36B40]/30 rounded-2xl shadow-2xs">
            {unassignedCount} Pending Selection
          </Badge>
        </div>
      </div>

      {/* 4 Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">
                Total Enrolled Students
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#2C2621] flex items-center justify-center border border-[#DFD7CB]">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#2C2621]">{totalStudents}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">
                Mentorship Paired
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#F1F1EB] text-[#77734B] flex items-center justify-center border border-[#77734B]/30">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#77734B]">{assignedCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">
                Awaiting Mentor Selection
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#A36B40] flex items-center justify-center border border-[#A36B40]/30">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#A36B40]">{unassignedCount}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">
                Faculty Mentors Available
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#77734B] flex items-center justify-center border border-[#DFD7CB]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#77734B]">{mentorList.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Student Roster Directory Table */}
      <StudentsMentorshipTable
        students={students}
        mentors={mentorList}
        programs={programList}
      />
    </div>
  )
}
