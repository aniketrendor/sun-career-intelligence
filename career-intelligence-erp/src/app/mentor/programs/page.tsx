import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, Building2, Users, ArrowRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MentorProgramDirectoryViewer } from '@/components/mentor/mentor-program-directory-viewer'

export const dynamic = 'force-dynamic'

export default async function MentorProgramsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Query real programs directly from database (zero mock data)
  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .order('code', { ascending: true })

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-2xl space-y-1.5">
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] gap-1.5 font-bold text-xs px-3 py-1">
            <Building2 className="w-3.5 h-3.5" /> University Academic Registry
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Program Directory & Approved Syllabi
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] leading-relaxed">
            Access official university approved semester-wise and full curriculum PDFs across all {programs?.length || 114} degree programmes to advise students on course selection, credits, and prerequisites.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Link href="/mentor/students">
            <Button
              size="sm"
              className="h-10 px-4 text-xs font-bold rounded-2xl bg-[#A36B40] hover:bg-[#8E5B33] text-white shadow-md shadow-[#A36B40]/25 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" /> View My Advisees
            </Button>
          </Link>
        </div>
      </div>

      {/* Database-driven Program Directory Viewer with Google Drive PDF Previews */}
      <MentorProgramDirectoryViewer programs={programs || []} />
    </div>
  )
}
