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
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/auth/callback', '/pending-approval', '/waiting-room', '/student/fresher']
  const isPublicRoute = pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))

  // If not authenticated
  if (!user) {
    if (isPublicRoute) return supabaseResponse
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If authenticated but on public auth route (not landing or pending), redirect to appropriate dashboard
  if (isPublicRoute && pathname !== '/' && pathname !== '/pending-approval' && !pathname.startsWith('/student/fresher')) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, status')
      .eq('auth_user_id', user.id)
      .single()

    if (profile) {
      if (profile.status === 'PENDING') {
        const url = request.nextUrl.clone()
        url.pathname = '/pending-approval'
        return NextResponse.redirect(url)
      }
      const url = request.nextUrl.clone()
      url.pathname = getDashboardPath(profile.role)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Role-based route protection
  if (!isPublicRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, status')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      // User authenticated but no profile yet (new user)
      if (!pathname.startsWith('/onboarding')) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    if (profile.status === 'PENDING') {
      if (!pathname.startsWith('/pending-approval')) {
        const url = request.nextUrl.clone()
        url.pathname = '/pending-approval'
        return NextResponse.redirect(url)
      }
      return supabaseResponse
    }

    if (profile.status === 'SUSPENDED' || profile.status === 'INACTIVE') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'account_suspended')
      return NextResponse.redirect(url)
    }

    // Enforce role-based routing
    if (pathname.startsWith('/student') && profile.role !== 'STUDENT') {
      const url = request.nextUrl.clone()
      url.pathname = getDashboardPath(profile.role)
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/mentor') && !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) {
      const url = request.nextUrl.clone()
      url.pathname = getDashboardPath(profile.role)
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/admin') && !['ADMIN', 'DEAN_HOD'].includes(profile.role)) {
      const url = request.nextUrl.clone()
      url.pathname = getDashboardPath(profile.role)
      return NextResponse.redirect(url)
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
