'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Copy, Check, Power, PowerOff, KeyRound,
  ShieldCheck, Sparkles, GraduationCap, Lock, Users, AlertCircle
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { toggleReferralCode } from '@/lib/actions/counselor.actions'

interface ReferralCodesTableProps {
  referralCodes: any[]
}

type FilterMode = 'ALL_MENTOR' | 'ACTIVE_MENTOR' | 'FULL_MENTOR' | 'LEGACY'

export function ReferralCodesTable({ referralCodes }: ReferralCodesTableProps) {
  const router = useRouter()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterMode>('ALL_MENTOR')
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

  const mentorCodes = referralCodes.filter((rc) => rc.key_type === 'MENTOR_LOGIN')
  const legacyCodes = referralCodes.filter((rc) => rc.key_type !== 'MENTOR_LOGIN')

  const activeMentorCodes = mentorCodes.filter(
    (rc) => rc.status === 'ACTIVE' && (rc.usage_count || 0) < (rc.max_uses || 20)
  )
  const fullMentorCodes = mentorCodes.filter(
    (rc) => rc.status === 'FULL' || (rc.usage_count || 0) >= (rc.max_uses || 20)
  )

  const filteredCodes = (() => {
    switch (activeFilter) {
      case 'ACTIVE_MENTOR':
        return activeMentorCodes
      case 'FULL_MENTOR':
        return fullMentorCodes
      case 'LEGACY':
        return legacyCodes
      case 'ALL_MENTOR':
      default:
        // If there are mentor codes, show mentor codes. If none yet, fallback to all.
        return mentorCodes.length > 0 ? mentorCodes : referralCodes
    }
  })()

  if (referralCodes.length === 0) {
    return (
      <div className="text-center py-16 text-[#7A7067] bg-[#FAF6F0] border border-[#DFD7CB] rounded-3xl space-y-3 font-sans">
        <KeyRound className="w-12 h-12 mx-auto text-[#A36B40]/40" />
        <div className="space-y-1">
          <p className="font-bold text-[#2C2621] text-base">No Mentor Access Keys created yet</p>
          <p className="text-xs text-[#7A7067]">
            Click &quot;Issue Mentor Access Key&quot; above to create a key for your first batch of 20 mentors.
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
            onClick={() => setActiveFilter('ALL_MENTOR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'ALL_MENTOR'
                ? 'bg-[#77734B] text-white shadow-xs'
                : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            All Mentor Keys ({mentorCodes.length})
          </button>

          <button
            onClick={() => setActiveFilter('ACTIVE_MENTOR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'ACTIVE_MENTOR'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Active Slots Available ({activeMentorCodes.length})
          </button>

          <button
            onClick={() => setActiveFilter('FULL_MENTOR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'FULL_MENTOR'
                ? 'bg-[#A36B40] text-white shadow-xs'
                : 'bg-[#FAF6F0] text-[#7A7067] hover:text-[#2C2621] border border-[#DFD7CB]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Capacity Full (20/20) ({fullMentorCodes.length})
          </button>

          {legacyCodes.length > 0 && (
            <button
              onClick={() => setActiveFilter('LEGACY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer text-[#8C8276] hover:text-[#2C2621] border border-[#DFD7CB]/60 ${
                activeFilter === 'LEGACY'
                  ? 'bg-stone-700 text-white shadow-xs'
                  : 'bg-white'
              }`}
            >
              Legacy Keys ({legacyCodes.length})
            </button>
          )}
        </div>

        <span className="text-xs text-[#7A7067]">
          Showing {filteredCodes.length} {filteredCodes.length === 1 ? 'key' : 'keys'}
        </span>
      </div>

      {/* Keys List */}
      <div className="divide-y divide-[#DFD7CB] bg-white border border-[#DFD7CB] rounded-3xl overflow-hidden shadow-xs">
        {filteredCodes.map((rc) => {
          const isCopied = copiedId === rc.id
          const isMentorKey = rc.key_type === 'MENTOR_LOGIN'
          const maxUses = rc.max_uses || 20
          const usageCount = rc.usage_count || 0
          const isFull = rc.status === 'FULL' || usageCount >= maxUses
          const percentage = Math.min(Math.round((usageCount / maxUses) * 100), 100)
          const remainingSlots = Math.max(0, maxUses - usageCount)

          return (
            <div
              key={rc.id}
              className={`p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                isFull ? 'bg-[#FAF6F0]/60' : 'hover:bg-[#FAF6F0]/40'
              }`}
            >
              {/* Left Column: Code, Type Badge, Department Info */}
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
                  {isMentorKey ? (
                    <Badge className="bg-[#F1F1EB] text-[#77734B] border-[#77734B]/30 text-[11px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Mentor Access Key
                    </Badge>
                  ) : rc.key_type === 'STUDENT_LOGIN' ? (
                    <Badge className="bg-[#F7EFEA] text-[#A36B40] border-[#A36B40]/30 text-[11px] font-semibold flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> Student Login Key
                    </Badge>
                  ) : (
                    <Badge className="bg-stone-100 text-stone-600 border-stone-300 text-[11px] font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Legacy Key
                    </Badge>
                  )}

                  {/* Status Badge */}
                  {isFull ? (
                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-700" /> FULL (20/20)
                    </Badge>
                  ) : rc.status === 'ACTIVE' ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
                      ACTIVE
                    </Badge>
                  ) : (
                    <Badge className="bg-stone-100 text-stone-600 border-stone-200 text-xs font-semibold">
                      {rc.status}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-[#7A7067] flex flex-wrap items-center gap-x-3 gap-y-1">
                  {rc.program?.name ? (
                    <span>
                      Affiliation: <strong className="text-[#2C2621]">{rc.program.name}</strong>
                    </span>
                  ) : (
                    <span>Scope: <strong className="text-[#2C2621]">Universal Faculty Access</strong></span>
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
                <div className="w-44 sm:w-48 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[#7A7067]">
                      {isMentorKey ? 'Mentor Registrations' : 'Usage Quota'}
                    </span>
                    <span className={isFull ? 'text-amber-800 font-extrabold' : 'text-[#2C2621]'}>
                      {usageCount} / {maxUses}
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF6F0] rounded-full h-2 overflow-hidden border border-[#DFD7CB]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull
                          ? 'bg-[#A36B40]'
                          : percentage >= 75
                          ? 'bg-[#77734B]'
                          : 'bg-[#77734B]/80'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-[10px] flex items-center justify-between pt-0.5">
                    {isFull ? (
                      <span className="text-amber-800 font-bold">
                        Key full · Create new key for next mentors
                      </span>
                    ) : (
                      <span className="text-[#77734B] font-semibold">
                        {remainingSlots} mentor {remainingSlots === 1 ? 'slot' : 'slots'} remaining
                      </span>
                    )}
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
