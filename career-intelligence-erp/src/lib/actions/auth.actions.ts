'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { z } from 'zod'

async function getAppUrl(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '')
  }

  try {
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host')
    const proto = headersList.get('x-forwarded-proto') || 'https'
    if (host) {
      return `${proto}://${host}`.replace(/\/$/, '')
    }
  } catch {
    // Fallback if headers() unavailable
  }

  return (envUrl || 'http://localhost:3000').replace(/\/$/, '')
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2),
  role: z.enum(['STUDENT', 'DEAN_HOD']),
})

export type AuthActionResult = {
  success: boolean
  error?: string
  redirectTo?: string
}

export async function signInWithEmail(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const validation = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!validation.success) {
    return { success: false, error: 'Invalid email or password format.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  })

  if (error) {
    return { success: false, error: 'Invalid credentials. Please try again.' }
  }

  // Update last login
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('auth_user_id', user.id)
    
    // Audit log
    const { data: profile } = await supabase.from('users').select('id, role').eq('auth_user_id', user.id).single()
    if (profile) {
      await supabase.from('audit_logs').insert({
        actor_user_id: profile.id,
        action: 'LOGIN',
        entity_type: 'users',
        entity_id: profile.id,
        metadata: { method: 'email' }
      })
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function signInWithGoogle(targetRole: string = 'STUDENT'): Promise<AuthActionResult> {
  const supabase = await createClient()
  const appUrl = await getAppUrl()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/auth/callback?target_role=${targetRole}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account consent',
      },
    },
  })

  if (error) {
    return { success: false, error: 'Failed to initiate Google login.' }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { success: false, error: 'Unable to redirect to Google.' }
}

export async function signUpWithEmail(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const validation = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
    role: formData.get('role'),
  })

  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message }
  }

  const { email, password, full_name, role } = validation.data
  const supabase = await createClient()
  const adminClient = await createAdminClient()
  const appUrl = await getAppUrl()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${appUrl}/auth/callback` },
  })

  if (authError || !authData.user) {
    return { success: false, error: authError?.message || 'Failed to create account.' }
  }

  // Create application profile
  const status = 'ACTIVE'
  const { data: userRecord, error: profileError } = await adminClient
    .from('users')
    .insert({
      auth_user_id: authData.user.id,
      full_name,
      email,
      role,
      status,
    })
    .select()
    .single()

  if (profileError) {
    return { success: false, error: 'Failed to create user profile.' }
  }

  // Create role-specific profile
  if (role === 'STUDENT') {
    await adminClient.from('student_profiles').insert({ user_id: userRecord.id })
  } else if (role === 'DEAN_HOD') {
    const designation = formData.get('designation') as string || 'Admin / Academic Leadership'
    await adminClient.from('dean_hod_profiles').insert({
      user_id: userRecord.id,
      designation,
    })
  }

  await adminClient.from('audit_logs').insert({
    actor_user_id: userRecord.id,
    action: 'SIGNUP',
    entity_type: 'users',
    entity_id: userRecord.id,
    metadata: { role, method: 'email' }
  })

  revalidatePath('/', 'layout')
  const redirectTo = ['ADMIN', 'DEAN_HOD'].includes(role)
    ? '/admin/dashboard'
    : ['MENTOR', 'COUNSELOR'].includes(role)
    ? '/mentor/dashboard'
    : '/student/dashboard'
  return { success: true, redirectTo }
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('users').select('id').eq('auth_user_id', user.id).single()
    if (profile) {
      await supabase.from('audit_logs').insert({
        actor_user_id: profile.id,
        action: 'LOGOUT',
        entity_type: 'users',
        entity_id: profile.id,
      })
    }
  }
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function sendPasswordResetEmail(
  _prev: AuthActionResult,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get('email') as string
  if (!email) return { success: false, error: 'Email is required.' }

  const supabase = await createClient()
  const appUrl = await getAppUrl()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/update-password`,
  })

  if (error) {
    return { success: false, error: 'Failed to send reset email.' }
  }

  return { success: true }
}

export async function sendOtpCode(email: string): Promise<AuthActionResult> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid institutional email address.' }
  }
  const supabase = await createClient()
  const appUrl = await getAppUrl()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
      shouldCreateUser: true,
    }
  })
  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}

export async function verifyOtpCode(
  email: string,
  token: string,
  targetRole: 'STUDENT' | 'COUNSELOR' | 'DEAN_HOD' = 'STUDENT'
): Promise<AuthActionResult> {
  if (!email || !token) {
    return { success: false, error: 'Email and 6-digit OTP code are required.' }
  }
  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
  if (error || !data.user) {
    return { success: false, error: error?.message || 'Invalid or expired OTP code.' }
  }

  // Ensure app profile exists (auto-provisioning for new users)
  const adminClient = await createAdminClient()
  const { data: existingProfile } = await adminClient
    .from('users')
    .select('id, role, status')
    .eq('auth_user_id', data.user.id)
    .single()

  if (!existingProfile) {
    const { data: newProfile } = await adminClient
      .from('users')
      .insert({
        auth_user_id: data.user.id,
        email: data.user.email!,
        full_name: data.user.email!.split('@')[0],
        role: targetRole,
        status: 'ACTIVE',
      })
      .select()
      .single()

    if (newProfile) {
      if (targetRole === 'STUDENT') {
        await adminClient.from('student_profiles').insert({ user_id: newProfile.id })
      } else if (targetRole === 'COUNSELOR') {
        await adminClient.from('counselor_profiles').insert({
          user_id: newProfile.id,
          designation: 'Career & Admissions Mentor',
          can_manage_assessments: true,
        })
      } else if (targetRole === 'DEAN_HOD') {
        await adminClient.from('dean_hod_profiles').insert({
          user_id: newProfile.id,
          designation: 'Institutional Administrator',
        })
      }
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  return profile
}

