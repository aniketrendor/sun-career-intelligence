'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// ─── DEAN/HOD APPROVAL / REJECTION ─────────────────────────────────────────

export async function approveDeanHod(
  deanHodUserId: string,
  institutionId?: string,
  departmentId?: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: counselor } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!counselor || counselor.role !== 'COUNSELOR') {
    return { success: false, error: 'Only counselors can approve accounts.' }
  }

  // Activate the user
  const { error: userError } = await adminClient
    .from('users')
    .update({ status: 'ACTIVE' })
    .eq('id', deanHodUserId)
    .eq('role', 'DEAN_HOD')

  if (userError) return { success: false, error: 'Failed to approve account.' }

  // Update dean_hod_profile
  await adminClient.from('dean_hod_profiles').update({
    approved_by: counselor.id,
    approved_at: new Date().toISOString(),
    ...(institutionId && { institution_id: institutionId }),
    ...(departmentId && { department_id: departmentId }),
  }).eq('user_id', deanHodUserId)

  // Notify the dean/hod
  await adminClient.from('notifications').insert({
    user_id: deanHodUserId,
    type: 'DEAN_HOD_APPROVAL',
    title: 'Account Approved',
    message: 'Your Dean/HOD account has been approved. You can now access the dashboard.',
  })

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: counselor.id,
    action: 'DEAN_HOD_APPROVAL',
    entity_type: 'users',
    entity_id: deanHodUserId,
    metadata: { approved_by: counselor.id }
  })

  revalidatePath('/counselor')
  return { success: true }
}

export async function rejectDeanHod(
  deanHodUserId: string,
  reason: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: counselor } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!counselor || counselor.role !== 'COUNSELOR') {
    return { success: false, error: 'Only counselors can reject accounts.' }
  }

  await adminClient.from('users').update({ status: 'INACTIVE' }).eq('id', deanHodUserId)
  await adminClient.from('dean_hod_profiles').update({ rejection_reason: reason }).eq('user_id', deanHodUserId)

  await adminClient.from('notifications').insert({
    user_id: deanHodUserId,
    type: 'DEAN_HOD_REJECTION',
    title: 'Account Request Rejected',
    message: `Your account request was not approved. Reason: ${reason}`,
  })

  await adminClient.from('audit_logs').insert({
    actor_user_id: counselor.id,
    action: 'DEAN_HOD_REJECTION',
    entity_type: 'users',
    entity_id: deanHodUserId,
    metadata: { reason }
  })

  revalidatePath('/counselor')
  return { success: true }
}

// ─── PROGRAM MANAGEMENT ──────────────────────────────────────────────────────

const programSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(20),
  description: z.string().optional(),
  institution_id: z.string().uuid(),
  department_id: z.string().uuid().optional(),
  academic_year: z.string().min(4),
  duration_years: z.coerce.number().min(1).max(10),
  total_semesters: z.coerce.number().min(1).max(20),
})

export async function createProgram(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const validation = programSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
    description: formData.get('description') || undefined,
    institution_id: formData.get('institution_id'),
    department_id: formData.get('department_id') || undefined,
    academic_year: formData.get('academic_year'),
    duration_years: formData.get('duration_years'),
    total_semesters: formData.get('total_semesters'),
  })

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['COUNSELOR', 'DEAN_HOD'].includes(profile.role)) {
    return { success: false, error: 'Insufficient permissions.' }
  }

  const { data, error } = await supabase
    .from('programs')
    .insert({ ...validation.data, created_by: profile.id })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message.includes('unique') ? 'A program with this code already exists for this academic year.' : 'Failed to create program.' }
  }

  await supabase.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'PROGRAM_CREATION',
    entity_type: 'programs',
    entity_id: data.id,
  })

  revalidatePath('/admin')
  revalidatePath('/mentor')
  return { success: true, data }
}

export async function updateProgram(
  programId: string,
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const validation = programSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
    description: formData.get('description') || undefined,
    institution_id: formData.get('institution_id'),
    department_id: formData.get('department_id') || undefined,
    academic_year: formData.get('academic_year'),
    duration_years: formData.get('duration_years'),
    total_semesters: formData.get('total_semesters'),
  })

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('programs').update(validation.data).eq('id', programId)
  if (error) return { success: false, error: 'Failed to update program.' }

  revalidatePath('/admin/programs')
  return { success: true }
}

// ─── CLASS MANAGEMENT ────────────────────────────────────────────────────────

const classSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(20),
  program_id: z.string().uuid(),
  semester: z.coerce.number().min(1).max(12),
  division: z.string().optional(),
  academic_year: z.string().min(4),
  faculty_coordinator: z.string().optional(),
  student_capacity: z.coerce.number().min(1).max(500),
})

