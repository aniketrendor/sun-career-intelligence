'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  KeyRound, X, GraduationCap, ShieldCheck, Sparkles,
  Users, RefreshCw, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createAccessKey, KeyType } from '@/lib/actions/key.actions'

interface CreateReferralCodeModalProps {
  programs: Array<{ id: string; name: string; code: string }>
  classes: Array<{ id: string; program_id: string; name: string; code: string; semester: number }>
}

export function CreateReferralCodeModal({ programs, classes }: CreateReferralCodeModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [keyType, setKeyType] = useState<KeyType>('STUDENT_LOGIN')
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id || '')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [mentorCode, setMentorCode] = useState('')
  const [maxUses, setMaxUses] = useState(20)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')

  const filteredClasses = classes.filter((c) => c.program_id === selectedProgramId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const res = await createAccessKey({
        keyType,
        programId: selectedProgramId || undefined,
        classId: selectedClassId || undefined,
        mentorCode: mentorCode.trim() || undefined,
        maxUses,
        autoRefresh,
        expiresAt: expiresAt || undefined,
        notes: notes || undefined,
      })

      if (res.success) {
        toast.success(`Access Key generated successfully! (Code: ${res.data?.code})`)
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || 'Failed to generate access key.')
      }
    })
  }

  return (
    <div>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          size="sm"
          className="h-9 px-4 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <KeyRound className="w-4 h-4" /> Generate Access Key
        </Button>
      ) : (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DFD7CB] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in-50 zoom-in-95 font-sans">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#DFD7CB] flex items-center justify-between bg-[#FAF6F0]">
              <div>
                <h3 className="font-extrabold text-[#2C2621] text-base flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#A36B40]" />
                  Generate Institutional Access Key
                </h3>
                <p className="text-xs text-[#7A7067]">
                  Issue waiting-room approval keys with 20-student auto-refresh quotas
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#7A7067] hover:text-[#2C2621] p-1.5 rounded-xl hover:bg-white cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto dark-scroll">
              {/* 1. Select Key Type (3 Options) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider block">
                  Select Key Type *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Option 1: Student Login Key */}
                  <div
                    onClick={() => {
                      setKeyType('STUDENT_LOGIN')
                      setMaxUses(20)
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      keyType === 'STUDENT_LOGIN'
                        ? 'border-[#A36B40] bg-[#FAF6F0] ring-2 ring-[#A36B40]/20 shadow-xs'
                        : 'border-[#DFD7CB] bg-white hover:bg-[#FAF6F0]/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-xl bg-[#F7EFEA] border border-[#A36B40]/30 text-[#A36B40] flex items-center justify-center mb-1.5">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#2C2621]">Student Login</h4>
                      <p className="text-[10px] text-[#7A7067] leading-tight">
                        Unlocks waiting room for students
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#A36B40] pt-2 font-mono">
                      STU-PASS-...
                    </span>
                  </div>

                  {/* Option 2: Mentor Login Key */}
                  <div
                    onClick={() => {
                      setKeyType('MENTOR_LOGIN')
                      setMaxUses(10)
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      keyType === 'MENTOR_LOGIN'
                        ? 'border-[#77734B] bg-[#F1F1EB] ring-2 ring-[#77734B]/20 shadow-xs'
                        : 'border-[#DFD7CB] bg-white hover:bg-[#FAF6F0]/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-xl bg-[#EBECE1] border border-[#77734B]/30 text-[#77734B] flex items-center justify-center mb-1.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#2C2621]">Mentor Login</h4>
                      <p className="text-[10px] text-[#7A7067] leading-tight">
                        Approves & activates mentor access
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#77734B] pt-2 font-mono">
                      MNT-PASS-...
                    </span>
                  </div>

                  {/* Option 3: Fresher Referral Key */}
                  <div
                    onClick={() => {
                      setKeyType('FRESHER_REFERRAL')
                      setMaxUses(20)
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                      keyType === 'FRESHER_REFERRAL'
                        ? 'border-[#C6A18D] bg-[#F9F4F0] ring-2 ring-[#C6A18D]/20 shadow-xs'
                        : 'border-[#DFD7CB] bg-white hover:bg-[#FAF6F0]/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="w-7 h-7 rounded-xl bg-[#F7EFEA] border border-[#C6A18D]/40 text-[#C6A18D] flex items-center justify-center mb-1.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-[#2C2621]">Fresher Key</h4>
                      <p className="text-[10px] text-[#7A7067] leading-tight">
                        Admissions & diagnostic assessment
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#C6A18D] pt-2 font-mono">
                      SUN-...
                    </span>
                  </div>
                </div>
              </div>

              {/* Mentor Code for Fresher Key */}
              {keyType === 'FRESHER_REFERRAL' && (
                <div className="bg-[#F9F4F0] p-4 rounded-2xl border border-[#C6A18D]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C6A18D]" /> Mentor Code / Identifier
                    </label>
                    <span className="text-[10px] text-[#7A7067]">
                      Format: <code className="text-[#A36B40] font-bold font-mono">sun-fresher-[mentorcode]</code>
                    </span>
                  </div>
                  <Input
                    value={mentorCode}
                    onChange={(e) => setMentorCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    placeholder="e.g. AK92 or RAJESH or SUN101"
                    className="bg-white border-[#DFD7CB] text-[#2C2621] text-xs font-mono rounded-xl focus-visible:ring-[#A36B40]"
                  />
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[#7A7067] text-[11px]">Generated Token Preview:</span>
                    <span className="font-mono font-extrabold text-[#A36B40] bg-white px-2.5 py-0.5 rounded-md border border-[#C6A18D]/40 text-xs">
                      {mentorCode.trim() ? `SUN-FRESHER-${mentorCode.trim().toUpperCase()}` : 'SUN-FRESHER-[MENTORCODE]'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A7067] leading-relaxed">
                    When freshers complete their diagnostic test using this key, their lead profile is automatically routed into this mentor's advisory queue.
                  </p>
                </div>
              )}

              {/* 2. Program & Cohort Assignment (Optional for Student Login, Optional for Fresher) */}
              {(keyType === 'STUDENT_LOGIN' || keyType === 'FRESHER_REFERRAL') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FAF6F0] p-4 rounded-2xl border border-[#DFD7CB]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                      Degree Program (Optional)
                    </label>
                    <select
                      value={selectedProgramId}
                      onChange={(e) => {
                        setSelectedProgramId(e.target.value)
                        setSelectedClassId('')
                      }}
                      className="w-full h-9 rounded-xl border border-[#DFD7CB] bg-white px-3 py-1 text-xs text-[#2C2621] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                    >
                      <option value="">-- Universal (All Programs) --</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                      Class / Cohort Section
                    </label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full h-9 rounded-xl border border-[#DFD7CB] bg-white px-3 py-1 text-xs text-[#2C2621] shadow-xs focus:outline-none focus:ring-1 focus:ring-[#A36B40] cursor-pointer"
                    >
                      <option value="">-- General Cohort --</option>
                      {filteredClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code} - Sem {c.semester})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* 3. Capacity Quota & Auto-Refresh Setting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Student Capacity Quota
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={maxUses}
                    onChange={(e) => setMaxUses(Number(e.target.value))}
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                  <span className="text-[10px] text-[#7A7067]">
                    Default is 20 students per batch key
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                    Expiration Date
                  </label>
                  <Input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="bg-[#FAF6F0] border-[#DFD7CB] text-[#2C2621] text-xs rounded-xl focus-visible:ring-[#A36B40]"
                  />
                </div>
              </div>

              {/* Auto-Refresh Toggle */}
              <div className="p-3.5 rounded-2xl border border-[#DFD7CB] bg-[#FAF6F0] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-[#77734B]" />
                    <span className="text-xs font-bold text-[#2C2621]">
                      Auto-Refresh on Quota Completion
                    </span>
                  </div>
                  <p className="text-[11px] text-[#7A7067]">
                    Automatically resets quota when {maxUses} students successfully register
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 rounded text-[#A36B40] accent-[#A36B40] cursor-pointer"
                />
              </div>

              {/* 4. Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C2621] uppercase tracking-wider">
                  Internal Batch Notes
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 2026 Batch A Onboarding Key"
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
                  className="gap-1.5 bg-[#A36B40] hover:bg-[#8E5B33] text-white font-semibold text-xs rounded-xl shadow-md shadow-[#A36B40]/20 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  {isPending ? 'Generating...' : 'Issue Access Key'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
