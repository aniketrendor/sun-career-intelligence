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

  // Concurrently fetch student profile and enrollment
  const [
    { data: studentProfile },
    { data: enrollment }
  ] = await Promise.all([
    supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle(),
    supabase
      .from('enrollments')
      .select(`
        *,
        program:programs(id, name, code, academic_year),
        class:classes(id, name, code, semester)
      `)
      .eq('student_id', profile.id)
      .eq('status', 'ACTIVE')
      .maybeSingle()
  ])

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans pb-12">
      <StudentProfileForm
        initialUser={profile}
        initialProfile={studentProfile}
        enrollment={enrollment}
      />
    </div>
  )
}
