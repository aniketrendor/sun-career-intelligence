'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// ─── REFERRAL CODE VERIFICATION ─────────────────────────────────────────────

export async function verifyReferralCode(code: string): Promise<ActionResult> {
  if (!code || code.trim().length < 3) {
    return { success: false, error: 'Please enter a valid referral code.' }
  }

  const supabase = await createClient()
  const { data: referral, error } = await supabase
    .from('referral_codes')
    .select(`
      *,
      program:programs(id, name, code, academic_year, status, institution:institutions(name)),
      class:classes(id, name, code, semester, status)
    `)
    .eq('code', code.trim().toUpperCase())
    .single()

  if (error || !referral) {
    return { success: false, error: 'Referral code not found. Please check and try again.' }
  }

  if (referral.status === 'DISABLED') {
    return { success: false, error: 'This referral code has been disabled.' }
  }

  if (referral.status === 'EXPIRED' || (referral.expires_at && new Date(referral.expires_at) < new Date())) {
    return { success: false, error: 'This referral code has expired.' }
  }

  if (referral.max_uses !== null && referral.usage_count >= referral.max_uses) {
    return { success: false, error: 'This referral code has reached its maximum enrollment limit.' }
  }

  if (referral.program?.status !== 'ACTIVE') {
    return { success: false, error: 'The program associated with this code is not currently active.' }
  }

  if (referral.class?.status !== 'ACTIVE') {
    return { success: false, error: 'The class associated with this code is not currently active.' }
  }

  return {
    success: true,
    data: {
      referral_code_id: referral.id,
      code: referral.code,
      program_id: referral.program_id,
      class_id: referral.class_id,
      program_name: referral.program?.name,
      program_code: referral.program?.code,
      class_name: referral.class?.name,
      class_code: referral.class?.code,
      semester: referral.class?.semester,
      academic_year: referral.program?.academic_year,
      institution_name: referral.program?.institution?.name,
      expires_at: referral.expires_at,
      remaining_capacity: referral.max_uses ? referral.max_uses - referral.usage_count : null,
    }
  }
}

// ─── STUDENT ENROLLMENT ──────────────────────────────────────────────────────

const enrollmentSchema = z.object({
  referral_code: z.string().min(3),
})

export async function enrollStudent(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const validation = enrollmentSchema.safeParse({ referral_code: formData.get('referral_code') })
  if (!validation.success) {
    return { success: false, error: 'Invalid referral code.' }
  }

  const supabase = await createClient()
  const adminClient = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'STUDENT') {
    return { success: false, error: 'Only students can enroll using referral codes.' }
  }

  // Verify code server-side (no client-provided program/class)
  const verifyResult = await verifyReferralCode(validation.data.referral_code)
  if (!verifyResult.success || !verifyResult.data) {
    return { success: false, error: verifyResult.error }
  }

  const { referral_code_id, program_id, class_id, academic_year } = verifyResult.data as {
    referral_code_id: string; program_id: string; class_id: string; academic_year: string
  }

  // Check for existing enrollment
  const { data: existingEnrollment } = await adminClient
    .from('enrollments')
    .select('id')
    .eq('student_id', profile.id)
    .eq('program_id', program_id)
    .single()

  if (existingEnrollment) {
    return { success: false, error: 'You are already enrolled in this program.' }
  }

  // Atomic enrollment + usage increment using RPC
  const { data: enrollment, error: enrollError } = await adminClient
    .from('enrollments')
    .insert({
      student_id: profile.id,
      program_id,
      class_id,
      referral_code_id,
      academic_year,
      status: 'ACTIVE',
    })
    .select()
    .single()

  if (enrollError) {
    return { success: false, error: 'Enrollment failed. Please try again.' }
  }

  // Increment usage count safely
  await adminClient.rpc('increment_referral_usage', { code_id: referral_code_id })

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'STUDENT_ENROLLMENT',
    entity_type: 'enrollments',
    entity_id: enrollment.id,
    metadata: { program_id, class_id, referral_code_id }
  })

  // Notify counselors
  const { data: counselors } = await adminClient
    .from('users')
    .select('id')
    .eq('role', 'COUNSELOR')
    .eq('status', 'ACTIVE')
  
  if (counselors && counselors.length > 0) {
    const { data: studentUser } = await adminClient.from('users').select('full_name').eq('id', profile.id).single()
    const notifications = counselors.map(c => ({
      user_id: c.id,
      type: 'STUDENT_ENROLLMENT' as const,
      title: 'New Student Enrolled',
      message: `${studentUser?.full_name} has enrolled in a program.`,
      metadata: { student_id: profile.id, enrollment_id: enrollment.id }
    }))
    await adminClient.from('notifications').insert(notifications)
  }

  revalidatePath('/student')
  return { success: true, data: enrollment }
}

