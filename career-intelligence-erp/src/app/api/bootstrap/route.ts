import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// One-time bootstrap endpoint to create the initial counselor account
// Usage: POST /api/bootstrap with { email, secret }
// After use, disable this endpoint or protect it further

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, secret } = body

    if (!secret || secret !== process.env.BOOTSTRAP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const adminClient = await createAdminClient()

    // Check if a counselor already exists
    const { data: existingCounselor } = await adminClient
      .from('users')
      .select('id')
      .eq('role', 'COUNSELOR')
      .eq('status', 'ACTIVE')
      .limit(1)
      .single()

    if (existingCounselor) {
      return NextResponse.json({ error: 'A counselor account already exists. Bootstrap can only run once.' }, { status: 409 })
    }

    // Find the auth user by email
    const { data: authUsers } = await adminClient.auth.admin.listUsers()
    const authUser = authUsers?.users?.find(u => u.email === email)

    if (!authUser) {
      return NextResponse.json({ 
        error: `No auth user found with email: ${email}. Please sign up first at /signup, then run bootstrap.` 
      }, { status: 404 })
    }

    // Check if they already have an app profile
    const { data: existingProfile } = await adminClient
      .from('users')
      .select('id, role')
      .eq('auth_user_id', authUser.id)
      .single()

    if (existingProfile) {
      // Upgrade to counselor
      await adminClient.from('users').update({ role: 'COUNSELOR', status: 'ACTIVE' }).eq('id', existingProfile.id)
      await adminClient.from('counselor_profiles').upsert({ user_id: existingProfile.id, designation: 'Lead Counselor', can_manage_assessments: true }, { onConflict: 'user_id' })
      
      return NextResponse.json({ 
        success: true, 
        message: `Account ${email} upgraded to COUNSELOR. You can now log in and access the counselor dashboard.` 
      })
    }

    // Create the counselor profile from scratch
    const { data: newUser, error: createError } = await adminClient.from('users').insert({
      auth_user_id: authUser.id,
      full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Lead Counselor',
      email: authUser.email!,
      role: 'COUNSELOR',
      status: 'ACTIVE',
    }).select().single()

    if (createError || !newUser) {
      return NextResponse.json({ error: 'Failed to create counselor profile' }, { status: 500 })
    }

    await adminClient.from('counselor_profiles').insert({
      user_id: newUser.id,
      designation: 'Lead Counselor',
      can_manage_assessments: true,
    })

    await adminClient.from('audit_logs').insert({
      actor_user_id: newUser.id,
      action: 'BOOTSTRAP_COUNSELOR',
      entity_type: 'users',
      entity_id: newUser.id,
    })

    return NextResponse.json({ 
      success: true, 
      message: `Bootstrap complete. ${email} is now an active COUNSELOR. Log in at /login.` 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    info: 'POST to this endpoint with { "email": "your@email.com", "secret": "BOOTSTRAP_SECRET" } to initialize the first counselor account.' 
  })
}
