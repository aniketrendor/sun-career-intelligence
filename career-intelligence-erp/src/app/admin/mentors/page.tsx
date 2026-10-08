import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users, UserCheck, Mail, Phone, Calendar,
  ShieldCheck, CheckCircle2, Clock, ArrowRight, Plus, Award
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { AssignCounselorModal } from '@/components/dean/assign-counselor-modal'

export const dynamic = 'force-dynamic'

export default async function DeanCounselorsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Fetch all mentors & counselors
  const { data: counselors } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      phone,
      status,
      created_at,
      assignments:student_counselor_assignments!counselor_id(
        id,
        status,
        student:users!student_id(id, full_name)
      ),
      counseling_sessions:counseling_sessions!counselor_id(id)
    `)
    .in('role', ['MENTOR', 'COUNSELOR'])
    .order('created_at', { ascending: false })

  // Fetch students and classes for assignment modal
  const [
    { data: students },
    { data: classes },
  ] = await Promise.all([
    supabase.from('users').select('id, full_name, email').eq('role', 'STUDENT').eq('status', 'ACTIVE'),
    supabase.from('classes').select('id, name, code'),
  ])

  const counselorOptions = (counselors || []).map(c => ({
    id: c.id,
    name: c.full_name,
    email: c.email,
    activeCaseload: (c.assignments || []).filter((a: any) => a.status === 'ACTIVE').length,
  }))

  const studentOptions = (students || []).map(s => ({
    id: s.id,
    name: s.full_name,
    email: s.email,
  }))

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77734B] bg-[#F1F1EB] px-3 py-1 rounded-full border border-[#77734B]/30">
              <Award className="w-3.5 h-3.5" /> Career Mentors Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Institutional Mentors & Caseloads
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Manage authorized career mentors, oversee student caseload allocations, and monitor advisory activity.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/admin/users">
            <Button size="sm" variant="outline" className="h-9 px-3.5 border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] hover:bg-[#F1E8DC] hover:text-[#A36B40] text-xs font-semibold rounded-xl transition-all cursor-pointer">
              <Users className="w-3.5 h-3.5 mr-1.5 text-[#A36B40]" /> Manage Users
            </Button>
          </Link>
          <AssignCounselorModal
            students={studentOptions}
            classes={classes || []}
            counselors={counselorOptions}
          />
        </div>
      </div>

      {/* Mentors Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(counselors || []).map((counselor: any) => {
          const activeAssignments = (counselor.assignments || []).filter((a: any) => a.status === 'ACTIVE')
          const totalSessions = counselor.counseling_sessions?.length || 0

          return (
            <Card key={counselor.id} className="bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:shadow-md transition-all flex flex-col justify-between rounded-2xl shadow-sm">
              <div>
                <CardHeader className="pb-3 border-b border-[#DFD7CB]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-[#F1F1EB] text-[#77734B] flex items-center justify-center font-bold text-base border border-[#77734B]/30">
                      {counselor.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'MT'}
                    </div>
                    <Badge className={counselor.status === 'ACTIVE' ? 'bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 text-xs' : 'bg-stone-100 text-stone-500 text-xs'}>
                      {counselor.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-[#2C2621]">{counselor.full_name}</CardTitle>
                  <CardDescription className="text-xs text-[#7A7067] mt-0.5">
                    {counselor.email} {counselor.phone ? `· ${counselor.phone}` : ''}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-3 bg-[#FAF6F0] p-3.5 rounded-xl border border-[#DFD7CB] text-xs">
                    <div>
                      <span className="text-[#7A7067] block text-[11px] font-medium">Assigned Students</span>
                      <span className="font-extrabold text-[#2C2621] text-base">{activeAssignments.length}</span>
                    </div>
                    <div>
                      <span className="text-[#7A7067] block text-[11px] font-medium">Sessions Logged</span>
                      <span className="font-extrabold text-[#77734B] text-base">{totalSessions}</span>
                    </div>
                  </div>

                  {activeAssignments.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider block mb-1.5">
                        Recent Advisees
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeAssignments.slice(0, 4).map((a: any) => (
                          <Badge key={a.id} variant="secondary" className="text-[10px] bg-[#FAF6F0] border border-[#DFD7CB] text-[#2C2621]">
                            {a.student?.full_name || 'Student'}
                          </Badge>
                        ))}
                        {activeAssignments.length > 4 && (
                          <Badge variant="secondary" className="text-[10px] bg-[#FAF6F0] border border-[#DFD7CB] text-[#7A7067]">
                            +{activeAssignments.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 pt-3 border-t border-[#DFD7CB] flex items-center justify-between text-xs text-[#7A7067]">
                <span>Joined {formatDate(counselor.created_at)}</span>
                <Link href={`/admin/assignments?counselor=${counselor.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-[#A36B40] hover:text-[#8E5B33] hover:bg-[#F7EFEA] gap-1 cursor-pointer">
                    Manage Caseload <ArrowRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}

        {(!counselors || counselors.length === 0) && (
          <div className="col-span-full py-12 text-center text-[#7A7067] bg-white border border-[#DFD7CB] rounded-2xl">
            <Award className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#77734B]" />
            <p className="font-bold text-[#2C2621]">No Mentors registered</p>
            <p className="text-xs text-[#7A7067] mt-0.5">Use Manage Users to provision mentor accounts.</p>
          </div>
        )}
      </div>
    </div>
  )
}
