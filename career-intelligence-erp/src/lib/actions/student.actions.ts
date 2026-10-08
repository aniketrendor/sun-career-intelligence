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
  prn: z.string().min(1, 'Student ID / PRN / Roll Number is required').max(60).nullable().optional(),
  phone: z.string().regex(/^\+91\s?\d{10}$/, 'Contact number must be a valid 10-digit Indian mobile number (+91 XXXXXXXXXX)').nullable().optional(),
  gender: z.string().nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  institution: z.string().nullable().optional(),
  school: z.string().nullable().optional(),
  current_program: z.string().nullable().optional(),
  current_semester: z.coerce.number().nullable().optional(),
  academic_year: z.string().nullable().optional(),
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

  const rawData = {
    full_name: getField('full_name') || 'Student Member',
    prn: prnRaw,
    phone: phoneRaw,
    gender: getField('gender'),
    date_of_birth: getField('date_of_birth'),
    institution: getField('institution') || getField('school') || 'Sandip University',
    school: getField('school') || getField('institution'),
    current_program: getField('current_program'),
    current_semester: getField('current_semester'),
    academic_year: getField('academic_year'),
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

  const { full_name, phone, prn, school, institution, current_program, current_semester, academic_year, gender, date_of_birth } = validation.data

  // 1. Update users table (stores full_name and phone)
  const { error: userError } = await adminClient.from('users').update({
    full_name,
    ...(phone ? { phone } : {}),
  }).eq('id', profile.id)

  if (userError) {
    return { success: false, error: userError.message || 'Failed to update user record.' }
  }

  // 2. Upsert student_profiles table (does not have phone column)
  const { error: profileError } = await adminClient
    .from('student_profiles')
    .upsert({
      user_id: profile.id,
      prn: prn || null,
      school: school || null,
      institution: institution || school || null,
      current_program: current_program || null,
      current_semester: current_semester || 1,
      academic_year: academic_year || null,
      ...(gender ? { gender } : {}),
      ...(date_of_birth ? { date_of_birth } : {}),
    }, { onConflict: 'user_id' })

  if (profileError) {
    return { success: false, error: profileError.message || 'Failed to save student profile.' }
  }

  revalidatePath('/student')
  revalidatePath('/student/profile')
  revalidatePath('/student/assessment')
  return { success: true }
}
