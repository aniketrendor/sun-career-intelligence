'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export interface MentorProfileData {
  full_name: string
  phone?: string
  title: string
  employee_id?: string
  cabin?: string
  expertise: string[]
  consultation_hours?: string
  bio?: string
}

// ─── 1. UPDATE MENTOR PROFILE ───────────────────────────────────────────────

export async function updateMentorProfile(
  data: MentorProfileData
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized to update mentor profile.' }
  }

  // 1. Update basic user data
  const { error: userError } = await adminClient
    .from('users')
    .update({
      full_name: data.full_name,
      phone: data.phone || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', profile.id)

  if (userError) {
    return { success: false, error: userError.message || 'Failed to update user profile.' }
  }

  // 2. Package metadata into counselor_profiles.designation JSON
  const designationPayload = JSON.stringify({
    title: data.title || 'Career & Faculty Mentor',
    cabin: data.cabin || 'Academic Block, Faculty Cabin',
    expertise: Array.isArray(data.expertise) ? data.expertise : [],
    consultation_hours: data.consultation_hours || 'Mon & Wed: 02:00 PM - 04:30 PM',
    bio: data.bio || ''
  })

  // Check if counselor_profile exists
  const { data: existingCp } = await adminClient
    .from('counselor_profiles')
    .select('id')
    .eq('user_id', profile.id)
    .maybeSingle()

  if (existingCp) {
    const { error: cpError } = await adminClient
      .from('counselor_profiles')
      .update({
        designation: designationPayload,
        employee_id: data.employee_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id)

    if (cpError) return { success: false, error: cpError.message || 'Failed to update counselor profile.' }
  } else {
    const { error: cpError } = await adminClient
      .from('counselor_profiles')
      .insert({
        user_id: profile.id,
        designation: designationPayload,
        employee_id: data.employee_id || null,
        can_manage_assessments: true
      })

    if (cpError) return { success: false, error: cpError.message || 'Failed to create counselor profile.' }
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'MENTOR_PROFILE_UPDATED',
    entity_type: 'counselor_profiles',
    metadata: { full_name: data.full_name, title: data.title }
  })

  revalidatePath('/mentor/profile')
  revalidatePath('/mentor/dashboard')
  revalidatePath('/student/counselor')

  return { success: true }
}

// ─── 1B. DYNAMIC SLOTS & GOOGLE MEET CONFIG ────────────────────────────────

export interface DynamicSlotsConfig {
  available_days: string[]
  custom_slots: string[]
  google_meet_link: string
  cabin?: string
  consultation_hours?: string
}

export async function updateMentorSlotsConfig(
  config: DynamicSlotsConfig
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized to configure advisory slots.' }
  }

  // Fetch existing counselor_profile
  const { data: existingCp } = await adminClient
    .from('counselor_profiles')
    .select('id, designation')
    .eq('user_id', profile.id)
    .maybeSingle()

  let currentMeta: Record<string, any> = {
    title: 'Career & Faculty Mentor',
    cabin: config.cabin || '',
    expertise: [],
    consultation_hours: config.consultation_hours || '',
    bio: ''
  }

  if (existingCp?.designation) {
    try {
      if (existingCp.designation.startsWith('{')) {
        currentMeta = JSON.parse(existingCp.designation)
      } else {
        currentMeta.title = existingCp.designation
      }
    } catch {}
  }

  // Merge updated dynamic slots & Google Meet link
  const updatedMeta = {
    ...currentMeta,
    cabin: config.cabin !== undefined ? config.cabin : (currentMeta.cabin || ''),
    consultation_hours: config.consultation_hours || (config.available_days.length > 0 ? `${config.available_days.join(', ')} (${config.custom_slots.length} daily slots)` : ''),
    google_meet_link: config.google_meet_link || '',
    available_days: config.available_days || [],
    custom_slots: config.custom_slots || []
  }

  const designationPayload = JSON.stringify(updatedMeta)

  if (existingCp) {
    const { error: cpError } = await adminClient
      .from('counselor_profiles')
      .update({
        designation: designationPayload,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.id)

    if (cpError) return { success: false, error: cpError.message || 'Failed to update slots config.' }
  } else {
    const { error: cpError } = await adminClient
      .from('counselor_profiles')
      .insert({
        user_id: profile.id,
        designation: designationPayload,
        can_manage_assessments: true
      })

    if (cpError) return { success: false, error: cpError.message || 'Failed to initialize counselor profile.' }
  }

  revalidatePath('/mentor/availability')
  revalidatePath('/mentor/profile')
  revalidatePath('/student/counselor')

  return { success: true }
}

// ─── 2. CREATE / UPDATE COUNSELING SESSION ─────────────────────────────────

export interface CounselingSessionInput {
  sessionId?: string
  student_id: string
  session_date: string // YYYY-MM-DD
  time_slot?: string
  mode?: 'IN_PERSON' | 'GOOGLE_MEET'
  location_or_link?: string
  topic?: string
  discussion_summary: string
  identified_concerns?: string
  recommended_actions?: string
  follow_up_date?: string | null
  status: 'OPEN' | 'FOLLOW_UP' | 'RESOLVED' | 'IN_PROGRESS' | 'CLOSED' | 'CANCELLED' | string
}

export async function saveCounselingSession(
  input: CounselingSessionInput
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized to log guidance sessions.' }
  }

  // Format discussion summary with structured metadata header if available
  let structuredSummary = input.discussion_summary || ''
  const metaHeader = `[Slot: ${input.time_slot || '10:00 AM'} | Mode: ${input.mode || 'IN_PERSON'}${input.location_or_link ? ` | Venue: ${input.location_or_link}` : ''}${input.topic ? ` | Topic: ${input.topic}` : ''}]`
  
  if (!structuredSummary.startsWith('[Slot:')) {
    structuredSummary = `${metaHeader}\n${structuredSummary}`.trim()
  }

  // Normalize status to valid PostgreSQL counseling_status enum: 'OPEN', 'FOLLOW_UP', 'RESOLVED'
  let dbStatus: 'OPEN' | 'FOLLOW_UP' | 'RESOLVED' = 'OPEN'
  const rawStatus = String(input.status).toUpperCase()
  if (rawStatus === 'RESOLVED' || rawStatus === 'CLOSED' || rawStatus === 'COMPLETED') {
    dbStatus = 'RESOLVED'
  } else if (rawStatus === 'FOLLOW_UP' || rawStatus === 'IN_PROGRESS') {
    dbStatus = 'FOLLOW_UP'
  } else {
    dbStatus = 'OPEN'
  }

  let sessionRecordId = input.sessionId

  if (input.sessionId) {
    // Update existing session
    const { error: updateError } = await adminClient
      .from('counseling_sessions')
      .update({
        student_id: input.student_id,
        session_date: input.session_date,
        discussion_summary: structuredSummary,
        identified_concerns: input.identified_concerns || null,
        recommended_actions: input.recommended_actions || null,
        follow_up_date: input.follow_up_date || null,
        status: dbStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', input.sessionId)
      .eq('counselor_id', profile.id)

    if (updateError) return { success: false, error: updateError.message || 'Failed to update session.' }
  } else {
    // Insert new session
    const { data: inserted, error: insertError } = await adminClient
      .from('counseling_sessions')
      .insert({
        counselor_id: profile.id,
        student_id: input.student_id,
        session_date: input.session_date,
        discussion_summary: structuredSummary,
        identified_concerns: input.identified_concerns || null,
        recommended_actions: input.recommended_actions || null,
        follow_up_date: input.follow_up_date || null,
        status: dbStatus
      })
      .select('id')
      .single()

    if (insertError) return { success: false, error: insertError.message || 'Failed to create session.' }
    sessionRecordId = inserted?.id
  }

  // Notify the advisee
  await adminClient.from('notifications').insert({
    user_id: input.student_id,
    type: 'GENERAL',
    title: dbStatus === 'RESOLVED' ? 'Mentorship Session Completed' : 'Mentorship Session Scheduled',
    message: `Faculty Mentor ${profile.full_name} has ${input.sessionId ? 'updated' : 'recorded'} advisory notes & action items for ${input.session_date}.`,
    metadata: { session_id: sessionRecordId, mentor_id: profile.id }
  })

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: input.sessionId ? 'COUNSELING_SESSION_UPDATED' : 'COUNSELING_SESSION_CREATED',
    entity_type: 'counseling_sessions',
    entity_id: sessionRecordId,
    metadata: { student_id: input.student_id, status: dbStatus }
  })

  revalidatePath('/mentor/sessions')
  revalidatePath('/mentor/availability')
  revalidatePath('/mentor/dashboard')
  revalidatePath('/student/counselor')

  return { success: true }
}

