import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  KeyRound, ShieldCheck, Users, Sparkles, CheckCircle2, Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

  // Fetch programs and referral codes
  const [
    { data: programs },
    { data: referralCodes },
  ] = await Promise.all([
    supabase.from('programs').select('id, name, code').order('name', { ascending: true }),
    supabase.from('referral_codes').select(`
      *,
      program:programs(name, code),
      class:classes(name, semester)
    `).order('created_at', { ascending: false }),
  ])

  const allCodes = referralCodes || []
  const mentorCodes = allCodes.filter((c) => c.key_type === 'MENTOR_LOGIN')
  const activeMentorCodes = mentorCodes.filter(
    (c) => c.status === 'ACTIVE' && (c.usage_count || 0) < (c.max_uses || 20)
  )
  const fullMentorCodes = mentorCodes.filter(
    (c) => c.status === 'FULL' || (c.usage_count || 0) >= (c.max_uses || 20)
  )

  const mentorsOnboarded = mentorCodes.reduce((sum, c) => sum + (c.usage_count || 0), 0)
  const availableSlots = activeMentorCodes.reduce(
    (sum, c) => sum + Math.max(0, (c.max_uses || 20) - (c.usage_count || 0)),
    0
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-[#DFD7CB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#77734B] bg-[#F1F1EB] px-3 py-1 rounded-full border border-[#77734B]/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Institutional Mentor Access Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C2621] tracking-tight">
            Mentor Access Keys
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7067] mt-1 leading-relaxed">
            Generate single-cohort mentor onboarding keys. Each key permits registration for exactly 20 mentors. When a key reaches capacity, issue a separate key for additional mentors.
          </p>
        </div>

        <CreateReferralCodeModal
          programs={programs || []}
        />
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">
                Total Mentor Keys
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#2C2621] flex items-center justify-center border border-[#DFD7CB]">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#2C2621]">{mentorCodes.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">
                Active Keys (&lt; 20)
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#F1F1EB] text-[#77734B] flex items-center justify-center border border-[#77734B]/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#77734B]">{activeMentorCodes.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">
                Mentors Onboarded
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#F7EFEA] text-[#A36B40] flex items-center justify-center border border-[#A36B40]/30">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#A36B40]">{mentorsOnboarded}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#DFD7CB] rounded-2xl">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#7A7067] uppercase tracking-wider">
                Available Slots
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] text-[#77734B] flex items-center justify-center border border-[#DFD7CB]">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#77734B]">{availableSlots}</p>
          </CardContent>
        </Card>
      </div>

      {/* Directory Table Card */}
      <Card className="bg-white border-[#DFD7CB] rounded-3xl shadow-sm">
        <CardHeader className="pb-3 border-b border-[#DFD7CB]">
          <CardTitle className="text-base font-bold text-[#2C2621]">
            Mentor Access Keys Directory
          </CardTitle>
          <CardDescription className="text-xs text-[#7A7067]">
            Copy keys to share with faculty mentors and monitor real-time registration capacity towards the 20-mentor quota.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ReferralCodesTable referralCodes={allCodes} />
        </CardContent>
      </Card>
    </div>
  )
}
