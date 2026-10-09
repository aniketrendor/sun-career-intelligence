import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/app-shell'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Manage Users', href: '/admin/users' },
  { label: 'Mentors', href: '/admin/mentors' },
  { label: 'Student Assignments', href: '/admin/assignments' },
  { label: 'Programs', href: '/admin/programs' },
  { label: 'Referral Codes', href: '/admin/referral-codes' },
  { label: 'Students', href: '/admin/students' },
  { label: 'Analytics', href: '/admin/analytics' },
]

export default async function DeanLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')
  if (profile.status === 'PENDING') redirect('/pending-approval')
  if (profile.status !== 'ACTIVE') redirect('/login')

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