// ─── STUDENT PROFILE ONBOARDING ──────────────────────────────────────────────

const studentProfileSchema = z.object({
  full_name: z.string().min(2, 'Please enter a valid full name'),
  prn: z.string().max(80).nullable().optional(),
  phone: z.string().regex(/^\+91\s?\d{10}$/, 'Contact number must be a valid 10-digit Indian mobile number (+91 XXXXXXXXXX)').nullable().optional(),
  gender: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  institution: z.string().min(1, 'Educational institution is required'),
  education_level: z.string().nullable().optional(),
  school: z.string().nullable().optional(),
  stream_department: z.string().nullable().optional(),
  current_program: z.string().min(1, 'Current qualification / program is required'),
  current_semester: z.coerce.number().nullable().optional(),
  current_class_semester: z.string().nullable().optional(),
  academic_year: z.string().nullable().optional(),
  student_status: z.string().nullable().optional(),
})

export async function updateStudentProfile(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const getField = (key: string) => {
    const val = formData.get(key)
    if (val === null || val === undefined) return undefined
    const str = String(val).trim()
    return str.length > 0 ? str : undefined
  }

  // Preserve alphanumeric student IDs, roll numbers, and PRNs (e.g. PU-2023-45 or 250102041007)
  let prnRaw = getField('prn')
  if (prnRaw) {
    prnRaw = prnRaw.trim()
  }

  // Sanitize Phone: ensure +91 prefix followed by 10 digits
  let phoneRaw = getField('phone')
  if (phoneRaw) {
    const digitsOnly = phoneRaw.replace(/\D/g, '')
    if (digitsOnly.length === 10) {
      phoneRaw = `+91 ${digitsOnly}`
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      phoneRaw = `+91 ${digitsOnly.slice(2)}`
    }
  }

  const classSemRaw = getField('current_class_semester') || getField('current_semester')
  // Try extracting numeric semester if present (e.g. "Semester 3" -> 3 or "Year 2" -> 2 or "3" -> 3)
  let numericSem: number | undefined = undefined
  if (classSemRaw) {
    const match = classSemRaw.match(/\d+/)
    if (match) {
      numericSem = parseInt(match[0], 10)
    }
  }

  const rawData = {
    full_name: getField('full_name') || 'Student Member',
    prn: prnRaw || null,
    phone: phoneRaw,
    gender: getField('gender'),
    date_of_birth: getField('date_of_birth'),
    institution: getField('institution') || getField('school') || 'Sandip University',
    education_level: getField('education_level') || 'Undergraduate (UG)',
    school: getField('stream_department') || getField('school') || getField('institution'),
    stream_department: getField('stream_department') || getField('school') || null,
    current_program: getField('current_program') || 'Undergraduate Degree',
    current_semester: numericSem || 1,
    current_class_semester: classSemRaw || 'Year 1, Semester 1',
    academic_year: getField('academic_year') || '2024 - 2028',
    student_status: getField('student_status') || 'Currently studying',
  }

  const validation = studentProfileSchema.safeParse(rawData)

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const supabase = await createClient()
  const adminClient = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) return { success: false, error: 'User profile not found.' }

  const {
    full_name,
    phone,
    prn,
    school,
    stream_department,
    institution,
    education_level,
    current_program,
    current_semester,
    current_class_semester,
    academic_year,
    student_status,
    gender,
    date_of_birth
  } = validation.data

  // 1. Update users table (stores full_name and phone)
  const { error: userError } = await adminClient.from('users').update({
    full_name,
    ...(phone ? { phone } : {}),
  }).eq('id', profile.id)

  if (userError) {
    return { success: false, error: userError.message || 'Failed to update user record.' }
  }

  // 2. Upsert student_profiles table
  const profilePayload: Record<string, any> = {
    user_id: profile.id,
    prn: prn || null,
    school: stream_department || school || null,
    stream_department: stream_department || school || null,
    institution: institution || school || null,
    education_level: education_level || 'Undergraduate (UG)',
    current_program: current_program || null,
    current_semester: current_semester || 1,
    current_class_semester: current_class_semester || null,
    academic_year: academic_year || null,
    student_status: student_status || 'Currently studying',
    ...(gender ? { gender } : {}),
    ...(date_of_birth ? { date_of_birth } : {}),
  }

  const { error: profileError } = await adminClient
    .from('student_profiles')
    .upsert(profilePayload, { onConflict: 'user_id' })

  if (profileError) {
    return { success: false, error: profileError.message || 'Failed to save student profile.' }
  }

  revalidatePath('/student')
  revalidatePath('/student/profile')
  revalidatePath('/student/career-profile')
  return { success: true }
}

