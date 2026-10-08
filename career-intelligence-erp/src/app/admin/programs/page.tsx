import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Building2, GraduationCap, Users, QrCode,
  ArrowRight, Search, Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateProgramModal } from '@/components/dean/create-program-modal'

export const dynamic = 'force-dynamic'

export default async function DeanProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Fetch programs created under department
  const { data: programs } = await supabase
    .from('programs')
    .select(`
      *,
      classes:classes(id, name, semester, student_capacity),
      enrollments:enrollments(id)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Building2 className="w-3.5 h-3.5" /> Department Programs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Academic Degree Programs
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Create and oversee degree programs, curriculum duration, and affiliated class cohorts.
          </p>
        </div>

        <CreateProgramModal />
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(programs || []).map((prog: any) => (
          <Card key={prog.id} className="bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:shadow-md transition-all flex flex-col justify-between rounded-2xl shadow-sm">
            <div>
              <CardHeader className="pb-3 border-b border-[#DFD7CB]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs bg-[#FAF6F0] text-[#2C2621] border-[#DFD7CB] font-mono">
                    {prog.code}
                  </Badge>
                  <Badge className={prog.status === 'ACTIVE' ? 'bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 text-xs' : 'bg-stone-100 text-stone-500 text-xs'}>
                    {prog.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-[#2C2621]">{prog.name}</CardTitle>
                <CardDescription className="text-xs text-[#7A7067] line-clamp-2 mt-1">
                  Academic Year: {prog.academic_year} · {prog.duration_years || 2} Years ({prog.total_semesters || 4} Sems)
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-4">
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF6F0] p-3 rounded-xl border border-[#DFD7CB]">
                  <div>
                    <span className="text-[#7A7067] block text-[11px] font-medium">Classes / Divs</span>
                    <span className="font-extrabold text-[#2C2621] text-base">{prog.classes?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-[#7A7067] block text-[11px] font-medium">Total Students</span>
                    <span className="font-extrabold text-[#A36B40] text-base">{prog.enrollments?.length || 0}</span>
                  </div>
                </div>

                {prog.classes && prog.classes.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider block mb-1.5">
                      Classes Configured
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {prog.classes.map((c: any) => (
                        <Badge key={c.id} variant="secondary" className="text-[10px] bg-[#FAF6F0] border border-[#DFD7CB] text-[#2C2621]">
                          {c.name} (Sem {c.semester})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </div>

            <div className="p-4 border-t border-[#DFD7CB] flex items-center justify-between text-xs">
              <Link
                href={`/admin/classes?program=${prog.id}`}
                className="font-semibold text-[#A36B40] hover:text-[#8E5B33] flex items-center gap-1 cursor-pointer"
              >
                Manage Classes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        ))}

        {(!programs || programs.length === 0) && (
          <div className="col-span-full py-12 text-center text-[#7A7067] bg-white border border-[#DFD7CB] rounded-2xl">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40 text-blue-600" />
            <p className="font-bold text-[#2C2621]">No Academic Programs yet</p>
            <p className="text-xs text-[#7A7067] mt-0.5">Click &quot;Create Program&quot; to establish department degrees.</p>
          </div>
        )}
      </div>
    </div>
  )
}
