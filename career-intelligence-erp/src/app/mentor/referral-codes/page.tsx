import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  QrCode, Users, CheckCircle2, Clock,
  ArrowRight, ShieldCheck, Copy, Sparkles, KeyRound
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateReferralCodeModal } from '@/components/dean/create-referral-code-modal'
import { ReferralCodesTable } from '@/components/dean/referral-codes-table'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function MentorReferralCodesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role, full_name')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['MENTOR', 'COUNSELOR', 'ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  const [
    { data: programs },
    { data: classes },
    { data: referralCodes },
    { data: fresherLeadsCount },
  ] = await Promise.all([
    supabase.from('programs').select('id, name, code').order('name', { ascending: true }),
    supabase.from('classes').select('id, program_id, name, code, semester').order('name', { ascending: true }),
    supabase.from('referral_codes').select(`
      *,
      program:programs(name, code),
      class:classes(name, semester),
      creator:users!created_by(full_name)
    `).order('created_at', { ascending: false }),
    supabase.from('fresher_leads').select('id', { count: 'exact' }).eq('assigned_mentor_id', profile.id),
  ])

  const myMentorKeys = referralCodes?.filter(rc => rc.created_by === profile.id || rc.code.startsWith('SUN-FRESHER-')) || []
  const allOtherKeys = referralCodes?.filter(rc => rc.created_by !== profile.id && !rc.code.startsWith('SUN-FRESHER-')) || []

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A36B40] bg-[#FAF6F0] px-3 py-1 rounded-full border border-[#A36B40]/30">
              <Sparkles className="w-3.5 h-3.5" /> Mentor Referral System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Mentor Fresher Keys & Referral Codes
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1 leading-relaxed">
            Generate and share your personalized <code className="font-bold text-[#A36B40] font-mono">sun-fresher-[mentorcode]</code> key. When aspiring freshers complete their diagnostic test using your key, they are instantly linked to your advisory caseload.
          </p>
        </div>

        <CreateReferralCodeModal
          programs={programs || []}
          classes={classes || []}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">My Referral Keys</span>
              <div className="w-8 h-8 rounded-xl bg-[#F9F4F0] text-[#C6A18D] flex items-center justify-center border border-[#C6A18D]/40">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#2C2621]">{myMentorKeys.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Fresher Leads via My Keys</span>
              <div className="w-8 h-8 rounded-xl bg-[#F7EFEA] text-[#A36B40] flex items-center justify-center border border-[#A36B40]/30">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#A36B40]">{fresherLeadsCount?.length || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Batch Capacity Quota</span>
              <div className="w-8 h-8 rounded-xl bg-[#F1F1EB] text-[#77734B] flex items-center justify-center border border-[#77734B]/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#77734B]">20 / Batch</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm">
        <CardHeader className="pb-3 border-b border-[#DFD7CB]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-[#2C2621]">All Institutional & Mentor Referral Keys</CardTitle>
              <CardDescription className="text-xs text-[#7A7067]">
                Copy any active key to share with students or aspiring fresher candidates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ReferralCodesTable referralCodes={referralCodes || []} />
        </CardContent>
      </Card>
    </div>
  )
}