// ─── STUDENT ADVISORY SLOT BOOKING ──────────────────────────────────────────

export interface BookCounselingSlotInput {
  counselor_id: string
  session_date: string // YYYY-MM-DD
  time_slot: string
  mode: 'IN_PERSON' | 'GOOGLE_MEET'
  topic: string
  agenda?: string
}

export async function bookCounselingSlot(input: BookCounselingSlotInput): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: student } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('auth_user_id', user.id)
    .single()

  if (!student) return { success: false, error: 'Student profile not found.' }

  if (!input.counselor_id || !input.session_date || !input.time_slot) {
    return { success: false, error: 'Please provide all required slot details.' }
  }

  // 1. Verify counselor exists
  const { data: counselor } = await adminClient
    .from('users')
    .select('id, full_name, email, role')
    .eq('id', input.counselor_id)
    .single()

  if (!counselor || !['COUNSELOR', 'MENTOR', 'ADMIN', 'DEAN_HOD'].includes(counselor.role)) {
    return { success: false, error: 'Selected advisor is not valid.' }
  }

  // 2. Fetch counselor metadata for cabin / meet location
  const { data: cp } = await adminClient
    .from('counselor_profiles')
    .select('designation')
    .eq('user_id', counselor.id)
    .maybeSingle()

  let venue = 'Faculty Cabin, Academic Block'
  let mentorMeetLink = ''

  if (cp?.designation?.startsWith('{')) {
    try {
      const parsed = JSON.parse(cp.designation)
      if (parsed.cabin) venue = parsed.cabin
      if (parsed.google_meet_link) mentorMeetLink = parsed.google_meet_link
    } catch {}
  }

  if (input.mode === 'GOOGLE_MEET') {
    venue = mentorMeetLink || 'https://meet.google.com (Advisory Link)'
  }

  // 3. Collision check: Is this slot already booked for this counselor on this date?
  const { data: existingBookings } = await adminClient
    .from('counseling_sessions')
    .select('id, discussion_summary, status')
    .eq('counselor_id', counselor.id)
    .eq('session_date', input.session_date)
    .neq('status', 'CANCELLED')

  const slotTaken = (existingBookings || []).some(s => {
    const match = s.discussion_summary?.match(/\[Slot:\s*([^|]+)\s*\|/)
    return match && match[1]?.trim() === input.time_slot.trim()
  })

  if (slotTaken) {
    return {
      success: false,
      error: `The ${input.time_slot} slot is already booked for Prof. ${counselor.full_name} on ${input.session_date}. Please choose another available slot.`
    }
  }

  // 4. Set this mentor as the student's active advisor (deactivating previous ones)
  await adminClient
    .from('student_counselor_assignments')
    .update({ status: 'INACTIVE' })
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')

  const { data: existingAssignment } = await adminClient
    .from('student_counselor_assignments')
    .select('id')
    .eq('student_id', student.id)
    .eq('counselor_id', counselor.id)
    .maybeSingle()

  if (existingAssignment) {
    await adminClient
      .from('student_counselor_assignments')
      .update({ status: 'ACTIVE', assigned_at: new Date().toISOString() })
      .eq('id', existingAssignment.id)
  } else {
    await adminClient
      .from('student_counselor_assignments')
      .insert({
        student_id: student.id,
        counselor_id: counselor.id,
        status: 'ACTIVE',
        assigned_at: new Date().toISOString()
      })
  }

  // 5. Create counseling session
  const structuredSummary = `[Slot: ${input.time_slot} | Mode: ${input.mode} | Venue: ${venue} | Topic: ${input.topic}]\nStudent Agenda: ${input.agenda || 'Routine career & academic advisory consultation'}`

  const { error: sessionError } = await adminClient
    .from('counseling_sessions')
    .insert({
      counselor_id: counselor.id,
      student_id: student.id,
      session_date: input.session_date,
      discussion_summary: structuredSummary,
      identified_concerns: input.agenda || null,
      status: 'OPEN'
    })

  if (sessionError) {
    return { success: false, error: sessionError.message || 'Failed to schedule advisory session.' }
  }

  // 6. Notify counselor
  await adminClient.from('notifications').insert({
    user_id: counselor.id,
    type: 'COUNSELING_SCHEDULED',
    title: 'New Student Advisory Slot Booked',
    message: `${student.full_name} booked an advisory consultation slot on ${input.session_date} (${input.time_slot}) for "${input.topic}".`
  })

  // 6. Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: student.id,
    action: 'STUDENT_ADVISORY_SLOT_BOOKED',
    entity_type: 'counseling_sessions',
    metadata: {
      counselor_id: counselor.id,
      session_date: input.session_date,
      time_slot: input.time_slot,
      mode: input.mode,
      topic: input.topic
    }
  })

  revalidatePath('/student/counselor')
  revalidatePath('/mentor/availability')
  revalidatePath('/mentor/sessions')
  revalidatePath('/mentor/students')
  revalidatePath('/mentor/dashboard')

  return { success: true }
}

