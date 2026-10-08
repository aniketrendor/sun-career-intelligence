import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ManageUsersClient, ManagedUser } from '@/components/dean/manage-users-client'

export const dynamic = 'force-dynamic'

export default async function DeanUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Fetch all users with explicitly disambiguated foreign key relationships
  const { data: usersData, error } = await supabase
    .from('users')
    .select(`
      id,
      auth_user_id,
      full_name,
      email,
      phone,
      avatar_url,
      role,
      status,
      created_at,
      student_profiles:student_profiles!student_profiles_user_id_fkey(prn, current_program),
      counselor_profiles:counselor_profiles!counselor_profiles_user_id_fkey(employee_id, designation),
      dean_hod_profiles:dean_hod_profiles!dean_hod_profiles_user_id_fkey(employee_id, designation)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users for admin management:', error)
  }

  const users: ManagedUser[] = (usersData || []).map((u: any) => ({
    id: u.id,
    auth_user_id: u.auth_user_id,
    full_name: u.full_name || '',
    email: u.email || '',
    phone: u.phone,
    avatar_url: u.avatar_url,
    role: u.role,
    status: u.status,
    created_at: u.created_at,
    student_profile: Array.isArray(u.student_profiles) ? u.student_profiles[0] : u.student_profiles,
    counselor_profile: Array.isArray(u.counselor_profiles) ? u.counselor_profiles[0] : u.counselor_profiles,
    dean_profile: Array.isArray(u.dean_hod_profiles) ? u.dean_hod_profiles[0] : u.dean_hod_profiles,
  }))

  return <ManageUsersClient initialUsers={users} currentUserId={profile.id} />
}
