import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StudentProfileForm } from '@/components/student/student-profile-form'
import { Badge } from '@/components/ui/badge'
import { User } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StudentProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'STUDENT') redirect('/login')

  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', profile.id)
    .maybeSingle()

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select(`
      *,
      program:programs(id, name, code, academic_year),
      class:classes(id, name, code, semester)
    `)
    .eq('student_id', profile.id)
    .eq('status', 'ACTIVE')
    .maybeSingle()

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6F0] text-[#A36B40] border border-[#DFD7CB] mb-2">
          <User className="w-3.5 h-3.5 text-[#A36B40]" /> Account Details
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Student Profile & Settings</h1>
        <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
          Manage your personal details, institutional enrollment, and career preferences.
        </p>
      </div>

      <StudentProfileForm
        initialUser={profile}
        initialProfile={studentProfile}
        enrollment={enrollment}
      />
    </div>
  )
}
