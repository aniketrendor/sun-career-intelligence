import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'

const navItems = [
  { label: 'Mentor Dashboard', href: '/mentor/dashboard' },
  { label: 'Referral Codes & Freshers', href: '/mentor/referral-codes' },
  { label: 'Advisee Profiles', href: '/mentor/students' },
  { label: 'Assessments & Reports', href: '/mentor/assessments' },
  { label: 'Degree Programs', href: '/mentor/programs' },
  { label: 'Department Analytics', href: '/mentor/analytics' },
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
