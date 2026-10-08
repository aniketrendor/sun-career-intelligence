'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
  redirectTo?: string
  message?: string
}

export type KeyType = 'STUDENT_LOGIN' | 'MENTOR_LOGIN' | 'FRESHER_REFERRAL'

function generateUniqueKey(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let randomPart = ''
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `${prefix.toUpperCase()}-${randomPart}`
}

// ─── 1. CREATE ACCESS KEY ───────────────────────────────────────────────────

export async function createAccessKey(data: {
  keyType: KeyType
  programId?: string
  classId?: string
  mentorCode?: string
  maxUses?: number
  expiresAt?: string
  autoRefresh?: boolean
  notes?: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role, full_name, email')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD', 'MENTOR', 'COUNSELOR'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized: Only Administrators and Mentors can issue access keys.' }
  }

  const isMentor = ['MENTOR', 'COUNSELOR'].includes(profile.role)

  // Determine prefix based on key type
  let prefix = 'SUN'
  let specificCodeCandidate: string | null = null

  if (data.keyType === 'STUDENT_LOGIN') {
    prefix = 'STU-PASS'
  } else if (data.keyType === 'MENTOR_LOGIN') {
    prefix = 'MNT-PASS'
  } else if (data.keyType === 'FRESHER_REFERRAL') {
    if (data.mentorCode && data.mentorCode.trim()) {
      const sanitized = data.mentorCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
      specificCodeCandidate = `SUN-FRESHER-${sanitized}`
      prefix = `SUN-FRESHER-${sanitized}`
    } else if (isMentor) {
      // Fetch mentor's counselor profile if exists
      const { data: counselorProf } = await adminClient
        .from('counselor_profiles')
        .select('employee_id')
        .eq('user_id', profile.id)
        .maybeSingle()

      const mentorTag = counselorProf?.employee_id
        ? counselorProf.employee_id.toUpperCase().replace(/[^A-Z0-9]/g, '')
        : (profile.full_name
            ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 3)
            : 'MNT')

      specificCodeCandidate = `SUN-FRESHER-${mentorTag}`
      prefix = `SUN-FRESHER-${mentorTag}`
    } else if (data.classId) {
      const { data: classData } = await adminClient.from('classes').select('code').eq('id', data.classId).maybeSingle()
      prefix = classData?.code ? `SUN-FRESHER-${classData.code}` : 'SUN-FRESHERS'
    } else {
      prefix = 'SUN-FRESHERS'
    }
  }

  // Generate unique code
  let code = ''
  if (specificCodeCandidate) {
    const { data: existingExact } = await adminClient
      .from('referral_codes')
      .select('id')
      .ilike('code', specificCodeCandidate)
      .maybeSingle()
    if (!existingExact) {
      code = specificCodeCandidate
    }
  }

  if (!code) {
    let attempts = 0
    while (attempts < 5) {
      const candidate = generateUniqueKey(prefix)
      const { data: existing } = await adminClient.from('referral_codes').select('id').ilike('code', candidate).maybeSingle()
      if (!existing) {
        code = candidate
        break
      }
      attempts++
    }
  }

  if (!code) {
    return { success: false, error: 'Failed to generate unique code. Please try again with a different mentor code.' }
  }

  const defaultMaxUses = data.maxUses && data.maxUses > 0 ? data.maxUses : 20

  const { data: newKey, error: insertError } = await adminClient
    .from('referral_codes')
    .insert({
      code,
      key_type: data.keyType,
      program_id: data.programId || null,
      class_id: data.classId || null,
      max_uses: defaultMaxUses,
      usage_count: 0,
      auto_refresh: data.autoRefresh ?? true,
      expires_at: data.expiresAt || null,
      notes: data.notes || null,
      status: 'ACTIVE',
      created_by: profile.id,
    })
    .select(`*, program:programs(name, code), class:classes(name, code)`)
    .single()

  if (insertError || !newKey) {
    return { success: false, error: insertError?.message || 'Failed to create access key.' }
  }

  // Log audit
  await adminClient.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'ACCESS_KEY_CREATED',
    entity_type: 'referral_codes',
    entity_id: newKey.id,
    metadata: { code, key_type: data.keyType, max_uses: defaultMaxUses }
  })

  revalidatePath('/admin/referral-codes')
  revalidatePath('/mentor/referral-codes')
  return { success: true, data: newKey }
}

// ─── 2. REDEEM ACCESS KEY IN WAITING ROOM ───────────────────────────────────