// ─── 3. DELETE SESSION ──────────────────────────────────────────────────────

export async function deleteCounselingSession(sessionId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized.' }
  }

  const { error } = await adminClient
    .from('counseling_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('counselor_id', profile.id)

  if (error) return { success: false, error: error.message || 'Failed to remove session.' }

  revalidatePath('/mentor/sessions')
  revalidatePath('/mentor/availability')
  revalidatePath('/mentor/dashboard')
  return { success: true }
}

// ─── 4. ENDORSE ADVISEE DIAGNOSTIC EVALUATION ────────────────────────────────

export interface EndorsementInput {
  studentId: string
  recommendedDomain: string
  recommendedTrack: string
  endorsementNotes: string
}

export async function endorseCareerEvaluation(
  input: EndorsementInput
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized.' }
  }

  const endorsementText = `[ENDORSED: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} by Prof. ${profile.full_name}]\nTarget Track: ${input.recommendedDomain} (${input.recommendedTrack})\nFaculty Note: ${input.endorsementNotes}`

  // Update notes on the active assignment
  const { error: asgError } = await adminClient
    .from('student_counselor_assignments')
    .update({
      notes: endorsementText
    })
    .eq('student_id', input.studentId)
    .eq('counselor_id', profile.id)
    .eq('status', 'ACTIVE')

  if (asgError) {
    return { success: false, error: asgError.message || 'Failed to register endorsement.' }
  }

  // Send direct congratulatory notification to advisee
  await adminClient.from('notifications').insert({
    user_id: input.studentId,
    type: 'GENERAL',
    title: 'Faculty Career Endorsement Approved',
    message: `Prof. ${profile.full_name} has officially endorsed your career specialization track in ${input.recommendedDomain}. View your updated advisory file.`,
    metadata: { mentor_id: profile.id, domain: input.recommendedDomain, track: input.recommendedTrack }
  })

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'CAREER_DIAGNOSTIC_ENDORSED',
    entity_type: 'student_counselor_assignments',
    metadata: {
      student_id: input.studentId,
      domain: input.recommendedDomain,
      track: input.recommendedTrack
    }
  })

  revalidatePath('/mentor/evaluations')
  revalidatePath('/mentor/dashboard')
  revalidatePath('/mentor/students')
  revalidatePath('/student/counselor')

  return { success: true }
}
