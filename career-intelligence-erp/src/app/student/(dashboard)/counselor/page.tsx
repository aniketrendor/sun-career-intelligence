import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CounselorClient, CounselorItem, SessionItem } from './counselor-client'

export const dynamic = 'force-dynamic'

export default async function StudentCounselorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Concurrently fetch assignment, available counselors, and sessions
  const [
    { data: assignment },
    { data: rawCounselors },
    { data: sessions }
  ] = await Promise.all([
    supabase
      .from('student_counselor_assignments')
      .select(`
        id,
        assigned_at,
        status,
        notes,
        counselor:users!counselor_id(
          id,
          full_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('student_id', profile.id)
      .eq('status', 'ACTIVE')
      .maybeSingle(),
    supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        phone,
        counselor_profile:counselor_profiles(
          designation,
          employee_id
        )
      `)
      .in('role', ['COUNSELOR', 'MENTOR'])
      .order('full_name', { ascending: true }),
    supabase
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
        counselor:users!counselor_id(full_name)
      `)
      .eq('student_id', profile.id)
      .order('session_date', { ascending: false })
  ])

  // Helper to parse counselor metadata
  function parseCounselorMeta(designation: string | null | undefined) {
    let title = 'Institutional Career & Faculty Mentor'
    let cabin = ''
    let consultation_hours = ''
    let expertise: string[] = []
    let bio = ''

    if (designation) {
      try {
        if (designation.startsWith('{')) {
          const parsed = JSON.parse(designation)
          title = parsed.title || title
          cabin = parsed.cabin || ''
          consultation_hours = parsed.consultation_hours || ''
          expertise = Array.isArray(parsed.expertise) ? parsed.expertise : []
          bio = parsed.bio || ''
        } else {
          title = designation
        }
      } catch {
        title = designation
      }
    }

    return { title, cabin, consultation_hours, expertise, bio }
  }

  // Format available counselors list
  const availableCounselors: CounselorItem[] = (rawCounselors || []).map((u: any) => {
    const rawCp = Array.isArray(u.counselor_profile) ? u.counselor_profile[0] : u.counselor_profile
    const meta = parseCounselorMeta(rawCp?.designation)
    return {
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone || null,
      title: meta.title,
      cabin: meta.cabin,
      consultation_hours: meta.consultation_hours,
      expertise: meta.expertise,
      bio: meta.bio
    }
  })

  // Format assigned counselor
  let assignedCounselor: CounselorItem | null = null
  const rawAssignedUser = Array.isArray((assignment as any)?.counselor)
    ? (assignment as any)?.counselor[0]
    : (assignment as any)?.counselor

  if (rawAssignedUser?.id) {
    const foundInAvailable = availableCounselors.find(c => c.id === rawAssignedUser.id)
    if (foundInAvailable) {
      assignedCounselor = foundInAvailable
    } else {
      // Query specific profile
      const { data: cp } = await supabase
        .from('counselor_profiles')
        .select('*')
        .eq('user_id', rawAssignedUser.id)
        .maybeSingle()

      const meta = parseCounselorMeta(cp?.designation)
      assignedCounselor = {
        id: rawAssignedUser.id,
        full_name: rawAssignedUser.full_name,
        email: rawAssignedUser.email,
        phone: rawAssignedUser.phone || null,
        title: meta.title,
        cabin: meta.cabin,
        consultation_hours: meta.consultation_hours,
        expertise: meta.expertise,
        bio: meta.bio
      }
    }
  }

  // Parse faculty endorsement note from assignment if present
  let endorsementData = null
  if (assignment?.notes?.startsWith('[ENDORSED:')) {
    const lines = assignment.notes.split('\n')
    endorsementData = {
      header: lines[0]?.replace('[', '').replace(']', '') || '',
      track: lines.find((l: string) => l.startsWith('Target Track:'))?.replace('Target Track:', '').trim() || '',
      note: lines.find((l: string) => l.startsWith('Faculty Note:'))?.replace('Faculty Note:', '').trim() || ''
    }
  }

  // Format sessions
  const formattedSessions: SessionItem[] = (sessions || []).map((s: any) => {
    const counselorUser = Array.isArray(s.counselor) ? s.counselor[0] : s.counselor
    return {
      id: s.id,
      session_date: s.session_date,
      discussion_summary: s.discussion_summary,
      identified_concerns: s.identified_concerns,
      recommended_actions: s.recommended_actions,
      follow_up_date: s.follow_up_date,
      status: s.status,
      created_at: s.created_at,
      counselor: counselorUser ? { full_name: counselorUser.full_name } : null
    }
  })

  return (
    <CounselorClient
      student={{
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email
      }}
      assignedCounselor={assignedCounselor}
      availableCounselors={availableCounselors}
      sessions={formattedSessions}
      endorsement={endorsementData}
    />
  )
}
