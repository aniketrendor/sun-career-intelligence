import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, Sparkles, Plus, GraduationCap } from 'lucide-react'
import { AdminProgramsCatalog } from '@/components/admin/admin-programs-catalog'

export const dynamic = 'force-dynamic'

export default async function AdminSyllabusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Fetch all master programs from database
  const { data: dbPrograms } = await supabase
    .from('programs')
    .select('*')
    .order('code', { ascending: true })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A36B40] bg-[#FAF6F0] px-3 py-1 rounded-full border border-[#DFD7CB]">
              <FileText className="w-3.5 h-3.5 text-[#A36B40]" /> University Approved Curriculum Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Program Syllabus & PDF Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1 max-w-3xl">
            Central repository for university approved semester-wise and full curriculum PDFs across all 114 academic degree programs.
          </p>
        </div>
      </div>

      {/* Interactive Catalog Component defaulted to Syllabus tab */}
      <AdminProgramsCatalog initialPrograms={dbPrograms || []} defaultTab="syllabus" />
    </div>
  )
}
