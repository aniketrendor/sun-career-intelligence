'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

export type ActionResult<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

// ─── ASSIGN STUDENT TO COUNSELOR ─────────────────────────────────────────────

export async function assignStudentToCounselor(
  studentId: string,
  counselorId: string,
  notes?: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !['DEAN_HOD', 'COUNSELOR'].includes(adminUser.role)) {
    return { success: false, error: 'Only Deans/Admins can assign counselors to students.' }
  }

  // Deactivate any existing active assignment for this student
  await adminClient
    .from('student_counselor_assignments')
    .update({ status: 'INACTIVE' })
    .eq('student_id', studentId)

  // Upsert active assignment
  const { data: assignment, error } = await adminClient
    .from('student_counselor_assignments')
    .upsert(
      {
        student_id: studentId,
        counselor_id: counselorId,
        assigned_by: adminUser.id,
        status: 'ACTIVE',
        notes: notes || 'Assigned by Dean / Institutional Admin',
        assigned_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,counselor_id' }
    )
    .select()
    .single()

  if (error) {
    return { success: false, error: 'Failed to assign counselor.' }
  }

  // Notify student
  const { data: counselorUser } = await adminClient.from('users').select('full_name').eq('id', counselorId).single()
  await adminClient.from('notifications').insert({
    user_id: studentId,
    type: 'COUNSELOR_ASSIGNMENT',
    title: 'Career Counselor Assigned',
    message: `${counselorUser?.full_name || 'A career counselor'} has been assigned to guide your career roadmap.`,
  })

  // Notify counselor
  const { data: studentUser } = await adminClient.from('users').select('full_name').eq('id', studentId).single()
  await adminClient.from('notifications').insert({
    user_id: counselorId,
    type: 'STUDENT_ENROLLMENT',
    title: 'New Student Assigned',
    message: `${studentUser?.full_name || 'A student'} has been assigned to your advisory caseload.`,
  })

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: adminUser.id,
    action: 'STUDENT_COUNSELOR_ASSIGNMENT',
    entity_type: 'student_counselor_assignments',
    entity_id: assignment.id,
    metadata: { student_id: studentId, counselor_id: counselorId }
  })

  revalidatePath('/admin')
  revalidatePath('/mentor')
  revalidatePath('/student')
  return { success: true, data: assignment }
}

// ─── BULK ASSIGN CLASS COHORT TO COUNSELOR ───────────────────────────────────

export async function bulkAssignClassToCounselor(
  classId: string,
  counselorId: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !['ADMIN', 'DEAN_HOD'].includes(adminUser.role)) {
    return { success: false, error: 'Only Admins and Deans can perform bulk class assignments.' }
  }

  // Get all active students in class
  const { data: enrollments } = await adminClient
    .from('enrollments')
    .select('student_id')
    .eq('class_id', classId)
    .eq('status', 'ACTIVE')

  if (!enrollments || enrollments.length === 0) {
    return { success: false, error: 'No active students found in this class.' }
  }

  const studentIds = enrollments.map(e => e.student_id)

  // Deactivate existing assignments
  await adminClient
    .from('student_counselor_assignments')
    .update({ status: 'INACTIVE' })
    .in('student_id', studentIds)

  // Batch insert new assignments
  const assignments = studentIds.map(sId => ({
    student_id: sId,
    counselor_id: counselorId,
    assigned_by: adminUser.id,
    status: 'ACTIVE' as const,
    notes: 'Cohort batch assignment by Dean',
    assigned_at: new Date().toISOString(),
  }))

  const { error } = await adminClient
    .from('student_counselor_assignments')
    .upsert(assignments, { onConflict: 'student_id,counselor_id' })

  if (error) {
    return { success: false, error: 'Failed to assign class students.' }
  }

  revalidatePath('/admin')
  revalidatePath('/mentor')
  return { success: true, data: { count: assignments.length } }
}

// ─── APPROVE OR REJECT COUNSELOR ─────────────────────────────────────────────

