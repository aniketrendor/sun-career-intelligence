import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const adminClient = await createAdminClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user has an app profile in public.users
      let { data: profile } = await adminClient
        .from('users')
        .select('id, role, status')
        .eq('auth_user_id', data.user.id)
        .single()

      // If this is a first-time Google sign-in user, auto-provision with selected target role
      if (!profile) {
        const rawTargetRole = searchParams.get('target_role') || 'STUDENT'
        const role = (
          rawTargetRole === 'mentor' || rawTargetRole === 'COUNSELOR'
            ? 'COUNSELOR'
            : rawTargetRole === 'admin' || rawTargetRole === 'DEAN_HOD'
            ? 'DEAN_HOD'
            : 'STUDENT'
        ) as 'STUDENT' | 'COUNSELOR' | 'DEAN_HOD'

        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          data.user.email?.split('@')[0] ||
          (role === 'COUNSELOR' ? 'Mentor' : role === 'DEAN_HOD' ? 'Admin' : 'Student')

        const avatarUrl =
          data.user.user_metadata?.avatar_url ||
          data.user.user_metadata?.picture ||
          null

        const { data: newUser, error: createError } = await adminClient
          .from('users')
          .insert({
            auth_user_id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            avatar_url: avatarUrl,
            role,
            status: 'ACTIVE',
          })
          .select('id, role, status')
          .single()

        if (!createError && newUser) {
          profile = newUser
          if (role === 'STUDENT') {
            await adminClient.from('student_profiles').insert({
              user_id: newUser.id,
            })
          } else if (role === 'COUNSELOR') {
            await adminClient.from('counselor_profiles').insert({
              user_id: newUser.id,
              designation: 'Career & Admissions Mentor',
              can_manage_assessments: true,
            })
          } else if (role === 'DEAN_HOD') {
            await adminClient.from('dean_hod_profiles').insert({
              user_id: newUser.id,
              designation: 'Institutional Administrator',
            })
          }

          // Log audit
          await adminClient.from('audit_logs').insert({
            actor_user_id: newUser.id,
            action: 'OAUTH_REGISTRATION',
            entity_type: 'users',
            entity_id: newUser.id,
            metadata: { provider: 'google', role },
          })
        }
      }

      if (profile) {
        if (profile.status === 'PENDING') {
          return NextResponse.redirect(`${origin}/pending-approval`)
        }

        // Role-based destination redirect
        const dashboardPaths: Record<string, string> = {
          STUDENT: '/student/dashboard',
          MENTOR: '/mentor/dashboard',
          COUNSELOR: '/mentor/dashboard',
          ADMIN: '/admin/dashboard',
          DEAN_HOD: '/admin/dashboard',
        }
        const redirectPath = dashboardPaths[profile.role] || next
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
