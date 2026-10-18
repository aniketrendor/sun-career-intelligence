'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  KeyRound, X, ShieldCheck, Sparkles, Building2,
  Calendar, FileText, CheckCircle2, Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createAccessKey } from '@/lib/actions/key.actions'

interface CreateReferralCodeModalProps {
  programs: Array<{ id: string; name: string; code: string }>
  classes?: Array<{ id: string; program_id: string; name: string; code: string; semester: number }>
}

export function CreateReferralCodeModal({ programs }: CreateReferralCodeModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [mentorTag, setMentorTag] = useState('')
  const [selectedProgramId, setSelectedProgramId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')

  const previewToken = mentorTag.trim()
    ? `SUN-MNT-${mentorTag.trim().toUpperCase()}`
    : 'SUN-MNT-[AUTO-5-CHARS]'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const res = await createAccessKey({
        keyType: 'MENTOR_LOGIN',
        programId: selectedProgramId || undefined,
        mentorCode: mentorTag.trim() || undefined,
        maxUses: 20,
        autoRefresh: false,
        expiresAt: expiresAt || undefined,
        notes: notes || undefined,
      })

      if (res.success) {
        toast.success(`Mentor Access Key generated! (${res.data?.code}) — Capacity: 20 Mentors`)
        setIsOpen(false)
        setMentorTag('')
        setSelectedProgramId('')
        setExpiresAt('')
        setNotes('')
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to generate mentor access key.')
      }
    })
  }

  return (
    <div>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="h-10 px-5 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#A36B40]/25 transition-all flex items-center gap-2 cursor-pointer"
        >
          <KeyRound className="w-4 h-4" /> Issue Mentor Access Key
        </Button>
      ) : (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in-50 zoom-in-95 font-sans">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#DFD7CB] flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F1F1EB] border border-[#77734B]/30 text-[#77734B] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#2C2621] text-base">
                    Issue Mentor Access Key
                  </h3>
                  <p className="text-xs text-[#7A7067]">
                    Single-cohort key strictly capped at 20 mentor registrations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1.5 rounded-xl hover:bg-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto dark-scroll">
              {/* Policy Notice Box */}
              <div className="bg-[#F1F1EB] border border-[#77734B]/30 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-[#77734B]">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Strict 20-Mentor Quota per Key
                  </span>
                </div>
                <p className="text-xs text-[#2C2621]/80 leading-relaxed">
                  Each key permits exactly <strong>20 mentor registrations</strong>. Once 20 mentors register, the key is closed permanently. For subsequent mentors, generate a separate key.
                </p>
              </div>

              {/* Key Code Token / Suffix */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Key Identifier / Custom Suffix (Optional)
                  </label>
                  <span className="text-[10px] text-[#7A7067]">Prefix: SUN-MNT-</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2 bg-[#FAF6F0] border border-[#DFD7CB] text-[#2C2621] font-mono text-xs font-bold rounded-xl select-none">
                    SUN-MNT-
                  </span>
                  <Input
                    value={mentorTag}
                    onChange={(e) => setMentorTag(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    placeholder="e.g. ENG2026 or ADVISORY"
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs font-mono rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-[#7A7067]">Key Preview:</span>
                  <span className="font-mono font-bold text-xs text-[#A36B40] bg-[#FAF6F0] px-2.5 py-0.5 rounded-lg border border-[#A36B40]/20">
                    {previewToken}
                  </span>
                </div>
              </div>

              {/* Fixed Quota Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#77734B]" />
                    Registration Capacity
                  </label>
                  <div className="h-9 px-3 bg-[#F1F1EB] border border-[#77734B]/30 rounded-xl flex items-center justify-between text-xs font-bold text-[#2C2621]">
                    <span>20 Mentors</span>
                    <Badge className="bg-[#77734B] text-white border-none text-[10px] px-1.5 py-0">
                      Fixed Limit
                    </Badge>
                  </div>
                  <span className="text-[10px] text-[#7A7067] block">
                    Capped at 20. Separate key required for next 20.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#7A7067]" />
                    Expiration Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                  <span className="text-[10px] text-[#7A7067] block">
                    Leave blank for no expiration date
                  </span>
                </div>
              </div>

              {/* Department / Program Affiliation (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#7A7067]" />
                  Department / School Affiliation (Optional)
                </label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[#DFD7CB] bg-[#FAF6F0] px-3 py-1 text-xs text-[#2C2621] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                >
                  <option value="">-- Universal Institutional Access (All Departments) --</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Internal Batch Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#7A7067]" />
                  Batch Label / Notes
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Q1 2026 Engineering Advisory Board"
                  className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#DFD7CB]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="border-[#DFD7CB] text-[#7A7067] hover:text-[#2C2621] rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="gap-1.5 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-bold text-xs rounded-xl shadow-md shadow-[#A36B40]/25 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isPending ? 'Generating...' : 'Issue Key (20 Mentors Max)'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