export async function createClass(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const validation = classSchema.safeParse({
    name: formData.get('name'),
    code: formData.get('code'),
    program_id: formData.get('program_id'),
    semester: formData.get('semester'),
    division: formData.get('division') || undefined,
    academic_year: formData.get('academic_year'),
    faculty_coordinator: formData.get('faculty_coordinator') || undefined,
    student_capacity: formData.get('student_capacity'),
  })

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD', 'COUNSELOR', 'MENTOR'].includes(profile.role)) {
    return { success: false, error: 'Insufficient permissions.' }
  }

  const { data, error } = await supabase
    .from('classes')
    .insert({ ...validation.data, created_by: profile.id })
    .select()
    .single()

  if (error) {
    return { success: false, error: 'Failed to create class.' }
  }

  await supabase.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'CLASS_CREATION',
    entity_type: 'classes',
    entity_id: data.id,
  })

  revalidatePath('/admin')
  return { success: true, data }
}

// ─── REFERRAL CODE MANAGEMENT ────────────────────────────────────────────────

function generateReferralCode(classCode: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${classCode.toUpperCase()}-${code}`
}

const referralCodeSchema = z.object({
  program_id: z.string().uuid(),
  class_id: z.string().uuid(),
  expires_at: z.string().optional(),
  max_uses: z.coerce.number().optional(),
  notes: z.string().optional(),
})

export async function createReferralCode(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const validation = referralCodeSchema.safeParse({
    program_id: formData.get('program_id'),
    class_id: formData.get('class_id'),
    expires_at: formData.get('expires_at') || undefined,
    max_uses: formData.get('max_uses') || undefined,
    notes: formData.get('notes') || undefined,
  })

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD', 'COUNSELOR', 'MENTOR'].includes(profile.role)) {
    return { success: false, error: 'Insufficient permissions.' }
  }

  // Get class code for generating a readable code
  const { data: classData } = await supabase.from('classes').select('code').eq('id', validation.data.class_id).single()
  const classCode = classData?.code || 'CLASS'

  // Generate unique code (retry up to 5 times)
  let code = ''
  let attempts = 0
  while (attempts < 5) {
    const candidate = generateReferralCode(classCode)
    const { data: existing } = await supabase.from('referral_codes').select('id').eq('code', candidate).single()
    if (!existing) { code = candidate; break }
    attempts++
  }

  if (!code) return { success: false, error: 'Failed to generate unique referral code. Please try again.' }

  const { data, error } = await supabase
    .from('referral_codes')
    .insert({
      code,
      ...validation.data,
      created_by: profile.id,
      status: 'ACTIVE',
    })
    .select(`*, program:programs(name, code), class:classes(name, code)`)
    .single()

  if (error) return { success: false, error: 'Failed to create referral code.' }

  await supabase.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'REFERRAL_CODE_CREATION',
    entity_type: 'referral_codes',
    entity_id: data.id,
    metadata: { code }
  })

  revalidatePath('/admin/referral-codes')
  revalidatePath('/mentor/referral-codes')
  return { success: true, data }
}

export async function toggleReferralCode(codeId: string, enable: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('referral_codes')
    .update({ status: enable ? 'ACTIVE' : 'DISABLED' })
    .eq('id', codeId)

  if (error) return { success: false, error: 'Failed to update referral code.' }
  revalidatePath('/admin/referral-codes')
  revalidatePath('/mentor/referral-codes')
  return { success: true }
}

// ─── COUNSELING SESSIONS ─────────────────────────────────────────────────────

const counselingSchema = z.object({
  student_id: z.string().uuid(),
  session_date: z.string(),
  discussion_summary: z.string().optional(),
  identified_concerns: z.string().optional(),
  recommended_actions: z.string().optional(),
  follow_up_date: z.string().optional(),
  status: z.enum(['OPEN', 'FOLLOW_UP', 'RESOLVED']).default('OPEN'),
})

export async function createCounselingSession(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const validation = counselingSchema.safeParse({
    student_id: formData.get('student_id'),
    session_date: formData.get('session_date'),
    discussion_summary: formData.get('discussion_summary') || undefined,
    identified_concerns: formData.get('identified_concerns') || undefined,
    recommended_actions: formData.get('recommended_actions') || undefined,
    follow_up_date: formData.get('follow_up_date') || undefined,
    status: formData.get('status') || 'OPEN',
  })

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['COUNSELOR', 'MENTOR'].includes(profile.role)) {
    return { success: false, error: 'Only mentors/counselors can create counseling records.' }
  }

  const { data, error } = await supabase
    .from('counseling_sessions')
    .insert({ ...validation.data, counselor_id: profile.id })
    .select()
    .single()

  if (error) return { success: false, error: 'Failed to create counseling session.' }

  await supabase.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'COUNSELING_SESSION_CREATED',
    entity_type: 'counseling_sessions',
    entity_id: data.id,
  })

  revalidatePath('/mentor/students')
  return { success: true, data }
}
