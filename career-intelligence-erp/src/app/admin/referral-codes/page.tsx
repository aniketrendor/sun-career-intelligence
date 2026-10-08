import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  KeyRound, GraduationCap, ShieldCheck, Sparkles, Users, RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateReferralCodeModal } from '@/components/dean/create-referral-code-modal'
import { ReferralCodesTable } from '@/components/dean/referral-codes-table'

export const dynamic = 'force-dynamic'

export default async function AdminReferralCodesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('id, role')
    .eq('auth_user_id', user.id)
    .single()

  if (!profile || !['ADMIN', 'DEAN_HOD'].includes(profile.role)) redirect('/login')

  // Fetch programs and classes for creation modal
  const [
    { data: programs },
    { data: classes },
    { data: referralCodes },
  ] = await Promise.all([
    supabase.from('programs').select('id, name, code').order('name', { ascending: true }),
    supabase.from('classes').select('id, program_id, name, code, semester').order('name', { ascending: true }),
    supabase.from('referral_codes').select(`
      *,
      program:programs(name, code),
      class:classes(name, semester)
    `).order('created_at', { ascending: false }),
  ])

  const totalKeys = referralCodes?.length || 0
  const studentKeys = referralCodes?.filter(c => c.key_type === 'STUDENT_LOGIN').length || 0
  const mentorKeys = referralCodes?.filter(c => c.key_type === 'MENTOR_LOGIN').length || 0
  const fresherKeys = referralCodes?.filter(c => !c.key_type || c.key_type === 'FRESHER_REFERRAL').length || 0

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A36B40] bg-[#FAF6F0] px-3 py-1 rounded-full border border-[#A36B40]/30">
              <KeyRound className="w-3.5 h-3.5" /> Institutional Access Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Access Keys & Waiting Room Approvals
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1 leading-relaxed">
            Create Student Login Keys, Mentor Login Keys, and Fresher Referral Keys. Each key allows 20 users with automated seamless quota renewal.
          </p>
        </div>

        <CreateReferralCodeModal
          programs={programs || []}
          classes={classes || []}
        />
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Total Keys Issued</span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#2C2621] flex items-center justify-center border border-[#DFD7CB]">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#2C2621]">{totalKeys}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Student Login Keys</span>
              <div className="w-8 h-8 rounded-xl bg-[#F7EFEA] text-[#A36B40] flex items-center justify-center border border-[#A36B40]/30">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#A36B40]">{studentKeys}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Mentor Login Keys</span>
              <div className="w-8 h-8 rounded-xl bg-[#F1F1EB] text-[#77734B] flex items-center justify-center border border-[#77734B]/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#77734B]">{mentorKeys}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">Fresher Referral Keys</span>
              <div className="w-8 h-8 rounded-xl bg-[#F9F4F0] text-[#C6A18D] flex items-center justify-center border border-[#C6A18D]/40">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#C6A18D]">{fresherKeys}</p>
          </CardContent>
        </Card>
      </div>

      {/* Codes Table Card */}
      <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm">
        <CardHeader className="pb-3 border-b border-[#DFD7CB]">
          <CardTitle className="text-base font-bold text-[#2C2621]">Issued Access Keys Directory</CardTitle>
          <CardDescription className="text-xs text-[#7A7067]">
            Copy keys to share with cohorts, review real-time usage quotas, or refresh batch limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ReferralCodesTable referralCodes={referralCodes || []} />
        </CardContent>
      </Card>
    </div>
  )
}
