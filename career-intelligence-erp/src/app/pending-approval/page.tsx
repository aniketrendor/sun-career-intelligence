import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WaitingRoomCard } from '@/components/auth/waiting-room-card'

export const dynamic = 'force-dynamic'

export default async function PendingApprovalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, full_name, email, role, status')
    .eq('auth_user_id', user.id)
    .single()

  // If already active, route to their designated role dashboard
  if (profile && profile.status === 'ACTIVE') {
    if (profile.role === 'STUDENT') redirect('/student/dashboard')
    if (['MENTOR', 'COUNSELOR'].includes(profile.role)) redirect('/mentor/dashboard')
    if (['ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-[#E8DDD0]/40 to-transparent pointer-events-none" />
      
      <WaitingRoomCard
        userEmail={profile?.email || user.email || ''}
        userName={profile?.full_name || user.user_metadata?.full_name || 'Student / Mentor'}
        userRole={profile?.role || 'STUDENT'}
      />
    </div>
  )
}
