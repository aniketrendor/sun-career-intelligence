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

export const dynamic = 'force-dynamic'

export default async function CounselorProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Fetch programs with class count and enrollment count
  const { data: programs } = await supabase
    .from('programs')
    .select(`
      *,
      classes:classes(id, name, semester, student_capacity),
      enrollments:enrollments(id)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] mb-2 gap-1.5 font-bold text-xs px-3 py-1">
            <Building2 className="w-3.5 h-3.5" /> Academic Structure
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Institutional Programs & Classes</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Overview of academic degree programs, divisions, and active student enrollment counts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3.5 py-1.5 text-xs font-bold border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] rounded-xl">
            {programs?.length || 0} Programs Active
          </Badge>
        </div>
      </div>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(programs || []).map((prog: any) => (
          <Card key={prog.id} className="bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:shadow-md transition-all rounded-3xl flex flex-col justify-between overflow-hidden shadow-sm">
            <div>
              <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs bg-white text-[#A36B40] border-[#DFD7CB] font-mono font-bold">
                    {prog.code}
                  </Badge>
                  <Badge className={prog.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold' : 'bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-xs'}>
                    {prog.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-[#2C2621]">{prog.name}</CardTitle>
                <CardDescription className="text-xs text-[#7A7067] line-clamp-2 mt-1">
                  Academic Year: {prog.academic_year} · {prog.duration_years || 2} Years ({prog.total_semesters || 4} Sems)
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-3.5">
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF6F0]/80 p-3.5 rounded-2xl border border-[#DFD7CB]">
                  <div>
                    <span className="text-[#7A7067] text-[11px] font-medium block">Classes / Divs</span>
                    <span className="font-bold text-[#2C2621] text-sm">{prog.classes?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-[#7A7067] text-[11px] font-medium block">Enrolled Students</span>
                    <span className="font-bold text-[#A36B40] text-sm">{prog.enrollments?.length || 0}</span>
                  </div>
                </div>

                {prog.classes && prog.classes.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-[#7A7067] uppercase tracking-wider block mb-1.5">
                      Active Classes
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {prog.classes.map((c: any) => (
                        <Badge key={c.id} variant="secondary" className="text-[10px] font-semibold bg-[#FAF6F0] text-[#2C2621] border border-[#DFD7CB]">
                          {c.name} (Sem {c.semester})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
