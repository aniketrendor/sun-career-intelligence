import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './profile-client'

export const dynamic = 'force-dynamic'

export default async function MentorProfilePage() {
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
          cabin: parsed.cabin || '',
          expertise: Array.isArray(parsed.expertise) ? parsed.expertise : [],
          consultation_hours: parsed.consultation_hours || '',
          bio: parsed.bio || ''
        }
      } else {
        mentorMetadata.title = cp.designation
      }
    } catch (e) {
      mentorMetadata.title = cp.designation
    }
  }

  // Count active advisees
  const { count: adviseeCount } = await supabase
    .from('student_counselor_assignments')
    .select('id', { count: 'exact', head: true })
    .eq('counselor_id', profile.id)
    .eq('status', 'ACTIVE')

  // Count logged sessions
  const { count: sessionCount } = await supabase
    .from('counseling_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('counselor_id', profile.id)

  return (
    <div className="max-w-7xl mx-auto py-2">
      <ProfileClient
        user={profile}
        counselorProfile={{
          employee_id: cp?.employee_id || null,
          title: mentorMetadata.title,
          cabin: mentorMetadata.cabin,
          expertise: mentorMetadata.expertise,
          consultation_hours: mentorMetadata.consultation_hours,
          bio: mentorMetadata.bio
        }}
        stats={{
          adviseeCount: adviseeCount || 0,
          sessionCount: sessionCount || 0
        }}
      />
    </div>
  )
}
