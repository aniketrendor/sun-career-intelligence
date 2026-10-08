import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Legacy route backwards-compatibility redirects
  if (pathname.startsWith('/dean/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/dean/', '/admin/')
    return NextResponse.redirect(url)
  }
  if (pathname === '/dean') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }
  if (pathname.startsWith('/counselor/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace('/counselor/', '/mentor/')
    return NextResponse.redirect(url)
  }
  if (pathname === '/counselor') {
    const url = request.nextUrl.clone()
    url.pathname = '/mentor/dashboard'
    return NextResponse.redirect(url)
  }

  // Auto-forward OAuth code redirects if user lands on /login instead of /auth/callback
  if (pathname === '/login' && request.nextUrl.searchParams.has('code')) {
    const callbackUrl = request.nextUrl.clone()
    callbackUrl.pathname = '/auth/callback'
    return NextResponse.redirect(callbackUrl)
  }

  // Public routes - accessible without auth
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/auth/callback', '/pending-approval', '/waiting-room', '/student/fresher/report']
  const isPublicRoute = pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))

  // If not authenticated
  if (!user) {
    if (isPublicRoute) return supabaseResponse
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated but on public auth route (not landing or pending), redirect to appropriate dashboard
  if (isPublicRoute && pathname !== '/' && pathname !== '/pending-approval' && pathname !== '/student/fresher/report') {
    let userRole = request.cookies.get('app_user_role')?.value
    let userStatus = request.cookies.get('app_user_status')?.value

    if (!userRole || !userStatus) {
      const { data: profile } = await supabase
        .from('users')
        .select('role, status')
        .eq('auth_user_id', user.id)
        .single()

      if (profile && profile.role && profile.status) {
        userRole = String(profile.role)
        userStatus = String(profile.status)
        supabaseResponse.cookies.set('app_user_role', userRole, { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
        supabaseResponse.cookies.set('app_user_status', userStatus, { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
      }
    }

    if (userRole && userStatus) {
      if (userStatus === 'PENDING') {
        const url = request.nextUrl.clone()
        url.pathname = '/pending-approval'
        return NextResponse.redirect(url)
      }
      const url = request.nextUrl.clone()
      url.pathname = getDashboardPath(userRole)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Role-based route protection
  if (!isPublicRoute) {
    let userRole = request.cookies.get('app_user_role')?.value
    let userStatus = request.cookies.get('app_user_status')?.value

    if (!userRole || !userStatus) {
      const { data: profile } = await supabase
        .from('users')
        .select('role, status')
        .eq('auth_user_id', user.id)
        .single()

      if (!profile || !profile.role || !profile.status) {
        // User authenticated but no profile yet (new user)
        if (!pathname.startsWith('/onboarding')) {
          const url = request.nextUrl.clone()
          url.pathname = '/onboarding'
          return NextResponse.redirect(url)
        }
        return supabaseResponse
      }

      userRole = String(profile.role)
      userStatus = String(profile.status)
      supabaseResponse.cookies.set('app_user_role', userRole, { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
      supabaseResponse.cookies.set('app_user_status', userStatus, { path: '/', maxAge: 60 * 60 * 24 * 7, sameSite: 'lax' })
    }

    if (userStatus === 'PENDING') {
      if (!pathname.startsWith('/pending-approval')) {
        const url = request.nextUrl.clone()
        url.pathname = '/pending-approval'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    if (userStatus === 'SUSPENDED' || userStatus === 'INACTIVE') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'account_suspended')
      return NextResponse.redirect(url)
    }

    // Enforce role-based routing
    if (userRole) {
      if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
        const url = request.nextUrl.clone()
        url.pathname = getDashboardPath(userRole)
        return NextResponse.redirect(url)
      }
      if (pathname.startsWith('/mentor') && !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(userRole)) {
        const url = request.nextUrl.clone()
        url.pathname = getDashboardPath(userRole)
        return NextResponse.redirect(url)
      }
      if (pathname.startsWith('/admin') && !['ADMIN', 'DEAN_HOD'].includes(userRole)) {
        const url = request.nextUrl.clone()
        url.pathname = getDashboardPath(userRole)
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'ADMIN':
    case 'DEAN_HOD':
      return '/admin/dashboard'
    case 'MENTOR':
    case 'COUNSELOR':
      return '/mentor/dashboard'
    case 'STUDENT':
      return '/student/dashboard'
    default:
      return '/login'
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
