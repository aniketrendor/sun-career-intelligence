import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClipboardList, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DeanApprovalsTable } from '@/components/counselor/dean-approvals-table'

export const dynamic = 'force-dynamic'

export default async function CounselorApprovalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Fetch pending DEAN_HOD users with their profile data
  const { data: pendingUsers } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      phone,
      created_at,
      status,
      dean_hod_profile:dean_hod_profiles(
        designation,
        institution_id,
        department_id
      )
    `)
    .eq('role', 'DEAN_HOD')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Badge className="bg-amber-50 text-amber-800 border-amber-200 mb-2 gap-1">
          <ClipboardList className="w-3.5 h-3.5" /> Access Control
        </Badge>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pending Dean & HOD Approvals</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review institutional leadership registration requests and authorize dashboard permissions.
        </p>
      </div>

      <DeanApprovalsTable pendingUsers={pendingUsers || []} />
    </div>
  )
}
