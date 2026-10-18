import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Search, BookOpen, Target,
  ArrowRight, CheckCircle2, Clock, ShieldCheck, UserCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const dynamic = 'force-dynamic'

export default async function CounselorStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Query ONLY students assigned to this mentor via student_counselor_assignments
  const { data: assignments } = await supabase
    .from('student_counselor_assignments')
    .select('student_id')
    .eq('counselor_id', profile.id)
    .eq('status', 'ACTIVE')

  const assignedStudentIds = (assignments || []).map(a => a.student_id).filter(Boolean)

  let students: any[] = []

  if (assignedStudentIds.length > 0) {
    let query = supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        phone,
        status,
        created_at,
        student_profile:student_profiles(
          prn,
          current_program,
          current_semester,
          academic_year,
          school
        ),
        enrollments:enrollments(
          id,
          status,
          program:programs(name, code),
          class:classes(name, semester)
        ),
        career_profile:career_profiles(
          primary_domain:career_domains!primary_domain_id(name),
          secondary_domain:career_domains!secondary_domain_id(name)
        ),
        assessment_attempts:assessment_attempts(
          id,
          status,
          completed_at
        )
      `)
      .eq('role', 'STUDENT')
      .in('id', assignedStudentIds)
      .order('created_at', { ascending: false })

    if (params.q) {
      query = query.ilike('full_name', `%${params.q}%`)
    }

    const { data: fetchedStudents } = await query
    students = fetchedStudents || []
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] mb-2 gap-1.5 font-bold text-xs px-3 py-1">
            <Users className="w-3.5 h-3.5" /> Assigned Advisees
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            My Advisee Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Monitor your assigned students, review career diagnostic assessments, track domain fit, and manage guidance interventions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3.5 py-1.5 text-xs font-bold border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] rounded-xl">
            Assigned Advisees: {students.length}
          </Badge>
        </div>
      </div>

      {/* Student List */}
      <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm overflow-hidden">
        <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621]">Assigned Students</CardTitle>
              <CardDescription className="text-xs text-[#7A7067] mt-0.5">
                Students paired with you for academic advising and career mentoring
              </CardDescription>
            </div>
            {assignedStudentIds.length > 0 && (
              <form className="flex items-center gap-2 w-full sm:w-80">
                <Input
                  name="q"
                  defaultValue={params.q || ''}
                  placeholder="Search by student name..."
                  className="text-xs rounded-xl bg-white border-[#DFD7CB] text-[#2C2621] h-9"
                />
                <Button type="submit" size="sm" className="shrink-0 text-xs bg-[#A36B40] hover:bg-[#8E5B34] text-white rounded-xl h-9 px-3.5 font-bold cursor-pointer">
                  <Search className="w-3.5 h-3.5" />
                </Button>
              </form>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {students.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] flex items-center justify-center mx-auto shadow-xs">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-[#2C2621] text-base">
                {assignedStudentIds.length === 0 ? 'No Advisee Students Assigned Yet' : 'No Students Matching Search'}
              </h3>
              <p className="text-xs text-[#7A7067] max-w-md mx-auto leading-relaxed">
                {assignedStudentIds.length === 0
                  ? 'You are only able to see students assigned directly to your mentorship caseload. When students select you as their mentor via the student portal or are allocated by the Dean, their academic profiles and diagnostic results will appear here.'
                  : 'Try adjusting your search query to find students assigned to your caseload.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#DFD7CB]/60">
              {students.map((student: any) => {
                const enrollment = student.enrollments?.[0]
                const completedAttempt = student.assessment_attempts?.find((a: any) => a.status === 'COMPLETED')
                const careerProfile = student.career_profile?.[0]

                return (
                  <div
                    key={student.id}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF6F0]/40 -mx-4 sm:-mx-6 px-4 sm:px-6 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#FAF6F0] border border-[#DFD7CB] text-[#A36B40] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {student.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'ST'}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#2C2621] text-sm">
                            {(student.full_name || 'Advisee')
                              .split(' ')
                              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                              .join(' ')}
                          </h4>
                          <span className="text-xs text-[#7A7067] font-mono">
                            ({student.student_profile?.prn || 'No PRN'})
                          </span>
                        </div>
                        <p className="text-xs text-[#5C544D]">
                          {enrollment?.program?.name || student.student_profile?.current_program || 'Program pending enrollment'}
                          {enrollment?.class?.name ? ` · ${enrollment.class.name}` : ''}
                        </p>
                        <p className="text-[11px] text-[#8C8276] font-mono">{student.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 shrink-0">
                      {/* Assessment status */}
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-[#7A7067] uppercase font-bold tracking-wider block">Assessment</span>
                        {completedAttempt ? (
                          <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-800 bg-amber-50 border-amber-200 text-[11px] gap-1 font-semibold">
                            <Clock className="w-3 h-3" /> Pending
                          </Badge>
                        )}
                      </div>

                      {/* Primary Domain */}
                      {careerProfile?.primary_domain && (
                        <div className="text-left md:text-right">
                          <span className="text-[10px] text-[#7A7067] uppercase font-bold tracking-wider block">Top Match</span>
                          <Badge variant="outline" className="text-[11px] font-semibold bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB]">
                            {careerProfile.primary_domain.name}
                          </Badge>
                        </div>
                      )}

                      <Link href={`/mentor/students/${student.id}`}>
                        <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 border-[#DFD7CB] hover:bg-[#A36B40] hover:text-white rounded-xl h-8 px-3 cursor-pointer">
                          <span>Student 360</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
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