export async function redeemAccessKey(rawKey: string): Promise<ActionResult> {
  const codeToVerify = rawKey?.trim().toUpperCase()
  if (!codeToVerify) {
    return { success: false, error: 'Please enter a valid Access Key.' }
  }

  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Session expired. Please log in again.' }
  }

  // Get current user profile
  const { data: profile } = await adminClient
    .from('users')
    .select('id, role, status, email, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile) {
    return { success: false, error: 'User profile not found. Please log in again.' }
  }

  // Look up access key in referral_codes
  const { data: keyRecord, error: keyError } = await adminClient
    .from('referral_codes')
    .select('*')
    .eq('code', codeToVerify)
    .maybeSingle()

  if (keyError || !keyRecord) {
    return {
      success: false,
      error: 'Invalid Access Key. Please check the code provided by your administrator or mentor.'
    }
  }

  // Check if disabled
  if (keyRecord.status === 'DISABLED') {
    return { success: false, error: 'This access key has been temporarily disabled by the administrator.' }
  }

  // Check if expired
  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
    return { success: false, error: 'This access key has expired.' }
  }

  const keyType: KeyType = keyRecord.key_type || 'FRESHER_REFERRAL'
  const maxUses = keyRecord.max_uses || 20
  const currentCount = keyRecord.usage_count || 0

  // Check quota & auto-refresh logic
  if (currentCount >= maxUses) {
    if (!keyRecord.auto_refresh) {
      return { success: false, error: `This key has completed its quota of ${maxUses} students and is no longer active.` }
    }
    // Auto-refresh: Reset counter for the next batch of 20 students smoothly
    await adminClient
      .from('referral_codes')
      .update({
        usage_count: 1,
        status: 'ACTIVE',
      })
      .eq('id', keyRecord.id)
  } else {
    // Increment usage count
    const nextCount = currentCount + 1
    const shouldDeactivate = !keyRecord.auto_refresh && nextCount >= maxUses
    await adminClient
      .from('referral_codes')
      .update({
        usage_count: nextCount,
        status: shouldDeactivate ? 'DISABLED' : 'ACTIVE',
      })
      .eq('id', keyRecord.id)
  }

  // Role validation & activation
  let targetDashboard = '/student/dashboard'

  if (profile.role === 'STUDENT') {
    if (keyType === 'MENTOR_LOGIN') {
      return {
        success: false,
        error: 'This is a Mentor Approval Key and cannot be used for a Student account.'
      }
    }

    // Activate student account
    await adminClient
      .from('users')
      .update({ status: 'ACTIVE' })
      .eq('id', profile.id)

    // Ensure student profile exists
    await adminClient
      .from('student_profiles')
      .upsert({ user_id: profile.id }, { onConflict: 'user_id' })

    // If key has program and class attached, auto-enroll student
    if (keyRecord.program_id && keyRecord.class_id) {
      await adminClient
        .from('enrollments')
        .upsert({
          student_id: profile.id,
          program_id: keyRecord.program_id,
          class_id: keyRecord.class_id,
          referral_code_id: keyRecord.id,
          status: 'ACTIVE',
        }, { onConflict: 'student_id,program_id' })
    }

    targetDashboard = '/student/dashboard'
  } else if (['MENTOR', 'COUNSELOR'].includes(profile.role)) {
    if (keyType === 'STUDENT_LOGIN') {
      return {
        success: false,
        error: 'This is a Student Login Key and cannot be used for a Mentor account.'
      }
    }

    // Activate mentor account
    await adminClient
      .from('users')
      .update({ status: 'ACTIVE' })
      .eq('id', profile.id)

    // Ensure mentor profile exists
    await adminClient
      .from('counselor_profiles')
      .upsert({
        user_id: profile.id,
        designation: 'Career & Admissions Mentor',
        can_manage_assessments: true,
      }, { onConflict: 'user_id' })

    targetDashboard = '/mentor/dashboard'
  } else if (['ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    await adminClient
      .from('users')
      .update({ status: 'ACTIVE' })
      .eq('id', profile.id)

    targetDashboard = '/admin/dashboard'
  }

  // Notification & Audit Log
  await adminClient.from('notifications').insert({
    user_id: profile.id,
    type: 'GENERAL',
    title: 'Account Activated via Key',
    message: `Access verified using key ${keyRecord.code}. Welcome to Sandip University Career Intelligence ERP!`,
  })

  await adminClient.from('audit_logs').insert({
    actor_user_id: profile.id,
    action: 'ACCESS_KEY_REDEEMED',
    entity_type: 'referral_codes',
    entity_id: keyRecord.id,
    metadata: { code: keyRecord.code, role: profile.role, key_type: keyType }
  })

  revalidatePath('/', 'layout')
  revalidatePath('/student/dashboard')
  revalidatePath('/mentor/dashboard')
  revalidatePath('/admin/referral-codes')

  return {
    success: true,
    redirectTo: targetDashboard,
    message: 'Access Key verified successfully! Account is now active.'
  }
}

