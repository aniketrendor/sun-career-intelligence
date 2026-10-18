import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SessionsClient } from './sessions-client'

export const dynamic = 'force-dynamic'

export default async function MentorSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    redirect('/login')
  }

  // Query strictly assigned advisees
  const { data: myAssignments } = await supabase
    .from('student_counselor_assignments')
    .select(`
      id,
      student:users!student_id(
        id,
        full_name,
        email,
        student_profile:student_profiles(prn, current_program, current_semester)
      )
    `)
    .eq('counselor_id', profile.id)
    .eq('status', 'ACTIVE')

  const advisees = (myAssignments || []).map((a: any) => a.student).filter(Boolean)

  // Query all sessions for this mentor
  const { data: sessions } = await supabase
    .from('counseling_sessions')
    .select(`
      id,
      session_date,
      discussion_summary,
      identified_concerns,
      recommended_actions,
      follow_up_date,
      status,
      created_at,
      student:users!student_id(
        id,
        full_name,
        email,
        student_profile:student_profiles(prn, current_program, current_semester)
      )
    `)
    .eq('counselor_id', profile.id)
    .order('session_date', { ascending: false })

  const formattedSessions = (sessions || []).map((s: any) => {
    const rawStudent = Array.isArray(s.student) ? s.student[0] : s.student
    return {
      ...s,
      student: rawStudent ? {
        id: rawStudent.id,
        full_name: rawStudent.full_name,
        email: rawStudent.email,
        student_profile: Array.isArray(rawStudent.student_profile) ? rawStudent.student_profile[0] : rawStudent.student_profile
      } : null
    }
  }).filter((s: any) => Boolean(s.student))

  return (
    <div className="max-w-7xl mx-auto py-2">
      <SessionsClient
        advisees={advisees}
        sessions={formattedSessions}
      />
    </div>
  )
}
