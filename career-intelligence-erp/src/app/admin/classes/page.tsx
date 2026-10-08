import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  GraduationCap, Users, QrCode, Building2,
  ArrowRight, Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreateClassModal } from '@/components/dean/create-class-modal'

export const dynamic = 'force-dynamic'

export default async function DeanClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ program?: string }>
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

  // Fetch all programs for creation modal
  const { data: programs } = await supabase
    .from('programs')
    .select('id, name, code, academic_year')
    .order('name', { ascending: true })

  // Query classes
  let query = supabase
    .from('classes')
    .select(`
      *,
      program:programs(id, name, code),
      enrollments:enrollments(id),
      referral_codes:referral_codes(id, code, status, usage_count, max_uses)
    `)
    .order('created_at', { ascending: false })

  if (params.program) {
    query = query.eq('program_id', params.program)
  }

  const { data: classes } = await query

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              <GraduationCap className="w-3.5 h-3.5" /> Class Cohorts & Sections
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Classes & Cohort Divisions
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Manage academic batches, student capacity limits, and referral access.
          </p>
        </div>

        <CreateClassModal programs={programs || []} />
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(classes || []).map((c: any) => {
          const studentCount = c.enrollments?.length || 0
          const capacity = c.student_capacity || 60

          return (
            <Card key={c.id} className="bg-white border-[#DFD7CB] hover:border-[#A36B40] hover:shadow-md transition-all flex flex-col justify-between rounded-2xl shadow-sm">
              <div>
                <CardHeader className="pb-3 border-b border-[#DFD7CB]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-xs bg-[#FAF6F0] text-[#2C2621] border-[#DFD7CB] font-mono">
                      {c.code}
                    </Badge>
                    <Badge className={c.status === 'ACTIVE' ? 'bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 text-xs' : 'bg-stone-100 text-stone-500 text-xs'}>
                      {c.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#2C2621]">{c.name}</CardTitle>
                  <CardDescription className="text-xs text-[#7A7067] mt-1">
                    Program: {c.program?.name} ({c.program?.code}) · Sem {c.semester}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-4">
                  <div className="bg-[#FAF6F0] p-3 rounded-xl border border-[#DFD7CB] text-xs space-y-1">
                    <div className="flex justify-between font-medium text-[#7A7067]">
                      <span>Enrollment Roster</span>
                      <span className="font-extrabold text-[#2C2621]">{studentCount} / {capacity} Students</span>
                    </div>
                    {c.faculty_coordinator && (
                      <p className="text-[#7A7067] text-[11px] pt-1">
                        Coordinator: <span className="text-[#2C2621] font-semibold">{c.faculty_coordinator}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </div>

              <div className="p-4 border-t border-[#DFD7CB] flex items-center justify-between text-xs">
                <Link
                  href={`/admin/students?class=${c.id}`}
                  className="font-semibold text-[#A36B40] hover:text-[#8E5B33] flex items-center gap-1 cursor-pointer"
                >
                  View Students <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/admin/referral-codes?class=${c.id}`}
                  className="text-[#7A7067] hover:text-[#2C2621] font-medium"
                >
                  Referral Codes
                </Link>
              </div>
            </Card>
          )
        })}

        {(!classes || classes.length === 0) && (
          <div className="col-span-full py-12 text-center text-[#7A7067] bg-white border border-[#DFD7CB] rounded-2xl">
            <GraduationCap className="w-10 h-10 mx-auto mb-2 opacity-40 text-purple-600" />
            <p className="font-bold text-[#2C2621]">No Classes configured yet</p>
            <p className="text-xs text-[#7A7067] mt-0.5">Click &quot;Create Class / Cohort&quot; to configure a class section.</p>
          </div>
        )}
      </div>
    </div>
  )
}