export async function cancelStudentSession(sessionId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: student } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!student) return { success: false, error: 'Student not found.' }

  const { error } = await adminClient
    .from('counseling_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('student_id', student.id)
    .eq('status', 'OPEN')

  if (error) {
    return { success: false, error: error.message || 'Failed to cancel appointment.' }
  }

  revalidatePath('/student/counselor')
  revalidatePath('/mentor/availability')
  revalidatePath('/mentor/sessions')

  return { success: true }
}

export async function selectMentor(counselorId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: student } = await supabase
    .from('users')
    .select('id, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!student) return { success: false, error: 'Student not found.' }

  // Verify mentor exists
  const { data: mentor } = await adminClient
    .from('users')
    .select('id, full_name, role')
    .eq('id', counselorId)
    .single()

  if (!mentor || !['COUNSELOR', 'MENTOR', 'ADMIN', 'DEAN_HOD'].includes(mentor.role)) {
    return { success: false, error: 'Selected mentor is invalid.' }
  }

  // Deactivate any existing active assignments
  await adminClient
    .from('student_counselor_assignments')
    .update({ status: 'INACTIVE' })
    .eq('student_id', student.id)
    .eq('status', 'ACTIVE')

  // Check if assignment record exists with this mentor
  const { data: existing } = await adminClient
    .from('student_counselor_assignments')
    .select('id')
    .eq('student_id', student.id)
    .eq('counselor_id', counselorId)
    .maybeSingle()

  if (existing) {
    await adminClient
      .from('student_counselor_assignments')
      .update({ status: 'ACTIVE', assigned_at: new Date().toISOString() })
      .eq('id', existing.id)
  } else {
    await adminClient
      .from('student_counselor_assignments')
      .insert({
        student_id: student.id,
        counselor_id: counselorId,
        status: 'ACTIVE',
        assigned_at: new Date().toISOString()
      })
  }

  // Notify mentor
  await adminClient.from('notifications').insert({
    user_id: mentor.id,
    type: 'MENTOR_SELECTED',
    title: 'New Student Advisee Assignment',
    message: `${student.full_name} selected you as their Faculty Career Mentor.`
  })

  revalidatePath('/student/counselor')
  revalidatePath('/mentor/dashboard')
  revalidatePath('/mentor/students')
  revalidatePath('/mentor/availability')

  return { success: true }
}