// ─── 3. REFRESH ACCESS KEY QUOTA (ADMIN MANUAL ACTION) ─────────────────────

export async function refreshKeyQuota(codeId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) {
    return { success: false, error: 'Unauthorized.' }
  }

  const { error } = await adminClient
    .from('referral_codes')
    .update({
      usage_count: 0,
      status: 'ACTIVE',
    })
    .eq('id', codeId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/referral-codes')
  return { success: true, message: 'Quota refreshed to 0 / 20 used.' }
}

export async function getReferralKeyDetails(rawCode: string) {
  const adminClient = await createAdminClient()
  const codeToVerify = rawCode?.trim().toUpperCase()

  if (!codeToVerify) {
    return {
      valid: false,
      code: 'SUN-FRESHERS-2026',
      advisorName: 'Admissions Directorate',
      advisorTitle: 'Sandip University Admissions Council',
      advisorRole: 'Admissions Council',
      isMentorKey: false,
    }
  }

  const { data: keyRecord } = await adminClient
    .from('referral_codes')
    .select(`
      id, code, key_type, status, expires_at,
      program:programs(name, code),
      creator:users!created_by(id, full_name, email, role)
    `)
    .ilike('code', codeToVerify)
    .maybeSingle()

  if (!keyRecord) {
    const isMentorFormat = codeToVerify.startsWith('SUN-FRESHER-')
    return {
      valid: false,
      code: codeToVerify,
      advisorName: isMentorFormat ? 'Assigned Mentor' : 'Admissions Directorate',
      advisorTitle: isMentorFormat ? 'Designated Admissions Mentor' : 'Sandip University Admissions Council',
      advisorRole: isMentorFormat ? 'Assigned Mentor' : 'Admissions Council',
      isMentorKey: isMentorFormat,
    }
  }

  const creator = keyRecord.creator as any
  const isMentor = creator && ['MENTOR', 'COUNSELOR'].includes(creator.role)
  const advisorName = isMentor
    ? creator.full_name || 'Designated Admissions Mentor'
    : 'Admissions Directorate'
  const advisorTitle = isMentor
    ? 'Designated Career & Admissions Mentor'
    : 'Sandip University Admissions Council'

  return {
    valid: keyRecord.status === 'ACTIVE',
    code: keyRecord.code,
    keyType: keyRecord.key_type,
    advisorName,
    advisorTitle,
    advisorRole: isMentor ? 'Assigned Mentor' : 'Admissions Council',
    isMentorKey: isMentor || keyRecord.code.startsWith('SUN-FRESHER-'),
    programName: (keyRecord.program as any)?.name,
  }
}

// ─── 4. SUBMIT FRESHER LEAD (FROM DIAGNOSTIC TEST) ──────────────────────────

