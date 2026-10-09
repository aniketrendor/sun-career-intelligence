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

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || profile.role !== 'STUDENT') redirect('/login')
  if (profile.status !== 'ACTIVE') redirect('/pending-approval')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', profile.id)
    .eq('is_read', false)

  const unreadCount = notifications?.length || 0

  return (
    <AppShell
      navItems={navItems}
      userRole={profile.role}
      userName={profile.full_name}
      userEmail={profile.email}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  )
}
