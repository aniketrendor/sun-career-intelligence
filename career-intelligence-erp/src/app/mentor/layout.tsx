import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'

const navItems = [
  { label: 'Mentor Dashboard', href: '/mentor/dashboard' },
  { label: 'Advisee Profiles', href: '/mentor/students' },
  { label: 'Available Slots & Scheduling', href: '/mentor/availability' },
  { label: 'Guidance Sessions', href: '/mentor/sessions' },
  { label: 'Diagnostic Evaluations', href: '/mentor/evaluations' },
  { label: 'Programs & Syllabi', href: '/mentor/programs' },
  { label: 'My Faculty Profile', href: '/mentor/profile' },
]

export default async function CounselorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')
  if (profile.status !== 'ACTIVE') redirect('/login')

  // Unread notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', profile.id)
    .eq('is_read', false)

  return (
    <AppShell
      navItems={navItems}
      userRole={profile.role}
      userName={profile.full_name}
      userEmail={profile.email}
      unreadCount={notifications?.length || 0}
    >
      {children}
    </AppShell>
  )
}