export async function submitFresherLead(data: {
  referralCode: string
  candidateName: string
  candidateEmail?: string
  candidatePhone?: string
  targetLevel?: 'UG' | 'PG'
  highestQualification?: string
  lastAttemptedCollege?: string
  testScore?: number
  fitScore?: number
  topDomain?: string
  recommendedSpec?: string
}): Promise<ActionResult<{ leadId: string }>> {
  const adminClient = await createAdminClient()
  const codeToVerify = data.referralCode.trim().toUpperCase()

  // Look up referral code along with creator info
  const { data: keyRecord } = await adminClient
    .from('referral_codes')
    .select(`
      id, usage_count, max_uses, auto_refresh, created_by,
      creator:users!created_by(id, full_name, email, role)
    `)
    .ilike('code', codeToVerify)
    .maybeSingle()

  // Check if this key belongs to a mentor
  let autoAssignedMentorId: string | null = null
  let initialStatus: 'TEST_COMPLETED' | 'MENTOR_ASSIGNED' = 'TEST_COMPLETED'

  if (keyRecord?.creator && ['MENTOR', 'COUNSELOR'].includes((keyRecord.creator as any).role)) {
    autoAssignedMentorId = keyRecord.created_by
    initialStatus = 'MENTOR_ASSIGNED'
  } else if (codeToVerify.startsWith('SUN-FRESHER-')) {
    // If key has mentor code suffix, check if mentor matches creator
    if (keyRecord?.created_by) {
      const { data: creatorUser } = await adminClient
        .from('users')
        .select('id, role')
        .eq('id', keyRecord.created_by)
        .maybeSingle()
      if (creatorUser && ['MENTOR', 'COUNSELOR'].includes(creatorUser.role)) {
        autoAssignedMentorId = creatorUser.id
        initialStatus = 'MENTOR_ASSIGNED'
      }
    }
  }

  // Insert into fresher_leads table
  const { data: lead, error: insertError } = await adminClient
    .from('fresher_leads')
    .insert({
      referral_code_id: keyRecord?.id || null,
      referral_code: codeToVerify,
      candidate_name: data.candidateName.trim(),
      candidate_email: data.candidateEmail?.toLowerCase().trim() || null,
      candidate_phone: data.candidatePhone?.trim() || null,
      target_level: data.targetLevel || 'UG',
      highest_qualification: data.highestQualification?.trim() || null,
      last_attempted_college: data.lastAttemptedCollege?.trim() || null,
      test_score: data.testScore || 90,
      fit_score: data.fitScore || 92,
      top_domain: data.topDomain || 'AI & Data Engineering',
      recommended_spec: data.recommendedSpec || 'B.Tech CSE (AI & Data Science)',
      assigned_mentor_id: autoAssignedMentorId,
      status: initialStatus,
    })
    .select('id')
    .single()

  if (insertError || !lead) {
    return { success: false, error: insertError?.message || 'Failed to save fresher lead.' }
  }

  // If auto-assigned to mentor, send notification and audit log
  if (autoAssignedMentorId) {
    await adminClient.from('notifications').insert({
      user_id: autoAssignedMentorId,
      type: 'GENERAL',
      title: 'New Fresher Candidate Linked to Your Key',
      message: `Candidate ${data.candidateName} completed their diagnostic test using your referral key (${codeToVerify}) and is automatically assigned to your mentorship list!`,
    })

    await adminClient.from('audit_logs').insert({
      actor_user_id: autoAssignedMentorId,
      action: 'FRESHER_LEAD_AUTO_ASSIGNED_BY_KEY',
      entity_type: 'fresher_leads',
      entity_id: lead.id,
      metadata: { referral_code: codeToVerify, candidate_name: data.candidateName }
    })
  }

  // Increment usage count of referral code if found
  if (keyRecord) {
    const nextCount = (keyRecord.usage_count || 0) + 1
    const maxUses = keyRecord.max_uses || 20
    if (nextCount >= maxUses && keyRecord.auto_refresh) {
      await adminClient.from('referral_codes').update({ usage_count: 1, status: 'ACTIVE' }).eq('id', keyRecord.id)
    } else {
      await adminClient.from('referral_codes').update({ usage_count: nextCount }).eq('id', keyRecord.id)
    }
  }

  revalidatePath('/admin/students')
  revalidatePath('/admin/referral-codes')
  revalidatePath('/mentor/dashboard')
  revalidatePath('/mentor/students')
  revalidatePath('/mentor/referral-codes')
  return { success: true, data: { leadId: lead.id } }
}

// ─── 5. ASSIGN MENTOR TO FRESHER LEAD (ADMIN) ──────────────────────────────

export async function assignMentorToFresherLead(
  leadId: string,
  mentorId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id, role, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !['ADMIN', 'DEAN_HOD'].includes(adminUser.role)) {
    return { success: false, error: 'Unauthorized: Only Administrators can assign mentors.' }
  }

  // Update fresher lead
  const { data: updatedLead, error: updateError } = await adminClient
    .from('fresher_leads')
    .update({
      assigned_mentor_id: mentorId,
      status: 'MENTOR_ASSIGNED',
      updated_at: new Date().toISOString(),
    })
    .eq('id', leadId)
    .select('*, mentor:users!assigned_mentor_id(full_name, email)')
    .single()

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Notify Mentor
  await adminClient.from('notifications').insert({
    user_id: mentorId,
    type: 'GENERAL',
    title: 'New Fresher Lead Assigned',
    message: `Administrator ${adminUser.full_name || 'Admin'} assigned a new aspiring fresher (${updatedLead.candidate_name}) to your advisory caseload.`,
  })

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: adminUser.id,
    action: 'FRESHER_LEAD_MENTOR_ASSIGNED',
    entity_type: 'fresher_leads',
    entity_id: leadId,
    metadata: { mentor_id: mentorId, candidate_name: updatedLead.candidate_name }
  })

  revalidatePath('/admin/students')
  revalidatePath('/admin/dashboard')
  revalidatePath('/mentor/dashboard')
  revalidatePath('/mentor/students')
  return { success: true, data: updatedLead }
}

