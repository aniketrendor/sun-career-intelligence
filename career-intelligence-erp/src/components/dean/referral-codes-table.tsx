'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Copy, Check, Power, PowerOff, RefreshCw, KeyRound,
  GraduationCap, ShieldCheck, Sparkles, Filter, Users
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { toggleReferralCode } from '@/lib/actions/counselor.actions'
import { refreshKeyQuota, KeyType } from '@/lib/actions/key.actions'

interface ReferralCodesTableProps {
  referralCodes: any[]
}

export function ReferralCodesTable({ referralCodes }: ReferralCodesTableProps) {
  const router = useRouter()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'ALL' | KeyType>('ALL')
  const [isPending, startTransition] = useTransition()

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast.success(`Copied key "${code}" to clipboard!`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleToggle = (id: string, currentStatus: string) => {
    const enable = currentStatus !== 'ACTIVE'
    startTransition(async () => {
      const res = await toggleReferralCode(id, enable)
      if (res.success) {
        toast.success(`Key ${enable ? 'activated' : 'disabled'}`)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to update key.')
      }
    })
  }

  const handleRefreshQuota = (id: string) => {
    startTransition(async () => {
      const res = await refreshKeyQuota(id)
      if (res.success) {
        toast.success('Key quota refreshed (0 / 20 students used).')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to refresh quota.')
      }
    })
  }

  const filteredCodes = referralCodes.filter((rc) => {
    if (activeFilter === 'ALL') return true
    const type = rc.key_type || 'FRESHER_REFERRAL'
    return type === activeFilter
  })

  if (referralCodes.length === 0) {
    return (
      <div className="text-center py-16 text-[#7A7067] bg-white border border-[#DFD7CB] rounded-3xl space-y-3 font-sans">
        <KeyRound className="w-12 h-12 mx-auto text-[#A36B40]/40" />
        <div className="space-y-1">
          <p className="font-bold text-[#2C2621] text-base">No Access Keys created yet</p>
          <p className="text-xs text-[#7A7067]">
            Click &quot;Generate Access Key&quot; above to create Student Login, Mentor Login, or Fresher Keys.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 font-sans">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#DFD7CB]">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-[#A36B40] text-white shadow-xs'
                : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
            }`}
          >
            All Keys ({referralCodes.length})
          </button>
          <button
            onClick={() => setActiveFilter('STUDENT_LOGIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'STUDENT_LOGIN'
                ? 'bg-[#A36B40] text-white shadow-xs'
                : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Student Login ({referralCodes.filter(c => c.key_type === 'STUDENT_LOGIN').length})
          </button>
          <button
            onClick={() => setActiveFilter('MENTOR_LOGIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'MENTOR_LOGIN'
                ? 'bg-[#77734B] text-white shadow-xs'
                : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Mentor Login ({referralCodes.filter(c => c.key_type === 'MENTOR_LOGIN').length})
          </button>
          <button
            onClick={() => setActiveFilter('FRESHER_REFERRAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'FRESHER_REFERRAL'
                ? 'bg-[#C6A18D] text-white shadow-xs'
                : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Fresher Keys ({referralCodes.filter(c => !c.key_type || c.key_type === 'FRESHER_REFERRAL').length})
          </button>
        </div>

        <span className="text-xs text-[#7A7067]">
          Showing {filteredCodes.length} of {referralCodes.length} keys
        </span>
      </div>

      {/* Keys List */}
      <div className="divide-y divide-[#DFD7CB] bg-white border border-[#DFD7CB] rounded-3xl overflow-hidden shadow-xs">
        {filteredCodes.map((rc) => {
          const isCopied = copiedId === rc.id
          const keyType: KeyType = rc.key_type || 'FRESHER_REFERRAL'
          const maxUses = rc.max_uses || 20
          const usageCount = rc.usage_count || 0
          const percentage = Math.min(Math.round((usageCount / maxUses) * 100), 100)

          return (
            <div
              key={rc.id}
              className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAF6F0]/40 transition-colors"
            >
              {/* Left Column: Code, Type Badge, Program Info */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => handleCopy(rc.code, rc.id)}
                    className="flex items-center gap-2 font-mono font-extrabold text-sm sm:text-base bg-[#FAF6F0] hover:bg-[#F2EAE0] text-[#2C2621] px-3.5 py-1.5 rounded-xl border border-[#DFD7CB] transition-all group cursor-pointer shadow-2xs"
                  >
                    <span>{rc.code}</span>
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#7A7067] group-hover:text-[#A36B40]" />
                    )}
                  </button>

                  {/* Key Type Badge */}
                  {keyType === 'STUDENT_LOGIN' && (
                    <Badge className="bg-[#F7EFEA] text-[#A36B40] border-[#A36B40]/30 text-[11px] font-semibold flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> Student Login Key
                    </Badge>
                  )}
                  {keyType === 'MENTOR_LOGIN' && (
                    <Badge className="bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 text-[11px] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Mentor Login Key
                    </Badge>
                  )}
                  {keyType === 'FRESHER_REFERRAL' && (
                    <Badge className="bg-[#F9F4F0] text-[#C6A18D] border-[#C6A18D]/40 text-[11px] font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Fresher Key
                    </Badge>
                  )}

                  {/* Status Badge */}
                  <Badge
                    className={
                      rc.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold'
                        : 'bg-stone-100 text-stone-600 border-stone-200 text-xs font-semibold'
                    }
                  >
                    {rc.status}
                  </Badge>

                  {rc.auto_refresh && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#77734B] bg-[#F1F1EB] px-2 py-0.5 rounded-md border border-[#77734B]/20">
                      <RefreshCw className="w-2.5 h-2.5" /> Auto-Renew (20 Quota)
                    </span>
                  )}
                </div>

                <div className="text-xs text-[#7A7067] flex flex-wrap items-center gap-x-3 gap-y-1">
                  {rc.program?.name ? (
                    <span>
                      Program: <strong className="text-[#2C2621]">{rc.program.name}</strong>
                      {rc.class?.name ? ` · Cohort: ${rc.class.name}` : ''}
                    </span>
                  ) : (
                    <span>Scope: <strong className="text-[#2C2621]">Universal Institutional Access</strong></span>
                  )}

                  {rc.notes && (
                    <span className="text-[#8C8276] italic">
                      — &quot;{rc.notes}&quot;
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Quota Progress, Expiration & Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs shrink-0">
                {/* Progress Bar & Counter */}
                <div className="w-36 sm:w-40 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[#7A7067]">Quota Usage</span>
                    <span className="text-[#2C2621]">
                      {usageCount} / {maxUses}
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF6F0] rounded-full h-2 overflow-hidden border border-[#DFD7CB]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        percentage >= 100
                          ? 'bg-emerald-600'
                          : percentage >= 75
                          ? 'bg-[#A36B40]'
                          : 'bg-[#77734B]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Expiration */}
                <div className="text-[11px] text-[#7A7067]">
                  <span className="block text-[#8C8276] text-[10px] uppercase font-bold">Expires</span>
                  <span className="font-medium text-[#2C2621]">
                    {rc.expires_at ? formatDate(rc.expires_at) : 'Never'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    title="Reset usage counter to 0"
                    disabled={isPending}
                    onClick={() => handleRefreshQuota(rc.id)}
                    className="h-8 px-2.5 border-[#DFD7CB] bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] hover:bg-[#F2EAE0] rounded-xl text-xs gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-[#77734B]" />
                    <span className="hidden sm:inline">Refresh Quota</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleToggle(rc.id, rc.status)}
                    className={`h-8 px-3 text-xs rounded-xl gap-1 cursor-pointer ${
                      rc.status === 'ACTIVE'
                        ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                        : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {rc.status === 'ACTIVE' ? (
                      <>
                        <PowerOff className="w-3 h-3" /> Disable
                      </>
                    ) : (
                      <>
                        <Power className="w-3 h-3" /> Enable
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
