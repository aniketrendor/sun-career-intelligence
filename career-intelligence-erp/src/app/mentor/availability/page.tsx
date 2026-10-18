import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AvailabilityClient } from './availability-client'

export const dynamic = 'force-dynamic'

export default async function MentorAvailabilityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, email, phone, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    redirect('/login')
  }

  // Fetch counselor profile
  const { data: cp } = await supabase
    .from('counselor_profiles')
    .select('*')
    .eq('user_id', profile.id)
    .maybeSingle()

  // Parse JSON from designation if present
  let mentorMetadata = {
    title: 'Career & Faculty Mentor',
    cabin: '',
    expertise: [] as string[],
    consultation_hours: '',
    bio: ''
  }

  if (cp?.designation) {
    try {
      if (cp.designation.startsWith('{')) {
        const parsed = JSON.parse(cp.designation)
        mentorMetadata = {
          title: parsed.title || mentorMetadata.title,
          cabin: parsed.cabin || mentorMetadata.cabin,
          expertise: Array.isArray(parsed.expertise) ? parsed.expertise : mentorMetadata.expertise,
          consultation_hours: parsed.consultation_hours || mentorMetadata.consultation_hours,
          bio: parsed.bio || mentorMetadata.bio
        }
      } else {
        mentorMetadata.title = cp.designation
      }
    } catch (e) {
      mentorMetadata.title = cp.designation
    }
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
      student:users!student_id(id, full_name, email)
    `)
    .eq('counselor_id', profile.id)
    .order('session_date', { ascending: true })

  const formattedSessions = (sessions || []).map((s: any) => ({
    ...s,
    student: Array.isArray(s.student) ? s.student[0] : s.student
  })).filter((s: any) => Boolean(s.student))

  return (
    <div className="max-w-7xl mx-auto py-2">
      <AvailabilityClient
        mentorProfile={mentorMetadata}
        advisees={advisees}
        sessions={formattedSessions}
      />
    </div>
  )
}