export async function approveCounselor(counselorUserId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: dean } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!dean || !['ADMIN', 'DEAN_HOD'].includes(dean.role)) {
    return { success: false, error: 'Only Admins can approve mentor/counselor accounts.' }
  }

  await adminClient
    .from('users')
    .update({ status: 'ACTIVE' })
    .eq('id', counselorUserId)

  await adminClient.from('notifications').insert({
    user_id: counselorUserId,
    type: 'COUNSELOR_APPROVAL' as any,
    title: 'Account Activated',
    message: 'Your mentor/counselor account has been approved by the Admin.',
  })

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { success: true }
}

// ─── USER MANAGEMENT ACTIONS (ADMIN) ─────────────────────────────────────────

export async function updateUserRole(
  targetUserId: string,
  newRole: 'STUDENT' | 'MENTOR' | 'ADMIN' | 'COUNSELOR' | 'DEAN_HOD'
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !['ADMIN', 'DEAN_HOD'].includes(adminUser.role)) {
    return { success: false, error: 'Unauthorized: Only Admins can modify user roles.' }
  }

  // Update role in users table
  const { error: updateError } = await adminClient
    .from('users')
    .update({ role: newRole })
    .eq('id', targetUserId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Provision corresponding profile table if it doesn't exist
  if (newRole === 'STUDENT') {
    const { data: existingProfile } = await adminClient
      .from('student_profiles')
      .select('id')
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (!existingProfile) {
      await adminClient.from('student_profiles').insert({ user_id: targetUserId })
    }
  } else if (newRole === 'MENTOR' || newRole === 'COUNSELOR') {
    const { data: existingProfile } = await adminClient
      .from('counselor_profiles')
      .select('id')
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (!existingProfile) {
      await adminClient.from('counselor_profiles').insert({
        user_id: targetUserId,
        designation: 'Career & Admissions Mentor',
        can_manage_assessments: true,
      })
    }
  } else if (newRole === 'ADMIN' || newRole === 'DEAN_HOD') {
    const { data: existingProfile } = await adminClient
      .from('dean_hod_profiles')
      .select('id')
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (!existingProfile) {
      await adminClient.from('dean_hod_profiles').insert({
        user_id: targetUserId,
        designation: 'Institutional Administrator',
      })
    }
  }

  // Log audit
  await adminClient.from('audit_logs').insert({
    actor_user_id: adminUser.id,
    action: 'USER_ROLE_UPDATE',
    entity_type: 'users',
    entity_id: targetUserId,
    metadata: { new_role: newRole, updated_by: adminUser.id },
  })

  // Notify user
  await adminClient.from('notifications').insert({
    user_id: targetUserId,
    type: 'GENERAL',
    title: 'Account Role Updated',
    message: `Your account role has been updated to ${newRole} by the Administrator.`,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  revalidatePath('/admin/students')
  revalidatePath('/admin/mentors')
  return { success: true }
}

export async function updateUserStatus(
  targetUserId: string,
  newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING',
  reason?: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !['ADMIN', 'DEAN_HOD'].includes(adminUser.role)) {
    return { success: false, error: 'Unauthorized: Only Admins can modify user status.' }
  }

  const { error: updateError } = await adminClient
    .from('users')
    .update({ status: newStatus })
    .eq('id', targetUserId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Log audit
  await adminClient.from('audit_logs').insert({
    actor_user_id: adminUser.id,
    action: 'USER_STATUS_UPDATE',
    entity_type: 'users',
    entity_id: targetUserId,
    metadata: { new_status: newStatus, reason: reason || null },
  })

  // Notify user
  await adminClient.from('notifications').insert({
    user_id: targetUserId,
    type: 'GENERAL',
    title: `Account Status: ${newStatus}`,
    message: reason || `Your account status is now set to ${newStatus}.`,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { success: true }
}

export async function createManagedUser(data: {
  fullName: string
  email: string
  role: 'STUDENT' | 'MENTOR' | 'ADMIN'
  phone?: string
  prnOrId?: string
  designation?: string
}): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !['ADMIN', 'DEAN_HOD'].includes(adminUser.role)) {
    return { success: false, error: 'Unauthorized: Only Admins can create users.' }
  }

  // Check if email already exists
  const { data: existingUser } = await adminClient
    .from('users')
    .select('id')
    .eq('email', data.email.toLowerCase().trim())
    .maybeSingle()

  if (existingUser) {
    return { success: false, error: 'A user with this email address already exists.' }
  }

  // Generate synthetic auth user ID or placeholder UUID
  const dummyAuthId = crypto.randomUUID()

  const dbRole = data.role === 'MENTOR' ? 'MENTOR' : data.role === 'ADMIN' ? 'ADMIN' : 'STUDENT'

  const { data: newUser, error: insertError } = await adminClient
    .from('users')
    .insert({
      auth_user_id: dummyAuthId,
      full_name: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || null,
      role: dbRole as any,
      status: 'ACTIVE',
    })
    .select('id')
    .single()

  if (insertError || !newUser) {
    return { success: false, error: insertError?.message || 'Failed to create user record.' }
  }

  // Create role profile
  if (data.role === 'STUDENT') {
    await adminClient.from('student_profiles').insert({
      user_id: newUser.id,
      prn: data.prnOrId?.trim() || null,
    })
  } else if (data.role === 'MENTOR') {
    await adminClient.from('counselor_profiles').insert({
      user_id: newUser.id,
      employee_id: data.prnOrId?.trim() || null,
      designation: data.designation?.trim() || 'Career Mentor',
      can_manage_assessments: true,
    })
  } else if (data.role === 'ADMIN') {
    await adminClient.from('dean_hod_profiles').insert({
      user_id: newUser.id,
      employee_id: data.prnOrId?.trim() || null,
      designation: data.designation?.trim() || 'Institutional Administrator',
    })
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: adminUser.id,
    action: 'ADMIN_USER_CREATION',
    entity_type: 'users',
    entity_id: newUser.id,
    metadata: { created_role: data.role, email: data.email },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { success: true, data: { id: newUser.id } }
}

export async function deleteManagedUser(targetUserId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !['ADMIN', 'DEAN_HOD'].includes(adminUser.role)) {
    return { success: false, error: 'Unauthorized: Only Admins can remove users.' }
  }

  if (adminUser.id === targetUserId) {
    return { success: false, error: 'Cannot delete your own active administrator account.' }
  }

  // Soft delete by updating status to INACTIVE or delete record
  const { error } = await adminClient
    .from('users')
    .update({ status: 'INACTIVE' })
    .eq('id', targetUserId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    actor_user_id: adminUser.id,
    action: 'USER_DEACTIVATION',
    entity_type: 'users',
    entity_id: targetUserId,
    metadata: { deactivated_by: adminUser.id },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserDetails(data: {
  userId: string
  fullName: string
  email: string
  phone?: string
  prnOrId?: string
  designation?: string
  role?: string
}): Promise<ActionResult> {
  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated.' }

  const { data: adminUser } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!adminUser || !['ADMIN', 'DEAN_HOD'].includes(adminUser.role)) {
    return { success: false, error: 'Unauthorized: Only Admins can edit users.' }
  }

  // Update user profile info
  const { error: updateError } = await adminClient
    .from('users')
    .update({
      full_name: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || null,
    })
    .eq('id', data.userId)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Update specific profile tables if applicable
  if (data.prnOrId) {
    await adminClient
      .from('student_profiles')
      .update({ prn: data.prnOrId.trim() })
      .eq('user_id', data.userId)

    await adminClient
      .from('counselor_profiles')
      .update({
        employee_id: data.prnOrId.trim(),
        ...(data.designation && { designation: data.designation.trim() }),
      })
      .eq('user_id', data.userId)

    await adminClient
      .from('dean_hod_profiles')
      .update({
        employee_id: data.prnOrId.trim(),
        ...(data.designation && { designation: data.designation.trim() }),
      })
      .eq('user_id', data.userId)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { success: true }
}
