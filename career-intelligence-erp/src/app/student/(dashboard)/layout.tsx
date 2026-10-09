import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'

const navItems = [
  { label: 'Dashboard', href: '/student/dashboard' },
  { label: 'My Assessment & History', href: '/student/assessment' },
  { label: 'Domain Suggestions', href: '/student/domain-suggestions' },
  { label: 'Mentor Guidance', href: '/student/counselor' },
  { label: 'My Profile', href: '/student/profile' },
]

export default async function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let profile: any = null
  try {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', user.id)
      .maybeSingle()
    profile = data
  } catch (e) {
    console.error('Error fetching user profile in student layout:', e)
  }

  // Fallback profile if record not yet synchronized
  const activeProfile = profile || {
    id: user.id,
    role: 'STUDENT',
    status: 'ACTIVE',
    full_name: (user.user_metadata as any)?.full_name || user.email?.split('@')[0] || 'Student',
    email: user.email || '',
  }

  if (activeProfile.role !== 'STUDENT' && profile) redirect('/login')
  if (activeProfile.status !== 'ACTIVE') redirect('/pending-approval')

  let unreadCount = 0
  try {
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', activeProfile.id)
      .eq('is_read', false)
    unreadCount = notifications?.length || 0
  } catch {
    // Non-critical
  }

  return (
    <AppShell
      navItems={navItems}
      userRole={activeProfile.role}
      userName={activeProfile.full_name}
      userEmail={activeProfile.email}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  )
}
