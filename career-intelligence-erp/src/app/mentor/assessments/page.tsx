import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, Layers, CheckCircle2, Clock, ShieldCheck,
  Plus, Eye, Users, ArrowRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CounselorAssessmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Fetch assessment templates and versions
  const { data: templates } = await supabase
    .from('assessment_templates')
    .select(`
      *,
      versions:assessment_versions(
        id,
        version_number,
        status,
        created_at,
        time_limit_minutes,
        is_resumable
      )
    `)
    .order('created_at', { ascending: false })

  // Total completed attempts count
  const { count: completedAttempts } = await supabase
    .from('assessment_attempts')
    .select('id', { count: 'exact' })
    .eq('status', 'COMPLETED')

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
      {/* Header */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge className="bg-[#FAF6F0] text-[#A36B40] border-[#DFD7CB] mb-2 gap-1.5 font-bold text-xs px-3 py-1">
            <BookOpen className="w-3.5 h-3.5" /> Assessment Framework
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">Assessment Templates & Versions</h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1">
            Manage psychometric and career assessment batteries, section weights, and active student delivery versions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3.5 py-1.5 text-xs font-bold border-[#DFD7CB] bg-[#FAF6F0] text-[#2C2621] rounded-xl">
            {completedAttempts || 0} Total Submissions
          </Badge>
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-6">
        {(templates || []).map((template: any) => (
          <Card key={template.id} className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm overflow-hidden">
            <CardHeader className="bg-[#FAF6F0]/60 border-b border-[#DFD7CB] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold text-[#2C2621]">{template.name}</CardTitle>
                    <Badge variant="outline" className="text-xs font-semibold bg-white text-[#A36B40] border-[#DFD7CB]">
                      {template.assessment_type || 'Psychometric'}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-[#7A7067] mt-1">
                    {template.description || 'Comprehensive multi-factor career intelligence assessment battery.'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <h4 className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider mb-3">
                Released Versions ({template.versions?.length || 0})
              </h4>
              <div className="divide-y divide-[#DFD7CB]/60">
                {(template.versions || []).map((ver: any) => (
                  <div key={ver.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-[#2C2621]">Version {ver.version_number}</span>
                      <Badge className={ver.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-semibold' : 'bg-[#FAF6F0] text-[#7A7067] border-[#DFD7CB] text-xs'}>
                        {ver.status}
                      </Badge>
                      <span className="text-xs text-[#8C8276]">Created {formatDate(ver.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#7A7067]">
                      <span className="font-medium">{ver.time_limit_minutes ? `${ver.time_limit_minutes} min limit` : 'Untimed'}</span>
                      <span className="font-medium">{ver.is_resumable ? 'Resumable' : 'Single-session'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
